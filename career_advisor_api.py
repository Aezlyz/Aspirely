from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

app = FastAPI()

# ==============================
# CORS Middleware
# ==============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# Load Data (single file now)
# ==============================
with open("questions_trees_updated.json", "r") as f:
    QUESTION_TREE = json.load(f)["questions"]

# ==============================
# Models
# ==============================
class Answer(BaseModel):
    question_id: str
    selected_tags: List[str]

class Submission(BaseModel):
    answers: Optional[List[Answer]] = None
    career: Optional[dict] = None  # full career object now

# ==============================
# API Endpoints
# ==============================
@app.get("/questions")
def get_all_questions():
    return {"questions": QUESTION_TREE}

@app.get("/question/{question_id}")
def get_question(question_id: str):
    q = next((q for q in QUESTION_TREE if q["question_id"] == question_id), None)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q

@app.post("/submit")
def submit_quiz(submission: Submission):
    if submission.career:
        career_obj = submission.career
        return {
            "top_match": career_obj["title"],
            "explanation": {
                "why": [f"You reached {career_obj['title']} based on your answers."],
                "career_details": career_obj
            }
        }
    raise HTTPException(status_code=400, detail="No career selected")

# Run with:
# uvicorn career_advisor_api:app --reload --host 127.0.0.1 --port 8000
#uvicorn career_advisor_api:app --reload


#cd C:\Users\sarth\projects\Aspirely
#set QUESTIONS_JSON=C:\Users\sarth\projects\aspirely1\client\public\questions_trees_updated.json
#python -m uvicorn career_advisor_api:app --reload --port 8000
