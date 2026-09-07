import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Enum, Text, JSON, Uuid as UUID
from sqlalchemy.orm import relationship
from db.session import Base

class UserRole(str, enum.Enum):
    LEARNER = "LEARNER"
    ADMIN = "ADMIN"

class CompetencyCategory(str, enum.Enum):
    TECHNICAL = "Technical"
    STATISTICAL = "Statistical"
    GOVERNANCE = "Governance"
    BEHAVIOURAL = "Behavioural"

class CourseProvider(str, enum.Enum):
    IGOT_KARMAYOGI = "iGOT Karmayogi"
    NSSTA_TPAC = "NSSTA TPAC"

class CourseLevel(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.LEARNER, nullable=False)
    department = Column(String)
    designation = Column(String)
    has_completed_diagnostic = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    competencies = relationship("UserCompetency", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    created_quizzes = relationship("Quiz", back_populates="creator")


class Competency(Base):
    __tablename__ = "competencies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(Enum(CompetencyCategory), nullable=False)
    benchmark_score = Column(Float, default=75.0)

    user_competencies = relationship("UserCompetency", back_populates="competency")
    courses = relationship("MockCourse", back_populates="competency")
    quizzes = relationship("Quiz", back_populates="competency")


class UserCompetency(Base):
    __tablename__ = "user_competencies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    competency_id = Column(UUID(as_uuid=True), ForeignKey("competencies.id"), nullable=False)
    current_score = Column(Float, default=0.0)
    last_evaluated_at = Column(DateTime(timezone=True))

    user = relationship("User", back_populates="competencies")
    competency = relationship("Competency", back_populates="user_competencies")


class MockCourse(Base):
    __tablename__ = "mock_courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    provider = Column(Enum(CourseProvider), nullable=False)
    competency_id = Column(UUID(as_uuid=True), ForeignKey("competencies.id"), nullable=False)
    level = Column(Enum(CourseLevel), nullable=False)
    duration = Column(String)
    external_url = Column(String)
    description = Column(Text)

    competency = relationship("Competency", back_populates="courses")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    competency_id = Column(UUID(as_uuid=True), ForeignKey("competencies.id"), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    source_file_name = Column(String, nullable=True)
    is_published = Column(Boolean, default=False)
    passing_score = Column(Float, default=70.0)
    target_role = Column(String, default="All Roles")
    is_diagnostic = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    competency = relationship("Competency", back_populates="quizzes")
    creator = relationship("User", back_populates="created_quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_text_hi = Column(Text, nullable=True)
    options = Column(JSON, nullable=False)
    options_hi = Column(JSON, nullable=True)
    correct_option_index = Column(Integer, nullable=False)
    explanation = Column(Text)
    explanation_hi = Column(Text, nullable=True)
    difficulty = Column(String, default="Medium")

    quiz = relationship("Quiz", back_populates="questions")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id"), nullable=False)
    score_percentage = Column(Float, nullable=False)
    completed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")

class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("mock_courses.id"), nullable=False)
    status = Column(String, default="IN_PROGRESS")
    enrolled_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    course = relationship("MockCourse")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False) # quiz_assigned, gap_alert, system
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")

