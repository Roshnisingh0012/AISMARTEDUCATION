from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class QuizQuestionPublic(BaseModel):
    id: UUID
    question_text: str
    question_text_hi: Optional[str] = None
    options: List[str]
    options_hi: Optional[List[str]] = None

    model_config = ConfigDict(from_attributes=True)

class QuizAvailable(BaseModel):
    id: UUID
    title: str
    competency_id: Optional[UUID]
    is_published: bool = True
    passing_score: float = 70.0

    model_config = ConfigDict(from_attributes=True)

class AnswerSubmission(BaseModel):
    question_id: UUID
    selected_option_index: int

class QuizSubmission(BaseModel):
    answers: List[AnswerSubmission]

class QuestionResult(BaseModel):
    question_id: UUID
    selected_option_index: int
    correct_option_index: int
    is_correct: bool
    explanation: Optional[str]
    explanation_hi: Optional[str] = None

class QuizResultResponse(BaseModel):
    score_percentage: float
    results: List[QuestionResult]

class SkillGap(BaseModel):
    competency_id: UUID
    competency_name: str
    benchmark_score: float
    current_score: float
    gap: float
    priority: str  # HIGH, MEDIUM, LOW, NONE
    ai_reasoning: str

class CourseRecommendation(BaseModel):
    course_id: UUID
    title: str
    provider: str
    skill_name: str
    level: str
    duration: Optional[str]
    external_url: Optional[str]
    reason: str

class DashboardSummary(BaseModel):
    overall_competency_avg: float
    total_skill_gaps_count: int
    high_priority_gaps_count: int
    completed_assessments_count: int
    recent_recommendations: List[CourseRecommendation]
    skill_gaps: List[SkillGap] = []

class RecommendationResponse(BaseModel):
    courses: List[CourseRecommendation]

