"""Smoke test for a running backend: python test_api.py [base_url]

Works without API keys: /api/ask should still stream a clear error event instead of crashing.
"""
import sys
import requests

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
GUEST = {"Authorization": "Bearer null"}  # anonymous free-tier request


def main():
    health = requests.get(f"{BASE_URL}/api/health", timeout=10)
    print(f"/api/health -> {health.status_code} {health.text}")
    assert health.status_code == 200 and health.json()["status"] == "healthy"

    ask = requests.post(
        f"{BASE_URL}/api/ask",
        headers=GUEST,
        json={"question": "What is AI?", "difficulty": "ELI5 (Child)", "format_option": "Standard"},
        timeout=60,
    )
    print(f"/api/ask -> {ask.status_code}\n{ask.text[:500]}")
    assert ask.status_code == 200 and ask.text.startswith("data: ")

    threads = requests.get(f"{BASE_URL}/api/threads", headers=GUEST, timeout=10)
    print(f"/api/threads (guest) -> {threads.status_code}")
    assert threads.status_code == 401, "threads must require login"

    print("\nAll backend smoke tests passed.")


if __name__ == "__main__":
    main()
