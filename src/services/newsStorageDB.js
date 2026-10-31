// Neblina Stereo 105.5 FM - Almacenamiento Persistente en IndexedDB
// Permite guardar miles de notas de prensa completas de WordPress sin límite de cuota de localStorage

const DB_NAME = 'neblina_news_store_v1';
const STORE_NAME = 'news_posts';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null);
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAllNewsToIndexedDB(posts = []) {
  if (!Array.isArray(posts) || posts.length === 0) return;
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Guardar o actualizar cada post
    for (const post of posts) {
      if (post && post.id !== undefined) {
        store.put(post);
      }
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Error guardando en IndexedDB:', err);
  }
}

export async function getAllNewsFromIndexedDB() {
  try {
    const db = await openDB();
    if (!db) return [];
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error leyendo desde IndexedDB:', err);
    return [];
  }
}
