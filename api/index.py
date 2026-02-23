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

def get_wikipedia_summary(query: str) -> str:
    try:
        return wikipedia.summary(query, sentences=5)
    except Exception as e:
        print(f"Wikipedia error: {e}")
        return "Could not fetch Wikipedia summary."

def get_system_message(level: str, style: str) -> str:
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

    # 4. Return the open stream to the client
    return StreamingResponse(
        langgraph_generate_stream(request.question, request.difficulty, request.format_option, request.context_source),
        media_type="text/event-stream"
    )

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "groq_api": bool(GROQ_API_KEY), "model": GROQ_MODEL, "tavily_api": bool(TAVILY_API_KEY)}
