"""
Comprehensive Role-to-Competency mapping for the AI Skill Intelligence Platform.
Covers MoSPI / NSSTA / IT / Analytics / Administrative profiles.
"""

CANONICAL_ROLES = [
    "Senior Statistical Officer",
    "Field Survey Officer",
    "Data Engineer",
    "Data Analyst / Statistical Assistant",
    "Director / Joint Director"
]

def normalize_role(role_or_designation: str) -> str:
    """Normalize user role strings (trim spaces, case-insensitive comparison, keyword parsing)."""
    if not role_or_designation:
        return "Senior Statistical Officer"
    
    r = role_or_designation.lower().strip()
    
    if any(k in r for k in ["director", "joint director", "deputy director", "leadership", "policy", "dg", "advisor"]):
        return "Director / Joint Director"
    elif any(k in r for k in ["engineer", "dev", "developer", "full stack", "backend", "frontend", "software", "architect", "database"]):
        return "Data Engineer"
    elif any(k in r for k in ["survey", "field", "investigator", "enumerator", "capi", "papi", "sampling officer"]):
        return "Field Survey Officer"
    elif any(k in r for k in ["analyst", "assistant", "bi", "visualisation", "visualization", "excel", "data science"]):
        return "Data Analyst / Statistical Assistant"
    else:
        return "Senior Statistical Officer"

# Maps role keywords -> list of competency names in priority order
ROLE_COMPETENCY_MAP = {
    # ── Statistical / MoSPI roles ───────────────────────────────────────────
    "senior statistical officer": [
        "Survey Sampling & Estimation",
        "National Accounts & Official Stats",
        "Python for Data Analysis",
        "Data Quality & Metadata Frameworks",
    ],
    "sso": [
        "Survey Sampling & Estimation",
        "National Accounts & Official Stats",
        "Python for Data Analysis",
        "Data Quality & Metadata Frameworks",
    ],
    "statistical officer": [
        "Survey Sampling & Estimation",
        "National Accounts & Official Stats",
        "Python for Data Analysis",
        "Data Quality & Metadata Frameworks",
    ],
    "field survey officer": [
        "Survey Sampling & Estimation",
        "Data Quality & Metadata Frameworks",
        "GIS & Spatial Data Processing",
    ],
    "field investigator": [
        "Survey Sampling & Estimation",
        "Data Quality & Metadata Frameworks",
        "GIS & Spatial Data Processing",
    ],
    "enumerator": [
        "Survey Sampling & Estimation",
        "Data Quality & Metadata Frameworks",
    ],

    # ── IT / Engineering roles ──────────────────────────────────────────────
    "data engineer": [
        "Database Engineering (PostgreSQL/SQL)",
        "Backend API Architecture (FastAPI/Python)",
        "SQL & Relational Databases",
        "Python for Data Analysis",
    ],
    "full stack developer": [
        "Frontend Development (React/TypeScript)",
        "Backend API Architecture (FastAPI/Python)",
        "Database Engineering (PostgreSQL/SQL)",
    ],
    "software developer": [
        "Frontend Development (React/TypeScript)",
        "Backend API Architecture (FastAPI/Python)",
        "Database Engineering (PostgreSQL/SQL)",
    ],
    "software engineer": [
        "Frontend Development (React/TypeScript)",
        "Backend API Architecture (FastAPI/Python)",
        "Database Engineering (PostgreSQL/SQL)",
    ],
    "backend developer": [
        "Backend API Architecture (FastAPI/Python)",
        "Database Engineering (PostgreSQL/SQL)",
    ],
    "frontend developer": [
        "Frontend Development (React/TypeScript)",
    ],

    # ── Analytics / Data Science roles ─────────────────────────────────────
    "data analyst": [
        "Python for Data Analysis",
        "SQL & Relational Databases",
        "Data Quality & Metadata Frameworks",
    ],
    "data analyst / statistical assistant": [
        "Python for Data Analysis",
        "SQL & Relational Databases",
        "Data Quality & Metadata Frameworks",
    ],
    "statistical assistant": [
        "Python for Data Analysis",
        "SQL & Relational Databases",
        "Data Quality & Metadata Frameworks",
    ],
    "data scientist": [
        "Python for Data Analysis",
        "SQL & Relational Databases",
        "Survey Sampling & Estimation",
    ],
    "business analyst": [
        "Python for Data Analysis",
        "SQL & Relational Databases",
        "Data Quality & Metadata Frameworks",
    ],

    # ── Administrative / General roles ─────────────────────────────────────
    "administrative officer": [
        "Public Procurement (GeM)",
        "RTI Act & Governance",
        "General Financial Rules (GFR)",
    ],
    "admin officer": [
        "Public Procurement (GeM)",
        "RTI Act & Governance",
        "General Financial Rules (GFR)",
    ],
    "section officer": [
        "Public Procurement (GeM)",
        "RTI Act & Governance",
        "General Financial Rules (GFR)",
    ],
    "under secretary": [
        "Public Procurement (GeM)",
        "RTI Act & Governance",
        "General Financial Rules (GFR)",
    ],

    # ── Leadership / Training roles ─────────────────────────────────────────
    "director / joint director": [
        "National Accounts & Official Stats",
        "Data Quality & Metadata Frameworks",
        "Survey Sampling & Estimation",
    ],
    "director": [
        "National Accounts & Official Stats",
        "Data Quality & Metadata Frameworks",
        "Survey Sampling & Estimation",
    ],
    "deputy director": [
        "Survey Sampling & Estimation",
        "Data Quality & Metadata Frameworks",
        "National Accounts & Official Stats",
    ],
    "joint director": [
        "National Accounts & Official Stats",
        "Survey Sampling & Estimation",
    ],
}

# Domain groups: used to bucket roles together for DB lookups
DOMAIN_GROUPS = {
    "statistical": ["survey sampling & estimation", "national accounts & official stats",
                    "python for data analysis", "data quality & metadata frameworks",
                    "gis & spatial data processing"],
    "it":          ["frontend development (react/typescript)", "backend api architecture (fastapi/python)",
                    "database engineering (postgresql/sql)"],
    "analytics":   ["python for data analysis", "sql & relational databases",
                    "data quality & metadata frameworks"],
    "admin":       ["public procurement (gem)", "rti act & governance",
                    "general financial rules (gfr)"],
}


def get_relevant_competencies_for_user(designation: str) -> list:
    """Return list of competency names relevant to the user's designation."""
    if not designation:
        return []
    key = designation.lower().strip()

    # Exact match
    if key in ROLE_COMPETENCY_MAP:
        return ROLE_COMPETENCY_MAP[key]

    # Partial / keyword match (longest key wins)
    best, best_len = [], 0
    for role_key, comps in ROLE_COMPETENCY_MAP.items():
        if role_key in key or key in role_key:
            if len(role_key) > best_len:
                best, best_len = comps, len(role_key)
    
    if not best:
        norm = normalize_role(designation)
        if norm.lower() in ROLE_COMPETENCY_MAP:
            return ROLE_COMPETENCY_MAP[norm.lower()]

    return best


def get_domain_for_designation(designation: str) -> str:
    """Return broad domain string for a designation."""
    comps = [c.lower() for c in get_relevant_competencies_for_user(designation)]
    if not comps:
        return "general"
    for domain, domain_comps in DOMAIN_GROUPS.items():
        if any(dc in comps for dc in domain_comps):
            return domain
    return "general"

