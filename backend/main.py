from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import wikipedia
import os
import requests
from dotenv import load_dotenv
from supabase import create_client, Client, ClientOptions
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
    context_source: str = "wikipedia"
    thread_id: Optional[str] = None

class QuestionResponse(BaseModel):
    answer: str
    wikipedia_summary: Optional[str] = None

def get_wikipedia_summary(query: str) -> str:
    try:
        return wikipedia.summary(query, sentences=5)
    except Exception as e:
        print(f"Wikipedia error: {e}")
        return "Could not fetch Wikipedia summary."

def build_messages(question: str, context: str, level: str, style: str, previous_messages: list = None) -> list:
    if previous_messages is None:
        previous_messages = []
        
    # 1. Persona & Tone Engineering
    styles = {
        "ELI5 (Child)": "You are a warm, imaginative teacher talking to a 5-year-old child. Use simple words and keep sentences short. NEVER use jargon. You MUST build your entire explanation around one single, cohesive, real-world analogy (like a playground, a sandbox, or a toy box).",
        "Intermediate": "You are an engaging high school teacher explaining a concept to a curious teenager. Strike a balance between approachability and factual depth. Define key terms immediately. You MUST base your explanation around a relatable real-world analogy (like a city, the internet, or a school).",
        "Expert": "You are a university professor or senior industry expert talking to a peer. Prioritize absolute accuracy, technical precision, and depth. Do not shy away from domain-specific jargon, advanced theories, or historical context. Structure your answer logically."
    }
    
    # 2. Structural & Formatting Engineering
    formats = {
        "Standard": "Provide a clear, cohesive explanation. Use bolding for key concepts.",
        "Storytelling": "Frame your entire explanation as a captivating narrative or a vivid story with characters or a clear plot to illustrate the concept.",
        "Technical Breakdown": "Structure your response entirely using clear headings, bullet points, and numbered lists. Focus heavily on the 'how' and 'why' mechanics."
    }
    
    # 3. Assemble the System Prompt
    system_msg = (
        f"{styles.get(level, styles['Intermediate'])}\n\n"
        f"FORMATTING INSTRUCTION: {formats.get(style, formats['Standard'])}\n\n"
        f"CRITICAL RULES:\n"
        f"1. NEVER start by announcing what you are going to do (e.g., 'Here is an explanation of...', 'Sure!'). Just instantly start the explanation.\n"
        f"2. NEVER end with cheesy concluding questions, cliches, or phrases like 'Isn't that amazing?', 'Wow!', or 'Hope that helps!'. End your explanation naturally and abruptly.\n"
        f"3. Structure your response in three parts: A simple 1-sentence hook, the core explanation/analogy, and a 1-sentence practical takeaway."
    )

    messages = [{"role": "system", "content": system_msg}]
    messages.extend(previous_messages)

    # 4. Assemble the User Prompt with Context
    user_msg = f"Please explain: {question}"
    if context and context != "Could not fetch Wikipedia summary.":
        user_msg = (
            f"Here is some factual background context from Wikipedia to help ground your explanation:\n"
            f"---\n{context}\n---\n\n"
            f"Based on the context above (and your own knowledge to fill gaps), please explain: {question}"
        )

    messages.append({"role": "user", "content": user_msg})
    return messages

import json

def groq_generate_stream(messages: list, wiki_summary: Optional[str], thread_id: str, auth_token: str):
    if not GROQ_API_KEY:
        yield f"data: {json.dumps({'type': 'error', 'content': 'GROQ_API_KEY not set.'})}\n\n"
        return
        
    # Yield thread ID first so frontend can update its state
    yield f"data: {json.dumps({'type': 'thread_id', 'content': thread_id})}\n\n"
        
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
        
    full_response = ""
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
                        token_str = data["choices"][0].get("delta", {}).get("content", "")
                        if token_str:
                            full_response += token_str
                            # 3. Yield each new word/token to the frontend
                            yield f"data: {json.dumps({'type': 'chunk', 'content': token_str})}\n\n"
                    except Exception:
                        pass
        
        # 4. Save the assistant's final message to the database
        if full_response and thread_id and auth_token and auth_token not in ["null", "undefined"]:
            try:
                user_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY, options=ClientOptions(headers={"Authorization": f"Bearer {auth_token}"}))
                user_client.table("chat_messages").insert({
                    "thread_id": thread_id,
                    "role": "assistant",
                    "content": full_response
                }).execute()
            except Exception as e:
                print(f"Error saving assistant message: {e}")

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
    
    user_id = None
    if token and token not in ["null", "undefined"]:
        try:
            user_response = supabase_client.auth.get_user(token)
            if user_response.user:
                user_id = user_response.user.id
        except Exception as e:
            pass # allow anonymous

    thread_id = request.thread_id
    previous_messages = []
    
    try:
        if user_id:
            user_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY, options=ClientOptions(headers={"Authorization": f"Bearer {token}"}))
            if not thread_id:
                # Create a new thread
                title = request.question[:50] + "..." if len(request.question) > 50 else request.question
                thread_res = user_client.table("chat_threads").insert({"user_id": user_id, "title": title}).execute()
                thread_id = thread_res.data[0]['id']
            else:
                # Fetch past messages to load history
                msg_res = user_client.table("chat_messages").select("*").eq("thread_id", thread_id).order("created_at").execute()
                for msg in msg_res.data:
                    previous_messages.append({"role": msg["role"], "content": msg["content"]})
                    
            # Save the current user question to the database
            user_client.table("chat_messages").insert({
                "thread_id": thread_id,
                "role": "user",
                "content": request.question
            }).execute()
        else:
            thread_id = "" # Force empty thread for anonymous users
            
    except Exception as e:
        print(f"Error handling database chat logs: {e}")

    # 2. Proceed with Generation
    wiki_summary = ""
    if request.use_wikipedia:
        wiki_summary = get_wikipedia_summary(request.question)
        
    messages = build_messages(
        request.question,
        wiki_summary,
        request.difficulty,
        request.format_option,
        previous_messages
    )
    
    # 4. Return the open stream to the client
    return StreamingResponse(
        groq_generate_stream(messages, wiki_summary if request.use_wikipedia else None, thread_id, token),
        media_type="text/event-stream"
    )

@app.get("/api/threads")
async def get_threads(req: Request):
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header.split(" ")[1]
    try:
        user_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY, options=ClientOptions(headers={"Authorization": f"Bearer {token}"}))
        res = user_client.table("chat_threads").select("*").order("created_at", desc=True).execute()
        return {"threads": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/threads/{thread_id}/messages")
async def get_thread_messages(thread_id: str, req: Request):
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header.split(" ")[1]
    try:
        user_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY, options=ClientOptions(headers={"Authorization": f"Bearer {token}"}))
        res = user_client.table("chat_messages").select("*").eq("thread_id", thread_id).order("created_at").execute()
        return {"messages": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "groq_api": bool(GROQ_API_KEY), "model": GROQ_MODEL}
