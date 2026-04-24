import os
import json
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
                    "content": "You are a professional HR and technical interviewer. Be strict, useful, and practical."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4,
            max_completion_tokens=900,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Groq error: {str(e)}"

def generate_question(role, level, resume_context=""):
    prompt = f"""
Candidate role: {role}
Difficulty: {level}

Candidate resume:
{resume_context[:2500]}

Ask only ONE realistic interview question.
Question should be practical and job-focused.
"""
    return call_groq(prompt)

def generate_feedback(question, answer_text):
    prompt = f"""
Evaluate this interview answer.

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
