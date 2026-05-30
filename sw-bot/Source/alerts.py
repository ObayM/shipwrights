import logging, time
import schedule
import blocks, db
from globals import REMINDERS_CHANNEL, STAFF_CHANNEL, client

scheduler = schedule.Scheduler()


def check_unresolved_tickets():
    stats = db.get_daily_ticket_stats()
    if not stats:
        return
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


def alerts_loop():
    scheduler.every().day.at("11:00", "UTC").do(check_unresolved_tickets)
    while True:
        scheduler.run_pending()
        time.sleep(30)
