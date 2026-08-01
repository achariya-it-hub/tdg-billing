import json
import re

with open("server/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

orders_vault = db.get("ordersVault", [])
vault_cancelled = [o for o in orders_vault if "cancel" in str(o).lower() or str(o.get("status")).lower() == "cancelled"]
print(f"Cancelled orders in ordersVault: {len(vault_cancelled)}")

# Check Reports.jsx for sample cancelled data
with open("src/pages/Reports.jsx", "r", encoding="utf-8") as f:
    reports_code = f.read()

# Find cancelled KOTs/bills in Reports.jsx
matches = re.findall(r"\{[^}]*cancelled[^}]*\}", reports_code, re.IGNORECASE)
print("Cancelled matches in Reports.jsx:", len(matches))
for m in matches:
    print(m)
