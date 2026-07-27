import os
import json
import shutil
from datetime import datetime

db_path = r"d:\TDG-Billing\server\db.json"
seed_path = r"d:\TDG-Billing\server\seed-db.json"
hostinger_seed_path = r"d:\TDG-Billing\deploy-hostinger\server\seed-db.json"
backup_lock_path = r"d:\TDG-Billing\server\menu_backup_LOCK.json"

if os.path.exists(db_path):
    with open(db_path, "r", encoding="utf-8") as f:
        db_data = json.load(f)
    
    menu_count = len(db_data.get("menuItems", []))
    cat_count = len(db_data.get("categories", []))
    print(f"Current DB Status: {menu_count} Menu Items, {cat_count} Categories.")

    # Copy active db.json to seed-db.json so seed is 100% identical
    shutil.copy2(db_path, seed_path)
    print(f"Synchronized {seed_path}")

    # Copy active db.json to deploy-hostinger seed
    os.makedirs(os.path.dirname(hostinger_seed_path), exist_ok=True)
    shutil.copy2(db_path, hostinger_seed_path)
    print(f"Synchronized {hostinger_seed_path}")

    # Create immutable lock backup
    shutil.copy2(db_path, backup_lock_path)
    print(f"Created permanent lock backup at {backup_lock_path}")
else:
    print("Error: server/db.json not found!")
