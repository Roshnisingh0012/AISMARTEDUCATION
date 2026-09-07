import type {
  DomainMeta,
  DomainKey,
  JobRole,
  DomainRatings,
  RoleMeta,
  RoleFamily,
} from './types';

export const DOMAINS: DomainMeta[] = [
  {
    key: 'statistical',
    label: 'Statistical',
    short: 'Statistical',
    description:
      'Sampling design, estimation theory, survey methodology, national accounts & data quality frameworks.',
  },
  {
    key: 'technical',
    label: 'Technical',
    short: 'Technical',
    description:
      'Programming, system architecture, data engineering, ML/AI, cloud infrastructure, APIs & reproducible workflows.',
  },
  {
    key: 'digital_governance',
    label: 'Digital Governance',
    short: 'Digital Gov',
    description:
      'e-Governance platforms, data portals, API-first systems, digital service delivery & citizen-centric design.',
  },
  {
    key: 'behavioural',
    label: 'Behavioural',
    short: 'Behavioural',
    description:
      'Leadership, communication, ethics in public statistics, stakeholder management & inter-departmental coordination.',
  },
];

export const DOMAIN_KEYS = DOMAINS.map((d) => d.key);

export const STATISTICAL_ROLES: JobRole[] = ['SSO', 'JSO', 'ISS Officer'];

export const TECH_ROLES: JobRole[] = [
  'Software Engineer',
  'Full Stack Developer',
  'AI/ML Engineer',
  'Data Engineer',
  'Cloud & DevOps Engineer',
  'GIS Specialist',
];

export const ALL_ROLES: JobRole[] = [...STATISTICAL_ROLES, ...TECH_ROLES];

export const ROLE_META: Record<JobRole, RoleMeta> = {
  SSO: {
    role: 'SSO',
    family: 'statistical',
    label: 'Senior Statistical Officer',
    short: 'SSO',
    description: 'Leads survey operations and data quality at directorate level.',
    skills: ['Sampling design', 'Survey operations', 'Data quality', 'NSS / NFHS'],
  },
  JSO: {
    role: 'JSO',
    family: 'statistical',
    label: 'Junior Statistical Officer',
    short: 'JSO',
    description: 'Executes data collection, tabulation and basic statistical analysis.',
    skills: ['Tabulation', 'Basic statistics', 'Data collection', 'R / Excel'],
  },
  'ISS Officer': {
    role: 'ISS Officer',
    family: 'statistical',
    label: 'ISS Officer',
    short: 'ISS Officer',
    description: 'Senior policy and strategy role in the Indian Statistical Service.',
    skills: ['National accounts', 'Policy', 'Statistical leadership', 'SQAF'],
  },
  'Software Engineer': {
    role: 'Software Engineer',
    family: 'technical',
    label: 'Software Engineer',
    short: 'SWE',
    description: 'Builds and maintains applications for statistical systems.',
    skills: ['Python', 'System design', 'APIs', 'Testing', 'Git'],
  },
  'Full Stack Developer': {
    role: 'Full Stack Developer',
    family: 'technical',
    label: 'Full Stack Developer',
    short: 'FSD',
    description: 'End-to-end web platforms for data portals and dashboards.',
    skills: ['React', 'Node.js', 'REST APIs', 'PostgreSQL', 'Docker'],
  },
  'AI/ML Engineer': {
    role: 'AI/ML Engineer',
    family: 'technical',
    label: 'AI/ML Engineer',
    short: 'ML',
    description: 'Develops models for nowcasting, imputation and indicator estimation.',
    skills: ['Python', 'PyTorch', 'Model deployment', 'MLOps', 'Forecasting'],
  },
  'Data Engineer': {
    role: 'Data Engineer',
    family: 'technical',
    label: 'Data Engineer',
    short: 'DE',
    description: 'Builds pipelines, warehouses and metadata infrastructure.',
    skills: ['ETL', 'Airflow', 'Spark', 'Parquet', 'Data warehousing'],
  },
  'Cloud & DevOps Engineer': {
    role: 'Cloud & DevOps Engineer',
    family: 'technical',
    label: 'Cloud & DevOps Engineer',
    short: 'DevOps',
    description: 'Manages cloud infrastructure, CI/CD and observability.',
    skills: ['AWS / Azure', 'Kubernetes', 'Terraform', 'CI/CD', 'Monitoring'],
  },
  'GIS Specialist': {
    role: 'GIS Specialist',
    family: 'technical',
    label: 'GIS Specialist',
    short: 'GIS',
    description: 'Spatial data integration, geocoding and choropleth mapping.',
    skills: ['QGIS', 'PostGIS', 'Geocoding', 'Spatial analysis', 'Python'],
  },
};

/** Expected competency target per domain for each job role (0-100). */
export const ROLE_TARGETS: Record<JobRole, DomainRatings> = {
  SSO: { statistical: 70, technical: 55, digital_governance: 50, behavioural: 60 },
  JSO: { statistical: 80, technical: 70, digital_governance: 65, behavioural: 70 },
  'ISS Officer': { statistical: 90, technical: 80, digital_governance: 80, behavioural: 85 },
  'Software Engineer': { statistical: 45, technical: 90, digital_governance: 70, behavioural: 55 },
  'Full Stack Developer': { statistical: 40, technical: 92, digital_governance: 75, behavioural: 55 },
  'AI/ML Engineer': { statistical: 65, technical: 95, digital_governance: 65, behavioural: 55 },
  'Data Engineer': { statistical: 55, technical: 90, digital_governance: 70, behavioural: 50 },
  'Cloud & DevOps Engineer': { statistical: 35, technical: 92, digital_governance: 75, behavioural: 55 },
  'GIS Specialist': { statistical: 60, technical: 85, digital_governance: 65, behavioural: 50 },
};

export function emptyRatings(): DomainRatings {
  return { statistical: 0, technical: 0, digital_governance: 0, behavioural: 0 };
}

export function computeGaps(
  self: DomainRatings,
  target: DomainRatings,
): Partial<Record<DomainKey, number>> {
  const gaps: Partial<Record<DomainKey, number>> = {};
  for (const key of DOMAIN_KEYS) {
    gaps[key] = Math.max(0, target[key] - self[key]);
  }
  return gaps;
}

export function roleFamilyOf(role: JobRole): RoleFamily {
  return ROLE_META[role].family;
}
