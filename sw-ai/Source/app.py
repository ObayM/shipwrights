import os, requests, json
import db, helpers
import flask
from flask import jsonify, request
from dotenv import load_dotenv

load_dotenv()

PORT = 45200
SW_API_KEY = os.environ.get("SW_API_KEY")
OPENROUTER_KEY = os.environ.get("OPENROUTER_KEY")
AI_MODEL = "google/gemini-3-flash-preview"

app = flask.Flask(__name__)

@app.before_request
def require_api_key():
    if request.headers.get("X-API-Key") != SW_API_KEY and request.path != "/health":
        return jsonify({"error": "unauthorized please check your swai key"}), 401

@app.get("/health")
def health():
    return jsonify({"status": "ok", "message": "up and running!"}), 200


@app.get("/tickets/summery")
def ticket_summery():
    ticket_id = request.json.get("ticket_id")
    ticket_messages = db.get_ticket_messages(ticket_id)
    ticket_question = db.get_ticket_question(ticket_id)

    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": AI_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": helpers.format_prompt(ticket_messages, ticket_question)
                }
            ]
        }
    )

    result = response.json()

    if "error" in result:
        return jsonify({"error": result["error"]}), 500

    if "choices" not in result:
        return jsonify({"error": "Unexpected API response", "response": result}), 500

    ai_response = json.loads(result["choices"][0]["message"]["content"])
    return jsonify({"suggested_action": ai_response['action'], "status": ai_response['status'], "summary": ai_response['summary']}), 200


if __name__ == "__main__":
    try:
        print("Services up and running!")
        app.run(host='0.0.0.0', port=PORT, debug=False, use_reloader=False)
    except Exception as e:
        print(f"Error occurred whilst attempting to run SWAI: {e}")