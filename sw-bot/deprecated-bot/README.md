# Shipwrights Bot (sw-bot)

`sw-bot` is a Slack bot built with Python, `slack_bolt` (using Socket Mode), and Flask. It acts as the core ticketing and support relay system for the Shipwrights team. 

The bot creates a seamless workflow directly in Slack, allowing users to ask questions in a user channel while staff tackle those questions in a dedicated staff channel.

## Features

- **Two-Way Ticket Relay**: Threads support questions from a User Channel into a separate Staff Channel, keeping noisy triage out of the public eye.
- **Ticket Management**: Shipwright staff can view, claim, and resolve open tickets.
- **AI Paraphrasing & Detection**: Integrates dynamically with an AI service (`SW_AI`) to paraphrase responses and attempt to auto-detect when a user is satisfied to prompt resolutions.
- **Feedback Collection**: Pushes actionable rating/feedback forms to users once their tickets are closed.
- **Meta Voting (`/metasw`)**: Custom slash commands for staff to raise internal meta-discussions with built-in upvote/downvote tracking.
- **Reminders & Alerts**: Background scheduled threads ensure staff are notified regarding stale tickets and open alerts.
- **Real-Time API / Websockets**: Runs a secondary Flask-SocketIO server to interact with the Shipwright Dashboard (`sw-dash`).

## Requirements

- Python 3.10+
- MySQL database instance
- Slack Workspace with a configured App (Bot Token, App Token for Socket Mode, Signing Secret)

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**
   Create a `.env` file based on the provided `example.env`. You will need:
   - Slack Credentials (`SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, `SLACK_SIGNING_SECRET`)
   - Channel IDs (`USER_CHANNEL_ID`, `STAFF_CHANNEL_ID`, etc.)
   - Database configuration (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)
   - Internal credentials (`API_KEY`, `SW_AI`)

3. **Database**
   Initialize your MySQL database with the schema required for saving messages, tickets, user opt-ins, and caching user states.

## Running the Bot

Run the main file to start the slack Socket Mode handler, Flask API, and background threads simultaneously:

```bash
python Source/main.py
```

Or run via Docker using the provided `Dockerfile`.

## Code Structure

- `Source/main.py`: Entrypoint initializing the Slack App, Socket Mode, Flask API thread, and scheduler threads.
- `Source/relay.py`: Logic managing the message bridging between the user channel and staff channel.
- `Source/api.py`: Contains the Flask & SocketIO web server interacting with the frontend dashboard.
- `Source/ai.py`: Handles integrations with the external AI worker.
- `Source/db.py` / `Source/cache.py`: Management of state/database reads and writes.
- `Source/msg_blocks.py`: Slack Block Kit layout definitions (e.g., feedback modals, meta voting blocks).
