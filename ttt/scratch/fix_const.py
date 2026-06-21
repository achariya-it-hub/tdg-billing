import os
import re

lib_dir = r"d:\upcoming Projects\tdg_flutter_app (2)\tdg_app\ttt\lib"

# Patterns to remove 'const' from if they contain TDGColors
patterns = [
    (r"const\s+TextStyle\s*\(", "TextStyle("),
    (r"const\s+BorderSide\s*\(", "BorderSide("),
    (r"const\s+Border\s*\(", "Border("),
    (r"const\s+UnderlineInputBorder\s*\(", "UnderlineInputBorder("),
    (r"const\s+OutlineInputBorder\s*\(", "OutlineInputBorder("),
    (r"const\s+AlwaysStoppedAnimation\s*<Color>\s*\(", "AlwaysStoppedAnimation<Color>("),
    (r"const\s+AlwaysStoppedAnimation\s*\(", "AlwaysStoppedAnimation("),
    (r"const\s+BoxShadow\s*\(", "BoxShadow("),
    (r"const\s+BoxDecoration\s*\(", "BoxDecoration("),
    (r"const\s+LinearGradient\s*\(", "LinearGradient("),
    (r"const\s+RadialGradient\s*\(", "RadialGradient("),
    (r"const\s+TextButton\s*\(", "TextButton("),
    (r"const\s+ElevatedButton\s*\(", "ElevatedButton("),
    (r"const\s+OutlinedButton\s*\(", "OutlinedButton("),
    (r"const\s+Icon\s*\(", "Icon("),
    (r"const\s+InputDecoration\s*\(", "InputDecoration("),
    (r"const\s+Text\s*\(", "Text("),
    (r"const\s+Container\s*\(", "Container("),
    (r"const\s+Padding\s*\(", "Padding("),
    (r"const\s+SizedBox\s*\(", "SizedBox("),
    (r"const\s+Row\s*\(", "Row("),
    (r"const\s+Column\s*\(", "Column("),
    (r"const\s+Center\s*\(", "Center("),
    (r"const\s+Align\s*\(", "Align("),
    (r"const\s+Divider\s*\(", "Divider("),
    (r"const\s+Positioned\s*\(", "Positioned("),
    (r"const\s+Wrap\s*\(", "Wrap("),
    (r"const\s+Expanded\s*\(", "Expanded("),
    (r"const\s+ListTile\s*\(", "ListTile("),
    (r"const\s+InkWell\s*\(", "InkWell("),
    (r"const\s+GestureDetector\s*\(", "GestureDetector("),
    (r"const\s+BackButton\s*\(", "BackButton("),
    (r"const\s+AppBar\s*\(", "AppBar("),
    (r"const\s+IconButton\s*\(", "IconButton("),
    (r"const\s+BackButtonIcon\s*\(", "BackButtonIcon("),
    (r"const\s+Title\s*\(", "Title("),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for pattern, replacement in patterns:
        def replcer(match):
            start_idx = match.start()
            open_count = 0
            has_tdg = False
            for i in range(start_idx, len(content)):
                if content[i] == '(':
                    open_count += 1
                elif content[i] == ')':
                    open_count -= 1
                    if open_count == 0:
                        sub = content[start_idx:i+1]
                        if "TDGColors" in sub:
                            return replacement
                        else:
                            return match.group(0)
            return match.group(0)

        new_content = re.sub(pattern, replcer, new_content)

    # Let's check line-by-line fallback
    lines = new_content.split('\n')
    for idx, line in enumerate(lines):
        if "TDGColors" in line and "const " in line:
            for pat, rep in patterns:
                lines[idx] = re.sub(pat, rep, lines[idx])
            lines[idx] = re.sub(r"const\s+\[", "[", lines[idx])
            lines[idx] = re.sub(r"const\s+<[^>]+>\s*\[", "[", lines[idx])

    new_content = '\n'.join(lines)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Modified: {filepath}")

# Traverse lib dir
for root, dirs, files in os.walk(lib_dir):
    for file in files:
        if file.endswith(".dart"):
            process_file(os.path.join(root, file))
