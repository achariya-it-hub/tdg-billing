import os
import json

print("=== TDG Billing — Updating src/stores/menuStore.js ===")

menu_store_path = r"d:\TDG-Billing\src\stores\menuStore.js"
db_path = r"d:\TDG-Billing\server\db.json"

with open(db_path, "r", encoding="utf-8") as f:
    db = json.load(f)

categories = db["categories"]
menu_items = db["menuItems"]

code = f"""import {{ create }} from 'zustand'

const sampleCategories = {json.dumps(categories, indent=2)}

const sampleMenuItems = {json.dumps(menu_items, indent=2)}

export const useMenuStore = create((set, get) => ({{
  categories: sampleCategories,
  menuItems: sampleMenuItems,
  loading: false,
  
  fetchCategories: async () => {{
    try {{
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : window.location.origin
      
      const res = await fetch(`${{apiUrl}}/api/admin/menu/categories`)
      if (res.ok) {{
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {{
          set({{ categories: data }})
          return
        }}
      }}
    }} catch (e) {{
      console.log('Using local categories fallback')
    }}
    set({{ categories: sampleCategories }})
  }},
  
  fetchMenuItems: async (categoryId) => {{
    set({{ loading: true }})
    try {{
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : window.location.origin
      
      const url = categoryId ? `${{apiUrl}}/api/admin/menu/items?categoryId=${{categoryId}}` : `${{apiUrl}}/api/admin/menu/items`
      const res = await fetch(url)
      if (res.ok) {{
        const rawData = await res.json()
        const data = Array.isArray(rawData) ? rawData : (rawData.items || rawData.menuItems || [])
        if (Array.isArray(data) && data.length > 0) {{
          set({{ menuItems: data, loading: false }})
          return
        }}
      }}
    }} catch (e) {{
      console.log('Using local menu items fallback')
    }}
    if (categoryId) {{
      set({{ menuItems: sampleMenuItems.filter(i => i.categoryId === categoryId), loading: false }})
    }} else {{
      set({{ menuItems: sampleMenuItems, loading: false }})
    }}
  }},
  
  toggleAvailability: async (itemId, isAvailable) => {{
    set(state => ({{
      menuItems: state.menuItems.map(item =>
        item.id === itemId ? {{ ...item, isAvailable }} : item
      )
    }}))
  }}
}}))
"""

with open(menu_store_path, "w", encoding="utf-8") as f:
    f.write(code)

print("src/stores/menuStore.js updated successfully!")
