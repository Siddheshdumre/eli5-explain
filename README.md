# ELI5 - Explain Like I'm Five

An AI-powered application that explains complex topics in simple terms, using the Mistral 7B model through Together API. The application provides explanations at different difficulty levels (Child, Teen, Adult) and in various formats (Standard, Story, Technical).

## Features

- 🤖 Powered by Mistral 7B AI model via Together API
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
- Together API (Mistral 7B)
- Wikipedia API

## Setup

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher
- Together API key

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

### Backend Setup
1. Navigate to the backend directory
```bash
cd backend
```

2. Create and activate virtual environment
```bash
python -m venv venv
# On Windows
.\venv\Scripts\activate
# On Unix/MacOS
source venv/bin/activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with your Together API key:
```
TOGETHER_API_KEY=your_api_key_here
TOGETHER_MODEL=mistralai/Mistral-7B-Instruct-v0.2
PORT=8000
ENVIRONMENT=development
```

5. Start the backend server
```bash
uvicorn main:app --reload --port 8000
```

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

- [Together AI](https://www.together.ai/) for providing the Mistral 7B API
- [Wikipedia](https://www.wikipedia.org/) for content context
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
