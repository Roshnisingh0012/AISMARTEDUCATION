import asyncio
import sys
import os

# Add parent directory to path to allow importing from the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from db.session import AsyncSessionLocal, engine, Base
from db.models import User, UserRole, Competency, CompetencyCategory, MockCourse, CourseProvider, CourseLevel
from core.security import get_password_hash

async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        print("Creating users...")
        admin = User(
            email="admin@gov.in",
            hashed_password=get_password_hash("Admin@123"),
            full_name="System Administrator",
            role=UserRole.ADMIN,
            department="MoSPI",
            designation="Director"
        )
        learner = User(
            email="learner@gov.in",
            hashed_password=get_password_hash("Learner@123"),
            full_name="Junior Statistical Officer",
            role=UserRole.LEARNER,
            department="NSSTA",
            designation="JSO"
        )
        db.add_all([admin, learner])
        await db.commit()
        await db.refresh(admin)
        await db.refresh(learner)

        print("Creating competencies...")
        comps = [
            Competency(name="Python", category=CompetencyCategory.TECHNICAL, benchmark_score=75.0),
            Competency(name="SQL", category=CompetencyCategory.TECHNICAL, benchmark_score=75.0),
            Competency(name="Sampling Techniques", category=CompetencyCategory.STATISTICAL, benchmark_score=80.0),
            Competency(name="Survey Design", category=CompetencyCategory.STATISTICAL, benchmark_score=80.0),
            Competency(name="Machine Learning", category=CompetencyCategory.TECHNICAL, benchmark_score=70.0),
            Competency(name="Official Statistics", category=CompetencyCategory.GOVERNANCE, benchmark_score=85.0),
        ]
        db.add_all(comps)
        await db.commit()
        for comp in comps:
            await db.refresh(comp)

        print("Creating mock courses...")
        courses = [
            MockCourse(
                title="Python for Data Analysis",
                provider=CourseProvider.IGOT_KARMAYOGI,
                competency_id=comps[0].id,
                level=CourseLevel.BEGINNER,
                duration="15 Hours",
                description="Introductory Python course tailored for statistical data processing."
            ),
            MockCourse(
                title="Advanced SQL Queries",
                provider=CourseProvider.NSSTA_TPAC,
                competency_id=comps[1].id,
                level=CourseLevel.INTERMEDIATE,
                duration="2 Days",
                description="Mastering complex aggregations, window functions, and subqueries."
            ),
            MockCourse(
                title="Fundamentals of Sampling",
                provider=CourseProvider.NSSTA_TPAC,
                competency_id=comps[2].id,
                level=CourseLevel.BEGINNER,
                duration="8 Hours",
                description="Basic sampling techniques and probability theory for surveys."
            ),
            MockCourse(
                title="Stratified and Cluster Sampling",
                provider=CourseProvider.NSSTA_TPAC,
                competency_id=comps[2].id,
                level=CourseLevel.ADVANCED,
                duration="3 Days",
                description="Deep dive into advanced sampling methodologies for large scale data."
            ),
            MockCourse(
                title="National Survey Design",
                provider=CourseProvider.IGOT_KARMAYOGI,
                competency_id=comps[3].id,
                level=CourseLevel.INTERMEDIATE,
                duration="10 Hours",
                description="Designing questionnaires and data collection methodologies."
            ),
            MockCourse(
                title="Intro to Machine Learning",
                provider=CourseProvider.IGOT_KARMAYOGI,
                competency_id=comps[4].id,
                level=CourseLevel.BEGINNER,
                duration="20 Hours",
                description="Basic concepts of supervised and unsupervised learning."
            ),
            MockCourse(
                title="Predictive Modeling in Governance",
                provider=CourseProvider.NSSTA_TPAC,
                competency_id=comps[4].id,
                level=CourseLevel.ADVANCED,
                duration="5 Days",
                description="Applying ML to governmental datasets and policy making."
            ),
            MockCourse(
                title="Introduction to Official Statistics",
                provider=CourseProvider.NSSTA_TPAC,
                competency_id=comps[5].id,
                level=CourseLevel.BEGINNER,
                duration="1 Day",
                description="Overview of the statistical system in India."
            ),
            MockCourse(
                title="Quality Control in Official Data",
                provider=CourseProvider.IGOT_KARMAYOGI,
                competency_id=comps[5].id,
                level=CourseLevel.INTERMEDIATE,
                duration="12 Hours",
                description="Ensuring data quality and integrity in official statistics."
            ),
            MockCourse(
                title="Python Scripting Automation",
                provider=CourseProvider.IGOT_KARMAYOGI,
                competency_id=comps[0].id,
                level=CourseLevel.INTERMEDIATE,
                duration="10 Hours",
                description="Automating routine data extraction and reporting tasks with Python."
            ),
        ]
        db.add_all(courses)
        await db.commit()

        print("Database seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
