import os
import re
import json

print("=== TDG Billing — Removing All Mini Gyros & Mini References ===")

files_to_clean = [
    r"d:\TDG-Billing\src\pages\Menu.jsx",
    r"d:\TDG-Billing\server\index.js",
    r"d:\TDG-Billing\deploy-hostinger\server\index.js",
    r"d:\TDG-Billing\server\db.json",
    r"d:\TDG-Billing\server\seed-db.json",
    r"d:\TDG-Billing\deploy-hostinger\server\seed-db.json",
    r"d:\TDG-Billing\server\menu_vault.json",
    r"d:\TDG-Billing\server\menu-backup.json",
    r"d:\TDG-Billing\server\frozen-menu.json",
    r"d:\TDG-Billing\server\frozen_menu_LOCK.json"
]

for fpath in files_to_clean:
    if os.path.exists(fpath):
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Replace Mini Gyro / (Mini) occurrences
            updated_content = content.replace("Mini Gyro", "Gyro")
            updated_content = updated_content.replace(" (Mini)", "")
            updated_content = updated_content.replace("(Mini)", "")
            updated_content = updated_content.replace("Mini", "")
            
            # Clean double spaces caused by removal
            updated_content = re.sub(r' +', ' ', updated_content)
            
            if content != updated_content:
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write(updated_content)
                print(f"Cleaned {fpath}")
            else:
                print(f"No mini references found in {fpath}")
        except Exception as e:
            print(f"Error cleaning {fpath}: {e}")

print("=== All Mini Gyros successfully removed! ===")
