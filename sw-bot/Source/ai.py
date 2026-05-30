import logging, requests
import blocks, db, worker
from cache import cache
from globals import MACROS, STAFF_CHANNEL, SWAI_KEY, client

AI_BASE_URL = "https://ai.review.hackclub.com"
AI_HEADERS = {"X-API-Key": SWAI_KEY}


def fetch(path, payload):
    try:
        resp = requests.get(url=f"{AI_BASE_URL}{path}", headers=AI_HEADERS, json=payload, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logging.error(f"ai.fetch {path} failed: {e}")
        return {}


def get_ticket_summary(ticket_id):
    return fetch("/tickets/summary", {"ticket_id": str(ticket_id)})


def summarize_ticket(ticket_id):
    summary = get_ticket_summary(ticket_id)
    ticket = cache.get_ticket_by_id(ticket_id)
    if not ticket:
        return
    client.chat_postMessage(
        channel=STAFF_CHANNEL,
        thread_ts=ticket["staff_thread_ts"],
        text="",
        blocks=blocks.ai_summary(summary),
    )


def get_message_completion(ticket_id, message):
    return fetch("/tickets/complete", {"ticket_id": str(ticket_id), "message": message})


def paraphrase_message(ticket_id, message):
    paraphrased = get_message_completion(ticket_id, message).get("paraphrased", "")
    ticket = cache.get_ticket_by_id(ticket_id)
    if not ticket:
        return
    resp = client.chat_postMessage(
        channel=STAFF_CHANNEL,
        thread_ts=ticket["staff_thread_ts"],
        text="",
        blocks=blocks.ai_paraphrase_suggestion(paraphrased, ticket_id),
    )
    worker.enqueue(db.save_message, ticket_id, "SWBOT", "Shipwrighter AI", None, f"AI Suggestion:\n{paraphrased}", True, None, resp.get("ts"))


def get_ticket_detection(ticket_id):
    return fetch("/tickets/detect", {"ticket_id": str(ticket_id)}).get("detection", "")


def detect_ticket(ticket_id):
    detection = get_ticket_detection(ticket_id)
    if detection not in MACROS:
        return
    ticket = cache.get_ticket_by_id(ticket_id)
    if not ticket:
        return
    client.chat_postMessage(
        channel=STAFF_CHANNEL,
        thread_ts=ticket["staff_thread_ts"],
        text="",
        blocks=blocks.ai_detection(MACROS[detection], ticket_id),
    )
