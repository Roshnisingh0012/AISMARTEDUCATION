import io
import json
import re
from typing import Dict, Any, Optional
import google.generativeai as genai
from pypdf import PdfReader
from core.config import settings

# Configure Gemini with the API key from settings
genai.configure(api_key=settings.GEMINI_API_KEY)

# Use the stable alias that's confirmed available for this key
MODEL_NAME = "gemini-flash-latest"


def extract_pdf_text(file_bytes: bytes, filename: str = "") -> str:
    """Extract text from PDF or DOCX file bytes."""
    try:
        if filename.lower().endswith(".docx"):
            import docx as docxlib
            import io as _io
            doc = docxlib.Document(_io.BytesIO(file_bytes))
            text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        else:
            # Default: treat as PDF
            reader = PdfReader(io.BytesIO(file_bytes))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        return text.strip() or "Standard Computer Science and Programming Assessment"
    except Exception as e:
        print(f"[EXTRACTION ERROR]: {e}")
        return "Standard Computer Science and Programming Assessment"


async def generate_quiz_from_text(
    document_text: str,
    num_questions: int = 5,
    difficulty: str = "Easy",
    quiz_title: Optional[str] = None
) -> Dict[str, Any]:
    """
    Call Gemini to generate exactly `num_questions` MCQs from `document_text`.
    Returns a dict with keys 'quiz_title' and 'questions'.
    """
    model = genai.GenerativeModel(MODEL_NAME)
    final_title = quiz_title.strip() if quiz_title and quiz_title.strip() else "Document Assessment"

    prompt = f"""You are an expert assessment generator.
Based strictly on the document text below, generate exactly {num_questions} multiple-choice questions at '{difficulty}' difficulty.

Document Content:
{document_text[:6000]}

Return ONLY a valid raw JSON object — no markdown, no explanation text — matching this schema exactly:
{{
  "quiz_title": "{final_title}",
  "questions": [
    {{
      "question_text": "Question statement here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option_index": 0,
      "explanation": "Brief explanation of the correct answer."
    }}
  ]
}}

Rules:
- Generate exactly {num_questions} questions. No more, no less.
- Each question must be directly based on the document text.
- options must always be a list of exactly 4 strings.
- correct_option_index must be 0, 1, 2, or 3.
- Do NOT wrap output in markdown code blocks.
"""

    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )

    raw_text = response.text.strip()

    # Strip any accidental markdown fences
    if raw_text.startswith("```"):
        raw_text = re.sub(r"^```[a-zA-Z]*\n?", "", raw_text)
        raw_text = re.sub(r"```$", "", raw_text).strip()

    parsed = json.loads(raw_text)

    if "questions" not in parsed or not isinstance(parsed["questions"], list):
        raise ValueError("Malformed LLM response: missing 'questions' list.")

    # Force quiz_title if repetitive or empty
    title = parsed.get("quiz_title", final_title)
    if not title or len(set(title.split())) <= 2:
        parsed["quiz_title"] = final_title

    return parsed
