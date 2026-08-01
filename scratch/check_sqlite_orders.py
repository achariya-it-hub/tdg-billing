import sqlite3

conn = sqlite3.connect("server/billing.db")
c = conn.cursor()
c.execute("SELECT * FROM orders ORDER BY rowid DESC LIMIT 20")
rows = c.fetchall()
c.execute("PRAGMA table_info(orders)")
cols = [col[1] for col in c.fetchall()]

print("Columns in billing.db orders:", cols)
print(f"Total rows in billing.db orders: {len(rows)}")
for r in rows:
    row_dict = dict(zip(cols, r))
    print(row_dict)
