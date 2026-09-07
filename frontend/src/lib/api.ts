const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// 1. Analyze Skill Gap
export async function analyzeSkillGap(userId: string, designation: string, selfRatings: Record<string, number>) {
  const res = await fetch(`${API_BASE_URL}/api/assessments/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, designation, self_ratings: selfRatings })
  });
  return res.json();
}

// 2. Fetch iGOT Recommendations
export async function fetchRecommendations(userId: string, gaps: string[]) {
  const res = await fetch(`${API_BASE_URL}/api/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, identified_gaps: gaps })
  });
  return res.json();
}

// 3. Generate Quiz from Uploaded PDF
export async function generateQuizFromPDF(file: File, numQuestions: number = 3) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("num_questions", numQuestions.toString());

  const res = await fetch(`${API_BASE_URL}/api/quiz/generate-pdf`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

// 4. RAG Chat Assistant Query
export async function askPdfAssistant(question: string, documentContext: string) {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, document_context: documentContext })
  });
  return res.json();
}

// 5. Fetch Admin Dashboard Analytics
export async function fetchAdminAnalytics() {
  const res = await fetch(`${API_BASE_URL}/api/analytics/dashboard`);
  return res.json();
}