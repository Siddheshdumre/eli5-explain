from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import wikipedia
import os
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
import json

# LangChain Imports
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import SystemMessage

load_dotenv()

# Supabase Auth Client
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Get API key from environment variable
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

app = FastAPI(title="ELI5 Universe Builder API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str
    difficulty: str
    format_option: str
    context_source: str = "wikipedia" # 'wikipedia' or 'advanced_web_search'

class QuizRequest(BaseModel):
    answer_text: str
    difficulty: str

class QuizCorrectionRequest(BaseModel):
    question: str
    user_answer: str
    correct_answer: str
    original_context: str
    difficulty: str

class QuizQuestion(BaseModel):
    question: str = Field(description="The multiple choice question based on the text")
    options: List[str] = Field(description="Exactly 4 realistic multiple choice options")
    correct_answer: str = Field(description="The exact text of the correct option")
    
class Quiz(BaseModel):
    questions: List[QuizQuestion] = Field(description="Exactly 3 quiz questions")

def verify_auth(req: Request):
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = auth_header.split(" ")[1]
    
    if token in ["null", "undefined"]:
        return None
        
    try:
        user_response = supabase_client.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid session token")
        return user_response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

def get_wikipedia_summary(query: str) -> str:
    try:
        return wikipedia.summary(query, sentences=5)
    except Exception as e:
        print(f"Wikipedia error: {e}")
        return "Could not fetch Wikipedia summary."

def get_system_message(level: str, style: str) -> str:
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
    
    return system_msg

async def langgraph_generate_stream(question: str, level: str, style: str, context_source: str):
    if not GROQ_API_KEY:
        yield f"data: {json.dumps({'type': 'error', 'content': 'GROQ_API_KEY not set.'})}\n\n"
        return
        
    llm = ChatGroq(model=GROQ_MODEL, api_key=GROQ_API_KEY, temperature=0.7)
    system_prompt = get_system_message(level, style)
    
    if context_source == "advanced_web_search":
        if not TAVILY_API_KEY:
            yield f"data: {json.dumps({'type': 'error', 'content': 'TAVILY_API_KEY not set in environment.'})}\n\n"
            return
            
        # Agentic Web Search Flow
        tools = [TavilySearchResults(max_results=3)]
        
        # Override the agent system prompt to include our custom persona instructions
        agent_system_msg = SystemMessage(content=system_prompt + "\n\nYou are a seasoned researcher. Use the search tool to find necessary context before answering. You MUST answer the original user question fully based on the rules provided.")
        
        agent = create_react_agent(llm, tools, state_modifier=agent_system_msg)
        
        # We start the stream in LangGraph
        try:
            # .astream_events allows us to see when tools are called and when text is generated
            async for event in agent.astream_events(
                {"messages": [("user", f"Please explain: {question}")]},
                version="v2"
            ):
                event_type = event["event"]
                
                # Streaming Agent Tool Usage (Thoughts/Actions)
                if event_type == "on_tool_start":
                    tool_name = event["name"]
                    tool_input = event["data"].get("input", {}).get("query", "something")
                    yield f"data: {json.dumps({'type': 'context', 'content': f'Agent researching: \"{tool_input}\" using {tool_name}...'})}\n\n"
                
                # Streaming LLM Generation (The actual answer)
                elif event_type == "on_chat_model_stream":
                    chunk = event["data"]["chunk"]
                    if hasattr(chunk, "content") and chunk.content:
                        # Langchain chunk content might be a string
                        yield f"data: {json.dumps({'type': 'chunk', 'content': chunk.content})}\n\n"
                        
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': f'Agent error: {str(e)}'})}\n\n"

    else:
        # Standard Wikipedia Flow (Legacy) Fast Path
        wiki_summary = get_wikipedia_summary(question)
        if wiki_summary and wiki_summary != "Could not fetch Wikipedia summary.":
            yield f"data: {json.dumps({'type': 'context', 'content': wiki_summary})}\n\n"
            
        user_msg = f"Please explain: {question}"
        if wiki_summary and wiki_summary != "Could not fetch Wikipedia summary.":
            user_msg = (
                f"Here is some factual background context from Wikipedia to help ground your explanation:\n"
                f"---\n{wiki_summary}\n---\n\n"
                f"Based on the context above (and your own knowledge to fill gaps), please explain: {question}"
            )

        messages = [
            ("system", system_prompt),
            ("user", user_msg)
        ]
        
        try:
            async for chunk in llm.astream(messages):
                if chunk.content:
                    yield f"data: {json.dumps({'type': 'chunk', 'content': chunk.content})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
             yield f"data: {json.dumps({'type': 'error', 'content': f'LLM error: {str(e)}'})}\n\n"


@app.post("/api/ask")
async def ask_question(request: QuestionRequest, req: Request):
    verify_auth(req)
    return StreamingResponse(
        langgraph_generate_stream(request.question, request.difficulty, request.format_option, request.context_source),
        media_type="text/event-stream"
    )

@app.post("/api/generate_quiz")
async def generate_quiz(request: QuizRequest, req: Request):
    verify_auth(req)
    
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set.")
        
    llm = ChatGroq(model=GROQ_MODEL, api_key=GROQ_API_KEY, temperature=0.2)
    structured_llm = llm.with_structured_output(Quiz)
    
    prompt = f"Given the following text explained at a {request.difficulty} level, generate exactly 3 multiple-choice questions to test the reader's understanding. Ensure there are 4 options per question, and one clearly correct answer.\n\nTEXT:\n{request.answer_text}"
    
    try:
        result = await structured_llm.ainvoke(prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Quiz Generation error: {str(e)}")

async def explain_quiz_correction_stream(request: QuizCorrectionRequest):
    if not GROQ_API_KEY:
        yield f"data: {json.dumps({'type': 'error', 'content': 'GROQ_API_KEY not set.'})}\n\n"
        return
        
    llm = ChatGroq(model=GROQ_MODEL, api_key=GROQ_API_KEY, temperature=0.5)
    
    prompt = f"""You are a helpful and encouraging tutor. 
The user was asked this question: "{request.question}"
They incorrectly answered: "{request.user_answer}"
The correct answer is: "{request.correct_answer}"

Here is the original context they read:
"{request.original_context}"

In 2-3 sentences max, explain WHY their answer was wrong and why the correct answer is right, using a {request.difficulty} tone. Be very encouraging."""

    try:
        async for chunk in llm.astream(prompt):
            if chunk.content:
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk.content})}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
         yield f"data: {json.dumps({'type': 'error', 'content': f'LLM error: {str(e)}'})}\n\n"

@app.post("/api/explain_quiz_answer")
async def explain_quiz_answer(request: QuizCorrectionRequest, req: Request):
    verify_auth(req)
    return StreamingResponse(
        explain_quiz_correction_stream(request),
        media_type="text/event-stream"
    )

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "groq_api": bool(GROQ_API_KEY), "model": GROQ_MODEL, "tavily_api": bool(TAVILY_API_KEY)}
