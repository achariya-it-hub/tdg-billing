import express from 'express';
import SQL from '../db.js';

const router = express.Router();

function generateId() {
  return 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateIngredientId() {
  return 'ring_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

router.get('/', (req, res) => {
  try {
    const recipes = SQL.all(`
      SELECT 
        r.*,
        m.name as menuItemName,
        m.price,
        c.name as categoryName
      FROM recipes r
      JOIN menu_items m ON r.menuItemId = m.id
      LEFT JOIN categories c ON m.categoryId = c.id
      ORDER BY c.displayOrder, m.name
    `);

    for (let recipe of recipes) {
      recipe.ingredients = SQL.all(`
        SELECT 
          ri.*,
          i.name as inventoryName,
          i.unit,
          i.currentStock,
          i.costPerUnit,
          i.minimumStock
        FROM recipe_ingredients ri
        JOIN inventory_items i ON ri.inventoryItemId = i.id
        WHERE ri.recipeId = ?
      `, [recipe.id]);
    }

    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

router.get('/menu-item/:menuItemId', (req, res) => {
  try {
    const { menuItemId } = req.params;
    const recipe = SQL.get(`
      SELECT r.*, m.name as menuItemName, m.price
      FROM recipes r
      JOIN menu_items m ON r.menuItemId = m.id
      WHERE r.menuItemId = ?
    `, [menuItemId]);

    if (recipe) {
      recipe.ingredients = SQL.all(`
        SELECT 
          ri.*,
          i.name as inventoryName,
          i.unit,
          i.currentStock,
          i.costPerUnit
        FROM recipe_ingredients ri
        JOIN inventory_items i ON ri.inventoryItemId = i.id
        WHERE ri.recipeId = ?
      `, [recipe.id]);
    }

    res.json(recipe || null);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

router.post('/', (req, res) => {
  try {
    const { menuItemId, name, description, yieldQty, prepTime, instructions, ingredients } = req.body;

    if (!menuItemId || !name) {
      return res.status(400).json({ error: 'Menu item and name are required' });
    }

    const existing = SQL.get('SELECT id FROM recipes WHERE menuItemId = ?', [menuItemId]);
    if (existing) {
      return res.status(400).json({ error: 'Recipe already exists for this menu item' });
    }

    const id = generateId();
    const now = new Date().toISOString();

    SQL.run(`
      INSERT INTO recipes (id, menuItemId, name, description, yieldQty, prepTime, instructions, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, menuItemId, name, description || '', yieldQty || 1, prepTime || 15, instructions || '', now, now]);

    if (ingredients && ingredients.length > 0) {
      for (let ing of ingredients) {
        SQL.run(`
          INSERT INTO recipe_ingredients (id, recipeId, inventoryItemId, quantity, unit, isOptional)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [generateIngredientId(), id, ing.inventoryItemId, ing.quantity, ing.unit || 'pcs', ing.isOptional ? 1 : 0]);
      }
    }

    const recipe = SQL.get('SELECT * FROM recipes WHERE id = ?', [id]);
    recipe.ingredients = SQL.all('SELECT * FROM recipe_ingredients WHERE recipeId = ?', [id]);

    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, yieldQty, prepTime, instructions, ingredients } = req.body;

    const recipe = SQL.get('SELECT * FROM recipes WHERE id = ?', [id]);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const now = new Date().toISOString();

    SQL.run(`
      UPDATE recipes 
      SET name = ?, description = ?, yieldQty = ?, prepTime = ?, instructions = ?, updatedAt = ?
      WHERE id = ?
    `, [name, description || '', yieldQty || 1, prepTime || 15, instructions || '', now, id]);

    SQL.run('DELETE FROM recipe_ingredients WHERE recipeId = ?', [id]);

    if (ingredients && ingredients.length > 0) {
      for (let ing of ingredients) {
        SQL.run(`
          INSERT INTO recipe_ingredients (id, recipeId, inventoryItemId, quantity, unit, isOptional)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [generateIngredientId(), id, ing.inventoryItemId, ing.quantity, ing.unit || 'pcs', ing.isOptional ? 1 : 0]);
      }
    }

    const updated = SQL.get('SELECT * FROM recipes WHERE id = ?', [id]);
    updated.ingredients = SQL.all(`
      SELECT ri.*, i.name as inventoryName, i.unit, i.currentStock, i.costPerUnit
      FROM recipe_ingredients ri
      JOIN inventory_items i ON ri.inventoryItemId = i.id
      WHERE ri.recipeId = ?
    `, [id]);

    res.json(updated);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    SQL.run('DELETE FROM recipe_ingredients WHERE recipeId = ?', [id]);
    SQL.run('DELETE FROM recipes WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

router.get('/inventory/check/:menuItemId', (req, res) => {
  try {
    const { menuItemId } = req.params;
    const recipe = SQL.get('SELECT * FROM recipes WHERE menuItemId = ?', [menuItemId]);

    if (!recipe) {
      return res.json({ hasRecipe: false, canMake: null, ingredients: [] });
    }

    const ingredients = SQL.all(`
      SELECT 
        ri.*,
        i.name as inventoryName,
        i.unit,
        i.currentStock
      FROM recipe_ingredients ri
      JOIN inventory_items i ON ri.inventoryItemId = i.id
      WHERE ri.recipeId = ?
    `, [recipe.id]);

    let canMake = true;
    let minCanMake = Infinity;

    for (let ing of ingredients) {
      if (!ing.isOptional) {
        const ratio = ing.currentStock / ing.quantity;
        if (ratio < 1) canMake = false;
        minCanMake = Math.min(minCanMake, Math.floor(ratio));
      }
    }

    if (minCanMake === Infinity) minCanMake = 0;

    res.json({
      hasRecipe: true,
      canMake: canMake,
      minCanMake: minCanMake,
      ingredients: ingredients
    });
  } catch (error) {
    console.error('Error checking inventory:', error);
    res.status(500).json({ error: 'Failed to check inventory' });
  }
});

router.post('/deduct', (req, res) => {
  try {
    const { orderItems } = req.body;

    if (!orderItems || !Array.isArray(orderItems)) {
      return res.status(400).json({ error: 'Order items required' });
    }

    const deducted = [];
    const warnings = [];

    for (let item of orderItems) {
      const recipe = SQL.get('SELECT * FROM recipes WHERE menuItemId = ?', [item.menuItemId]);

      if (recipe) {
        const ingredients = SQL.all(`
          SELECT * FROM recipe_ingredients WHERE recipeId = ? AND isOptional = 0
        `, [recipe.id]);

        for (let ing of ingredients) {
          const totalNeeded = ing.quantity * item.quantity;
          const inventory = SQL.get('SELECT * FROM inventory_items WHERE id = ?', [ing.inventoryItemId]);

          if (inventory) {
            const newStock = inventory.currentStock - totalNeeded;
            SQL.run('UPDATE inventory_items SET currentStock = ? WHERE id = ?', [newStock, ing.inventoryItemId]);

            SQL.run(`
              INSERT INTO inventory_transactions (id, inventoryItemId, type, quantity, reason, createdAt)
              VALUES (?, ?, 'sold', ?, ?)
            `, [generateIngredientId(), ing.inventoryItemId, -totalNeeded, `Order: ${item.menuItemName} x${item.quantity}`]);

            deducted.push({
              inventoryId: ing.inventoryItemId,
              name: inventory.name,
              deducted: totalNeeded,
              remaining: newStock
            });

            if (newStock <= inventory.minimumStock) {
              warnings.push({
                item: inventory.name,
                current: newStock,
                minimum: inventory.minimumStock
              });
            }
          }
        }
      }
    }

    res.json({ deducted, warnings });
  } catch (error) {
    console.error('Error deducting inventory:', error);
    res.status(500).json({ error: 'Failed to deduct inventory' });
  }
});

export default router;
