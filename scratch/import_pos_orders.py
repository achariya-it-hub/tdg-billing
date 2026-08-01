import json
import os

# Transcribed POS report orders from image
pos_report_orders = [
    {"bill": "#001240", "kot": "KOT-157", "time": "21:53", "mode": "takeaway", "pay": "upi", "amt": 344},
    {"bill": "#001239", "kot": "KOT-156", "time": "21:44", "mode": "dine-in", "pay": "upi", "amt": 545},
    {"bill": "#001238", "kot": "KOT-155", "time": "21:39", "mode": "dine-in", "pay": "cash", "amt": 419},
    {"bill": "#001237", "kot": "KOT-154", "time": "21:28", "mode": "dine-in", "pay": "upi", "amt": 544},
    {"bill": "#001236", "kot": "KOT-153", "time": "21:26", "mode": "dine-in", "pay": "upi", "amt": 821},
    {"bill": "#001235", "kot": "KOT-152", "time": "21:16", "mode": "dine-in", "pay": "upi", "amt": 125},
    {"bill": "#001234", "kot": "KOT-151", "time": "21:14", "mode": "dine-in", "pay": "upi", "amt": 125},
    {"bill": "#001233", "kot": "KOT-150", "time": "21:12", "mode": "dine-in", "pay": "upi", "amt": 755},
    {"bill": "#001232", "kot": "KOT-149", "time": "21:08", "mode": "dine-in", "pay": "upi", "amt": 483},
    {"bill": "#001231", "kot": "KOT-148", "time": "21:03", "mode": "dine-in", "pay": "upi", "amt": 333},
    {"bill": "#001230", "kot": "KOT-147", "time": "21:01", "mode": "dine-in", "pay": "upi", "amt": 167},
    {"bill": "#001229", "kot": "KOT-146", "time": "21:00", "mode": "dine-in", "pay": "upi", "amt": 419},
    {"bill": "#001228", "kot": "KOT-145", "time": "20:57", "mode": "dine-in", "pay": "upi", "amt": 125},
    {"bill": "#001227", "kot": "KOT-144", "time": "20:56", "mode": "dine-in", "pay": "upi", "amt": 227},
    {"bill": "#001226", "kot": "KOT-143", "time": "20:51", "mode": "dine-in", "pay": "cash", "amt": 83},
    {"bill": "#001225", "kot": "KOT-142", "time": "20:48", "mode": "takeaway", "pay": "cash", "amt": 659},
    {"bill": "#001224", "kot": "KOT-141", "time": "20:38", "mode": "dine-in", "pay": "cash", "amt": 251},
    {"bill": "#001223", "kot": "KOT-140", "time": "20:37", "mode": "dine-in", "pay": "upi", "amt": 314},
    {"bill": "#001222", "kot": "KOT-139", "time": "20:30", "mode": "dine-in", "pay": "upi", "amt": 83},
    {"bill": "#001221", "kot": "KOT-138", "time": "20:23", "mode": "dine-in", "pay": "upi", "amt": 309},
    {"bill": "#001220", "kot": "KOT-137", "time": "20:16", "mode": "takeaway", "pay": "upi", "amt": 218},
    {"bill": "#001219", "kot": "KOT-136", "time": "19:58", "mode": "dine-in", "pay": "upi", "amt": 167},
    {"bill": "#001218", "kot": "KOT-135", "time": "19:57", "mode": "dine-in", "pay": "upi", "amt": 369},
    {"bill": "#001217", "kot": "KOT-134", "time": "19:56", "mode": "dine-in", "pay": "upi", "amt": 325},
    {"bill": "#001216", "kot": "KOT-133", "time": "19:53", "mode": "dine-in", "pay": "upi", "amt": 755},
    {"bill": "#001215", "kot": "KOT-132", "time": "19:50", "mode": "dine-in", "pay": "cash", "amt": 151},
    {"bill": "#001214", "kot": "KOT-131", "time": "19:49", "mode": "dine-in", "pay": "upi", "amt": 800},
    {"bill": "#001213", "kot": "KOT-130", "time": "19:44", "mode": "dine-in", "pay": "upi", "amt": 83},
    {"bill": "#001212", "kot": "KOT-129", "time": "19:43", "mode": "dine-in", "pay": "upi", "amt": 501},
    {"bill": "#001211", "kot": "KOT-128", "time": "19:39", "mode": "dine-in", "pay": "upi", "amt": 912},
    {"bill": "#001210", "kot": "KOT-127", "time": "19:33", "mode": "dine-in", "pay": "upi", "amt": 184},
    {"bill": "#001209", "kot": "KOT-126", "time": "19:28", "mode": "dine-in", "pay": "upi", "amt": 208},
    {"bill": "#001208", "kot": "KOT-125", "time": "19:19", "mode": "dine-in", "pay": "upi", "amt": 118},
    {"bill": "#001207", "kot": "KOT-124", "time": "19:15", "mode": "dine-in", "pay": "cash", "amt": 334},
    {"bill": "#001206", "kot": "KOT-123", "time": "19:06", "mode": "dine-in", "pay": "cash", "amt": 301},
    {"bill": "#001205", "kot": "KOT-122", "time": "19:03", "mode": "dine-in", "pay": "cash", "amt": 475},
    {"bill": "#001204", "kot": "KOT-121", "time": "19:01", "mode": "dine-in", "pay": "upi", "amt": 458},
    {"bill": "#001203", "kot": "KOT-120", "time": "18:59", "mode": "dine-in", "pay": "upi", "amt": 83},
    {"bill": "#001202", "kot": "KOT-119", "time": "18:59", "mode": "dine-in", "pay": "upi", "amt": 403},
    {"bill": "#001201", "kot": "KOT-118", "time": "18:46", "mode": "dine-in", "pay": "upi", "amt": 602},
    {"bill": "#001200", "kot": "KOT-117", "time": "18:22", "mode": "dine-in", "pay": "upi", "amt": 167},
    {"bill": "#001199", "kot": "KOT-116", "time": "18:12", "mode": "dine-in", "pay": "upi", "amt": 167},
    {"bill": "#001198", "kot": "KOT-115", "time": "17:59", "mode": "dine-in", "pay": "cash", "amt": 419},
    {"bill": "#001197", "kot": "KOT-114", "time": "17:49", "mode": "dine-in", "pay": "upi", "amt": 418},
    {"bill": "#001196", "kot": "KOT-113", "time": "17:39", "mode": "dine-in", "pay": "upi", "amt": 166},
    {"bill": "#001195", "kot": "KOT-112", "time": "17:36", "mode": "dine-in", "pay": "upi", "amt": 293},
    {"bill": "#001194", "kot": "KOT-111", "time": "17:08", "mode": "dine-in", "pay": "upi", "amt": 166},
    {"bill": "#001193", "kot": "KOT-110", "time": "17:07", "mode": "takeaway", "pay": "upi", "amt": 83},
    {"bill": "#001192", "kot": "KOT-109", "time": "16:40", "mode": "dine-in", "pay": "upi", "amt": 101},
    {"bill": "#001191", "kot": "KOT-108", "time": "16:35", "mode": "dine-in", "pay": "upi", "amt": 83},
    {"bill": "#001190", "kot": "KOT-107", "time": "16:28", "mode": "dine-in", "pay": "upi", "amt": 66},
    {"bill": "#001189", "kot": "KOT-106", "time": "16:27", "mode": "dine-in", "pay": "upi", "amt": 394},
    {"bill": "#001188", "kot": "KOT-105", "time": "16:15", "mode": "dine-in", "pay": "upi", "amt": 199},
    {"bill": "#001187", "kot": "KOT-104", "time": "16:06", "mode": "dine-in", "pay": "upi", "amt": 200},
    {"bill": "#001186", "kot": "KOT-103", "time": "15:54", "mode": "dine-in", "pay": "upi", "amt": 292},
    {"bill": "#001185", "kot": "KOT-102", "time": "15:35", "mode": "dine-in", "pay": "cash", "amt": 595},
    {"bill": "#001184", "kot": "KOT-101", "time": "15:06", "mode": "dine-in", "pay": "upi", "amt": 610},
    {"bill": "#001183", "kot": "KOT-100", "time": "15:03", "mode": "dine-in", "pay": "upi", "amt": 418}
]

# Convert to standard JSON order schema
new_orders_july31 = []
for p in pos_report_orders:
    onum = int(p["bill"].replace("#00", ""))
    total = p["amt"]
    subtotal = Math = int(round(total / 1.05)) if total > 0 else 0
    tax = total - subtotal
    
    dt_str = f"2026-07-31T{p['time']}:00.000+05:30"
    
    order_obj = {
        "id": onum,
        "orderNumber": onum,
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
    new_orders_july31.append(order_obj)

# Update database files
target_files = [
    "server/db.json",
    "server/seed-db.json",
    "deploy-hostinger/server/seed-db.json",
    "deploy-hostinger/server/db.json"
]

for tf in target_files:
    if os.path.exists(tf):
        try:
            with open(tf, "r", encoding="utf-8") as f:
                db_data = json.load(f)
            
            # Remove old orders for 2026-07-31
            existing_orders = db_data.get("orders", [])
            filtered_orders = [o for o in existing_orders if "2026-07-31" not in str(o.get("date") or o.get("createdAt") or "")]
            
            # Append exact 58 orders for 2026-07-31
            filtered_orders.extend(new_orders_july31)
            
            db_data["orders"] = filtered_orders
            
            with open(tf, "w", encoding="utf-8") as f:
                json.dump(db_data, f, indent=2)
                
            print(f"Updated {tf} with exact {len(new_orders_july31)} POS report orders for 2026-07-31!")
        except Exception as e:
            print(f"Error updating {tf}: {e}")
