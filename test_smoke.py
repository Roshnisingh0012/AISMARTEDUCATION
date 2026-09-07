import requests
import sys

BASE_URL = "http://localhost:8000/api/v1"

def test():
    print("Testing Auth...")
    # Login as Admin
    res_admin = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@gov.in", "password": "Admin@123"})
    if res_admin.status_code != 200:
        print("Admin login failed:", res_admin.text)
        sys.exit(1)
    admin_token = res_admin.json()["access_token"]
    
    # Login as Learner
    res_learner = requests.post(f"{BASE_URL}/auth/login", data={"username": "learner@gov.in", "password": "Learner@123"})
    if res_learner.status_code != 200:
        print("Learner login failed:", res_learner.text)
        sys.exit(1)
    learner_token = res_learner.json()["access_token"]

    import docx
    import io
    doc = docx.Document()
    doc.add_paragraph("Python is a popular programming language used for data science and web development.")
    doc_bytes = io.BytesIO()
    doc.save(doc_bytes)
    doc_bytes.seek(0)
    
    print("Testing Quiz Generation...")
    res_quiz = requests.post(
        f"{BASE_URL}/admin/quizzes/generate-from-doc",
        headers={"Authorization": f"Bearer {admin_token}"},
        files={"file": ("test.docx", doc_bytes.getvalue())},
        data={"competency_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479", "num_questions": 1, "difficulty": "Beginner"}
    )
    if res_quiz.status_code != 200:
        print("Quiz Generation failed:", res_quiz.text)
        sys.exit(1)
    
    quiz_data = res_quiz.json()
    print("Quiz Data:", quiz_data)
    if "Mock question generated because API Key is missing" in str(quiz_data):
        print("FAIL: Still using mock question!")
        sys.exit(1)
    print("PASS: Real LLM generation working!")
    
    print("Testing Enrollment...")
    # We need a course ID. We can get dashboard summary to find one.
    res_dash = requests.get(f"{BASE_URL}/learner/dashboard-summary", headers={"Authorization": f"Bearer {learner_token}"})
    courses = res_dash.json().get("recent_recommendations", [])
    if not courses:
        print("No recommended courses found!")
        sys.exit(1)
    
    course_id = courses[0]["course_id"]
    res_enroll = requests.post(
        f"{BASE_URL}/learner/courses/{course_id}/enroll",
        headers={"Authorization": f"Bearer {learner_token}"}
    )
    if res_enroll.status_code != 200:
        print("Enrollment failed:", res_enroll.text)
        sys.exit(1)
        
    print("Enroll Response:", res_enroll.json())
    print("PASS: Enrollment working!")

if __name__ == "__main__":
    test()
