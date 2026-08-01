import json

with open("server/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

orders_vault = db.get("ordersVault", [])

vault_dates = {}
for o in orders_vault:
    d = (o.get("createdAt") or o.get("date") or "")[:10]
    vault_dates[d] = vault_dates.get(d, 0) + 1

print("--- VAULT ORDERS DATE COUNTS ---")
for d in sorted(vault_dates.keys()):
    print(f"Date: {d} | Vault Orders: {vault_dates[d]}")
