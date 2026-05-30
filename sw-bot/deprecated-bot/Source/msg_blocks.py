import json, re
from globals import FEEDBACK_MESSAGE, ANNOUNCE_META


def feedback_message(ticket_id):
	return [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*Hey there, fellow chef!* :wave-pikachu-2:\n"
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": FEEDBACK_MESSAGE
			},
			"accessory": {
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": "Submit Feedback"
				},
				"style": "primary",
				"value": str(ticket_id),
				"action_id": "submit_feedback"
			}
		}
	]

def meta_votes_message(votes, meta_message_ts):
	return [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": f"*Anonymous Votes: {votes}*"
			},
			"accessory": {
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": "Delete Post",
					"emoji": True
				},
				"value": meta_message_ts,
				"action_id": "delete_meta"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Upvote Message",
						"emoji": True
					},
					"value": json.dumps({"direction": 1, "meta_ts": meta_message_ts}),
					"action_id": "modify_votes",
					"style": "primary"
				}
			]
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Downvote Message",
						"emoji": True
					},
					"value": json.dumps({"direction": -1, "meta_ts": meta_message_ts}),
					"action_id": "modify_votes",
					"style": "danger"
				}
			]
		}
	]

def meta_message_blocks(text, user_id):
	cleaned_text = re.sub(
		r'<@[A-Z0-9]+(?:\|([^>]+))?>|<!(?:here|channel|subteam\^[A-Z0-9]+)(?:\|[^>]*)?>',
		lambda m: m.group(1) if m.group(1) else '',
		text
	)
	cleaned_text = re.sub(r'\*\*|__', '', cleaned_text)
	indented_text = '\n'.join(f'>{line}' for line in cleaned_text.split('\n'))
	blocks = [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "Meta Post",
				"emoji": True
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": indented_text
			}
		},
		{
			"type": "divider"
		},
	]
	if re.search(r'<@[A-Z0-9]+', text) and ANNOUNCE_META:
		blocks.append({
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": f"sent by <@{user_id}> - <!subteam^S0AFZAHP955>"
				}
			]
		})
	elif ANNOUNCE_META:
		blocks.append({
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": "<!subteam^S0AFZAHP955>"
				}
			]
		})
	elif re.search(r'<@[A-Z0-9]+', text):
		blocks.append({
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": f"sent by <@{user_id}>"
				}
			]
		})
	return blocks


def aide_message():
	return [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "Project Shipping Help",
				"emoji": True
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Unsure how to get your project shipped? Get personalized help now!"
			}
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Create Help Ticket!",
						"emoji": True
					},
					"action_id": "create_aide",
					"style": "primary"
				}
			]
		}
	]
