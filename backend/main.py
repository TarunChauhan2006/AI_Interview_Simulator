from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from resume_parser import extract_resume_text
from interview_engine import (
    generate_question,
    generate_feedback,
    generate_interview_questions,
)

app = FastAPI(title="AI Interview Simulator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

resume_context = ""


@app.get("/")
def home():
    return {
        "message": "AI Interview Simulator Backend Running 🚀",
        "status": "live",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    global resume_context
    resume_context = await extract_resume_text(file)

    return {
        "message": "Resume uploaded successfully",
        "preview": resume_context[:500],
    }


@app.post("/question")
async def question(role: str = Form(...), level: str = Form(...)):
    question_text = generate_question(role, level, resume_context)
    return {"question": question_text}


@app.post("/interview/start")
async def start_interview(role: str = Form(...), level: str = Form(...)):
    questions = generate_interview_questions(role, level, resume_context)
    return {"questions": questions}


@app.post("/answer")
async def answer(question: str = Form(...), answer_text: str = Form(...)):
    feedback = generate_feedback(question, answer_text)
    return feedback