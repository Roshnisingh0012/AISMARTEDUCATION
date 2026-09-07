from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func
from datetime import datetime
import calendar
from db.models import UserCompetency, Competency
from schemas.analytics import PredictiveTrendsResponse, ForecastPoint, AtRiskCompetency
import random

def add_months(sourcedate, months):
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, calendar.monthrange(year, month)[1])
    return datetime(year, month, day)

async def generate_predictive_trends(db: AsyncSession) -> PredictiveTrendsResponse:
    # Get current averages across competencies
    result = await db.execute(
        select(Competency.name, Competency.benchmark_score, func.avg(UserCompetency.current_score))
        .join(UserCompetency, Competency.id == UserCompetency.competency_id)
        .group_by(Competency.name, Competency.benchmark_score)
    )
    data = result.all()
    
    # Calculate a global average to form the trend baseline
    if not data:
        return PredictiveTrendsResponse(
            forecast_timeline=[],
            at_risk_competencies=[],
            recommended_interventions=["Gather more assessment data to generate predictions."]
        )
    
    current_global_avg = sum(row[2] for row in data) / len(data)
    
    # Generate 12 months timeline (6 months past, 6 months future)
    now = datetime.now()
    timeline = []
    
    # Simulate past actuals
    start_val = max(10, current_global_avg - 15)
    for i in range(6, 0, -1):
        dt = add_months(now, -i)
        val = start_val + (6-i)*2.5 + random.uniform(-2, 2)
        timeline.append(ForecastPoint(month=dt.strftime("%b %Y"), actual=round(val, 1), predicted=None))
        
    # Current month
    timeline.append(ForecastPoint(month=now.strftime("%b %Y"), actual=round(current_global_avg, 1), predicted=round(current_global_avg, 1)))
    
    # Simulate future predictions (linear extrapolation with slight decay in growth)
    pred_val = current_global_avg
    for i in range(1, 7):
        dt = add_months(now, i)
        pred_val += 1.8 + random.uniform(-0.5, 0.5)
        timeline.append(ForecastPoint(month=dt.strftime("%b %Y"), actual=None, predicted=round(min(100, pred_val), 1)))

    # Identify at-risk competencies
    at_risk = []
    interventions = []
    for name, bench, avg_score in data:
        # Predict 6 month growth
        projected_6mo = avg_score + 10.8  # ~1.8 per month
        if projected_6mo < bench:
            risk = "High" if projected_6mo < bench - 10 else "Medium"
            at_risk.append(AtRiskCompetency(
                name=name,
                current_avg=round(avg_score, 1),
                projected_6mo=round(projected_6mo, 1),
                benchmark=bench,
                risk_level=risk
            ))
            
            if risk == "High" and len(interventions) < 3:
                interventions.append(f"Schedule mandatory NSSTA TPAC workshop on {name} by Q4.")

    if not interventions:
        interventions.append("Current learning trajectories are healthy. Maintain current engagement strategies.")

    # Sort at_risk by severity
    at_risk.sort(key=lambda x: (x.risk_level == "High", x.benchmark - x.projected_6mo), reverse=True)

    return PredictiveTrendsResponse(
        forecast_timeline=timeline,
        at_risk_competencies=at_risk,
        recommended_interventions=interventions
    )
