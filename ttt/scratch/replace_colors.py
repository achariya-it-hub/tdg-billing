import os
import re

lib_dir = r"d:\upcoming Projects\tdg_flutter_app (2)\tdg_app\ttt\lib"

def process_file(filepath):
    # Skip widgets directory to avoid breaking base buttons if necessary, or process it
    if "tdg_button.dart" in filepath:
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    
    # 1. BackButton(color: Colors.white) -> BackButton(color: TDGColors.white)
    new_content = re.sub(
        r"BackButton\s*\(\s*color:\s*Colors\.white\s*\)", 
        "BackButton(color: TDGColors.white)", 
        new_content
    )
    
    # 2. const TextStyle(color: Colors.white) -> TextStyle(color: TDGColors.white)
    new_content = re.sub(
        r"const\s+TextStyle\s*\(\s*color:\s*Colors\.white", 
        "TextStyle(color: TDGColors.white", 
        new_content
    )
    new_content = re.sub(
        r"const\s+TextStyle\s*\(\s*color:\s*Colors\.white70", 
        "TextStyle(color: TDGColors.white.withOpacity(0.7)", 
        new_content
    )
    
    # 3. TextStyle(color: Colors.white) -> TextStyle(color: TDGColors.white)
    new_content = re.sub(
        r"TextStyle\s*\(\s*color:\s*Colors\.white", 
        "TextStyle(color: TDGColors.white", 
        new_content
    )
    new_content = re.sub(
        r"TextStyle\s*\(\s*color:\s*Colors\.white70", 
        "TextStyle(color: TDGColors.white.withOpacity(0.7)", 
        new_content
    )
    
    # 4. Icon(..., color: Colors.white) -> Icon(..., color: TDGColors.white)
    new_content = re.sub(
        r"Icon\s*\(([^)]*?color:\s*)Colors\.white", 
        r"Icon(\1TDGColors.white", 
        new_content
    )
    
    # 5. color: Colors.white70 -> color: TDGColors.white.withOpacity(0.7)
    new_content = re.sub(
        r"color:\s*Colors\.white70", 
        "color: TDGColors.white.withOpacity(0.7)", 
        new_content
    )
    
    # 6. Any const before constructors with TDGColors now
    new_content = re.sub(
        r"const\s+TextStyle\s*\(", 
        lambda m: "TextStyle(" if "TDGColors" in m.group(0) or "TDGColors" in new_content[m.start():m.start()+200] else m.group(0), 
        new_content
    )

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Modified: {filepath}")

# Traverse lib dir
for root, dirs, files in os.walk(lib_dir):
    for file in files:
        if file.endswith(".dart"):
            process_file(os.path.join(root, file))
