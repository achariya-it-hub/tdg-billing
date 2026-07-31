import json

with open('server/db.json', 'r', encoding='utf-8') as f:
    db_data = json.load(f)

recipes = db_data.get('recipes', [])

# Format recipes as JS array string
recipes_js = json.dumps(recipes, indent=2)

with open('src/pages/Menu.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace sampleRecipes = [...] with sampleRecipes = <recipes_js>
start_marker = "const sampleRecipes = ["
end_marker = "\nconst API ="

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + "const sampleRecipes = " + recipes_js + "\n" + content[end_idx:]
    with open('src/pages/Menu.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully updated sampleRecipes in Menu.jsx!")
else:
    print(f"Markers not found! start_idx={start_idx}, end_idx={end_idx}")
