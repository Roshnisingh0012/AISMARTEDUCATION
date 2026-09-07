from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from db.models import User, UserCompetency, Competency, QuizAttempt, Quiz

async def get_overview_metrics(db: AsyncSession):
    learners_res = await db.execute(select(func.count(User.id)).where(User.role == 'LEARNER'))
    total_learners = learners_res.scalar() or 0

    quizzes_res = await db.execute(select(func.count(Quiz.id)).where(Quiz.is_published == True))
    active_assessments = quizzes_res.scalar() or 0
    
    uc_res = await db.execute(select(func.avg(UserCompetency.current_score)))
    avg_competency = uc_res.scalar() or 0.0

    return {
        "total_learners": total_learners,
        "active_assessments": active_assessments,
        "average_org_competency": float(avg_competency),
        "total_unresolved_gaps": 0 
    }

async def get_department_breakdown(db: AsyncSession):
    stmt = select(
        User.department,
        func.avg(UserCompetency.current_score).label('avg_score')
    ).join(UserCompetency, User.id == UserCompetency.user_id).group_by(User.department)
    
    res = await db.execute(stmt)
    breakdown = [{"department": row[0], "avg_score": float(row[1])} for row in res.all()]
    return breakdown

async def get_skill_demand(db: AsyncSession):
    stmt = select(
        Competency.name,
        Competency.benchmark_score,
        func.avg(UserCompetency.current_score).label('avg_current')
    ).join(UserCompetency, Competency.id == UserCompetency.competency_id).group_by(Competency.name, Competency.benchmark_score)
    
    res = await db.execute(stmt)
    demand = []
    for row in res.all():
        gap = max(0.0, row[1] - row[2])
        demand.append({"skill": row[0], "gap_size": float(gap)})
        
    demand.sort(key=lambda x: x['gap_size'], reverse=True)
    return demand[:5]

async def get_role_metrics(db: AsyncSession):
    res = await db.execute(select(User.designation, func.count(User.id)).where(User.role == 'LEARNER').group_by(User.designation))
    personnel_by_role = {row[0] or 'Unassigned': row[1] for row in res.all()}
    
    stmt = select(User.designation, UserCompetency.current_score, Competency.benchmark_score).join(UserCompetency, User.id == UserCompetency.user_id).join(Competency, Competency.id == UserCompetency.competency_id)
    scores = await db.execute(stmt)
    
    risk_dist = {}
    for role, score, bench in scores.all():
        role_name = role or 'Unassigned'
        if role_name not in risk_dist:
            risk_dist[role_name] = {'High': 0, 'Medium': 0, 'Low': 0}
        
        ratio = score / bench if bench > 0 else 1.0
        if ratio < 0.5:
            risk_dist[role_name]['High'] += 1
        elif ratio < 0.75:
            risk_dist[role_name]['Medium'] += 1
        else:
            risk_dist[role_name]['Low'] += 1
            
    return { 'personnel_by_role': personnel_by_role, 'risk_distribution': risk_dist }

