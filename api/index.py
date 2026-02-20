from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import wikipedia
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Get API key from environment variable
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

app = FastAPI(title="ELI5 Universe Builder API")

# Configure CORS for production (since Vercel hosts both frontend and backend on the same origin, we can just allow the same origin or be permissive)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's serverless on the same domain, wildcards or specific domains work. But we'll leave it open for simplicity on serverless.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str
    difficulty: str
    format_option: str
    use_wikipedia: bool = True

class QuestionResponse(BaseModel):
    answer: str
    wikipedia_summary: Optional[str] = None

def get_wikipedia_summary(query: str) -> str:
    try:
        return wikipedia.summary(query, sentences=5)
    except Exception as e:
        print(f"Wikipedia error: {e}")
        return "Could not fetch Wikipedia summary."

def build_messages(question: str, context: str, level: str, style: str) -> list:
    styles = {
        "ELI5 (Child)": "Explain like I'm 5 years old. Use very simple words and short sentences.",
        "Intermediate": "Explain like you're teaching a curious teenager.",
        "Expert": "Explain like a computer science professor with technical depth."
    }
    formats = {
        "Standard": "",
        "Storytelling": " Make it a fun story or use creative analogies.",
        "Technical Breakdown": " Break down the explanation into bullet points with technical detail."
    }
    system_msg = f"You are a helpful explainer. {styles[level]}{formats[style]} Keep your answer focused and clear."
    user_msg = f"{question}"
    if context and context != "Could not fetch Wikipedia summary.":
        user_msg = f"Context from Wikipedia:\n{context}\n\nQuestion: {question}"
    return [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": user_msg}
    ]

def groq_generate(messages: list) -> str:
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set.")
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "max_tokens": 1024,
        "temperature": 0.7,
    }
    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=50) # Vercel functions timeout faster
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except requests.exceptions.HTTPError as e:
        error_detail = ""
        try:
            error_detail = response.json().get("error", {}).get("message", str(e))
        except Exception:
            error_detail = str(e)
        print(f"Groq API error: {error_detail}")
        raise HTTPException(status_code=502, detail=f"Groq API error: {error_detail}")
    except Exception as e:
        print(f"Groq API error: {e}")
        raise HTTPException(status_code=500, detail=f"Groq API error: {e}")

@app.post("/api/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    try:
        wiki_summary = ""
        if request.use_wikipedia:
            wiki_summary = get_wikipedia_summary(request.question)
        messages = build_messages(
            request.question,
            wiki_summary,
            request.difficulty,
            request.format_option
        )
        answer = groq_generate(messages)
        return QuestionResponse(
            answer=answer,
            wikipedia_summary=wiki_summary if request.use_wikipedia else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "groq_api": bool(GROQ_API_KEY), "model": GROQ_MODEL}
