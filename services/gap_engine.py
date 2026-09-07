from db.models import Competency, UserCompetency

def calculate_gap(benchmark: float, current: float) -> float:
    return max(0.0, benchmark - current)

def get_priority(gap: float) -> str:
    if gap >= 30.0:
        return "HIGH"
    elif 10.0 <= gap < 30.0:
        return "MEDIUM"
    elif 0.0 < gap < 10.0:
        return "LOW"
    else:
        return "NONE"

def generate_ai_reasoning(competency_name: str, current_score: float, benchmark: float, priority: str) -> str:
    if priority == "HIGH":
        return f"Your {competency_name} score is {current_score}% against a {benchmark}% benchmark, requiring immediate foundational upskilling."
    elif priority == "MEDIUM":
        return f"Your {competency_name} score is {current_score}% against a {benchmark}% benchmark. Targeted intermediate learning is recommended."
    elif priority == "LOW":
        return f"You are very close to the benchmark for {competency_name}. A quick refresher will close this gap."
    else:
        return f"You have met or exceeded the benchmark for {competency_name}. Excellent work!"

def analyze_user_gaps(competencies: list, user_competencies: list) -> list:
    uc_map = {uc.competency_id: uc for uc in user_competencies}
    gaps = []
    
    for comp in competencies:
        uc = uc_map.get(comp.id)
        current_score = uc.current_score if uc else 0.0
        
        gap_value = calculate_gap(comp.benchmark_score, current_score)
        priority = get_priority(gap_value)
        
        reasoning = generate_ai_reasoning(comp.name, current_score, comp.benchmark_score, priority)
        
        gaps.append({
            "competency_id": comp.id,
            "competency_name": comp.name,
            "benchmark_score": comp.benchmark_score,
            "current_score": current_score,
            "gap": gap_value,
            "priority": priority,
            "ai_reasoning": reasoning
        })
    return gaps
