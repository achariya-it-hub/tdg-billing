import json

with open("server/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

print("Keys in db.json:", list(db.keys()))

for k in db:
    if isinstance(db[k], list):
        print(f"Key '{k}': {len(db[k])} items")
