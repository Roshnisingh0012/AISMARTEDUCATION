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
  options: string[];
}

export interface QuizAvailable {
  id: string;
  title: string;
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
}

export interface QuizResultResponse {
  score_percentage: number;
  results: QuestionResult[];
}
