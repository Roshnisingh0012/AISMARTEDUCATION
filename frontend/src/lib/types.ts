export type StatisticalRole = 'SSO' | 'JSO' | 'ISS Officer';
export type TechRole =
  | 'Software Engineer'
  | 'Full Stack Developer'
  | 'AI/ML Engineer'
  | 'Data Engineer'
  | 'Cloud & DevOps Engineer'
  | 'GIS Specialist';

export type JobRole = StatisticalRole | TechRole;

export type RoleFamily = 'statistical' | 'technical';

export type DomainKey =
  | 'statistical'
  | 'technical'
  | 'digital_governance'
  | 'behavioural';

export interface DomainMeta {
  key: DomainKey;
  label: string;
  short: string;
  description: string;
}

export type DomainRatings = Record<DomainKey, number>;

export interface RoleMeta {
  role: JobRole;
  family: RoleFamily;
  label: string;
  short: string;
  description: string;
  /** Key technical/statistical skills relevant to this role. */
  skills: string[];
}

export interface LearnerAssessment {
  id?: string;
  name: string;
  job_role: JobRole;
  experience_years: number;
  department: string;
  self_ratings: DomainRatings;
  target_ratings: DomainRatings;
  gap_summary?: Partial<Record<DomainKey, number>>;
  created_at?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResultItem {
  question: string;
  selected: number;
  correct: number;
  explanation: string;
}

export interface QuizAttempt {
  id?: string;
  learner_name: string;
  job_role: JobRole;
  topic: string;
  score: number;
  total: number;
  results: QuizResultItem[];
  created_at?: string;
}

export interface CourseCard {
  id: string;
  title: string;
  provider: 'iGOT Karmayogi' | 'NSSTA';
  domain: DomainKey;
  level: 'Foundation' | 'Intermediate' | 'Advanced';
  durationHours: number;
  description: string;
  skills: string[];
  url: string;
  roles: JobRole[];
}

export type AppRole = 'learner' | 'admin';

export interface AuthUser {
  name: string;
  email: string;
  appRole: AppRole;
  jobRole: JobRole;
  department: string;
  has_completed_diagnostic: boolean;
}
