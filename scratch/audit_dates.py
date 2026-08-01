import json
import os

print("=== FULL RE-CONFIRMATION & DATE AUDIT FOR ALL ORDERS ===")

with open("server/db.json", "r", encoding="utf-8") as f:
    db_data = json.load(f)

orders = db_data.get("orders", [])
orders_vault = db_data.get("ordersVault", [])
all_orders = orders + orders_vault

print(f"Total active orders: {len(orders)}")
print(f"Total vault orders: {len(orders_vault)}")
print(f"Total combined orders: {len(all_orders)}")

pos_report_bills = list(range(1183, 1241))
misplaced_bills = []
today_bills = []

for o in all_orders:
    onum = o.get("orderNumber") or o.get("id")
    kot = str(o.get("kotNumber") or "")
    d_val = str(o.get("date") or o.get("createdAt") or "")
    
    if (isinstance(onum, int) and 1183 <= onum <= 1240) or any(f"KOT-{k}" in kot for k in range(100, 158)):
        if "2026-07-31" not in d_val:
            misplaced_bills.append((onum, kot, d_val, o))
        else:
            today_bills.append(o)

print(f"\nAudit Result for POS Report Range (#001183 - #001240 / KOT-100 - KOT-157):")
print(f"  Total matching bills under 2026-07-31: {len(today_bills)}")
print(f"  Misplaced bills under previous dates: {len(misplaced_bills)}")

if misplaced_bills:
    print("\nMISPLACED BILLS FOUND:")
    for onum, kot, d_val, o in misplaced_bills:
        print(f"  Order #{onum} | {kot} | Date in DB: {d_val}")

date_summary = {}
for o in all_orders:
    d = str(o.get("date") or o.get("createdAt") or "")[:10]
    if d not in date_summary:
        date_summary[d] = {"count": 0, "rev": 0, "id_min": 999999, "id_max": 0}
    date_summary[d]["count"] += 1
    date_summary[d]["rev"] += (o.get("total") or 0)
    oid = o.get("id") or o.get("orderNumber")
    if isinstance(oid, int):
        date_summary[d]["id_min"] = min(date_summary[d]["id_min"], oid)
        date_summary[d]["id_max"] = max(date_summary[d]["id_max"], oid)

print("\n--- Summary of Orders per Date in Database ---")
for d in sorted(date_summary.keys()):
    info = date_summary[d]
    id_range = f"IDs #{info['id_min']} - #{info['id_max']}" if info['id_min'] != 999999 else "UUIDs"
    print(f"Date: {d} | Bills: {info['count']:3d} | Revenue: Rs.{info['rev']:7.2f} | Range: {id_range}")
