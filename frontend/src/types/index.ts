export interface CourseRecommendation {
  course_id: string;
  title: string;
  provider: string;
  skill_name: string;
  level: string;
  duration?: string;
  external_url?: string;
  reason: string;
}

export interface DashboardSummary {
  overall_competency_avg: number;
  total_skill_gaps_count: number;
  high_priority_gaps_count: number;
  completed_assessments_count: number;
  recent_recommendations: CourseRecommendation[];
  skill_gaps: SkillGap[];
}

export interface SkillGap {
  competency_id: string;
  competency_name: string;
  benchmark_score: number;
  current_score: number;
  gap: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  ai_reasoning: string;
}

export interface QuizQuestionPublic {
  id: string;
  question_text: string;
  question_text_hi?: string;
  options: string[];
  options_hi?: string[];
}

export interface QuizAvailable {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  passing_score?: number;
  competency_id?: string;
}

export interface AnswerSubmission {
  question_id: string;
  selected_option_index: number;
}

export interface QuestionResult {
  question_id: string;
  selected_option_index: number;
  correct_option_index: number;
  is_correct: boolean;
  explanation?: string;
  explanation_hi?: string;
}

export interface QuizResultResponse {
  score_percentage: number;
  results: QuestionResult[];
}

export interface ForecastPoint {
  month: string;
  actual?: number | null;
  predicted?: number | null;
}

export interface AtRiskCompetency {
  name: string;
  current_avg: number;
  projected_6mo: number;
  benchmark: number;
  risk_level: string;
}

export interface PredictiveTrendsResponse {
  forecast_timeline: ForecastPoint[];
  at_risk_competencies: AtRiskCompetency[];
  recommended_interventions: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

