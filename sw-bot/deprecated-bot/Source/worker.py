import time
import logging
from slack_sdk.errors import SlackApiError
from cache import cache
from globals import client, USER_CHANNEL
from msg_blocks import aide_message
from helpers import find_sticky_from_history

logger = logging.getLogger("worker")

class Worker:
    def __init__(self):
        self.tasks = []

    def enqueue_sticky_message_update(self):
        if "update_sticky_message" in self.tasks:
            return
        self.tasks.append("update_sticky_message")
        return

    def update_sticky_message(self):
        if not cache.sticky_message_ts:
            cache.sticky_message_ts = find_sticky_from_history(
                client.conversations_history(channel=USER_CHANNEL, limit=5)["messages"]
            )
            if cache.sticky_message_ts:
                logger.info(f"Located sticky via history fallback ts={cache.sticky_message_ts}")

        if cache.sticky_message_ts:
            try:
                client.chat_delete(ts=cache.sticky_message_ts, channel=USER_CHANNEL)
            except SlackApiError as e:
                logger.warning(f"Could not delete sticky ts={cache.sticky_message_ts} error={e.response['error']}")
                cache.sticky_message_ts = None

        try:
            resp = client.chat_postMessage(channel=USER_CHANNEL, text="Create Help Ticket Now!", blocks=aide_message())
            cache.sticky_message_ts = resp["ts"]
            logger.info(f"Sticky message updated ts={resp['ts']}")
        except SlackApiError as e:
            logger.error(f"Failed to post sticky message error={e.response['error']}")

    def run(self):
        while True:
            working_copy, self.tasks = self.tasks, []
            for task in working_copy:
                if task == "update_sticky_message":
                    try:
                        self.update_sticky_message()
                    except Exception as e:
                        logger.exception(f"Unhandled error in task={task} error={e}")
            time.sleep(2)

worker = Worker()
