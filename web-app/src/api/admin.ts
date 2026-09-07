import axios from 'axios';

const API_BASE_URL = '/api/v1/admin/quizzes';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export const generateQuizFromDoc = async (file: File, competencyId: string, numQuestions: number, difficulty: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('competency_id', competencyId);
  formData.append('num_questions', numQuestions.toString());
  formData.append('difficulty', difficulty);

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
