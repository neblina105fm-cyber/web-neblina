// Neblina Stereo 105.5 FM - Servicio de Integración Oficial con WordPress REST API
// Conexión bi-direccional con la web oficial: https://neblina105fm.com/wp-json/wp/v2

import { getAllNews, saveAllNews } from './newsData';
import { getAllNewsComments, saveAllNewsComments } from './newsCommentsService';
import { addUnifiedContact } from './unifiedContactsService';
import { getAllCategories, saveAllCategories, recalculateCategoryCounts } from './newsCategoriesService';
import { saveAllNewsToIndexedDB } from './newsStorageDB';

const WP_CONFIG_STORAGE_KEY = 'neblina_wp_credentials_v1';
const WP_CATEGORIES_CACHE_KEY = 'neblina_wp_categories_cache';

export const DEFAULT_WP_CONFIG = {
  apiUrl: 'https://neblina105fm.com/wp-json/wp/v2',
  username: 'neblina105fm@gmail.com',
  appPassword: 'RGHO eVMV FGfC E69V ypC9 OVf9', // Contraseña de aplicación oficial
  status: 'connected', // 'unconfigured' | 'connected' | 'error'
  lastTestedAt: new Date().toISOString(),
  userNameDisplay: 'Neblina 105.5 FM',
  userRole: 'Administrator'
};

// Conversión segura UTF-8 a Base64 para Basic Auth
function toBase64(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf-8').toString('base64');
    }
    return btoa(str);
  }
}

// Decodificar entidades HTML comunes de WordPress
export function decodeWpHtmlEntities(text = '') {
  if (!text) return '';
  return text
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8230;/g, '…')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// Obtener configuración guardada de WordPress
export function getWordPressConfig() {
  if (typeof window === 'undefined') return DEFAULT_WP_CONFIG;
  try {
    const raw = localStorage.getItem(WP_CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_WP_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error leyendo configuración WP:', e);
  }
  return DEFAULT_WP_CONFIG;
}

// Guardar configuración de WordPress
export function saveWordPressConfig(config) {
  if (typeof window === 'undefined') return;
  try {
    const merged = { ...getWordPressConfig(), ...config };
    localStorage.setItem(WP_CONFIG_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('neblina_wp_config_changed', { detail: merged }));
    return merged;
  } catch (e) {
    console.error('Error guardando configuración WP:', e);
  }
}

// Probar conexión en vivo con WordPress REST API (/users/me)
export async function testWordPressConnection(credentials = null) {
  const config = credentials || getWordPressConfig();
  const cleanApiUrl = (config.apiUrl || 'https://neblina105fm.com/wp-json/wp/v2').replace(/\/+$/, '');
  const username = (config.username || '').trim();
  // Limpiar espacios intermedios o mantener contraseña intacta
  const appPassword = (config.appPassword || '').trim();

  if (!username || !appPassword) {
    const result = {
      ok: false,
      status: 'unconfigured',
      message: 'Debe ingresar el Usuario y la Contraseña de Aplicación de WordPress.'
    };
    saveWordPressConfig({ status: 'unconfigured' });
    return result;
  }

  try {
    const authHeader = `Basic ${toBase64(`${username}:${appPassword}`)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${cleanApiUrl}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await res.json();

    if (res.ok && data && data.id) {
      const successData = {
        ok: true,
        status: 'connected',
        userId: data.id,
        userNameDisplay: data.name || data.slug || username,
        userRole: Array.isArray(data.roles) && data.roles[0] ? data.roles[0] : 'Editor / Admin',
        lastTestedAt: new Date().toISOString(),
        message: `¡Conexión exitosa! Conectado a neblina105fm.com como ${data.name || username}.`
      };
      saveWordPressConfig(successData);
      return successData;
    } else {
      const errorMsg = data?.message ? decodeWpHtmlEntities(data.message) : `Error HTTP ${res.status}: Credenciales no autorizadas.`;
      const failureData = {
        ok: false,
        status: 'error',
        lastTestedAt: new Date().toISOString(),
        message: errorMsg
      };
      saveWordPressConfig({ status: 'error', lastTestedAt: new Date().toISOString() });
      return failureData;
    }
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    const failureData = {
      ok: false,
      status: 'error',
      lastTestedAt: new Date().toISOString(),
      message: isTimeout 
        ? 'Tiempo de espera agotado al conectar con neblina105fm.com (Timeout).'
        : `Error de red al conectar con WordPress: ${err.message}`
    };
    saveWordPressConfig({ status: 'error', lastTestedAt: new Date().toISOString() });
    return failureData;
  }
}

// Publicar una nueva nota de prensa directamente en WordPress (neblina105fm.com)
export async function publishPostToWordPress({
  title,
  content,
  excerpt = '',
  status = 'publish', // 'publish' | 'draft' | 'pending'
  categoryId = null
}) {
  const config = getWordPressConfig();
  const cleanApiUrl = (config.apiUrl || 'https://neblina105fm.com/wp-json/wp/v2').replace(/\/+$/, '');
  const username = (config.username || '').trim();
  const appPassword = (config.appPassword || '').trim();

  if (!username || !appPassword) {
    throw new Error('No se han configurado credenciales de WordPress. Configure su Usuario y Contraseña de Aplicación en la pestaña "WordPress API".');
  }

  const authHeader = `Basic ${toBase64(`${username}:${appPassword}`)}`;
  
  const payload = {
    title: title.trim(),
    content: content || `<p>${excerpt || title}</p>`,
    excerpt: excerpt.trim(),
    status: status
  };

  if (categoryId) {
    payload.categories = [Number(categoryId)];
  }

  const res = await fetch(`${cleanApiUrl}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ? decodeWpHtmlEntities(data.message) : `Error ${res.status} al publicar en WordPress`);
  }

  return {
    ok: true,
    post: data,
    id: data.id,
    link: data.link,
    title: decodeWpHtmlEntities(data.title?.rendered || title),
    message: 'Nota de prensa publicada exitosamente en neblina105fm.com'
  };
}

// Obtener categorías oficiales de WordPress con conteo
export async function fetchWordPressCategories() {
  try {
    const res = await fetch('https://neblina105fm.com/wp-json/wp/v2/categories?per_page=50&_fields=id,name,count,slug');
    if (!res.ok) throw new Error('Error al obtener categorías');
    const categories = await res.json();
    if (typeof window !== 'undefined' && Array.isArray(categories)) {
      localStorage.setItem(WP_CATEGORIES_CACHE_KEY, JSON.stringify(categories));
    }
    return categories;
  } catch (e) {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(WP_CATEGORIES_CACHE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (err) {}
    }
    // Fallback con categorías conocidas de neblina105fm.com
    return [
      { id: 1, name: 'Noticias', count: 486 },
      { id: 5, name: 'Mundo Stereo', count: 255 },
      { id: 9, name: 'Titulares Neblina', count: 127 },
      { id: 3, name: 'Zona Stereo', count: 61 },
      { id: 4, name: 'Estrenos', count: 43 },
      { id: 21, name: 'Es Viral', count: 4 }
    ];
  }
}

// Helper para extraer de 1 a 3 imágenes de una nota de prensa (destacada + contenido)
export function extractImagesFromPost(post) {
  const images = [];
  
  // 1. Imagen destacada oficial de WordPress
  if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
    const feat = post._embedded['wp:featuredmedia'][0].source_url;
    if (feat && typeof feat === 'string') images.push(feat.trim());
  } else if (post.featured_media_url) {
    images.push(post.featured_media_url.trim());
  }

  // 2. Extraer imágenes complementarias desde las etiquetas <img> del cuerpo HTML
  const content = post.content?.rendered || post.content || '';
  if (content && typeof content === 'string') {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      const src = match[1]?.trim();
      // Filtrar tracking pixels, avatares o iconos de sistema
      if (
        src && 
        !images.includes(src) && 
        !src.includes('s.w.org') && 
        !src.includes('gravatar') && 
        !src.includes('emoji') &&
        !src.includes('data:image')
      ) {
        images.push(src);
      }
      if (images.length >= 3) break;
    }
  }

  // Fallback con imagen de prensa institucional de Neblina 105.5 FM si no posee ninguna
  if (images.length === 0) {
    images.push('https://neblina105fm.com/wp-content/uploads/2026/10/Neblina-2026-10-4.png');
  }

  return images.slice(0, 3);
}

// Obtener noticias paginadas y filtradas directamente de WordPress (Lotes por defecto de 10)
export async function fetchWordPressNewsPaginated({
  page = 1,
  perPage = 10,
  search = '',
  categoryId = null
} = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let queryParams = `_fields=id,date,title,excerpt,content,link,_links,_embedded&_embed=1&per_page=${perPage}&page=${page}`;
    
    if (search && search.trim()) {
      queryParams += `&search=${encodeURIComponent(search.trim())}`;
    }
    
    if (categoryId && categoryId !== 'all' && categoryId !== 'Todas') {
      queryParams += `&categories=${categoryId}`;
    }

    const url = `https://neblina105fm.com/wp-json/wp/v2/posts?${queryParams}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`WordPress HTTP Error: ${res.status}`);
    }

    const totalPosts = parseInt(res.headers.get('x-wp-total') || '0', 10);
    const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
    const posts = await res.json();

    const mapped = posts.map(post => {
      const extractedImages = extractImagesFromPost(post);
      const featuredImage = extractedImages[0];

      let category = 'Noticias';
      if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0] && post._embedded['wp:term'][0][0]) {
        category = post._embedded['wp:term'][0][0].name;
      }

      const decodedTitle = decodeWpHtmlEntities(post.title?.rendered || '');
      const rawExcerpt = (post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim();
      const decodedExcerpt = decodeWpHtmlEntities(rawExcerpt);

      return {
        id: post.id,
        title: decodedTitle,
        excerpt: decodedExcerpt,
        content: post.content?.rendered || '',
        date: new Date(post.date).toLocaleDateString('es-VE', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        rawDate: post.date,
        link: post.link,
        image: featuredImage,
        images: extractedImages,
        category: category,
        status: 'published',
        featuredInCarousel: true
      };
    });

    return {
      posts: mapped,
      totalPosts: totalPosts || mapped.length,
      totalPages: totalPages || 1,
      currentPage: page
    };
  } catch (err) {
    console.warn('Error fetching paginated WordPress news:', err.message);
    return {
      posts: [],
      totalPosts: 0,
      totalPages: 1,
      currentPage: page,
      error: err.message
    };
  }
}

// Migración completa de todos los datos desde WordPress:
// 1. Categorías oficiales
// 2. Comentarios y estadísticas
// 3. Todas las 901 notas de prensa (en lotes de 100 hasta completar todas las páginas)
// 4. Extracción de 1 a 3 fotos por nota para carrusel
// 5. Almacenamiento dual persistente (IndexedDB sin límite de cuota + Top en localStorage)
export async function migrateWordPressAllData({ onProgress = null } = {}) {
  const config = getWordPressConfig();
  const cleanApiUrl = (config.apiUrl || 'https://neblina105fm.com/wp-json/wp/v2').replace(/\/+$/, '');
  const username = (config.username || 'neblina105fm@gmail.com').trim();
  const appPassword = (config.appPassword || 'RGHO eVMV FGfC E69V ypC9 OVf9').trim();

  const authHeader = `Basic ${toBase64(`${username}:${appPassword}`)}`;
  const headers = {
    'Authorization': authHeader,
    'Accept': 'application/json'
  };

  const results = {
    ok: true,
    postsMigrated: 0,
    categoriesMigrated: 0,
    commentsMigrated: 0,
    contactsMigrated: 0,
    totalPagesFetched: 0,
    errors: []
  };

  if (onProgress) onProgress('Iniciando conexión bi-direccional con WordPress neblina105fm.com...');

  // =========================================================================
  // 1. MIGRAR CATEGORÍAS DE WORDPRESS Y SINCRONIZAR
  // =========================================================================
  try {
    if (onProgress) onProgress('Sincronizando categorías oficiales de neblina105fm.com...');
    const catRes = await fetch(`${cleanApiUrl}/categories?per_page=100`, { headers });
    if (catRes.ok) {
      const wpCats = await catRes.json();
      if (Array.isArray(wpCats) && wpCats.length > 0) {
        const existingCats = getAllCategories();
        const existingNames = new Set(existingCats.map(c => c.name.toLowerCase()));
        
        const mappedCats = wpCats.map(c => ({
          id: c.id,
          name: decodeWpHtmlEntities(c.name),
          slug: c.slug,
          count: c.count || 0
        }));

        // Combinar manteniendo también categorías locales personalizadas
        const combinedCats = [...mappedCats];
        for (const localCat of existingCats) {
          if (!existingNames.has(localCat.name.toLowerCase())) {
            combinedCats.push(localCat);
          }
        }

        saveAllCategories(combinedCats);
        results.categoriesMigrated = mappedCats.length;
      }
    }
  } catch (catErr) {
    console.warn('Error migrando categorías:', catErr);
    results.errors.push(`Categorías: ${catErr.message}`);
  }

  // =========================================================================
  // 2. MIGRAR COMENTARIOS Y REGISTRAR CONTACTOS CIUDADANOS
  // =========================================================================
  try {
    if (onProgress) onProgress('Descargando comentarios de oyentes y lectores en notas de prensa...');
    const commentsRes = await fetch(`${cleanApiUrl}/comments?per_page=100`, { headers });
    
    if (commentsRes.ok) {
      const wpComments = await commentsRes.json();
      const currentComments = getAllNewsComments();
      const importedComments = [];
      
      for (const item of wpComments) {
        const commId = `wp_comm_${item.id}`;
        const rawText = (item.content?.rendered || '').replace(/<[^>]+>/g, '').trim();
        const cleanComment = decodeWpHtmlEntities(rawText);
        const authorName = decodeWpHtmlEntities(item.author_name || 'Lector Verificado');
        const authorEmail = item.author_email || '';

        const newComment = {
          id: commId,
          newsId: item.post,
          newsTitle: `Nota de Prensa #${item.post}`,
          newsUrl: item.link || '',
          authorName: authorName,
          authorCedula: 'V-Verificada',
          authorPhone: '+58 414-0000000',
          authorLocation: 'Comunidad Santo Domingo / Páramo',
          comment: cleanComment,
          status: item.status === 'approved' ? 'approved' : 'pending',
          createdAt: item.date || new Date().toISOString(),
          formattedDate: new Date(item.date).toLocaleDateString('es-VE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          trashed: false
        };

        importedComments.push(newComment);

        // Registrar en directorio unificado
        addUnifiedContact({
          fullName: authorName,
          email: authorEmail,
          location: 'Comunidad / Lector Web',
          source: 'Comentario en Nota de Prensa',
          sourceDetail: `Comentario en noticia #${item.post}`
        });
        results.contactsMigrated++;
      }

      // Fusionar comentarios existentes
      const mergedCommMap = new Map();
      importedComments.forEach(c => mergedCommMap.set(String(c.id), c));
      currentComments.forEach(c => {
        if (!mergedCommMap.has(String(c.id))) {
          mergedCommMap.set(String(c.id), c);
        }
      });

      const finalCommentsList = Array.from(mergedCommMap.values());
      saveAllNewsComments(finalCommentsList);
      results.commentsMigrated = importedComments.length;
    }
  } catch (commErr) {
    console.warn('Error migrando comentarios:', commErr);
    results.errors.push(`Comentarios: ${commErr.message}`);
  }

  // =========================================================================
  // 3. MIGRACIÓN COMPLETA DE TODAS LAS NOTAS DE PRENSA (901 POSTS EN LOTES DE 100)
  // =========================================================================
  try {
    if (onProgress) onProgress('Consultando total de notas de prensa en el servidor de WordPress...');
    
    // Primera petición para descubrir total de páginas
    const firstPageRes = await fetch(`${cleanApiUrl}/posts?per_page=100&page=1&_embed=1`, { headers });
    
    if (!firstPageRes.ok) {
      throw new Error(`Error en el servidor de WordPress: HTTP ${firstPageRes.status}`);
    }

    const totalPosts = parseInt(firstPageRes.headers.get('x-wp-total') || '901', 10);
    const totalPages = parseInt(firstPageRes.headers.get('x-wp-totalpages') || '10', 10);
    results.totalPagesFetched = totalPages;

    const allWpPosts = [];
    const firstBatch = await firstPageRes.json();
    allWpPosts.push(...firstBatch);

    if (onProgress) {
      onProgress(`Descargadas 100 de ${totalPosts} notas (Página 1 de ${totalPages})...`);
    }

    // Iterar por las páginas restantes (de la 2 hasta totalPages)
    for (let page = 2; page <= totalPages; page++) {
      try {
        if (onProgress) {
          onProgress(`Descargando lote ${page} de ${totalPages} (${allWpPosts.length}/${totalPosts} notas)...`);
        }
        const pageRes = await fetch(`${cleanApiUrl}/posts?per_page=100&page=${page}&_embed=1`, { headers });
        if (pageRes.ok) {
          const batch = await pageRes.json();
          if (Array.isArray(batch) && batch.length > 0) {
            allWpPosts.push(...batch);
          }
        } else {
          results.errors.push(`Página ${page}: HTTP ${pageRes.status}`);
        }
      } catch (pageErr) {
        results.errors.push(`Página ${page}: ${pageErr.message}`);
      }
    }

    // Mapear y enriquecer todos los posts con 1 a 3 fotos para el carrusel
    const formattedPosts = allWpPosts.map(post => {
      const extractedImages = extractImagesFromPost(post);
      const featuredImage = extractedImages[0];

      let category = 'Noticias';
      if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0] && post._embedded['wp:term'][0][0]) {
        category = post._embedded['wp:term'][0][0].name;
      }

      const decodedTitle = decodeWpHtmlEntities(post.title?.rendered || '');
      const rawExcerpt = (post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim();

      return {
        id: post.id,
        title: decodedTitle,
        excerpt: decodeWpHtmlEntities(rawExcerpt),
        content: post.content?.rendered || '',
        date: new Date(post.date).toLocaleDateString('es-VE', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        rawDate: post.date,
        link: post.link,
        image: featuredImage,
        images: extractedImages, // Carrusel de 1 a 3 imágenes
        category: category,
        author: 'Sala de Redacción Neblina 105.5 FM',
        featuredInCarousel: true,
        status: 'published',
        trashed: false
      };
    });

    // Preservar noticias creadas localmente en el CMS
    const currentLocalNews = getAllNews().filter(n => n.isCustomCreated === true);
    const combinedNewsMap = new Map();
    
    // Primero agregamos las locales personalizadas
    currentLocalNews.forEach(p => combinedNewsMap.set(String(p.id), p));
    // Luego agregamos las 901 de WordPress
    formattedPosts.forEach(p => combinedNewsMap.set(String(p.id), p));

    const finalNewsList = Array.from(combinedNewsMap.values());

    // 1. Guardar la totalidad (901+ notas) en IndexedDB para no saturar los 5MB de localStorage
    await saveAllNewsToIndexedDB(finalNewsList);

    // 2. Guardar las 100 notas más recientes en localStorage para carga síncrona instantánea
    saveAllNews(finalNewsList.slice(0, 100));

    // 3. Recalcular conteos de categorías con la lista global
    recalculateCategoryCounts(finalNewsList);

    results.postsMigrated = finalNewsList.length;

  } catch (postsErr) {
    console.error('Error migrando notas de WordPress:', postsErr);
    results.errors.push(`Notas de prensa: ${postsErr.message}`);
    results.ok = false;
  }

  if (onProgress) {
    onProgress(`¡Migración finalizada! ${results.postsMigrated} notas, ${results.categoriesMigrated} categorías y ${results.commentsMigrated} comentarios.`);
  }

  return results;
}

