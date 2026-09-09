from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List
import uuid
from datetime import datetime, timezone

from db.session import get_db
from db.models import User, UserRole, Quiz, QuizQuestion, QuizAttempt, UserCompetency, Competency, MockCourse, CourseEnrollment
from schemas.learner import (
    QuizAvailable, QuizQuestionPublic, QuizSubmission, QuizResultResponse,
    QuestionResult, SkillGap, CourseRecommendation, DashboardSummary, RecommendationResponse
)
from api.deps import get_current_user, require_role
from services.gap_engine import analyze_user_gaps
from services.recommendation_engine import recommend_courses
from services.role_competency_map import get_relevant_competencies_for_user, normalize_role

router = APIRouter()
learner_role = require_role(UserRole.LEARNER)


async def _get_role_filtered_competency_ids(user: User, db: AsyncSession) -> list:
    """Return competency IDs relevant to the user's designation. Empty list = no filter."""
    relevant_names = get_relevant_competencies_for_user(user.designation or "")
    if not relevant_names:
        return []
    result = await db.execute(select(Competency).where(Competency.name.in_(relevant_names)))
    comps = result.scalars().all()
    return [c.id for c in comps]


@router.get("/assessments/available", response_model=List[QuizAvailable])
@router.get("/assessments", response_model=List[QuizAvailable])
async def get_available_quizzes(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(learner_role)
):
    """Return published quizzes strictly filtered by the learner's normalized role/designation and competencies."""
    user_desig = (user.designation or "").strip()
    norm_role = normalize_role(user_desig)

    # Allowed role tags
    allowed_roles = [user_desig, norm_role, "All Roles"]
    comp_ids = await _get_role_filtered_competency_ids(user, db)

    # 1. Primary Query: Target role match
    result = await db.execute(
        select(Quiz).where(
            Quiz.is_published == True,
            or_(
                Quiz.target_role.in_(allowed_roles),
                Quiz.target_role.is_(None)
            )
        )
    )
    quizzes = result.scalars().all()

    # 2. If no quizzes matched specific target role, fallback to competency-linked quizzes
    if not quizzes:
        if comp_ids:
            result = await db.execute(
                select(Quiz).where(
                    Quiz.is_published == True,
                    or_(Quiz.competency_id.in_(comp_ids), Quiz.target_role == "All Roles", Quiz.target_role.is_(None))
                )
            )
            quizzes = result.scalars().all()
        else:
            result = await db.execute(select(Quiz).where(Quiz.is_published == True))
            quizzes = result.scalars().all()

    out = []
    for q in quizzes:
        q_count_res = await db.execute(select(QuizQuestion).where(QuizQuestion.quiz_id == q.id))
        q_list = q_count_res.scalars().all()
        diff = q_list[0].difficulty if q_list else "Intermediate"
        out.append(QuizAvailable(
            id=q.id,
            title=q.title,
            competency_id=q.competency_id,
            is_published=q.is_published,
            passing_score=q.passing_score,
            target_role=q.target_role or "All Roles",
            difficulty=diff,
            duration_mins=max(5, len(q_list) * 2),
            questions_count=len(q_list) if q_list else 5,
            is_diagnostic=q.is_diagnostic
        ))
    return out


@router.get("/baseline-diagnostic", response_model=QuizAvailable)
async def get_baseline_diagnostic(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(learner_role)
):
    """Retrieve the primary baseline diagnostic assessment tailored to the user's role."""
    user_desig = (user.designation or "").strip()
    norm_role = normalize_role(user_desig)
    allowed_roles = [user_desig, norm_role, "All Roles"]

    result = await db.execute(
        select(Quiz).where(
            Quiz.is_published == True,
            or_(Quiz.is_diagnostic == True, Quiz.target_role.in_(allowed_roles))
        )
    )
    quiz = result.scalars().first()
    if not quiz:
        res_any = await db.execute(select(Quiz).where(Quiz.is_published == True))
        quiz = res_any.scalars().first()

    if not quiz:
        raise HTTPException(status_code=404, detail="No diagnostic assessment found.")

    q_count_res = await db.execute(select(QuizQuestion).where(QuizQuestion.quiz_id == quiz.id))
    q_list = q_count_res.scalars().all()

    return QuizAvailable(
        id=quiz.id,
        title=quiz.title,
        competency_id=quiz.competency_id,
        is_published=quiz.is_published,
        passing_score=quiz.passing_score,
        target_role=quiz.target_role or user_desig or "All Roles",
        difficulty="Diagnostic",
        duration_mins=max(5, len(q_list) * 2),
        questions_count=len(q_list) if q_list else 5,
        is_diagnostic=True
    )


@router.get("/assessments/{quiz_id}", response_model=List[QuizQuestionPublic])
async def get_quiz_questions(
    quiz_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(learner_role)
):
    result = await db.execute(select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id))
    questions = result.scalars().all()
    if not questions:
        raise HTTPException(status_code=404, detail="Quiz not found or has no questions.")
    return questions


@router.post("/assessments/{quiz_id}/submit", response_model=QuizResultResponse)
async def submit_quiz(
    quiz_id: uuid.UUID,
    submission: QuizSubmission,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(learner_role)
):
    quiz_res = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_res.scalars().first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")

    q_res = await db.execute(select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id))
    questions = q_res.scalars().all()

    q_map = {q.id: q for q in questions}
    correct_count = 0
    total_count = len(questions)

    if total_count == 0:
        raise HTTPException(status_code=400, detail="Quiz has no questions.")

    results = []

    for ans in submission.answers:
        q = q_map.get(ans.question_id)
        if not q:
            continue

        is_correct = (ans.selected_option_index == q.correct_option_index)
        if is_correct:
            correct_count += 1

        results.append(QuestionResult(
            question_id=ans.question_id,
            question_text=q.question_text,
            question_text_hi=q.question_text_hi,
            options=q.options if isinstance(q.options, list) else [],
            options_hi=q.options_hi if isinstance(q.options_hi, list) else None,
            selected_option_index=ans.selected_option_index,
            correct_option_index=q.correct_option_index,
            is_correct=is_correct,
            explanation=q.explanation or "Official guidelines and methodology define this answer.",
            explanation_hi=q.explanation_hi,
            competency_tag=quiz.title or (user.designation or "Statistical Competency")
        ))

    score_percentage = (correct_count / total_count) * 100.0

    attempt = QuizAttempt(
        user_id=user.id,
        quiz_id=quiz_id,
        score_percentage=score_percentage
    )
    db.add(attempt)

    # Update competencies
    if quiz.competency_id:
        uc_res = await db.execute(
            select(UserCompetency)
            .where(UserCompetency.user_id == user.id)
            .where(UserCompetency.competency_id == quiz.competency_id)
        )
        uc = uc_res.scalars().first()
        if uc:
            uc.current_score = (uc.current_score * 0.4) + (score_percentage * 0.6)
            uc.last_evaluated_at = datetime.now(timezone.utc)
        else:
            db.add(UserCompetency(
                user_id=user.id,
                competency_id=quiz.competency_id,
                current_score=score_percentage,
                last_evaluated_at=datetime.now(timezone.utc)
            ))
    else:
        # If diagnostic or general quiz, evaluate all role-related competencies
        comp_ids = await _get_role_filtered_competency_ids(user, db)
        for cid in comp_ids[:4]:
            uc_res = await db.execute(
                select(UserCompetency)
                .where(UserCompetency.user_id == user.id)
                .where(UserCompetency.competency_id == cid)
            )
            uc = uc_res.scalars().first()
            if uc:
                uc.current_score = (uc.current_score * 0.3) + (score_percentage * 0.7)
                uc.last_evaluated_at = datetime.now(timezone.utc)
            else:
                db.add(UserCompetency(
                    user_id=user.id,
                    competency_id=cid,
                    current_score=score_percentage,
                    last_evaluated_at=datetime.now(timezone.utc)
                ))

    # Always mark diagnostic as completed once an assessment is submitted
    user.has_completed_diagnostic = True

    await db.commit()

    return QuizResultResponse(
        score_percentage=score_percentage,
        results=results,
        is_diagnostic=quiz.is_diagnostic or False
    )


@router.get("/skill-gaps", response_model=List[SkillGap])
async def get_skill_gaps(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(learner_role)
):
    """Return skill gaps. If learner has 0 completed assessments, return empty list."""
    attempts_res = await db.execute(select(QuizAttempt).where(QuizAttempt.user_id == user.id))
    attempts = attempts_res.scalars().all()
    if len(attempts) == 0:
        return []

    comps_res = await db.execute(select(Competency))
    comps = comps_res.scalars().all()

    ucs_res = await db.execute(select(UserCompetency).where(UserCompetency.user_id == user.id))
    ucs = ucs_res.scalars().all()

    gaps = analyze_user_gaps(comps, ucs)

    # Boost priority of role-relevant gaps to the top
    relevant_names = get_relevant_competencies_for_user(user.designation or "")
    if relevant_names:
        def sort_key(g):
            if g["competency_name"] in relevant_names:
                return (0, -g["gap"])
            return (1, -g["gap"])
        gaps = sorted(gaps, key=sort_key)

    return gaps


@router.get("/competencies", response_model=List[SkillGap])
async def get_competencies(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(learner_role)
):
    return await get_skill_gaps(db=db, user=user)


@router.get("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(learner_role)
):
    """Return courses prioritised by the user's role-specific skill gaps."""
    comps_res = await db.execute(select(Competency))
    comps = comps_res.scalars().all()

    ucs_res = await db.execute(select(UserCompetency).where(UserCompetency.user_id == user.id))
    ucs = ucs_res.scalars().all()

    gaps = analyze_user_gaps(comps, ucs)

    # Filter courses
    comp_ids = await _get_role_filtered_competency_ids(user, db)

    if comp_ids:
        courses_res = await db.execute(
            select(MockCourse).where(MockCourse.competency_id.in_(comp_ids))
        )
    else:
        courses_res = await db.execute(select(MockCourse))

    courses = courses_res.scalars().all()
    recs = recommend_courses(gaps, courses)
    return {"courses": recs}


@router.get("/dashboard-summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(learner_role)
):
    attempts_res = await db.execute(select(QuizAttempt).where(QuizAttempt.user_id == user.id))
    attempts = attempts_res.scalars().all()
    completed_count = len(attempts)

    # Role-specific course recommendations
    comp_ids = await _get_role_filtered_competency_ids(user, db)
    if comp_ids:
        courses_res = await db.execute(
            select(MockCourse).where(MockCourse.competency_id.in_(comp_ids))
        )
    else:
        courses_res = await db.execute(select(MockCourse))
    courses = courses_res.scalars().all()

    # True Zero-State for Brand New Profiles (0 completed assessments)
    if completed_count == 0:
        recs = recommend_courses([], courses)
        return DashboardSummary(
            overall_competency_avg=0.0,
            total_skill_gaps_count=0,
            high_priority_gaps_count=0,
            completed_assessments_count=0,
            recent_recommendations=recs[:5],
            skill_gaps=[],
            has_completed_diagnostic=user.has_completed_diagnostic or False
        )

    comps_res = await db.execute(select(Competency))
    comps = comps_res.scalars().all()

    ucs_res = await db.execute(select(UserCompetency).where(UserCompetency.user_id == user.id))
    ucs = ucs_res.scalars().all()

    gaps = analyze_user_gaps(comps, ucs)
    recs = recommend_courses(gaps, courses)

    total_gaps = len([g for g in gaps if g["priority"] != "NONE"])
    high_priority_gaps = len([g for g in gaps if g["priority"] == "HIGH"])
    avg_comp = sum(uc.current_score for uc in ucs) / len(ucs) if ucs else 0.0

    return DashboardSummary(
        overall_competency_avg=avg_comp,
        total_skill_gaps_count=total_gaps,
        high_priority_gaps_count=high_priority_gaps,
        completed_assessments_count=completed_count,
        recent_recommendations=recs[:5],
        skill_gaps=gaps,
        has_completed_diagnostic=user.has_completed_diagnostic or False
    )
