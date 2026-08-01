import os
import json
import sqlite3

search_terms = ["1183", "001183", "KOT-100", "03:03", "3:03"]

print("=== SEARCHING FOR BILL #001183 OR KOT-100 IN ALL PROJECT FILES AND DATABASES ===")

for root, dirs, files in os.walk("."):
    if ".git" in root or "node_modules" in root:
        continue
    for f in files:
        fpath = os.path.join(root, f)
        
        # Check SQLite DBs
        if f.endswith(".db") or f.endswith(".sqlite"):
            try:
                conn = sqlite3.connect(fpath)
                c = conn.cursor()
                c.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = c.fetchall()
                for t in tables:
                    tname = t[0]
                    c.execute(f"SELECT * FROM \"{tname}\"")
                    rows = c.fetchall()
                    for r in rows:
                        r_str = str(r)
                        if any(st in r_str for st in search_terms):
                            print(f"MATCH IN SQLITE DB {fpath} -> Table {tname}: {r}")
            except Exception as e:
                pass

        # Check JSON and text files
        elif f.endswith((".json", ".js", ".ts", ".html", ".txt", ".md", ".log")):
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fp:
                    text = fp.read()
                    if any(st in text for st in search_terms):
                        print(f"MATCH IN FILE {fpath}")
                        # Print lines containing terms
                        lines = text.splitlines()
                        for i, line in enumerate(lines):
                            if any(st in line for st in search_terms):
                                print(f"  L{i+1}: {line[:150]}")
            except Exception as e:
                pass
