import json
import db

class Cache:

    def __init__(self):
        self.sticky_message_ts = None
        self.ticket_users = {}
        self.tickets = {}
        self.feedback = {}
        self.metas = {}
        self.shipwrights = []
        self.ignorable = []
        self.metrics = {
            "cached_at": None,
            "quote_otd": None,
            "recommendation" : None,
            "bool" : None,
            "paused" : False,
        }

    def get_user_opt_in(self, user_id):
        if user_id not in self.ticket_users.keys():
            user_data = db.get_ticket_user(user_id)
            if user_data:
                self.ticket_users[user_data["userId"]] = user_data["isOptedIn"]
                return self.ticket_users[user_id]
            else:
                db.create_ticket_user(user_id)
                self.ticket_users[user_id] = True
                return True
        else:
            return self.ticket_users[user_id]

    def modify_user_opt(self, user_id, state=True):
        if user_id not in self.ticket_users.keys():
            user_data = db.get_ticket_user(user_id)
            if user_data:
                self.ticket_users[user_id] = state
                db.update_ticket_user_opt(user_id, state)
                return
            else:
                self.ticket_users[user_id] = self.get_user_opt_in(user_id)
                db.update_ticket_user_opt(user_id, state)
                self.ticket_users[user_id] = state
                return
        else:
            self.ticket_users[user_id] = state
            db.update_ticket_user_opt(user_id, state)
            return

    def ticket_data_saver(self, ticket_data):
        self.tickets[ticket_data["id"]] = {
            "id": ticket_data["id"],
            "userId": ticket_data["userId"],
            "userName": ticket_data["userName"],
            "question": ticket_data["question"],
            "userThreadTs": ticket_data["userThreadTs"],
            "staffThreadTs": ticket_data["staffThreadTs"],
            "status": ticket_data["status"],
            "closedBy": ticket_data["closedBy"],
        }

    def get_ticket_by_id(self, ticket_id):
        if ticket_id not in self.tickets.keys():
            ticket_data = db.get_ticket(ticket_id)
            if not ticket_data:
                return None
            self.ticket_data_saver(ticket_data)
            return self.tickets[ticket_id]
        else:
            return self.tickets[ticket_id]

    def find_ticket_by_ts(self, ts):
        for ticket_id in self.tickets.keys():
            if self.tickets[ticket_id]["staffThreadTs"] == ts:
                return self.tickets[ticket_id]
            elif self.tickets[ticket_id]["userThreadTs"] == ts:
                return self.tickets[ticket_id]

        ticket_data = db.find_ticket(ts)

        if ticket_data:
            self.ticket_data_saver(ticket_data)
            return ticket_data
        return None

    def open_ticket(self, ticket_id):
        if ticket_id in self.tickets.keys():
            self.tickets[ticket_id]["status"] = "open"
            db.open_ticket(ticket_id)
        else:
            ticket_data = db.get_ticket(ticket_id)
            if ticket_data:
                self.ticket_data_saver(ticket_data)
                self.open_ticket(ticket_id)
            else:
                print(f"URGENT: Something went wrong. Someone tried reopening a ticket that simply doesn't exist in cache nor db... Ticket ID:{ticket_id}, Cache Dump:{json.dumps(self.tickets)}")

    def close_ticket(self, ticket_id):
        if ticket_id in self.tickets.keys():
            self.tickets[ticket_id]["status"] = "closed"
            db.close_ticket(ticket_id)
        else:
            ticket_data = db.get_ticket(ticket_id)
            if ticket_data:
                self.ticket_data_saver(ticket_data)
                self.close_ticket(ticket_id)
            else:
                print(f"URGENT: Something went wrong. Someone tried closing a ticket that simply doesn't exist in cache nor db... Ticket ID:{ticket_id}, Cache Dump:{json.dumps(self.tickets)}")

    def is_ticket_claimed(self, ticket_id):
        if ticket_id in self.tickets.keys():
            return self.tickets[ticket_id]["closedBy"]
        else:
            ticket_data = db.get_ticket(ticket_id)
            if ticket_data:
                self.ticket_data_saver(ticket_data)
                return ticket_data["closedBy"]
            else:
                print(f"URGENT: Something went wrong. Someone tried checking if a ticket is claimed and that ticket simply doesn't exist in cache nor db... Ticket ID:{ticket_id}, Cache Dump:{json.dumps(self.tickets)}")
                print("URGENT: Killing ticket cache...")
                self.tickets = {}
                return None

    def claim_ticket(self, ticket_id, claimer):
        if ticket_id in self.tickets.keys():
            self.tickets[ticket_id]["closedBy"] = claimer
            db.claim_ticket(ticket_id, claimer)
            db.add_cookies(claimer, ticket_id)
        else:
            ticket_data = db.get_ticket(ticket_id)
            if ticket_data:
                ticket_data["closedBy"] = claimer
                self.ticket_data_saver(ticket_data)
                db.claim_ticket(ticket_id, claimer)
                db.add_cookies(claimer, amount=0.3, ticket_id=ticket_id)
            else:
                print(f"URGENT: Something went wrong. Someone tried claiming a ticket and that ticket simply doesn't exist in cache nor db... Ticket ID:{ticket_id}, Cache Dump:{json.dumps(self.tickets)}")
                print("URGENT: Killing ticket cache...")
                self.tickets = {}
        return

    def get_shipwrights(self):
        if self.shipwrights:
            return self.shipwrights
        self.shipwrights = db.get_shipwrights()
        return self.shipwrights

    def get_feedback(self, ticket_id):
        if ticket_id not in self.feedback.keys():
            feedback_data = db.get_feedback(ticket_id)
            if not feedback_data:
                return None
            self.feedback[ticket_id] = feedback_data
            return self.feedback[ticket_id]
        else:
            return self.feedback[ticket_id]

    def save_feedback(self, ticket_id, rating, comment):
        db.save_feedback(ticket_id, int(rating), comment)
        entry = {"rating": int(rating), "comment": comment}
        if ticket_id in self.feedback:
            self.feedback[ticket_id].append(entry)
        else:
            self.feedback[ticket_id] = [entry]

    def save_meta(self, text, meta_message_ts, votes_message_ts):
        db.save_meta(text, meta_message_ts, votes_message_ts)
        self.metas[meta_message_ts] = {
                "votes": 0,
                "votes_message_ts": votes_message_ts,
                "text": text,
                "voters": {},
        }

    def get_meta_by_meta_ts(self, meta_message_ts):
        if meta_message_ts in self.metas.keys():
            return self.metas[meta_message_ts]
        else:
            meta_data = db.find_meta_by_meta_ts(meta_message_ts)
            if meta_data:
                self.metas[meta_message_ts] = {
                    "votes": meta_data["votes"],
                    "votes_message_ts": meta_data["votesMessageTs"],
                    "text": meta_data["text"],
                    "voters": {},
                }
                return self.metas[meta_message_ts]
            else:
                print("[Urgent] Error occured while fetching meta data from db.")
                return None

    def add_vote(self, meta_message_ts, user_id, delta):
        meta = self.get_meta_by_meta_ts(meta_message_ts)
        if not meta or {user_id: meta_message_ts} in self.ignorable:
            return None
        self.ignorable.append({user_id: meta_message_ts})
        previous = meta["voters"].get(user_id)
        if previous == delta:
            return False
        net = delta - previous if previous is not None else delta
        new_count = db.update_meta_votes(meta_message_ts, net)
        if new_count is None:
            return None
        meta["voters"][user_id] = delta
        meta["votes"] = new_count
        self.ignorable.remove({user_id: meta_message_ts})
        return new_count

cache = Cache()