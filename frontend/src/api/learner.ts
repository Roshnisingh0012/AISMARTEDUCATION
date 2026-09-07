import axios from 'axios';
import {
  DashboardSummary,
  SkillGap,
  CourseRecommendation,
  QuizAvailable,
  QuizQuestionPublic,
  AnswerSubmission,
  QuizResultResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1/learner` : '/api/v1/learner';

// Helper to get token (assuming it's stored in localStorage)
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await axios.get(`${API_BASE_URL}/dashboard-summary`, getAuthHeaders());
  return response.data;
};

export const fetchSkillGaps = async (): Promise<SkillGap[]> => {
  const response = await axios.get(`${API_BASE_URL}/skill-gaps`, getAuthHeaders());
  return response.data;
};

export const fetchRecommendations = async (): Promise<{ courses: CourseRecommendation[] }> => {
  const response = await axios.get(`${API_BASE_URL}/recommendations`, getAuthHeaders());
  return response.data;
};

export const fetchAvailableAssessments = async (): Promise<QuizAvailable[]> => {
  const response = await axios.get(`${API_BASE_URL}/assessments/available`, getAuthHeaders());
  return response.data;
};

export const fetchQuizQuestions = async (quizId: string): Promise<QuizQuestionPublic[]> => {
  const response = await axios.get(`${API_BASE_URL}/assessments/${quizId}`, getAuthHeaders());
  return response.data;
};

export const submitQuiz = async (quizId: string, answers: AnswerSubmission[]): Promise<QuizResultResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/assessments/${quizId}/submit`,
    { answers },
    getAuthHeaders()
  );
  return response.data;
};

export const enrollCourse = async (courseId: string | number) => {
  const response = await axios.post(`/api/v1/learner/courses/${courseId}/enroll`, {}, getAuthHeaders());
  return response.data;
};


export const fetchNotifications = async () => {
  const res = await axios.get('/api/v1/notifications', getAuthHeaders());
  return res.data;
};

export const markNotificationRead = async (id: string) => {
  const res = await axios.patch(`/api/v1/notifications/${id}/read`, {}, getAuthHeaders());
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await axios.post('/api/v1/notifications/mark-all-read', {}, getAuthHeaders());
  return res.data;
};

