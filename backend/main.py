from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import wikipedia
import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv(".env")
print("TOGETHER_API_KEY (debug):", os.getenv("TOGETHER_API_KEY"))

# Hardcode the API key and model
TOGETHER_API_KEY = "59d52ed2a9cc794d48bb56e40b35fc13302224fc48e6467eed728933879cc164"
TOGETHER_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"
TOGETHER_API_URL = "https://api.together.xyz/v1/completions"

app = FastAPI(title="ELI5 Universe Builder API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:8081", "http://127.0.0.1:8080", "http://127.0.0.1:8081"],
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

def format_prompt(question: str, context: str, level: str, style: str) -> str:
    styles = {
        "ELI5 (Child)": "Explain like I'm 5 years old.",
        "Intermediate": "Explain like you're teaching a teenager.",
        "Expert": "Explain like a computer science professor."
    }
    formats = {
        "Standard": "",
        "Storytelling": " Make it a fun story or use analogies.",
        "Technical Breakdown": " Break down the explanation into bullet points with technical detail."
    }
    return f"""[Context]
{context}

[Task]
{styles[level]}{formats[style]}

Question: {question}

Answer:"""

def together_generate(prompt: str) -> str:
    if not TOGETHER_API_KEY:
        raise HTTPException(status_code=500, detail="Together API key not set.")
    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": TOGETHER_MODEL,
        "prompt": prompt,
        "max_tokens": 512,
        "temperature": 0.7,
        "stop": ["Question:", "\n\n"]
    }
    try:
        response = requests.post(TOGETHER_API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["text"].strip()
    except Exception as e:
        print(f"Together API error: {e}")
        raise HTTPException(status_code=500, detail=f"Together API error: {e}")

@app.post("/api/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    try:
        wiki_summary = ""
        if request.use_wikipedia:
            wiki_summary = get_wikipedia_summary(request.question)
        prompt = format_prompt(
            request.question,
            wiki_summary,
            request.difficulty,
            request.format_option
        )
        answer = together_generate(prompt)
        return QuestionResponse(
            answer=answer,
            wikipedia_summary=wiki_summary if request.use_wikipedia else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "together_api": bool(TOGETHER_API_KEY)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 