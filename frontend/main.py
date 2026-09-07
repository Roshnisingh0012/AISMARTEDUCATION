import json
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
import google.generativeai as genai

# 1. Initialize FastAPI Application
app = FastAPI(
    title="Smart Education AntiGravity Backend",
    description="AI Engine for Official Statistical System Competency Platform",
    version="1.0.0"
)

# 2. CORS Setup for Frontend Connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with Vercel App URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Configure Gemini AI API Key
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"
genai.configure(api_key=GEMINI_API_KEY)
llm_model = genai.GenerativeModel("gemini-1.5-flash")

# =====================================================================
# DATA MODELS (Pydantic Schemas)
# =====================================================================
class AssessmentRequest(BaseModel):
    user_id: str
    designation: str
    self_ratings: dict  # e.g., {"Survey Design": 3, "Python": 2}

class RecommendationRequest(BaseModel):
    user_id: str
    identified_gaps: List[str]

class ChatRequest(BaseModel):
    question: str
    document_context: str

# =====================================================================
# 1. PROFILEVIEW: COMPETENCY & SKILL GAP ANALYZER
# =====================================================================
@app.post("/api/assessments/analyze")
async def analyze_assessment(data: AssessmentRequest):
    # Predefined Official Target Competency Framework for Roles
    role_targets = {
        "SSO": {"Survey Design": 5, "Sampling": 4, "Python": 3, "National Accounts": 3},
        "JSO": {"Survey Design": 4, "Sampling": 3, "Excel": 4, "SQL": 3},
        "AI/ML Engineer": {"Python": 5, "AI/ML": 5, "SQL": 4, "Cloud Computing": 4}
    }
    
    target = role_targets.get(data.designation, {"Survey Design": 4, "Python": 4, "SQL": 4})
    
    gaps = []
    total_score = 0
    max_score = len(target) * 5
    
    for skill, target_level in target.items():
        user_level = data.self_ratings.get(skill, 0)
        total_score += min(user_level, target_level)
        if user_level < target_level:
            gaps.append({
                "skill": skill,
                "current_level": user_level,
                "target_level": target_level,
                "gap_score": target_level - user_level
            })
            
    competency_percentage = round((total_score / max_score) * 100, 1)
    
    return {
        "user_id": data.user_id,
        "designation": data.designation,
        "competency_score": competency_percentage,
        "identified_gaps": gaps
    }

# =====================================================================
# 2. PATHWAYVIEW: IGOT & NSSTA COURSE RECOMMENDER
# =====================================================================
@app.post("/api/recommendations")
async def get_recommendations(data: RecommendationRequest):
    igot_catalog = {
        "Survey Design": {
            "id": "c1",
            "title": "Modern Sampling & Survey Design",
            "provider": "MoSPI / iGOT",
            "duration": "10 Hours",
            "level": "Intermediate",
            "skills": ["Survey Design", "Sampling"]
        },
        "Python": {
            "id": "c2",
            "title": "Data Science & Machine Learning with Python",
            "provider": "iGOT Karmayogi",
            "duration": "15 Hours",
            "level": "Advanced",
            "skills": ["Python", "AI/ML"]
        },
        "National Accounts": {
            "id": "c3",
            "title": "National Accounts Framework & Price Statistics",
            "provider": "NSSTA",
            "duration": "20 Hours",
            "level": "Advanced",
            "skills": ["National Accounts"]
        },
        "SQL": {
            "id": "c4",
            "title": "Relational Databases & Big Data SQL",
            "provider": "iGOT Karmayogi",
            "duration": "8 Hours",
            "level": "Beginner",
            "skills": ["SQL"]
        }
    }
    
    recommended_courses = []
    for gap_skill in data.identified_gaps:
        if gap_skill in igot_catalog:
            recommended_courses.append(igot_catalog[gap_skill])
            
    return {"user_id": data.user_id, "recommendations": recommended_courses}

# =====================================================================
# 3. QUIZVIEW: PDF INGESTION & AI MCQ GENERATOR
# =====================================================================
@app.post("/api/quiz/generate-pdf")
async def generate_quiz_from_pdf(
    file: UploadFile = File(...),
    num_questions: int = Form(3)
):
    try:
        pdf_text = ""
        if file.filename.endswith(".pdf"):
            reader = PdfReader(file.file)
            for page in reader.pages:
                pdf_text += page.extract_text() or ""
        else:
            content = await file.read()
            pdf_text = content.decode("utf-8", errors="ignore")
            
        if not pdf_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from document.")
            
        prompt = f"""
        You are an official examiner for India's Official Statistical System.
        Extract key technical concepts from the text below and generate exactly {num_questions} Multiple Choice Questions (MCQs).
        
        Strictly return ONLY a JSON array in this format:
        [
          {{
            "id": "q1",
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option A",
            "explanation": "Detailed explanation of why this answer is correct."
          }}
        ]
        
        Text Content:
        {pdf_text[:4000]}
        """
        
        response = llm_model.generate_content(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )
        
        quiz_data = json.loads(response.text)
        return {"filename": file.filename, "quiz": quiz_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================================
# 4. QUIZVIEW: RAG PDF ASSISTANT CHAT
# =====================================================================
@app.post("/api/chat")
async def pdf_chat_assistant(data: ChatRequest):
    try:
        prompt = f"""
        You are an AI Assistant for India's Official Statistical System learning platform.
        Answer the user's question based strictly on the provided document context.
        If the answer is not in the context, state that clearly and provide a helpful answer based on official statistics standards.

        Document Context:
        {data.document_context[:3000]}

        User Question: {data.question}
        """
        
        response = llm_model.generate_content(prompt)
        return {"answer": response.text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================================
# 5. ADMINVIEW: DASHBOARD ANALYTICS
# =====================================================================
@app.get("/api/analytics/dashboard")
async def get_admin_analytics():
    return {
        "kpis": {
            "total_learners": 1240,
            "quiz_attempts": 3890,
            "avg_competency_gap": "24.5%",
            "avg_quiz_score": "78.2%"
        },
        "domain_gaps": [
            {"domain": "Statistical Competencies", "gap": 18.5},
            {"domain": "Technical Competencies", "gap": 34.2},
            {"domain": "Digital Governance", "gap": 22.0},
            {"domain": "Behavioural Competencies", "gap": 12.1}
        ],
        "role_distribution": [
            {"role": "SSO", "count": 450},
            {"role": "JSO", "count": 620},
            {"role": "Data Analyst", "count": 170}
        ]
    }