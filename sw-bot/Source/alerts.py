import logging, time
from datetime import datetime, timezone
import pytz
import schedule
import blocks, db
from globals import REMINDERS_CHANNEL, STAFF_CHANNEL, client

scheduler = schedule.Scheduler()


def check_unresolved_tickets():
    stats = db.get_daily_ticket_stats()
    if stats:
        try:
            client.chat_postMessage(
                channel=REMINDERS_CHANNEL,
                text="Daily ticket check-in",
                blocks=blocks.daily_ticket_alert(stats, STAFF_CHANNEL),
                unfurl_links=False,
                unfurl_media=False,
            )
        except Exception as e:
            logging.error(f"check_unresolved_tickets failed: {e}")

    try:
        unresolved_tickets = db.get_unresolved_tickets_past_24h()
        now = datetime.now(timezone.utc)
        for ticket in unresolved_tickets:
            try:
                created_at = ticket["created_at"]
                if created_at and ticket.get("staff_thread_ts"):
                    if created_at.tzinfo is None:
                        created_at = pytz.utc.localize(created_at)
                    num_days = (now - created_at).days
                    if num_days < 1:
                        num_days = 1

                    client.chat_postMessage(
                        channel=STAFF_CHANNEL,
                        thread_ts=ticket["staff_thread_ts"],
                        text=f"Bump, this ticket isn't resolved yet, it's been over {num_days} day{'s' if num_days > 1 else ''}.",
                        reply_broadcast=True,
                    )
                    time.sleep(1) # slack rate limiting
            except Exception as e:
                logging.error(f"Bump failed for ticket {ticket.get('id')}: {e}")
    except Exception as e:
        logging.error(f"check_unresolved_tickets bump loop failed: {e}")


def alerts_loop():
    scheduler.every().day.at("11:00", "UTC").do(check_unresolved_tickets)
    while True:
        scheduler.run_pending()
        time.sleep(30)
