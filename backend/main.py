from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import wikipedia
import os
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
import json

load_dotenv()

# Supabase Auth Client
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

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
    # 1. Persona & Tone Engineering
    styles = {
        "ELI5 (Child)": "You are a warm, imaginative teacher talking to a 5-year-old child. Your goal is to make the child say 'Wow, I get it!' Use simple words, tangible real-world analogies (like toys, cars, or food), and keep sentences short. Never use jargon or complex academic phrasing. Be encouraging.",
        "Intermediate": "You are an engaging high school teacher explaining a concept to a curious teenager. Strike a balance between approachability and factual depth. You can introduce key terms, but you must define them immediately. Keep the tone conversational, interesting, and relatable.",
        "Expert": "You are a university professor or senior industry expert talking to a peer. Prioritize absolute accuracy, technical precision, and depth. Do not shy away from domain-specific jargon, advanced theories, or historical context. Structure your answer logically."
    }
    
    # 2. Structural & Formatting Engineering
    formats = {
        "Standard": "Provide a clear, cohesive explanation in well-structured paragraphs. Use bolding for key concepts.",
        "Storytelling": "Frame your entire explanation as a captivating narrative or a vivid story with characters or a clear plot to illustrate the concept.",
        "Technical Breakdown": "Structure your response entirely using clear headings, bullet points, and numbered lists. Focus heavily on the 'how' and 'why' mechanics."
    }
    
    # 3. Assemble the System Prompt
    system_msg = (
        f"{styles.get(level, styles['Intermediate'])}\n\n"
        f"FORMATTING INSTRUCTION: {formats.get(style, formats['Standard'])}\n\n"
        f"CRITICAL RULES:\n"
        f"- Get straight to the point. Do not start with filler phrases like 'Here is an explanation' or 'Sure!'\n"
        f"- Ensure your tone exactly matches the target audience.\n"
        f"- When explaining a process, timeline, architecture, or relationship, you MUST include a visual diagram.\n"
        f"- Use Mermaid.js syntax for diagrams. Wrap the diagram code exactly in ```mermaid  ``` markdown blocks.\n"
    )

    # 4. Assemble the User Prompt with Context
    user_msg = f"Please explain: {question}"
    if context and context != "Could not fetch Wikipedia summary.":
        user_msg = (
            f"Here is some factual background context from Wikipedia to help ground your explanation:\n"
            f"---\n{context}\n---\n\n"
            f"Based on the context above (and your own knowledge to fill gaps), please explain: {question}"
        )

    return [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": user_msg}
    ]

import json

def groq_generate_stream(messages: list, wiki_summary: Optional[str]):
    if not GROQ_API_KEY:
        yield f"data: {json.dumps({'type': 'error', 'content': 'GROQ_API_KEY not set.'})}\n\n"
        return
        
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "max_tokens": 1024,
        "temperature": 0.7,
        "stream": True # Enable streaming from Groq
    }
    
    # 1. Yield the wikipedia context first so the frontend can display it immediately
    if wiki_summary:
        yield f"data: {json.dumps({'type': 'context', 'content': wiki_summary})}\n\n"
        
    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, stream=True, timeout=50)
        response.raise_for_status()
        
        # 2. Loop over the stream chunks from Groq
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith("data: ") and line_str != "data: [DONE]":
                    try:
                        data = json.loads(line_str[6:])
                        token = data["choices"][0].get("delta", {}).get("content", "")
                        if token:
                            # 3. Yield each new word/token to the frontend
                            yield f"data: {json.dumps({'type': 'chunk', 'content': token})}\n\n"
                    except Exception:
                        pass
        yield "data: [DONE]\n\n"
        
    except requests.exceptions.HTTPError as e:
        error_detail = ""
        try:
            error_detail = response.json().get("error", {}).get("message", str(e))
        except Exception:
            error_detail = str(e)
        yield f"data: {json.dumps({'type': 'error', 'content': f'Groq API error: {error_detail}'})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'content': f'Groq API error: {str(e)}'})}\n\n"

@app.post("/api/ask")
async def ask_question(request: QuestionRequest, req: Request):
    # 1. Verify the Supabase JWT token
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = auth_header.split(" ")[1]
    
    try:
        user_response = supabase_client.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid session token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

    # 2. Proceed with Generation
    wiki_summary = ""
    if request.use_wikipedia:
        wiki_summary = get_wikipedia_summary(request.question)
        
    messages = build_messages(
        request.question,
        wiki_summary,
        request.difficulty,
        request.format_option
    )
    
    # 4. Return the open stream to the client
    return StreamingResponse(
        groq_generate_stream(messages, wiki_summary if request.use_wikipedia else None),
        media_type="text/event-stream"
    )

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "groq_api": bool(GROQ_API_KEY), "model": GROQ_MODEL}
