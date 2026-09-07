import requests, json

BASE = "http://localhost:8000/api/v1"

r = requests.post(f"{BASE}/auth/login", data={"username": "learner@gov.in", "password": "Learner@123"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

quizzes = requests.get(f"{BASE}/learner/assessments/available", headers=headers).json()
print("QUIZZES (role-filtered for Senior Statistical Officer):")
for q in quizzes:
    print(f"  - {q['title']}")

gaps = requests.get(f"{BASE}/learner/skill-gaps", headers=headers).json()
print("\nSKILL GAPS (role-priority sorted):")
for g in gaps:
    print(f"  [{g['priority']:6}] {g['competency_name']}: {g['current_score']:.0f}/{g['benchmark_score']:.0f} (gap={g['gap']:.0f})")

recs = requests.get(f"{BASE}/learner/recommendations", headers=headers).json()
print("\nCOURSE RECOMMENDATIONS (role-specific):")
for c in recs:
    print(f"  - [{c['provider']}] {c['title']}")
