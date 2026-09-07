from pydantic import BaseModel
from typing import List, Optional

class ForecastPoint(BaseModel):
    month: str
    actual: Optional[float] = None
    predicted: Optional[float] = None

class AtRiskCompetency(BaseModel):
    name: str
    current_avg: float
    projected_6mo: float
    benchmark: float
    risk_level: str  # High, Medium

class PredictiveTrendsResponse(BaseModel):
    forecast_timeline: List[ForecastPoint]
    at_risk_competencies: List[AtRiskCompetency]
    recommended_interventions: List[str]
