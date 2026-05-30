import json, logging, os, threading
from datetime import datetime, timezone
from globals import TASK_JOURNAL_PATH

lock = threading.RLock()


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def append(record: dict):
    with lock:
        try:
            with open(TASK_JOURNAL_PATH, "a", encoding="utf-8") as f:
                f.write(json.dumps(record) + "\n")
        except OSError as e:
            logging.error(f"task_journal append failed: {e}")


def record_enqueue(task_id: str, fn_name: str, args: tuple, kwargs: dict):
    try:
        serialized_args = list(args)
        json.dumps(serialized_args)
    except (TypeError, ValueError) as e:
        logging.error(f"task_journal: cannot serialize args for {fn_name}: {e}")
        return
    append({
        "id": task_id,
        "fn": fn_name,
        "args": serialized_args,
        "kwargs": kwargs,
        "status": "pending",
        "ts": now(),
    })


def record_start(task_id: str):
    append({"id": task_id, "status": "in_progress", "ts": now()})


def record_done(task_id: str):
    append({"id": task_id, "status": "done", "ts": now()})


def load_pending() -> list[dict]:
    if not os.path.exists(TASK_JOURNAL_PATH):
        return []
    full_records: dict[str, dict] = {}
    latest_status: dict[str, str] = {}
    with lock:
        try:
            with open(TASK_JOURNAL_PATH, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        record = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    task_id = record.get("id")
                    if not task_id:
                        continue
                    if "fn" in record:
                        full_records[task_id] = record
                    latest_status[task_id] = record["status"]
        except OSError as e:
            logging.error(f"task_journal load failed: {e}")
            return []
    return [
        {**full_records[tid], "status": latest_status[tid]}
        for tid in full_records
        if latest_status.get(tid) != "done"
    ]


def compact():
    pending = load_pending()
    with lock:
        try:
            with open(TASK_JOURNAL_PATH, "w", encoding="utf-8") as f:
                for task in pending:
                    f.write(json.dumps({
                        "id": task["id"],
                        "fn": task["fn"],
                        "args": task["args"],
                        "kwargs": task.get("kwargs", {}),
                        "status": "pending",
                        "ts": now(),
                    }) + "\n")
        except OSError as e:
            logging.error(f"task_journal compact failed: {e}")
