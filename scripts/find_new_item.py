import os
import json

print("=== Searching for rogue item 'new' across files ===")

matches = []
for root, dirs, files in os.walk(r"d:\TDG-Billing"):
    if any(x in root for x in ['node_modules', '.git', 'dist', 'build', '.dart_tool']):
        continue
    for f in files:
        if f.endswith('.json') or f.endswith('.js') or f.endswith('.jsx'):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as fh:
                    content = fh.read()
                    if '"new"' in content.lower() or "'new'" in content.lower():
                        # check if it looks like a menu item name
                        if 'price' in content.lower():
                            matches.append(path)
            except Exception as e:
                pass

print("Files matching 'new' + 'price':")
for m in matches:
    print(" -", m)
