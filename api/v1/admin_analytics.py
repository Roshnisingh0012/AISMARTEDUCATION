from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_db
from db.models import User, UserRole
from services.analytics_engine import get_overview_metrics, get_department_breakdown, get_skill_demand, get_role_metrics, get_all_officers
from services.predictive_engine import generate_predictive_trends
from schemas.analytics import PredictiveTrendsResponse

router = APIRouter()
admin_role = require_role(UserRole.ADMIN)

@router.get("/overview")
async def overview(db: AsyncSession = Depends(get_db), user: User = Depends(admin_role)):
    return await get_overview_metrics(db)

@router.get("/officers")
@router.get("/learners")
async def officers(db: AsyncSession = Depends(get_db), user: User = Depends(admin_role)):
    return await get_all_officers(db)

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
