# ELI5 Universe Builder 🌌

An advanced, AI-powered conversational platform that explains complex topics effortlessly. Powered by the incredibly fast Llama 3 model (via Groq API), this application acts as a stateful, agentic tutor capable of adapting to different audiences, searching the web in real-time, and aggressively verifying learning through generated quizzes.

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Core Features

*   🧠 **Adaptive Persona Contexts:** Tailor responses dynamically across multiple difficulties (ELI5 Child, Intermediate Teen, Expert Adult), ensuring maximum relatability and appropriate vocabulary without cheesy filler.
*   💬 **Persistent Chat History:** Sign in, start a thread, and pick it up later. Built on a fully normalized Supabase PostgreSQL database, your conversation threads and messages are securely persisted and loaded into the sleek sidebar interface.
*   🎯 **Socrates Mode (Active Learning):** Toggle this mode to instantly generate bespoke 3-question multiple-choice quizzes automatically derived from the AI's explanation. Incorrect answers trigger an immediate, Socratic micro-explanation explaining exactly *why* the thought process was flawed. 
*   🌐 **Agentic Web Search:** Ask questions requiring up-to-date knowledge. Powered by LangGraph and Tavily, the underlying AI operates as a ReAct agent to independently research, synthesize, and answer questions using standard Google search protocols.
*   🔒 **Secure Authentication:** Integrated JWT-based authentication using Supabase Auth. Users must log in, ensuring their history and profile context is siloed securely using Row Level Security (RLS).
*   🎭 **Flexible Output Formatting:** Request answers as simple summaries, storytelling narratives, or dense technical breakdowns using markdown and structured responses.

## 🛠 Tech Stack

### Frontend Architecture
*   **React 18 + TypeScript:** Strongly-typed component architecture.
*   **Vite:** Extremely fast frontend tooling.
*   **Shadcn UI & Tailwind CSS:** Beautiful, accessible, zero-runtime-cost styling system leveraging Radix UI primitives.
*   **React Router:** For deep-linking into specific chat threads and secure route handling.
*   **Supabase JS:** Seamless authentication and real-time database querying.

### Backend Architecture
*   **FastAPI (Python):** Blazing fast, asynchronous HTTP server handling streaming responses dynamically.
*   **Groq API (Llama 3):** Providing ultra-fast inference to give the LLM near-zero latency.
*   **LangGraph & LangChain:** Orchestrating the "Agentic Web Search" workflows and structured output generation.
*   **Supabase (PostgreSQL):** Managing users, threads, messages, and RLS policies.
*   **Wikipedia & Tavily Search API:** Fetching live unstructured text context for grounded RAG (Retrieval-Augmented Generation).

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   Python 3.10 or higher
*   A [Groq](https://console.groq.com/) API Key
*   A [Supabase](https://supabase.com/) Project (URL & Anon Key)
*   A [Tavily](https://tavily.com/) API Key for optional Agentic Search.

### Backend Setup
1. Open a new terminal and navigate to the backend (`backend/` or `api/` for remote serverless deployment):
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```
2. Set up your environment variables locally in `backend/.env` exactly like:
   ```env
   GROQ_API_KEY=your_groq_key
   TAVILY_API_KEY=your_tavily_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   ```
3. Run the development server cleanly:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup
1. In a new terminal, navigate to the root directory and install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` in the root explicitly mapping the Supabase credentials for the client:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the gorgeous UI at [http://localhost:5173](http://localhost:5173) (or whichever port Vite allocates)!

## 🔮 Usage Journey
1. Navigate to the web app, click **SignUp** (to create an account via Supabase auth), and then **Login**.
2. Start a fresh thread in the chat interface. You can adjust the **Difficulty** and the **Source Option**. Try changing "Basic Wikipedia" to "Agentic Web Search" and ask a question about today's news!
3. Toggle the **Socrates Quiz** switch, ask a complex explanation, and test your knowledge interactively below the chat bubble.
4. Close the browser, bring it back up later, log in, and click your previous chat thread on the left-side Sidebar to resume right where you left off.

## 📝 License
> ⚠️ This is a **proprietary project** by Siddhesh Dumre.
> All rights reserved. No part of this code may be used, copied, or modified without explicit permission.
