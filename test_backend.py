import requests
import json

url = "http://localhost:8000/api/ask"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer fake_token"
}
data = {
    "question": "Why is the sky blue?",
    "difficulty": "Intermediate",
    "format_option": "Standard",
    "use_wikipedia": False
}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
