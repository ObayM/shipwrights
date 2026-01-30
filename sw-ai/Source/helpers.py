import requests, re, json, os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_KEY = os.environ.get("OPENROUTER_KEY")

TYPES = [
  "CLI",
  "Cargo",
  "Web App",
  "Chat Bot",
  "Extension",
  "Desktop App (Windows)",
  "Desktop App (Linux)",
  "Desktop App (macOS)",
  "Minecraft Mods",
  "Hardware",
  "Android App",
  "iOS App",
  "Other",
]


def format_messages(ticket_messages):
    conversation=""
    for message in ticket_messages:
        if message.get("isStaff", False):
            conversation += f"Shipwrights team: {message.get('msg', 'None')}"
        else:
            conversation += f"User: {message.get('msg', 'None')}"
    return conversation

def format_summary_prompt(ticket_messages, ticket_question):
    return f"""You are an AI assistant for Shipwrights reviewing Hack Club project submissions.

## Review Guidelines
- **README**: Must explain purpose, usage, and how to run
- **Open-source**: All code must be publicly visible
- **Demo required**: Live site, video, or downloadable release
- **Hardware**: Video/photos of physical build required
- **Games**: Must be playable or have gameplay video

## Your Task
Analyze the support ticket below and provide a concise summary.

## Ticket Details
**Original Question:** {ticket_question}

**Conversation:**
{format_messages(ticket_messages)}

## Instructions
1. Summarize the ticket's core issue in 1-2 sentences
2. Determine the current status
3. Identify the next action needed (leave empty if resolved)

## Response Format
Return ONLY valid JSON with no markdown, no code blocks, no explanation:
{{"summary": "Brief description of the issue", "status": "resolved|pending_user|pending_staff|unclear", "action": "Next step or the word None if resolved"}}"""


def format_completion_prompt(ticket_messages, ticket_question, message):
    return f"""You are a writing assistant for the Shipwrights team at Hack Club.

## Your Task
Paraphrase the staff member's draft message to be clearer, more grammatical, and professional. The message will be sent FROM the Shipwrights team TO the user, so address the user directly (use "you/your").

## Context
**Ticket Question:** {ticket_question}

**Conversation History:**
{format_messages(ticket_messages)}

## Review Guidelines Reference
- Web Apps: Need live demo (GitHub Pages, Vercel, Netlify)
- Executables: GitHub releases as .exe/.app/.deb with instructions
- Android: .apk in releases or Play Store
- APIs: Swagger docs with testable endpoints
- Games: Web build on itch.io or GitHub releases
- Bots: Must be hosted and online with command documentation
- Extensions: On store or unpacked in GitHub releases
- Hardware: Demo video required for physical builds; KiCad/EDA files for PCB-only
- README: Must explain purpose, usage, and setup instructions

## Staff Draft to Paraphrase
{message}

## Instructions
Rewrite as a professional response FROM Shipwrights TO the user. Address the user directly using "you/your". Keep the original intent but make it clear, friendly, and grammatically correct in 1-2 sentences.

## Response Format
Return ONLY valid JSON with no markdown, no code blocks, no explanation:
{{"paraphrased": "Your rewritten message here"}}"""


def format_detection_prompt(ticket_messages, ticket_question):
    return f"""You are a ticket classifier for the Shipwrights team at Hack Club.

## Shipwrights Scope
The Shipwrights team reviews project submissions for quality and completeness. They handle:
- Project certification/rejection appeals
- Submission guidance and fixes
- Review status inquiries

They CANNOT help with:
- Cookie (currency) payouts or deductions
- Prize fulfillment
- User bans

## Classification Categories
Return exactly ONE of these:
- **fraud**: user bans (outside Shipwrights scope)
- **fthelp**: Non-project issues unrelated to certification/submission
- **queue**: Complaints about project waiting time in review queue
- **ship**: Project submission help, review requests, or rejection appeals

## Ticket Data
**Question:** {ticket_question}

**Conversation:**
{format_messages(ticket_messages)}

## Response Format
Return ONLY valid JSON with no markdown, no code blocks:
{{"detection": "fraud|fthelp|queue|ship"}}"""


def clean_json_response(content: str) -> str:
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    return content.strip()


def get_readme(url):
    if not url:
        return ""
    try:
        raw = url.replace('github.com', 'raw.githubusercontent.com').replace("/blob/", "/")
        result = requests.get(raw, timeout=10)
        if result.ok:
            return result.text
        if result.status_code == 404:
            return "Readme doesn't exist"
        return ""
    except Exception as e:
        print(f"Error occured whilst fetching readme for {url}: {e}")
        return ""

def get_releases(url):
    data = {"has": False, "files": [], "notes": "", "hints": []}
    if not url or "github.com" not in url:
        return data
    try:
        match = re.search(r'github\.com/([^/]+)/([^/]+)', url)
        if not match:
            return data
        owner, repo = match.groups()
        repo = repo.replace(".git", "")
        result = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/releases?per_page=3",
            timeout=10,
            headers={"Accept": "application/vnd.github.v3+json"},
        )
        if not result.ok:
            return data
        rels = result.json()
        if not rels:
            return data
        files = []
        hints = []
        notes = ""
        for r in rels:
            if r.get("body"):
                notes += r["body"][:500] + "\n"
            for a in r.get("assets", []):
                n = a["name"].lower()
                files.append(n)
                if n.endswith(".exe") or "windows" in n or "win64" in n or "win32" in n:
                    hints.append("win")
                if n.endswith(".dmg") or n.endswith(".pkg") or "macos" in n or "darwin" in n:
                    hints.append("mac")
                if n.endswith(".deb") or n.endswith(".rpm") or n.endswith(".appimage") or "linux" in n:
                    hints.append("linux")
                if n.endswith(".apk") or "android" in n:
                    hints.append("android")
                if n.endswith(".ipa") or "ios" in n:
                    hints.append("ios")
                if n.endswith(".jar") or "fabric" in n or "forge" in n:
                    hints.append("mc-mod")
                if n.endswith(".vsix") or n.endswith(".xpi") or n.endswith(".crx"):
                    hints.append("ext")
        return {
            "has": True,
            "files": list(set(files)),
            "notes": notes[:1000],
            "hints": list(set(hints)),
        }
    except Exception as e:
        print(f"Error occured whilst fetching releases for {url}: {e}")
        return data

def check_type(data: dict) -> dict:
    readme = get_readme(data.get("readmeUrl", ""))
    rel = get_releases(data.get("repoUrl", ""))

    input_data = {
        "title": data.get("title", ""),
        "desc": data.get("desc", ""),
        "readmeUrl": data.get("readmeUrl", ""),
        "demoUrl": data.get("demoUrl", ""),
        "repoUrl": data.get("repoUrl", ""),
        "readmeContent": (readme or "")[:2000],
        "rel": rel,
    }

    if not OPENROUTER_KEY:
        return {"type": "Unknown", "debug": {"input": input_data, "request": {}, "response": None, "error": "no OPENROUTER_KEY"}}

    ctx = ""
    if rel.get("has"):
        ctx = f"\n\nFILES: {', '.join(rel['files'])}"
        if rel.get("hints"):
            ctx += f"\nHINTS: {', '.join(rel['hints'])}"
        if rel.get("notes"):
            ctx += f"\nNOTES:\n{rel['notes']}"

    req_body = {
        "model": 'google/gemini-2.5-flash-lite',
        "messages": [
            {
                "role": "system",
                "content": f"You are a project classifier. Classify projects into EXACTLY one of these categories: {', '.join(TYPES)}. Respond with ONLY valid JSON: {{\"type\": \"category\", \"confidence\": 0.0-1.0}}. No markdown, no explanation, no thinking tags.",
            },
            {
                "role": "user",
                "content": f"Title: {data.get('title', '')}\nDescription: {data.get('desc', '')}\nDemo URL: {data.get('demoUrl', '')}\nRepo: {data.get('repoUrl', '')}\n\nREADME:\n{readme or ''}{ctx}",
            },
        ],
    }

    import time
    for i in range(3):
        try:
            res = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENROUTER_KEY}", "Content-Type": "application/json"},
                json=req_body,timeout=30,
            )
            result = res.json()

            if not res.ok:
                if i < 2:
                    time.sleep(5)
                    continue
                return {"type": "Unknown", "debug": {"input": input_data, "request": req_body, "response": result, "error": f"status {res.status_code}"}}

            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            content = content.replace("```json", "").replace("```", "").strip()
            if "<think>" in content:
                content = content.split("</think>")[-1].strip()

            parsed = json.loads(content)
            final_type = parsed["type"] if parsed.get("confidence", 0) >= 0.8 else "Unknown"

            return {"type": final_type, "debug": {"input": input_data, "request": req_body, "response": result, "error": None}}

        except Exception as e:
            if i < 2:
                time.sleep(5)
                continue
            return {"type": "Unknown", "debug": {"input": input_data, "request": req_body, "response": None, "error": str(e)}}

    return {"type": "Unknown", "debug": {"input": input_data, "request": req_body, "response": None, "error": "max retries"}}
