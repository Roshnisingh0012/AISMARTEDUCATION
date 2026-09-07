import os
import google.generativeai as genai
from db.models import User
from services.gap_engine import analyze_user_gaps
from services.recommendation_engine import recommend_courses
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.models import Competency, UserCompetency, MockCourse
import asyncio
import json

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def build_learner_context(user: User, db: AsyncSession) -> str:
    comps_res = await db.execute(select(Competency))
    comps = comps_res.scalars().all()
    
    ucs_res = await db.execute(select(UserCompetency).where(UserCompetency.user_id == user.id))
    ucs = ucs_res.scalars().all()
    
    gaps = analyze_user_gaps(comps, ucs)
    
    courses_res = await db.execute(select(MockCourse))
    courses = courses_res.scalars().all()
    recs = recommend_courses(gaps, courses)
    
    context = f"""
    Learner Profile:
    Name: {user.full_name}
    Department: {user.department}
    Designation: {user.designation}
    
    Current Skill Gaps:
    """
    for g in gaps:
        if g["priority"] != "NONE":
            context += f"- {g['competency_name']}: Score {g['current_score']}% (Target {g['benchmark_score']}%) [{g['priority']} Priority]\n"
            
    context += "\nRecommended Courses:\n"
    for r in recs[:3]:
        context += f"- {r['title']} ({r['level']}) by {r['provider']}\n"
        
    return context

async def generate_chat_stream(prompt: str, user: User, db: AsyncSession):
    context = await build_learner_context(user, db)
    
    full_prompt = f"""
    SYSTEM: You are a knowledgeable, encouraging upskilling coach for government officials.
    Use the following real-time profile of the learner to personalize your answers.
    
    {context}
    
    Respond directly to the user's prompt in markdown. Keep it concise, helpful, and contextual. Do not mention that you are an AI.
    
    USER: {prompt}
    """
    
    if not GEMINI_API_KEY:
        yield "data: {\"text\": \"Please configure GEMINI_API_KEY to enable the AI assistant.\"}\n\n"
        return
        
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(full_prompt, stream=True)
    
    for chunk in response:
        if chunk.text:
            safe_text = json.dumps({"text": chunk.text})
            yield f"data: {safe_text}\n\n"
            await asyncio.sleep(0.01)
