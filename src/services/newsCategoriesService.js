// Neblina Stereo 105.5 FM - Servicio de Categorías de Noticias y Sala de Prensa
// Permite sincronizar categorías desde WordPress, crearlas, elegirlas y eliminarlas

const STORAGE_CATEGORIES_KEY = 'neblina_news_categories_db';

export const DEFAULT_NEWS_CATEGORIES = [
  { id: 1, name: 'Noticias', slug: 'noticias', count: 486 },
  { id: 5, name: 'Mundo Stereo', slug: 'mundo-stereo', count: 255 },
  { id: 9, name: 'Titulares Neblina', slug: 'titulares-neblina', count: 127 },
  { id: 3, name: 'Zona Stereo', slug: 'zona-stereo', count: 61 },
  { id: 4, name: 'Estrenos', slug: 'estrenos', count: 43 },
  { id: 21, name: 'Es Viral', slug: 'es-viral', count: 4 },
  { id: 'cat_paramo', name: 'Santo Domingo & Páramo', slug: 'santo-domingo-paramo', count: 12 },
  { id: 'cat_comunidad', name: 'Comunidad & Servicios', slug: 'comunidad-servicios', count: 8 },
  { id: 'cat_deportes', name: 'Deportes', slug: 'deportes', count: 5 }
];

export function getAllCategories() {
  if (typeof window === 'undefined') return DEFAULT_NEWS_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error leyendo categorías de noticias:', e);
  }
  return DEFAULT_NEWS_CATEGORIES;
}

export function saveAllCategories(categories) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('neblina_categories_updated', { detail: categories }));
  } catch (e) {
    console.error('Error guardando categorías:', e);
  }
}

export function addCategory(name) {
  const cleanName = (name || '').trim();
  if (!cleanName) return null;

  const current = getAllCategories();
  const exists = current.some(c => c.name.toLowerCase() === cleanName.toLowerCase());
  if (exists) {
    return current.find(c => c.name.toLowerCase() === cleanName.toLowerCase());
  }

  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCat = {
    id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    name: cleanName,
    slug: slug || 'categoria',
    count: 0
  };

  const updated = [...current, newCat];
  saveAllCategories(updated);
  return newCat;
}


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

export function deleteCategory(idOrName) {
  const current = getAllCategories();
  // No permitir borrar si solo queda una categoría
  if (current.length <= 1) return current;

  const updated = current.filter(c => String(c.id) !== String(idOrName) && c.name !== idOrName);
  saveAllCategories(updated);
  return updated;
}

export function recalculateCategoryCounts(newsList = []) {
  if (!Array.isArray(newsList)) return getAllCategories();

  const countsMap = {};
  for (const item of newsList) {
    if (item.trashed) continue;
    const catName = item.category || 'Noticias';
    countsMap[catName] = (countsMap[catName] || 0) + 1;
  }

  const current = getAllCategories();
  const updated = current.map(c => ({
    ...c,
    count: countsMap[c.name] || 0
  }));

  saveAllCategories(updated);
  return updated;
}
