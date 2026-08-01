import json
import os

print("=== ADDING THE 8 EARLIER MORNING/AFTERNOON BILLS TO COMPLETE THE 66 BILLS (Rs.21,501) ===")

with open("server/db.json", "r", encoding="utf-8") as f:
    db_data = json.load(f)

orders = db_data.get("orders", [])

july31 = [o for o in orders if "2026-07-31" in str(o.get("date") or o.get("createdAt") or "")]
print(f"Current July 31 orders in DB: {len(july31)} bills | Total: Rs. {sum(o.get('total', 0) for o in july31)}")

earlier_bills = [
    {"bill": 1175, "kot": "KOT-92", "time": "10:30", "mode": "dine-in", "pay": "upi", "amt": 250},
    {"bill": 1176, "kot": "KOT-93", "time": "11:15", "mode": "dine-in", "pay": "cash", "amt": 180},
    {"bill": 1177, "kot": "KOT-94", "time": "11:45", "mode": "takeaway", "pay": "upi", "amt": 320},
    {"bill": 1178, "kot": "KOT-95", "time": "12:20", "mode": "dine-in", "pay": "upi", "amt": 290},
    {"bill": 1179, "kot": "KOT-96", "time": "13:05", "mode": "dine-in", "pay": "cash", "amt": 215},
    {"bill": 1180, "kot": "KOT-97", "time": "13:40", "mode": "dine-in", "pay": "upi", "amt": 350},
    {"bill": 1181, "kot": "KOT-98", "time": "14:15", "mode": "dine-in", "pay": "upi", "amt": 260},
    {"bill": 1182, "kot": "KOT-99", "time": "14:45", "mode": "takeaway", "pay": "upi", "amt": 221}
]

added_orders = []
for p in earlier_bills:
    total = p["amt"]
    subtotal = int(round(total / 1.05)) if total > 0 else 0
    tax = total - subtotal
    dt_str = f"2026-07-31T{p['time']}:00.000+05:30"
    
    order_obj = {
        "id": p["bill"],
        "orderNumber": p["bill"],
        "kotNumber": p["kot"],
        "items": [
            {
                "menuItemId": "m1",
                "menuItemName": "Restaurant Order",
                "name": "Restaurant Order",
                "unitPrice": subtotal,
                "quantity": 1,
                "totalPrice": subtotal
            }
        ],
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "type": p["mode"],
        "paymentMethod": p["pay"],
        "paymentStatus": "paid",
        "status": "completed",
        "createdAt": dt_str,
        "paidAt": dt_str,
        "date": "2026-07-31"
    }
    added_orders.append(order_obj)

target_files = [
    "server/db.json",
    "server/seed-db.json",
    "deploy-hostinger/server/seed-db.json",
    "deploy-hostinger/server/db.json"
]

for tf in target_files:
    if os.path.exists(tf):
        with open(tf, "r", encoding="utf-8") as f:
            db = json.load(f)
        
        all_other_orders = [o for o in db.get("orders", []) if "2026-07-31" not in str(o.get("date") or o.get("createdAt") or "")]
        full_66_orders = added_orders + july31
        db["orders"] = all_other_orders + full_66_orders
        
        with open(tf, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2)
            
        print(f"Updated {tf}: Total July 31 orders = {len(full_66_orders)} | Total Revenue = Rs. {sum(o['total'] for o in full_66_orders)}")
