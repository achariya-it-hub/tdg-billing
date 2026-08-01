import os
import json
import datetime

today_str = "2026-07-31"
start_time = datetime.datetime(2026, 7, 31, 9, 0, 0)
end_time = datetime.datetime(2026, 7, 31, 22, 19, 30)

print(f"Scanning for any orders or files between {start_time} and {end_time}...")

matched_files = []
order_matches = []

for root, dirs, files in os.walk("."):
    if ".git" in root or "node_modules" in root or ".gemini" in root:
        continue
    for f in files:
        filepath = os.path.join(root, f)
        try:
            mtime = os.path.getmtime(filepath)
            mod_dt = datetime.datetime.fromtimestamp(mtime)
            
            # Check if file content contains "2026-07-31"
            if f.endswith((".json", ".db", ".log", ".txt", ".sqlite")):
                with open(filepath, "r", encoding="utf-8", errors="ignore") as fp:
                    content = fp.read()
                    if today_str in content:
                        # Find occurrences
                        matched_files.append((filepath, mod_dt))
                        # If it's json, see if orders are inside
                        if f.endswith(".json"):
                            try:
                                data = json.loads(content)
                                if isinstance(data, dict):
                                    for k, v in data.items():
                                        if isinstance(v, list):
                                            for item in v:
                                                if isinstance(item, dict) and today_str in json.dumps(item):
                                                    order_matches.append((filepath, k, item))
                            except:
                                pass
        except Exception as e:
            pass

print(f"\nFiles containing string '{today_str}':")
for mf, dt in matched_files:
    print(f"  - {mf} (Modified: {dt})")

print(f"\nStructured objects matching '{today_str}': {len(order_matches)}")
for src, key, item in order_matches:
    print(f"  Source: {src} | Key: {key} | Item: {item}")
