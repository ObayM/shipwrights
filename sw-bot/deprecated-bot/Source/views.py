def edit_message(message_ts):
    return {
            "type": "modal",
            "callback_id": "edited_message",
            "private_metadata": message_ts,
            "title": {
                "type": "plain_text",
                "text": "Shipwrighter",
                "emoji": True
            },
            "submit": {
                "type": "plain_text",
                "text": "Edit",
                "emoji": True
            },
            "close": {
                "type": "plain_text",
                "text": "Cancel",
                "emoji": True
            },
            "blocks": [
                {
                    "type": "input",
                    "block_id": "input_block",
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "user_input"
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Edited Message"
                    }
                }
            ]
        }

def show_unauthorized(access):
    return {
            "title": {
                "type": "plain_text",
                "text": "Shipwrighter",
                "emoji": True
            },
            "type": "modal",
            "blocks": [
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*You can't close this ticket* :(" if access == "closing" else "*You can't send feedback on this ticket* :("
                    }
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "plain_text",
                            "text": "Only shipwrights and the ticket owner can close tickets, Or this ticket is already closed" if access == "closing" else "Only the ticket owner can send feedback or the form has already been filled!   ",
                            "emoji": True
                        }
                    ]
                }
            ]
        }

def show_rating_form(ticket_id):
    return {
	"type": "modal",
	"callback_id": "rating_form",
	"private_metadata": str(ticket_id),
	"title": {
		"type": "plain_text",
		"text": "Shipwrighter Feedback",
		"emoji": True
	},
	"submit": {
		"type": "plain_text",
		"text": "Submit",
		"emoji": True
	},
	"close": {
		"type": "plain_text",
		"text": "Cancel",
		"emoji": True
	},
	"blocks": [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "How'd we do :blush-wx:",
				"emoji": True
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "input",
			"block_id": "rating_block",
			"element": {
				"type": "number_input",
				"is_decimal_allowed": False,
				"min_value": "1",
				"max_value": "10",
				"action_id": "number_input-action"
			},
			"label": {
				"type": "plain_text",
				"text": "How would you rate your ticket experience? (1-10)",
				"emoji": True
			},
			"optional": False
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "plain_text",
					"text": "(required)",
					"emoji": True
				}
			]
		},
		{
			"type": "input",
			"block_id": "comment_block",
			"element": {
				"type": "plain_text_input",
				"action_id": "plain_text_input-action"
			},
			"label": {
				"type": "plain_text",
				"text": "Any comments?",
				"emoji": True
			},
			"optional": True
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "plain_text",
					"text": "(optional)",
					"emoji": True
				}
			]
		}
	]
}