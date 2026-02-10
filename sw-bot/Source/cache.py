import db
class Cache:
    def __init__(self):
        self.ticket_users = {}

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

cache = Cache()