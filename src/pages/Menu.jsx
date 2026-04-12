import { useState, useEffect } from 'react'
import { UtensilsCrossed, Plus, Search, BookOpen, Package, Edit, Trash2, Check, X, ChevronRight, AlertTriangle, Calculator } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'

const sampleCategories = [
  { id: 'cat_1', name: 'Burgers', color: '#e63946', displayOrder: 1 },
  { id: 'cat_2', name: 'Chicken', color: '#f59e0b', displayOrder: 2 },
  { id: 'cat_3', name: 'Sides', color: '#10b981', displayOrder: 3 },
  { id: 'cat_4', name: 'Beverages', color: '#3b82f6', displayOrder: 4 },
]

const sampleMenuItems = [
  { id: 'm1', categoryId: 'cat_1', name: 'Zinger Burger', price: 249, description: 'Crispy zinger fillet with spicy sauce', prepTime: 12, isAvailable: 1 },
  { id: 'm2', categoryId: 'cat_1', name: 'Classic Burger', price: 199, description: 'Juicy chicken patty with lettuce', prepTime: 10, isAvailable: 1 },
  { id: 'm3', categoryId: 'cat_1', name: 'Double Decker', price: 329, description: 'Two patties, double the taste', prepTime: 15, isAvailable: 1 },
  { id: 'm4', categoryId: 'cat_2', name: 'Hot Wings (6pc)', price: 299, description: 'Crispy fried wings with hot sauce', prepTime: 15, isAvailable: 1 },
  { id: 'm5', categoryId: 'cat_2', name: 'Crispy Strips (4pc)', price: 249, description: 'Golden crispy chicken strips', prepTime: 12, isAvailable: 1 },
  { id: 'm6', categoryId: 'cat_3', name: 'French Fries', price: 99, description: 'Golden crispy fries', prepTime: 8, isAvailable: 1 },
  { id: 'm7', categoryId: 'cat_3', name: 'Coleslaw', price: 79, description: 'Creamy cabbage salad', prepTime: 5, isAvailable: 1 },
  { id: 'm8', categoryId: 'cat_4', name: 'Pepsi (500ml)', price: 60, description: 'Chilled Pepsi', prepTime: 2, isAvailable: 1 },
  { id: 'm9', categoryId: 'cat_4', name: 'Masala Chai', price: 40, description: 'Traditional Indian spiced tea', prepTime: 5, isAvailable: 1 },
]

const sampleInventory = [
  { id: 'i1', name: 'Chicken Breast', unit: 'kg', currentStock: 50, costPerUnit: 180 },
  { id: 'i2', name: 'Burger Buns', unit: 'pcs', currentStock: 200, costPerUnit: 8 },
  { id: 'i3', name: 'Lettuce', unit: 'kg', currentStock: 10, costPerUnit: 120 },
  { id: 'i4', name: 'Tomato Slices', unit: 'kg', currentStock: 8, costPerUnit: 80 },
  { id: 'i5', name: 'Cheese Slices', unit: 'pcs', currentStock: 100, costPerUnit: 15 },
  { id: 'i6', name: 'Chicken Wings', unit: 'kg', currentStock: 25, costPerUnit: 200 },
  { id: 'i7', name: 'Fries (Frozen)', unit: 'kg', currentStock: 30, costPerUnit: 45 },
  { id: 'i8', name: 'Cooking Oil', unit: 'liters', currentStock: 40, costPerUnit: 120 },
  { id: 'i9', name: 'Pepsi Syrup', unit: 'liters', currentStock: 5, costPerUnit: 350 },
  { id: 'i10', name: 'Tea Leaves', unit: 'kg', currentStock: 3, costPerUnit: 500 },
  { id: 'i11', name: 'Milk', unit: 'liters', currentStock: 10, costPerUnit: 60 },
  { id: 'i12', name: 'Packaging Boxes', unit: 'pcs', currentStock: 200, costPerUnit: 5 },
]

const sampleRecipes = [
  {
    id: 'r1',
    menuItemId: 'm1',
    name: 'Zinger Burger Recipe',
    description: 'Standard recipe for Zinger Burger',
    yieldQty: 1,
    prepTime: 12,
    ingredients: [
      { id: 'ri1', inventoryItemId: 'i1', inventoryName: 'Chicken Breast', quantity: 0.15, unit: 'kg', currentStock: 50 },
      { id: 'ri2', inventoryItemId: 'i2', inventoryName: 'Burger Buns', quantity: 1, unit: 'pcs', currentStock: 200 },
      { id: 'ri3', inventoryItemId: 'i3', inventoryName: 'Lettuce', quantity: 0.02, unit: 'kg', currentStock: 10 },
      { id: 'ri4', inventoryItemId: 'i4', inventoryName: 'Tomato Slices', quantity: 0.03, unit: 'kg', currentStock: 8 },
      { id: 'ri5', inventoryItemId: 'i5', inventoryName: 'Cheese Slices', quantity: 1, unit: 'pcs', currentStock: 100 },
      { id: 'ri6', inventoryItemId: 'i8', inventoryName: 'Cooking Oil', quantity: 0.05, unit: 'liters', currentStock: 40 },
    ]
  },
  {
    id: 'r2',
    menuItemId: 'm4',
    name: 'Hot Wings Recipe',
    description: 'Standard recipe for Hot Wings (6pc)',
    yieldQty: 1,
    prepTime: 15,
    ingredients: [
      { id: 'ri7', inventoryItemId: 'i6', inventoryName: 'Chicken Wings', quantity: 0.4, unit: 'kg', currentStock: 25 },
      { id: 'ri8', inventoryItemId: 'i8', inventoryName: 'Cooking Oil', quantity: 0.2, unit: 'liters', currentStock: 40 },
    ]
  },
  {
    id: 'r3',
    menuItemId: 'm9',
    name: 'Masala Chai Recipe',
    description: 'Standard recipe for Masala Chai',
    yieldQty: 1,
    prepTime: 5,
    ingredients: [
      { id: 'ri9', inventoryItemId: 'i10', inventoryName: 'Tea Leaves', quantity: 0.005, unit: 'kg', currentStock: 3 },
      { id: 'ri10', inventoryItemId: 'i11', inventoryName: 'Milk', quantity: 0.15, unit: 'liters', currentStock: 10 },
    ]
  },
]

export default function MenuManagement() {
  const toast = useToast()
  const [categories, setCategories] = useState(sampleCategories)
  const [menuItems, setMenuItems] = useState(sampleMenuItems)
  const [inventory, setInventory] = useState(sampleInventory)
  const [recipes, setRecipes] = useState(sampleRecipes)
  const [activeTab, setActiveTab] = useState('menu')
  const [showRecipeModal, setShowRecipeModal] = useState(false)
  const [showIngredientModal, setShowIngredientModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState(null)
  const [recipeIngredients, setRecipeIngredients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getRecipeForItem = (menuItemId) => {
    return recipes.find(r => r.menuItemId === menuItemId)
  }

  const getItemCost = (menuItemId) => {
    const recipe = getRecipeForItem(menuItemId)
    if (!recipe) return null
    return recipe.ingredients.reduce((sum, ing) => sum + (ing.quantity * inventory.find(i => i.id === ing.inventoryItemId)?.costPerUnit || 0), 0)
  }

  const getItemProfit = (menuItemId) => {
    const item = menuItems.find(m => m.id === menuItemId)
    const cost = getItemCost(menuItemId)
    if (!item || cost === null) return null
    return item.price - cost
  }

  const getItemMargin = (menuItemId) => {
    const item = menuItems.find(m => m.id === menuItemId)
    const profit = getItemProfit(menuItemId)
    if (!item || profit === null) return null
    return ((profit / item.price) * 100).toFixed(1)
  }

  const canMakeItem = (menuItemId) => {
    const recipe = getRecipeForItem(menuItemId)
    if (!recipe) return { canMake: null, reasons: [] }
    
    const reasons = []
    let canMake = true
    
    for (let ing of recipe.ingredients) {
      const invItem = inventory.find(i => i.id === ing.inventoryItemId)
      if (invItem) {
        const needed = ing.quantity
        const available = invItem.currentStock
        if (available < needed) {
          canMake = false
          reasons.push(`Short of ${invItem.name} by ${(needed - available).toFixed(2)} ${ing.unit}`)
        }
      }
    }
    
    return { canMake, reasons }
  }

  const openRecipeModal = (menuItem) => {
    setSelectedMenuItem(menuItem)
    const existingRecipe = getRecipeForItem(menuItem.id)
    if (existingRecipe) {
      setRecipeIngredients([...existingRecipe.ingredients])
    } else {
      setRecipeIngredients([])
    }
    setShowRecipeModal(true)
  }

  const addIngredient = (invItem) => {
    if (recipeIngredients.find(i => i.inventoryItemId === invItem.id)) {
      toast.warning('Ingredient already added')
      return
    }
    setRecipeIngredients([...recipeIngredients, {
      id: 'temp_' + Date.now(),
      inventoryItemId: invItem.id,
      inventoryName: invItem.name,
      quantity: 1,
      unit: invItem.unit,
      currentStock: invItem.currentStock,
      costPerUnit: invItem.costPerUnit
    }])
  }

  const updateIngredientQty = (id, quantity) => {
    setRecipeIngredients(recipeIngredients.map(i => 
      i.id === id ? { ...i, quantity: parseFloat(quantity) || 0 } : i
    ))
  }

  const removeIngredient = (id) => {
    setRecipeIngredients(recipeIngredients.filter(i => i.id !== id))
  }

  const saveRecipe = () => {
    if (recipeIngredients.length === 0) {
      toast.error('Add at least one ingredient')
      return
    }
    
    const existingIndex = recipes.findIndex(r => r.menuItemId === selectedMenuItem.id)
    const newRecipe = {
      id: existingIndex >= 0 ? recipes[existingIndex].id : 'r_' + Date.now(),
      menuItemId: selectedMenuItem.id,
      name: `${selectedMenuItem.name} Recipe`,
      description: '',
      yieldQty: 1,
      prepTime: selectedMenuItem.prepTime,
      ingredients: recipeIngredients.map(i => ({
        inventoryItemId: i.inventoryItemId,
        quantity: i.quantity,
        unit: i.unit
      }))
    }

    if (existingIndex >= 0) {
      const updated = [...recipes]
      updated[existingIndex] = newRecipe
      setRecipes(updated)
    } else {
      setRecipes([...recipes, newRecipe])
    }

    toast.success('Recipe saved successfully')
    setShowRecipeModal(false)
  }

  const deleteRecipe = (menuItemId) => {
    setRecipes(recipes.filter(r => r.menuItemId !== menuItemId))
    toast.success('Recipe deleted')
  }

  const totalRecipeCost = recipeIngredients.reduce((sum, ing) => {
    const invItem = inventory.find(i => i.id === ing.inventoryItemId)
    return sum + (ing.quantity * (invItem?.costPerUnit || 0))
  }, 0)

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          Menu & Recipe Management
        </h2>
        <p style={{ color: '#6b7280' }}>Manage menu items and map recipes to ingredients</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UtensilsCrossed size={24} color="#e63946" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{menuItems.length}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Menu Items</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#fffbeb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={24} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{recipes.length}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Recipes Mapped</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={24} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{menuItems.length - recipes.length}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Unmapped Items</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={24} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{inventory.length}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Inventory Items</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed },
          { id: 'recipes', label: 'All Recipes', icon: BookOpen },
          { id: 'inventory', label: 'Inventory', icon: Package },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: activeTab === tab.id ? '#e63946' : 'white',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Menu Items Tab */}
      {activeTab === 'menu' && (
        <>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'white',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
            {filteredMenuItems.map(item => {
              const category = categories.find(c => c.id === item.categoryId)
              const recipe = getRecipeForItem(item.id)
              const cost = getItemCost(item.id)
              const profit = getItemProfit(item.id)
              const margin = getItemMargin(item.id)
              const { canMake, reasons } = canMakeItem(item.id)

              return (
                <Card key={item.id} hover>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: category?.color || '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <UtensilsCrossed size={24} color="white" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>{item.name}</h3>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{category?.name}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#10b981'
                    }}>
                      ₹{item.price}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>{item.description}</p>

                  {recipe ? (
                    <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Check size={16} color="#10b981" />
                          <span style={{ fontWeight: 600, color: '#166534' }}>Recipe Mapped</span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{recipe.ingredients.length} ingredients</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>Cost</div>
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>₹{cost?.toFixed(0)}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>Profit</div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>₹{profit?.toFixed(0)}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>Margin</div>
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>{margin}%</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} color="#ca8a04" />
                      <span style={{ fontSize: '13px', color: '#92400e' }}>No recipe mapped - inventory won't auto-deduct</span>
                    </div>
                  )}

                  {canMake === false && (
                    <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <X size={14} color="#dc2626" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#991b1b' }}>Cannot make item</span>
                      </div>
                      {reasons.map((r, i) => (
                        <div key={i} style={{ fontSize: '11px', color: '#dc2626', marginLeft: '22px' }}>{r}</div>
                      ))}
                    </div>
                  )}

                  {canMake === true && recipe && (
                    <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '8px 12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={14} color="#10b981" />
                      <span style={{ fontSize: '12px', color: '#166534' }}>All ingredients in stock</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant={recipe ? 'secondary' : 'primary'} size="sm" style={{ flex: 1 }} onClick={() => openRecipeModal(item)}>
                      <BookOpen size={14} />
                      {recipe ? 'Edit Recipe' : 'Map Recipe'}
                    </Button>
                    {recipe && (
                      <Button variant="ghost" size="sm" onClick={() => deleteRecipe(item.id)}>
                        <Trash2 size={14} color="#ef4444" />
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* All Recipes Tab */}
      {activeTab === 'recipes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
          {recipes.map(recipe => {
            const menuItem = menuItems.find(m => m.id === recipe.menuItemId)
            const totalCost = recipe.ingredients.reduce((sum, ing) => {
              const invItem = inventory.find(i => i.id === ing.inventoryItemId)
              return sum + (ing.quantity * (invItem?.costPerUnit || 0))
            }, 0)
            const profit = menuItem ? menuItem.price - totalCost : 0
            const margin = menuItem ? ((profit / menuItem.price) * 100).toFixed(1) : 0

            return (
              <Card key={recipe.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>{recipe.name}</h3>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>{menuItem?.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedMenuItem(menuItem)
                    setRecipeIngredients([...recipe.ingredients.map(i => ({
                      ...i,
                      inventoryName: inventory.find(inv => inv.id === i.inventoryItemId)?.name || 'Unknown',
                      currentStock: inventory.find(inv => inv.id === i.inventoryItemId)?.currentStock || 0,
                      costPerUnit: inventory.find(inv => inv.id === i.inventoryItemId)?.costPerUnit || 0
                    }))])
                    setShowRecipeModal(true)
                  }}>
                    <Edit size={14} />
                  </Button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#dc2626' }}>₹{totalCost.toFixed(0)}</div>
                    <div style={{ fontSize: '10px', color: '#991b1b' }}>COST</div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>₹{profit.toFixed(0)}</div>
                    <div style={{ fontSize: '10px', color: '#166534' }}>PROFIT</div>
                  </div>
                  <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#2563eb' }}>{margin}%</div>
                    <div style={{ fontSize: '10px', color: '#1e40af' }}>MARGIN</div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>Ingredients:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {recipe.ingredients.map((ing, i) => {
                    const invItem = inventory.find(i => i.id === ing.inventoryItemId)
                    const isLow = invItem && invItem.currentStock < ing.quantity
                    return (
                      <span key={i} style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: isLow ? '#fef2f2' : '#f3f4f6',
                        color: isLow ? '#dc2626' : '#4b5563'
                      }}>
                        {invItem?.name || 'Unknown'}: {ing.quantity} {ing.unit}
                      </span>
                    )
                  })}
                </div>
              </Card>
            )
          })}
          {recipes.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px' }}>
              <BookOpen size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Recipes Yet</h3>
              <p style={{ color: '#6b7280' }}>Map recipes to menu items to track ingredient costs</p>
            </div>
          )}
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <Card padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Item</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Unit</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Stock</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Cost/Unit</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{item.unit}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        color: item.currentStock < 10 ? '#dc2626' : '#10b981',
                        fontWeight: 600
                      }}>
                        {item.currentStock}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>₹{item.costPerUnit}</td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>₹{(item.currentStock * item.costPerUnit).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recipe Modal */}
      <Modal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        title={`Recipe: ${selectedMenuItem?.name || ''}`}
        size="xl"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Cost Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#991b1b', marginBottom: '4px' }}>RECIPE COST</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>₹{totalRecipeCost.toFixed(0)}</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#166534', marginBottom: '4px' }}>SELLING PRICE</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>₹{selectedMenuItem?.price || 0}</div>
            </div>
            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#1e40af', marginBottom: '4px' }}>PROFIT</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>₹{((selectedMenuItem?.price || 0) - totalRecipeCost).toFixed(0)}</div>
            </div>
            <div style={{ background: '#f5f3ff', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#6b21a8', marginBottom: '4px' }}>MARGIN</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#8b5cf6' }}>
                {selectedMenuItem?.price ? (((selectedMenuItem.price - totalRecipeCost) / selectedMenuItem.price) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          {/* Current Ingredients */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Ingredients</h4>
              <Button size="sm" variant="secondary" onClick={() => setShowIngredientModal(true)}>
                <Plus size={14} />
                Add Ingredient
              </Button>
            </div>

            {recipeIngredients.length === 0 ? (
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                <Package size={32} color="#9ca3af" style={{ marginBottom: '8px' }} />
                <p style={{ color: '#6b7280' }}>No ingredients added yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recipeIngredients.map(ing => (
                  <div key={ing.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '10px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{ing.inventoryName}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Stock: {ing.currentStock} {ing.unit} | Cost: ₹{(ing.quantity * ing.costPerUnit).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        value={ing.quantity}
                        onChange={(e) => updateIngredientQty(ing.id, e.target.value)}
                        style={{
                          width: '80px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          textAlign: 'center',
                          fontWeight: 600
                        }}
                      />
                      <span style={{ fontSize: '13px', color: '#6b7280', width: '50px' }}>{ing.unit}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeIngredient(ing.id)}>
                        <X size={14} color="#ef4444" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button fullWidth onClick={saveRecipe}>
            <Check size={18} />
            Save Recipe
          </Button>
        </div>
      </Modal>

      {/* Add Ingredient Modal */}
      <Modal isOpen={showIngredientModal} onClose={() => setShowIngredientModal(false)} title="Add Ingredient" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflow: 'auto' }}>
          {inventory.map(item => {
            const isAdded = recipeIngredients.some(i => i.inventoryItemId === item.id)
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: isAdded ? '#f0fdf4' : '#f9fafb',
                  borderRadius: '10px',
                  cursor: isAdded ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => !isAdded && addIngredient(item)}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {item.currentStock} {item.unit} available | ₹{item.costPerUnit}/{item.unit}
                  </div>
                </div>
                {isAdded ? (
                  <Check size={20} color="#10b981" />
                ) : (
                  <ChevronRight size={20} color="#9ca3af" />
                )}
              </div>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}
