import time
import schedule

# import blocks, db  # ship_certs
# from globals import REMINDERS_CHANNEL, client  # ship_certs

scheduler = schedule.Scheduler()


# def send_reminder():  # ship_certs
#     reviews = db.recent_reviews()
#     shipped = db.shipped_yesterday()
#     top = db.top_reviewer_yesterday()
#     client.chat_postMessage(
#         channel=REMINDERS_CHANNEL,
#         text="Daily summary",
#         blocks=blocks.daily_summary_message(reviews, shipped, top),
#     )


def reminders_loop():
    # scheduler.every().day.at("00:00", "US/Eastern").do(send_reminder)  # ship_certs
    while True:
        scheduler.run_pending()
        time.sleep(30)
