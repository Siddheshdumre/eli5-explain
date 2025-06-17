import requests
import json

# Test data
data = {
    "question": "What is AI?",
    "difficulty": "ELI5 (Child)",
    "format_option": "Standard",
    "use_wikipedia": True
}

try:
    print("Testing /api/health endpoint...")
    health_response = requests.get("http://127.0.0.1:8000/api/health")
    print(f"Health Status: {health_response.status_code}")
    print(f"Health Response: {health_response.json()}")
    print()
    
    print("Testing /api/ask endpoint...")
    response = requests.post("http://127.0.0.1:8000/api/ask", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Text: {response.text}")
    
    if response.status_code != 200:
        print(f"\nError Details:")
        try:
            error_json = response.json()
            print(json.dumps(error_json, indent=2))
        except:
            print("Could not parse error as JSON")
            
except Exception as e:
    print(f"Exception occurred: {e}")
    import traceback
    traceback.print_exc() 