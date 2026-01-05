import os, json, time, requests, tempfile
import db
from collections import defaultdict
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

rate_limits = defaultdict(list)
MAX_REQS = 30
WINDOW = 60
AVAILABLE_TYPES = [
    "CLI", "Cargo", "Web App", "Chat Bot", "Extension",
    "Desktop App (Windows)", "Desktop App (Linux)", "Desktop App (macOS)",
    "Minecraft Mods", "Hardware", "Android App", "iOS App", "Other"
]

HACKAI_API = os.getenv('HACKAI_API').split(',')

def check_rate(ip):
    now = datetime.now()
    rate_limits[ip] = [t for t in rate_limits[ip] if t > now - timedelta(seconds=WINDOW)]
    if len(rate_limits[ip]) >= MAX_REQS:
        return False
    rate_limits[ip].append(now)
    return True

def ping_ws(ticket_id):
    try:
        port = os.getenv('PORT', '45100')
        requests.post(f'http://localhost:{port}/ws/notify', json={'ticketId': ticket_id}, timeout=0.5)
    except:
        pass

def handle_staff_reply(event, client, bot_token, staff_channel, user_channel):
    if event.get("channel") != staff_channel:
        return
    uploaded = []
    thread = event.get("thread_ts")
    if not thread:
        return
    
    ticket = db.find_ticket(thread)
    if not ticket:
        return
    
    text = event.get("text", "")
    files = event.get("files", [])
    
    if not text and not files:
        return
    
    user_id = event["user"]
    
    user_info = client.users_info(user=user_id)
    staff_name = user_info["user"]["profile"].get("display_name") or user_info["user"]["profile"].get("real_name")
    staff_avatar = user_info["user"]["profile"]["image_48"]
    
    if text.startswith("?"):
        clean_text = text[1:].strip()
        
        file_info = []
        
        dest_ts = ticket["userThreadTs"]
        if files:
            uploaded = send_files(event, client, user_channel, dest_ts, bot_token)
        
        if clean_text:
            resp = client.chat_postMessage(
                channel=user_channel,
                thread_ts=ticket["userThreadTs"],
                text=clean_text,
                username=f"{staff_name} | Shipwrights Team",
                icon_url=staff_avatar
            )
            dest_ts = resp["ts"]
        
        db.save_message(ticket["id"], user_id, staff_name, staff_avatar, text, True, file_info if file_info else None, dest_ts)
        ping_ws(ticket["id"])
        
        if not files:
            client.chat_postEphemeral(
                channel=staff_channel,
                user=user_id,
                thread_ts=thread,
                blocks=[
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "Message sent."
                        }
                    },
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {"type": "plain_text", "text": "Delete message"},
                                "style": "danger",
                                "value": json.dumps({"ts": dest_ts}),
                                "action_id": "delete_message"
                            },
                            {
                                "type": "button",
                                "text": {"type": "plain_text", "text": "Edit message"},
                                "value": json.dumps({"ts": dest_ts}),
                                "action_id": "edit_message"
                            }
                        ]
                    }
                ]
            )
        else:
            client.chat_postEphemeral(
                channel=staff_channel,
                user=user_id,
                thread_ts=thread,
                blocks=[
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "Attachments sent."
                        },
                        "accessory": {
                            "type": "button",
                            "text": {"type": "plain_text", "text": "Delete Attachments"},
                            "style": "danger",
                            "value": json.dumps({"ts": uploaded}),
                            "action_id": "delete_message"
                        }
                    }
                ]
            )
    elif text.strip() == ".resolve":
        if not db.can_close(user_id):
            client.chat_postEphemeral(
                channel=staff_channel,
                thread_ts=thread,
                user=user_id,
                text="Are u sure u have the right perms for this?"
            )
            return
        
        if db.close_ticket(ticket["id"]):
            
            try:
                client.reactions_add(
                    channel=staff_channel,
                    timestamp=thread,
                    name="checks-passed-octicon"
                )
            except:
                pass
            
            try:
                client.reactions_add(
                    channel=user_channel,
                    timestamp=ticket["userThreadTs"],
                    name="checks-passed-octicon"
                )
            except:
                pass
            
            client.chat_postMessage(
                channel=staff_channel,
                thread_ts=thread,
                text="ticket closed"
            )
            
            client.chat_postMessage(
                channel=user_channel,
                thread_ts=ticket["userThreadTs"],
                text="This ticket has been resolved. If you have any more questions create a new ticket!"
            )
        else:
            client.chat_postEphemeral(
                channel=staff_channel,
                thread_ts=thread,
                user=user_id,
                text="shit broke yo"
            )
    else:
        file_info = []
        if files:
            for f in files:
                file_info.append({
                    'name': f.get('name'),
                    'url': f.get('url_private'),
                    'mimetype': f.get('mimetype'),
                    'size': f.get('size')
                })
        db.save_message(ticket["id"], user_id, staff_name, staff_avatar, text, True, file_info if file_info else None, event.get("ts"))
        ping_ws(ticket["id"])

def send_files(event, client, dest_channel, dest_ts, bot_token):
    files = event.get("files") or []
    results = []
    
    for file in files:
        url = file.get("url_private_download") or file.get("url_private")
        if not url:
            continue
        
        name = file.get("name") or "file"
        suffix = f".{name.split('.')[-1]}" if "." in name else ""
        
        tmp_path = None
        try:
            fd, tmp_path = tempfile.mkstemp(suffix=suffix)
            with requests.get(url, headers={"Authorization": f"Bearer {bot_token}"}, stream=True) as r:
                r.raise_for_status()
                with os.fdopen(fd, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
            
            up = client.files_upload_v2(
                channel=dest_channel,
                thread_ts=dest_ts,
                filename=name,
                file=tmp_path,
                initial_comment=None
            )
            new_ts=None
            file = up.get("file").get("id")
            if file:
                time.sleep(2)
                info = client.files_info(file=file)
                shares = info.get("file", {}).get("shares", {})
                for visibility in ("public", "private"):
                    chan_dict = shares.get(visibility, {})
                    if dest_channel in chan_dict:
                        new_ts = chan_dict[dest_channel][0]["ts"]
                        break
            results.append(new_ts)

        except Exception as e:
            print(f"file upload failed: {e}")
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except Exception as e:
                    print(f"file unlink failed: {e}")
    
    return results


def show_edit_modal(client, body, message_ts):
    client.views_open(
        trigger_id=body["trigger_id"],
        view={
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
    )

def show_unauthorized_close(client, body):
    client.views_open(
        trigger_id=body["trigger_id"],
        view={
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
                        "text": "*You can't close this ticket* :("
                    }
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "plain_text",
                            "text": "Only shipwrights and the ticket owner can close tickets, Or this ticket is already closed",
                            "emoji": True
                        }
                    ]
                }
            ]
        }
    )


def fetch_readme(readme_url):
    if not readme_url:
        return ""
    try:
        raw_url = readme_url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")
        response = requests.get(raw_url, timeout=10)
        if response.status_code == 200:
            return response.text
        elif response.status_code == 404:
            return "Readme doesn't exist"
        elif response.status_code == 429:
            print("Getting rate limited whilst getting readme...")
            return ""
        else:
            print(f"Unknown error code: {response.status_code}")
            return ""
    except Exception as e:
        print(f"Error fetching readme: {e}")
        return ""



def get_type(title, desc, readme="", demo_url="", repo_url="", tries=0):
    response = requests.post(
        "https://ai.hackclub.com/proxy/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {HACKAI_API[tries]}",
            "Content-Type": "application/json"
        },
        json={
            "model": "qwen/qwen3-32b",
            "messages": [
                {
                    "role": "system",
                    "content": f"You are a project classifier. Classify projects into EXACTLY one of these categories: {', '.join(AVAILABLE_TYPES)}. Respond with ONLY valid JSON: {{\"type\": \"category\", \"confidence\": 0.0-1.0}}. No markdown, no explanation, no thinking tags."
                },
                {
                    "role": "user",
                    "content": f"Title: {title}\nDescription: {desc}\nDemo URL: {demo_url}\nRepo: {repo_url}\n\nREADME:\n{readme}"
                }
            ]
        }
    )

    try:
        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            content = content.replace("```json", "").replace("```", "").strip()
            if "<think>" in content:
                content = content.split("</think>")[-1].strip()
            result = json.loads(content)
            return result.get("type", "Unknown") if result.get("confidence", 0) >= 0.8 else "Unknown"
        elif response.status_code == 429:
            if tries > 0:
                print(f"Getting rate limited! Key: {tries}, Retrying in 10 seconds...")
                time.sleep(10)
                return get_type(title, desc, readme, demo_url, repo_url, 0)
            return get_type(title, desc, readme, demo_url, repo_url, tries + 1)
        elif response.status_code == 402:
            print("Looks like Hackclub AI has gone broke :/ Try again later.")
        else:
            print(f"Unknown status code returned by HackClub AI: {response.status_code}")
    except Exception as e:
        print(f"Smth went wrong whilst sending request to HackClub AI: {e}\n retrying request...")
        return get_type(title, desc, readme, demo_url, repo_url, tries + 1)