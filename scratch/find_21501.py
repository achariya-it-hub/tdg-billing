import os
import json

print("=== SEARCHING FOR 21501 OR 66 IN ALL JSON FILES ===")

for root, dirs, files in os.walk("."):
    if ".git" in root or "node_modules" in root:
        continue
    for f in files:
        if f.endswith(".json"):
            fpath = os.path.join(root, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fp:
                    text = fp.read()
                    if "21501" in text or "21,501" in text:
                        print(f"FOUND 21501 IN FILE: {fpath}")
            except Exception as e:
                pass
