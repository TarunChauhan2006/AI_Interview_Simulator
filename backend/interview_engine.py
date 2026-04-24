import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"


def call_groq(prompt):
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict professional HR and technical interviewer.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            max_completion_tokens=1000,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Groq error: {str(e)}"


def generate_question(role, level, resume_context=""):
    prompt = f"""
Ask ONE practical interview question.

Role: {role}
Level: {level}

Resume:
{resume_context[:2500]}

Rules:
Return only the question.
No intro.
No note.
No markdown.
"""
    return call_groq(prompt)


def generate_interview_questions(role, level, resume_context=""):
    questions = []

    for _ in range(5):
        question = generate_question(role, level, resume_context)
        questions.append(question)

    return questions


def generate_feedback(question, answer_text):
    prompt = f"""
Evaluate this interview answer strictly.

Question:
{question}

Candidate Answer:
{answer_text}

Return feedback in this exact format:

Score: /10

Strengths:
-

Weaknesses:
-

Improved Answer:

Next Follow-up Question:
"""
    result = call_groq(prompt)
    return {"feedback": result}
