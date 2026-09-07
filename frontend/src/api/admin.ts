import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1/admin/quizzes` : '/api/v1/admin/quizzes';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export const generateQuizFromDoc = async (file: File, competencyId: string, numQuestions: number, difficulty: string, customTitle: string = '', targetRole: string = 'All Roles', isDiagnostic: boolean = false) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('competency_id', competencyId);
  formData.append('num_questions', numQuestions.toString());
  formData.append('difficulty', difficulty);
  formData.append('target_role', targetRole);
  formData.append('is_diagnostic', isDiagnostic.toString());
  if (customTitle) formData.append('custom_title', customTitle);

  const response = await axios.post(`${API_BASE_URL}/generate-from-doc`, formData, {
    headers: {
      ...getAuthHeaders().headers,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data; // { message, quiz_id }
};

export const fetchQuizPreview = async (quizId: string) => {
  const response = await axios.get(`${API_BASE_URL}/${quizId}/preview`, getAuthHeaders());
  return response.data;
};

export const updateQuestion = async (quizId: string, questionId: string, payload: any) => {
  const response = await axios.put(`${API_BASE_URL}/${quizId}/questions/${questionId}`, payload, getAuthHeaders());
  return response.data;
};

export const deleteQuestion = async (quizId: string, questionId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/${quizId}/questions/${questionId}`, getAuthHeaders());
  return response.data;
};

export const publishQuiz = async (quizId: string) => {
  const response = await axios.post(`${API_BASE_URL}/${quizId}/publish`, {}, getAuthHeaders());
  return response.data;
};

export const fetchPredictiveTrends = async () => {
  const baseUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1';
  const res = await axios.get(`${baseUrl}/admin/analytics/predictive-trends`, getAuthHeaders());
  return res.data;
};

export const fetchRoleMetrics = async () => {
  const baseUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1';
  const res = await axios.get(`${baseUrl}/admin/analytics/role-metrics`, getAuthHeaders());
  return res.data;
};
