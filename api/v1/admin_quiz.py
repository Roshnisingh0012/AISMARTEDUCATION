from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
import uuid

from db.session import get_db
from db.models import User, UserRole, Quiz, QuizQuestion
from api.deps import get_current_user, require_role
from services.quiz_ai_service import generate_quiz_from_text, extract_pdf_text

router = APIRouter()
admin_role = require_role(UserRole.ADMIN)

class QuestionUpdatePayload(BaseModel):
    question_text: Optional[str] = None
    options: Optional[List[str]] = None
    correct_option_index: Optional[int] = None
    explanation: Optional[str] = None

@router.post("/generate-from-doc")
async def generate_quiz(
    file: UploadFile = File(...),
    competency_id: uuid.UUID = Form(...),
    num_questions: int = Form(5),
    difficulty: str = Form("Easy"),
    target_role: str = Form("All Roles"),
    is_diagnostic: bool = Form(False),
    custom_title: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(admin_role)
):
    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")
        
    try:
        text = extract_pdf_text(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    if not text:
        raise HTTPException(status_code=400, detail="No readable text found in document.")
        
    try:
        ai_result = await generate_quiz_from_text(text, num_questions, difficulty, custom_title or file.filename)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI generation failed: {str(e)}")
    
    draft_quiz = Quiz(
        title=ai_result.get("quiz_title", "Draft Assessment"),
        competency_id=competency_id,
        created_by=user.id,
        source_file_name=file.filename,
        is_published=False,
        target_role=target_role,
        is_diagnostic=is_diagnostic
    )
    db.add(draft_quiz)
    await db.flush() 

    for q_data in ai_result.get("questions", []):
        db.add(QuizQuestion(
            quiz_id=draft_quiz.id,
            question_text=q_data["question_text"],
            options=q_data["options"],
            correct_option_index=q_data["correct_option_index"],
            explanation=q_data["explanation"],
            difficulty=difficulty
        ))
    
    await db.commit()
    return {"message": "Quiz generated successfully", "quiz_id": draft_quiz.id}

@router.get("/{quiz_id}/preview")
async def preview_quiz(
    quiz_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(admin_role)
):
    quiz_res = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_res.scalars().first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    q_res = await db.execute(select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id))
    questions = q_res.scalars().all()
    
    return {
        "id": quiz.id,
        "title": quiz.title,
        "is_published": quiz.is_published,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "options": q.options,
                "correct_option_index": q.correct_option_index,
                "explanation": q.explanation
            } for q in questions
        ]
    }

@router.put("/{quiz_id}/questions/{question_id}")
async def update_question(
    quiz_id: uuid.UUID,
    question_id: uuid.UUID,
    payload: QuestionUpdatePayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(admin_role)
):
    q_res = await db.execute(select(QuizQuestion).where(QuizQuestion.id == question_id, QuizQuestion.quiz_id == quiz_id))
    q = q_res.scalars().first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
        
    if payload.question_text is not None:
        q.question_text = payload.question_text
    if payload.options is not None:
        q.options = payload.options
    if payload.correct_option_index is not None:
        q.correct_option_index = payload.correct_option_index
    if payload.explanation is not None:
        q.explanation = payload.explanation
        
    await db.commit()
    return {"message": "Question updated successfully"}

@router.delete("/{quiz_id}/questions/{question_id}")
async def delete_question(
    quiz_id: uuid.UUID,
    question_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(admin_role)
):
    q_res = await db.execute(select(QuizQuestion).where(QuizQuestion.id == question_id, QuizQuestion.quiz_id == quiz_id))
    q = q_res.scalars().first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
        
    await db.delete(q)
    await db.commit()
    return {"message": "Question deleted successfully"}

@router.post("/{quiz_id}/publish")
async def publish_quiz(
    quiz_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(admin_role)
):
    quiz_res = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_res.scalars().first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    quiz.is_published = True
    await db.commit()
    return {"message": "Quiz published successfully"}
