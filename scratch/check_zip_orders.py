import zipfile
import json

print("=== CHECKING SEED-DB.JSON INSIDE DEPLOY-HOSTINGER.ZIP ===")

if zipfile.is_zipfile("deploy-hostinger.zip"):
    with zipfile.ZipFile("deploy-hostinger.zip", "r") as z:
        for fname in z.namelist():
            if "seed-db.json" in fname or "db.json" in fname:
                try:
                    content = z.read(fname).decode("utf-8")
                    if "2026-07-31" in content:
                        data = json.loads(content)
                        orders = data.get("orders", []) + data.get("ordersVault", [])
                        july31 = [o for o in orders if isinstance(o, dict) and "2026-07-31" in str(o.get("createdAt") or o.get("date") or "")]
                        print(f"Inside zip {fname}: July 31 orders count = {len(july31)}")
                        if july31:
                            sum_rev = sum(o.get("total", 0) for o in july31)
                            print(f"  Total sales: Rs. {sum_rev}")
                            print(f"  First 3 IDs: {[o.get('id') or o.get('orderNumber') for o in july31[:3]]}")
                            print(f"  Last 3 IDs:  {[o.get('id') or o.get('orderNumber') for o in july31[-3:]]}")
                except Exception as e:
                    print(f"Error reading {fname}: {e}")
