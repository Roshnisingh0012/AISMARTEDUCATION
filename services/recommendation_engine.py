from db.models import MockCourse

def get_course_level_for_score(score: float) -> str:
    if score < 40.0:
        return "Beginner"
    elif score <= 70.0:
        return "Intermediate"
    else:
        return "Advanced"

def recommend_courses(gaps: list, available_courses: list) -> list:
    target_competency_ids = {g["competency_id"]: g for g in gaps if g["priority"] in ["HIGH", "MEDIUM"]}
    
    recommendations = []
    
    for course in available_courses:
        if course.competency_id in target_competency_ids:
            gap_info = target_competency_ids[course.competency_id]
            target_level = get_course_level_for_score(gap_info["current_score"])
            
            if course.level.value == target_level:
                recommendations.append({
                    "course_id": course.id,
                    "title": course.title,
                    "provider": course.provider.value,
                    "skill_name": gap_info["competency_name"],
                    "level": course.level.value,
                    "duration": course.duration,
                    "external_url": course.external_url,
                    "reason": f"Recommended to address a {gap_info['priority']} priority gap in {gap_info['competency_name']} at {target_level} level."
                })
    
    if not recommendations:
        for course in available_courses:
            if course.level.value == "Beginner":
                recommendations.append({
                    "course_id": course.id,
                    "title": course.title,
                    "provider": course.provider.value,
                    "skill_name": "Fundamental Skills",
                    "level": course.level.value,
                    "duration": course.duration,
                    "external_url": course.external_url,
                    "reason": f"Baseline course recommended for foundational knowledge."
                })
                if len(recommendations) >= 3:
                    break
                    
    return recommendations
