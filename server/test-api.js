import SQL from './db.js';

await SQL.init();

const categories = SQL.all('SELECT * FROM categories WHERE isActive = 1 ORDER BY displayOrder');
const menuItems = SQL.all('SELECT name, price FROM menu_items ORDER BY name LIMIT 10');

console.log('=== CATEGORIES ===');
console.log(JSON.stringify(categories, null, 2));

console.log('\n=== MENU ITEMS (first 10) ===');
console.log(JSON.stringify(menuItems, null, 2));

const menuItemsByCat = SQL.all(`
  SELECT c.name as category, COUNT(m.id) as itemCount 
  FROM categories c 
  LEFT JOIN menu_items m ON m.categoryId = c.id 
  WHERE c.isActive = 1 
  GROUP BY c.id
`);
console.log('\n=== ITEMS PER CATEGORY ===');
console.log(JSON.stringify(menuItemsByCat, null, 2));