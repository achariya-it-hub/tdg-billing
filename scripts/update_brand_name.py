import os
import re

print("=== Replacing all brand names to 'Tendens Gyros' / 'TENDENS GYROS' ===")

# Replacements:
# "TEN DEN GYROS" -> "TENDENS GYROS"
# "TEN DENS GYROS" -> "TENDENS GYROS"
# "TE DEN GYROS" -> "TENDENS GYROS"
# "Ten Den Gyros" -> "Tendens Gyros"
# "Ten Dens Gyros" -> "Tendens Gyros"
# "Te Den Gyros" -> "Tendens Gyros"

replacements = [
    ("TEN DENS GYROS", "TENDENS GYROS"),
    ("TEN DEN GYROS", "TENDENS GYROS"),
    ("TE DEN GYROS", "TENDENS GYROS"),
    ("Ten Dens Gyros", "Tendens Gyros"),
    ("Ten Den Gyros", "Tendens Gyros"),
    ("Te Den Gyros", "Tendens Gyros"),
    ("ten den gyros", "tendens gyros"),
    ("te den gyros", "tendens gyros"),
]

root_dir = r"d:\TDG-Billing"
modified_files = []

for root, dirs, files in os.walk(root_dir):
    if any(x in root for x in ['node_modules', '.git', 'dist', 'build', '.dart_tool']):
        continue
    for file in files:
        if file.endswith(('.dart', '.jsx', '.js', '.html', '.json', '.yaml')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                new_content = content
                for old_text, new_text in replacements:
                    new_content = new_content.replace(old_text, new_text)

                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    modified_files.append(filepath)
                    print(f"Updated: {filepath}")
            except Exception as e:
                pass

print(f"\nDone! Modified {len(modified_files)} files.")
