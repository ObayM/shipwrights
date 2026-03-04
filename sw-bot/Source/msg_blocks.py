def feedback_message(ticket_id):
    return [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*Hey there, fellow chef!* :wave-pikachu-2:\nIf you could give us 20 seconds of your time, we would love to know how we did in this ticket!"
			},
			"accessory": {
				"type": "button",
				"text": {"type": "plain_text", "text": "Submit Feedback"},
				"style": "primary",
				"value": str(ticket_id),
				"action_id": "submit_feedback"
			}
		}
	]

