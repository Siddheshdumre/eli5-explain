# ELI5 Universe Builder Backend

This is the backend server for the ELI5 Universe Builder application, built with FastAPI and using the Mistral 7B model for generating explanations.

## Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Download the Mistral 7B model:
- Download the GGUF version of Mistral 7B from Hugging Face
- Place it in the `models` directory
- Create a `.env` file with:
```
MODEL_PATH=models/mistral-7b-instruct-v0.1.Q4_K_M.gguf
PORT=8000
ENVIRONMENT=development
```

## Running the Server

Start the development server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### POST /api/ask
Ask a question and get an explanation.

Request body:
```json
{
    "question": "What is quantum computing?",
    "difficulty": "ELI5 (Child)",
    "format_option": "Standard",
    "use_wikipedia": true
}
```

### GET /api/health
Check the health status of the server and model.

## Development

- The server uses FastAPI for high performance and automatic API documentation
- CORS is configured to allow requests from the frontend (http://localhost:8080)
- The Mistral model is loaded on startup and reused for all requests
- Wikipedia integration provides context for better explanations

## Error Handling

The API includes comprehensive error handling for:
- Model loading failures
- Wikipedia API errors
- Invalid requests
- Generation errors

## Notes

- Make sure you have enough RAM/GPU memory to load the Mistral model
- The model parameters can be adjusted in `main.py` for different performance/quality tradeoffs
- Wikipedia integration can be disabled per request if needed 