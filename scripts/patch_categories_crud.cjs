const fs = require('fs');

console.log('--- AGREGANDO updateCategory Y editCategory EN newsCategoriesService ---');

const file = 'src/services/newsCategoriesService.js';
let c = fs.readFileSync(file, 'utf8');

const updateFn = `
export function updateCategory(idOrName, newName) {
  const cleanName = (newName || '').trim();
  if (!cleanName) return null;

  const current = getAllCategories();
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const updated = current.map(cat => {
    if (String(cat.id) === String(idOrName) || cat.name === idOrName) {
      return {
        ...cat,
        name: cleanName,
        slug: slug || cat.slug
      };
    }
    return cat;
  });

  saveAllCategories(updated);
  return updated.find(cat => String(cat.id) === String(idOrName) || cat.name === cleanName) || null;
}
`;

if (!c.includes('export function updateCategory')) {
  c = c.replace('export function deleteCategory', updateFn + '\nexport function deleteCategory');
  fs.writeFileSync(file, c, 'utf8');
  console.log('✓ updateCategory agregada a newsCategoriesService.');
}
