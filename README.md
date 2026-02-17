# ELI5 - Explain Like I'm Five

An AI-powered application that explains complex topics in simple terms, using the Llama 3 model via the Groq API. The application provides explanations at different difficulty levels (Child, Teen, Adult) and in various formats (Standard, Story, Technical).

## Features

- 🤖 Powered by Llama 3 (Groq API)
- 📚 Wikipedia integration for context-aware explanations
- 🎯 Multiple difficulty levels:
  - ELI5 (Child) - Simple explanations for young children
  - Teen - More detailed explanations for teenagers
  - Adult - Comprehensive explanations for adults
- 📝 Multiple explanation formats:
  - Standard - Clear and concise explanations
  - Story - Narrative-style explanations
  - Technical - Detailed technical explanations
- 🎨 Modern UI built with React, TypeScript, and Shadcn UI
- ⚡ Fast backend using FastAPI

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Shadcn UI
- Tailwind CSS

### Backend
- FastAPI
- Python
- Groq API (Llama 3)
- Wikipedia API

## Setup

### 🚀 Docker Deployment (Recommended)

You can run the entire application (frontend and backend) using Docker. This is the easiest way to get started and ensures all dependencies are handled automatically.

#### 1. Build and start the containers
```bash
docker compose up --build
```

#### 2. Access the app
- Frontend: http://localhost:8081/app
- Backend API: http://localhost:8000

#### 3. Environment Variables
Copy `env.example` to `.env` and fill in your Groq API key and other settings as needed before starting Docker.

---

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher
- Groq API key

### Frontend Setup
1. Clone the repository
```bash
git clone https://github.com/yourusername/eli5-explain.git
cd eli5-explain
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```


### Backend Setup (Manual, for development only)
If you prefer not to use Docker, you can run the backend manually:
1. Navigate to the backend directory
2. Create and activate a virtual environment
3. Install dependencies with `pip install -r requirements.txt`
4. Create a `.env` file with your Groq API key and settings
5. Start the backend server with `uvicorn main:app --reload --port 8000`

> **Note:** For most users, Docker is the recommended approach.

## Usage

1. Open http://localhost:8081/app in your browser
2. Enter your question in the text box
3. Select your preferred difficulty level
4. Choose your preferred format
5. Click "Ask Question" to get your explanation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

> ⚠️ This is a **proprietary project** by Siddhesh Dumre.
> All rights reserved. No part of this code may be used, copied, or modified without explicit permission.

## Acknowledgments

- [Groq](https://console.groq.com/) for providing the Llama 3 API
- [Wikipedia](https://www.wikipedia.org/) for content context
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
