from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from db.models import CompetencyCategory, CourseProvider, CourseLevel

class CompetencyBase(BaseModel):
    name: str
    category: CompetencyCategory
    benchmark_score: Optional[float] = 75.0

class CompetencyCreate(CompetencyBase):
    pass

class CompetencyResponse(CompetencyBase):
    id: UUID
    
    model_config = ConfigDict(from_attributes=True)

class MockCourseBase(BaseModel):
    title: str
    provider: CourseProvider
    level: CourseLevel
    duration: Optional[str] = None
    external_url: Optional[str] = None
    description: Optional[str] = None

class MockCourseCreate(MockCourseBase):
    competency_id: UUID

class MockCourseResponse(MockCourseBase):
    id: UUID
    competency_id: UUID
    
    model_config = ConfigDict(from_attributes=True)
