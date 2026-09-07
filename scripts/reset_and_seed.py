import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from core.security import get_password_hash
from db.session import engine, AsyncSessionLocal
from db.models import (
    Base, User, UserRole, Competency, CompetencyCategory, UserCompetency,
    CourseProvider, CourseLevel, MockCourse, Quiz, QuizQuestion
)
from datetime import datetime, timezone


async def reset_and_seed():
    print("Dropping all existing tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        print("Recreating all tables from models...")
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # ── 1. Users ───────────────────────────────────────────────────────────
        print("Seeding Users...")
        admin = User(
            full_name="Director Training",
            email="admin@gov.in",
            hashed_password=get_password_hash("Admin@123"),
            role=UserRole.ADMIN,
            department="NSSTA",
            designation="Director"
        )
        learner = User(
            full_name="Ramesh Kumar",
            email="learner@gov.in",
            hashed_password=get_password_hash("Learner@123"),
            role=UserRole.LEARNER,
            department="Field Operations Division (MoSPI)",
            designation="Senior Statistical Officer"
        )
        dev_learner = User(
            full_name="Alice Dev",
            email="dev@gov.in",
            hashed_password=get_password_hash("Dev@123"),
            role=UserRole.LEARNER,
            department="IT",
            designation="Full Stack Developer"
        )
        analyst_learner = User(
            full_name="Bob Analyst",
            email="analyst@gov.in",
            hashed_password=get_password_hash("Analyst@123"),
            role=UserRole.LEARNER,
            department="Analytics",
            designation="Data Analyst"
        )
        
        session.add_all([admin, learner, dev_learner, analyst_learner])
        await session.flush()

        # ── 2. Competencies ────────────────────────────────────────────────────
        print("Seeding Competencies...")
        comp_data = [
            ("Survey Sampling & Estimation",         CompetencyCategory.STATISTICAL, 85.0),
            ("National Accounts & Official Stats",   CompetencyCategory.STATISTICAL, 80.0),
            ("Python for Data Analysis",             CompetencyCategory.TECHNICAL,   80.0),
            ("Data Quality & Metadata Frameworks",   CompetencyCategory.GOVERNANCE,  75.0),
            ("SQL & Relational Databases",           CompetencyCategory.TECHNICAL,   75.0),
            ("GIS & Spatial Data Processing",        CompetencyCategory.TECHNICAL,   70.0),
            ("Frontend Development (React/TypeScript)", CompetencyCategory.TECHNICAL, 80.0),
            ("Backend API Architecture (FastAPI/Python)", CompetencyCategory.TECHNICAL, 80.0),
            ("Database Engineering (PostgreSQL/SQL)", CompetencyCategory.TECHNICAL, 80.0),
        ]

        competencies = {}
        for name, category, benchmark in comp_data:
            c = Competency(name=name, category=category, benchmark_score=benchmark)
            session.add(c)
            competencies[name] = c
        await session.flush()

        # ── 3. Learner Skill Gaps ─────────────────────────────────────────────
        print("Seeding Learner Skill Gaps...")
        
        def add_gaps(user_id, gaps_data):
            for comp_name, score in gaps_data:
                session.add(UserCompetency(
                    user_id=user_id,
                    competency_id=competencies[comp_name].id,
                    current_score=score,
                    last_evaluated_at=datetime.now(timezone.utc)
                ))
                
        add_gaps(learner.id, [
            ("Survey Sampling & Estimation",         48.0),   # HIGH gap
            ("National Accounts & Official Stats",   55.0),   # MEDIUM gap
            ("Python for Data Analysis",             35.0),   # HIGH gap
            ("Data Quality & Metadata Frameworks",   60.0),   # MEDIUM gap
            ("SQL & Relational Databases",           70.0),   # LOW gap
            ("GIS & Spatial Data Processing",        20.0),   # HIGH gap
        ])
        
        add_gaps(dev_learner.id, [
            ("Frontend Development (React/TypeScript)", 40.0),
            ("Backend API Architecture (FastAPI/Python)", 50.0),
            ("Database Engineering (PostgreSQL/SQL)", 85.0), # Met benchmark
        ])
        
        add_gaps(analyst_learner.id, [
             ("Python for Data Analysis", 45.0),
             ("SQL & Relational Databases", 60.0),
             ("Data Quality & Metadata Frameworks", 70.0),
        ])

        # ── 4. Courses ─────────────────────────────────────────────────────────
        print("Seeding Courses...")
        courses_data = [
            (
                "Survey Methodology & Sampling Techniques for Field Officers",
                CourseProvider.NSSTA_TPAC,
                "Survey Sampling & Estimation",
                CourseLevel.INTERMEDIATE,
                "4 Days",
                "https://igot.gov.in/igot/course-detail/do_113",
                "Covers stratified sampling, cluster sampling, systematic sampling, and estimation techniques for national surveys."
            ),
            (
                "National Accounts: GDP Computation & MoSPI Guidelines",
                CourseProvider.NSSTA_TPAC,
                "National Accounts & Official Stats",
                CourseLevel.INTERMEDIATE,
                "3 Days",
                "https://igot.gov.in/igot/course-detail/do_114",
                "Deep dive into System of National Accounts (SNA 2008), GDP estimation methods, and MoSPI dissemination protocols."
            ),
            (
                "Python for Statistical Analysis — MoSPI Edition",
                CourseProvider.IGOT_KARMAYOGI,
                "Python for Data Analysis",
                CourseLevel.BEGINNER,
                "10 Hours",
                "https://igot.gov.in/igot/course-detail/do_115",
                "Hands-on Python using Pandas, NumPy, and Matplotlib tailored for government statistical use cases."
            ),
            (
                "Data Quality Assurance in Official Surveys",
                CourseProvider.IGOT_KARMAYOGI,
                "Data Quality & Metadata Frameworks",
                CourseLevel.BEGINNER,
                "8 Hours",
                "https://igot.gov.in/igot/course-detail/do_116",
                "International standards for data quality (DQAF), metadata management, and survey quality control."
            ),
            (
                "Open Source QGIS for Village Boundary & Census Mapping",
                CourseProvider.IGOT_KARMAYOGI,
                "GIS & Spatial Data Processing",
                CourseLevel.BEGINNER,
                "12 Hours",
                "https://igot.gov.in/igot/course-detail/do_117",
                "Practical GIS training for field investigators: digitising survey villages and spatial data analysis."
            ),
             (
                "Modern React and TypeScript",
                CourseProvider.IGOT_KARMAYOGI,
                "Frontend Development (React/TypeScript)",
                CourseLevel.INTERMEDIATE,
                "15 Hours",
                "https://igot.gov.in/igot/course-detail/do_118",
                "Build modern, type-safe web applications."
            ),
             (
                "FastAPI for High-Performance APIs",
                CourseProvider.IGOT_KARMAYOGI,
                "Backend API Architecture (FastAPI/Python)",
                CourseLevel.INTERMEDIATE,
                "10 Hours",
                "https://igot.gov.in/igot/course-detail/do_119",
                "Design and build fast, asynchronous APIs using Python and FastAPI."
            ),
             (
                "Advanced PostgreSQL Performance Tuning",
                CourseProvider.IGOT_KARMAYOGI,
                "Database Engineering (PostgreSQL/SQL)",
                CourseLevel.ADVANCED,
                "12 Hours",
                "https://igot.gov.in/igot/course-detail/do_120",
                "Optimize queries, indexes, and database architecture."
            ),
        ]
        for title, provider, comp_name, level, duration, url, desc in courses_data:
            session.add(MockCourse(
                title=title,
                provider=provider,
                competency_id=competencies[comp_name].id,
                level=level,
                duration=duration,
                external_url=url,
                description=desc
            ))
        await session.flush()

        # ── 5. Role-Relevant Published Quizzes ───────────────────────────────
        print("Seeding Quizzes & Questions...")

        # Helper function
        def create_quiz(title, comp_name, questions, target_role="All Roles", is_diagnostic=False):
            q = Quiz(
                title=title,
                competency_id=competencies[comp_name].id,
                created_by=admin.id,
                is_published=True,
                passing_score=70.0,
                target_role=target_role,
                is_diagnostic=is_diagnostic
            )
            session.add(q)
            return q, questions
            
        quizzes_to_create = []

        # SSO Quizzes
        quizzes_to_create.append(create_quiz(
            "Survey Sampling & Estimation – SSO Baseline Assessment",
            "Survey Sampling & Estimation",
            [
                ("Which sampling method divides the population into non-overlapping groups and samples from each?",
                 ["Systematic", "Cluster", "Stratified", "Simple Random"], 2,
                 "Stratified sampling divides the population into strata (groups) and samples from each."),
                ("In probability proportional to size (PPS) sampling, the probability of selection is proportional to:",
                 ["Population size", "Unit size or measure", "Survey cost", "Sampling fraction"], 1,
                 "PPS sampling selects units with probability proportional to their size measure."),
                ("The Horvitz-Thompson estimator is used for:",
                 ["Ratio estimation", "Unequal probability sampling", "Cluster mean", "Bootstrap variance"], 1,
                 "The Horvitz-Thompson estimator provides unbiased estimates for unequal probability sampling designs."),
            ],
            target_role="Senior Statistical Officer",
            is_diagnostic=True
        ))
        
        quizzes_to_create.append(create_quiz(
            "National Accounts & Official Statistics – MoSPI Baseline Assessment",
            "National Accounts & Official Stats",
            [
                 ("GDP measured using the expenditure approach sums:",
                 ["C + I + G + (X - M)", "C + I + G + T", "Revenue + Profit + Wages", "NNP + Depreciation"], 0,
                 "GDP (Expenditure) = Consumption + Investment + Government Expenditure + Net Exports."),
                ("Which organisation publishes India's National Accounts Statistics?",
                 ["RBI", "NITI Aayog", "MoSPI / CSO", "Finance Ministry"], 2,
                 "National Accounts Statistics are published by MoSPI through the Central Statistics Office (CSO)."),
                ("The base year for India's current GDP series is:",
                 ["2004-05", "2011-12", "2007-08", "2015-16"], 1,
                 "India revised its GDP base year to 2011-12 in January 2015."),
            ],
            target_role="Senior Statistical Officer",
            is_diagnostic=True
        ))

        # Dev Quizzes
        quizzes_to_create.append(create_quiz(
            "Modern Frontend & State Management Diagnostic",
            "Frontend Development (React/TypeScript)",
            [
                 ("What hook is used to manage side effects in React?",
                 ["useState", "useEffect", "useContext", "useReducer"], 1,
                 "useEffect is the hook used for side effects."),
                ("Which of the following is a TypeScript core type?",
                 ["tuple", "interface", "number", "All of the above"], 3,
                 "All are valid types/structures in TypeScript."),
                ("In React, props are:",
                 ["Mutable", "Immutable", "Stateful", "Functions only"], 1,
                 "Props are read-only (immutable) to the component receiving them."),
            ],
            target_role="Full Stack Developer",
            is_diagnostic=True
        ))
        
        quizzes_to_create.append(create_quiz(
            "Web & API Architecture Assessment",
            "Backend API Architecture (FastAPI/Python)",
            [
                 ("What is FastAPI built on?",
                 ["Flask", "Django", "Starlette & Pydantic", "Tornado"], 2,
                 "FastAPI is built on Starlette for the web parts and Pydantic for the data parts."),
                ("How does FastAPI achieve high performance?",
                 ["Multiprocessing", "Asynchronous capabilities (asyncio)", "C-extensions", "No SQL usage"], 1,
                 "FastAPI uses standard Python async/await functionality."),
                ("What does HTTP status code 404 mean?",
                 ["Internal Server Error", "Unauthorized", "Not Found", "Bad Request"], 2,
                 "404 means the requested resource could not be found."),
            ],
            target_role="Full Stack Developer",
            is_diagnostic=False
        ))

        # Analyst Quizzes
        quizzes_to_create.append(create_quiz(
            "Data Cleaning & Feature Engineering Baseline",
            "Python for Data Analysis",
            [
                 ("Which method is typically used to drop missing values in Pandas?",
                 ["df.remove_na()", "df.dropna()", "df.drop_null()", "df.delete_na()"], 1,
                 "df.dropna() removes rows (or columns) with missing values."),
                ("What does the 'inplace=True' parameter do in Pandas?",
                 ["Returns a new DataFrame", "Modifies the original DataFrame", "Throws an error", "Copies data to clipboard"], 1,
                 "It modifies the DataFrame directly without returning a new object."),
                ("Which function can be used to merge two DataFrames?",
                 ["pd.join()", "pd.combine()", "pd.merge()", "pd.append()"], 2,
                 "pd.merge() performs database-style join operations."),
            ],
            target_role="Data Analyst",
            is_diagnostic=True
        ))
        
        quizzes_to_create.append(create_quiz(
             "SQL for Analytics",
             "SQL & Relational Databases",
             [
                 ("Which clause is used to filter aggregated data?",
                  ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], 1,
                  "HAVING filters data after GROUP BY has aggregated it."),
                 ("What does a LEFT JOIN do?",
                  ["Returns all records from both tables", "Returns only matching records", "Returns all records from the left table, and matched from the right", "Returns all records from the right table"], 2,
                  "LEFT JOIN preserves all rows from the left table."),
                 ("Which function counts the number of rows?",
                  ["SUM()", "COUNT()", "TOTAL()", "MAX()"], 1,
                  "COUNT() returns the number of items in a group."),
             ],
            target_role="Data Analyst",
            is_diagnostic=False
        ))
        
        await session.flush()
        
        for q, questions in quizzes_to_create:
            for text, opts, correct, expl in questions:
                 session.add(QuizQuestion(
                     quiz_id=q.id, 
                     question_text=text, 
                     question_text_hi=None,
                     options=opts,
                     options_hi=None,
                     correct_option_index=correct, 
                     explanation=expl,
                     explanation_hi=None,
                     difficulty="Medium"
                 ))

        await session.commit()
        
        # 🔔 6. Notifications 🔔
        from db.models import Notification
        print("Seeding Notifications...")
        notifs = [
            Notification(
                user_id=learner.id,
                title="New Assessment",
                message="Survey Sampling & Estimation is now available for your profile.",
                type="quiz_assigned",
                is_read=False
            ),
            Notification(
                user_id=learner.id,
                title="Skill Gap Alert",
                message="Notice: Your score in National Accounts is 12% below benchmark. Recommended training is ready in Course Pathway.",
                type="gap_alert",
                is_read=False
            )
        ]
        session.add_all(notifs)
        await session.commit()
        
        print("\n[SUCCESS] Database seeded successfully!")
        
        q_count = len(quizzes_to_create)
        c_count = len(comp_data)
        print(f"   Created {c_count} competencies.")
        print(f"   Created {q_count} quizzes.")
        print("   Admin:   admin@gov.in / Admin@123  (Director, NSSTA)")
        print("   Learner: learner@gov.in / Learner@123  (Senior Statistical Officer, MoSPI)")
        print("   Dev:     dev@gov.in / Dev@123 (Full Stack Developer, IT)")
        print("   Analyst: analyst@gov.in / Analyst@123 (Data Analyst, Analytics)")

if __name__ == "__main__":
    asyncio.run(reset_and_seed())
