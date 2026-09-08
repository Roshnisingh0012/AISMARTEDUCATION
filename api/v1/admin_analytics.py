from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.session import get_db
from db.models import User, UserRole
from api.deps import require_role
from services.analytics_engine import get_overview_metrics, get_department_breakdown, get_skill_demand, get_role_metrics
from services.predictive_engine import generate_predictive_trends
from schemas.analytics import PredictiveTrendsResponse

router = APIRouter()
admin_role = require_role(UserRole.ADMIN)

@router.get("/overview")
async def overview(db: AsyncSession = Depends(get_db), user: User = Depends(admin_role)):
    return await get_overview_metrics(db)

@router.get("/officers")
@router.get("/learners")
async def get_all_learners(db: AsyncSession = Depends(get_db), user: User = Depends(admin_role)):
    result = await db.execute(select(User).where(User.role != UserRole.ADMIN if hasattr(UserRole, 'ADMIN') else True))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "name": u.full_name or u.email.split('@')[0],
            "full_name": u.full_name or u.email.split('@')[0],
            "email": u.email,
            "role": getattr(u, 'designation', None) or getattr(u, 'job_role', None) or "Senior Statistical Officer",
            "cadre": getattr(u, 'designation', None) or getattr(u, 'job_role', None) or "Statistical Officer",
            "department": u.department or "MoSPI",
            "band": "critical",
            "competency_band": "Not Assessed",
            "score": 0.0,
            "current_score": 0.0,
            "domainScore": "Assessment pending",
            "recommendedAction": "Complete Baseline Assessment",
            "recommended_action": "Complete Baseline Assessment"
        }
        for u in users
        if getattr(u, 'email', '') != 'admin@gov.in'
    ]

@router.get("/role-metrics")
async def role_metrics(db: AsyncSession = Depends(get_db), user: User = Depends(admin_role)):
    return await get_role_metrics(db)

@router.get("/department-breakdown")
async def department_breakdown(db: AsyncSession = Depends(get_db), user: User = Depends(admin_role)):
    return await get_department_breakdown(db)

@router.get("/skill-demand")
async def skill_demand(db: AsyncSession = Depends(get_db), user: User = Depends(admin_role)):
    return await get_skill_demand(db)

@router.get("/predictive-trends", response_model=PredictiveTrendsResponse)
async def predictive_trends(db: AsyncSession = Depends(get_db), user: User = Depends(admin_role)):
    return await generate_predictive_trends(db)
