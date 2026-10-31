// Servicio de Notificaciones Nativas y Alertas de Noticias para Neblina Stereo 105.5 FM

const LAST_POST_KEY = 'neblina_last_seen_post_id';
const NOTIF_SETTINGS_KEY = 'neblina_notifications_enabled';

// Activa las notificaciones por defecto sin diálogos ni preguntas molestas
export async function autoEnableNotifications() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIF_SETTINGS_KEY, 'true');
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission().catch(() => {});
    }
  } catch (e) {}
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Este dispositivo no soporta notificaciones de sistema.');
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem(NOTIF_SETTINGS_KEY, 'true');
    }
    return permission;
  } catch (err) {
    console.error('Error solicitando permisos de notificación:', err);
    return 'denied';
  }
}

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Muestra notificación del tema que se está reproduciendo en la transmisión
export async function showNowPlayingNotification(songData) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  // Aislamiento: No emitir notificaciones de la radio si el usuario está dentro de un sistema interno
  if (typeof window !== 'undefined') {
    const hash = (window.location.hash || '').toLowerCase();
    if (hash === '#admin' || hash === '#clientes' || hash === '#locutores') return;
  }

  const title = songData.song || songData.songtitle || 'Neblina Stereo 105.5 FM';
  const artist = songData.artist ? `Con: ${songData.artist}` : 'Santo Domingo - Mérida · En Vivo';
  const artwork = songData.artwork || '/icon-192.png';

  try {
    // Si hay Service Worker activo, usar showNotification para mejor soporte en Android y PWAs instaladas
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, {
        body: artist,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        image: artwork,
        tag: 'now-playing',
        renotify: false,
        silent: true
      });
    } else {
      new Notification(title, {
        body: artist,
        icon: '/icon-192.png',
        tag: 'now-playing',
        silent: true
      });
    }
  } catch (err) {
    console.warn('No se pudo emitir la notificación de reproducción:', err);
  }
}

// Muestra notificación de nueva noticia publicada en WordPress
export async function showNewsNotification(post) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  // Aislamiento: No emitir notificaciones públicas de noticias dentro de los sistemas internos
  if (typeof window !== 'undefined') {
    const hash = (window.location.hash || '').toLowerCase();
    if (hash === '#admin' || hash === '#clientes' || hash === '#locutores') return;
  }

  const title = `📰 Última Hora: ${post.title.replace(/<[^>]+>/g, '')}`;
  const body = post.excerpt ? post.excerpt.slice(0, 140) + '...' : 'Nueva publicación en Neblina Stereo 105.5 FM';
  const image = post.image || '/logo.png';

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, {
        body: body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        image: image,
        tag: `news-${post.id}`,
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
          url: '/',
          postId: post.id
        }
      });
    } else {
      new Notification(title, {
        body: body,
        icon: '/icon-192.png',
        tag: `news-${post.id}`
      });
    }
  } catch (err) {
    console.warn('Error mostrando notificación de noticia:', err);
  }
}

// Muestra notificación de prueba instantánea para verificar funcionamiento
export async function sendTestNotification() {
  const perm = await requestNotificationPermission();
  if (perm !== 'granted') {
    alert('Por favor autoriza las notificaciones en tu navegador o dispositivo para recibir alertas.');
    return false;
  }

  showNewsNotification({
    id: Date.now(),
    title: '¡Notificaciones de Neblina 105.5 FM Activadas!',
    excerpt: 'Recibirás avisos inmediatos en tu dispositivo cada vez que se publique una nueva noticia o reporte.',
    image: '/logo.png'
  });
  return true;
}

// Muestra notificación nativa del Portal de Clientes (Pagos, Vencimientos y Mensajes del Director)
export async function showPortalPushNotification({ title, body, tag = 'portal-alert' }) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return false;

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag,
        renotify: true,
        vibrate: [200, 100, 200]
      });
    } else {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        tag
      });
    }
    return true;
  } catch (err) {
    console.warn('No se pudo emitir la notificación del portal:', err);
    return false;
  }
}

// Monitor en segundo plano que revisa la API de WordPress periódicamente
export function initNewsNotificationMonitor() {
  if (typeof window === 'undefined') return;

  const checkLatestNews = async () => {
    // Solo verificar si el usuario tiene las notificaciones activadas
    if (getNotificationPermission() !== 'granted') return;

    try {
      const res = await fetch('https://neblina105fm.com/wp-json/wp/v2/posts?per_page=1&_embed=1');
      if (!res.ok) return;
      const posts = await res.json();
      if (!posts || posts.length === 0) return;

      const latestPost = posts[0];
      const lastSeenIdStr = localStorage.getItem(LAST_POST_KEY);
      const lastSeenId = lastSeenIdStr ? parseInt(lastSeenIdStr, 10) : null;

      // Si es la primera vez que se ejecuta, guardar el ID actual como base para no alertar noticias viejas
      if (!lastSeenId) {
        localStorage.setItem(LAST_POST_KEY, latestPost.id.toString());
        return;
      }

      // Si hay un post nuevo con ID mayor al último visto
      if (latestPost.id > lastSeenId) {
        localStorage.setItem(LAST_POST_KEY, latestPost.id.toString());

        let featuredImage = '/logo.png';
        if (latestPost._embedded && latestPost._embedded['wp:featuredmedia'] && latestPost._embedded['wp:featuredmedia'][0]) {
          featuredImage = latestPost._embedded['wp:featuredmedia'][0].source_url || featuredImage;
        }

        showNewsNotification({
          id: latestPost.id,
          title: latestPost.title.rendered,
          excerpt: latestPost.excerpt.rendered.replace(/<[^>]+>/g, '').trim(),
          image: featuredImage
        });
      }
    } catch (err) {
      // Silencioso ante fallas de red
    }
  };

  // Chequeo inicial y luego cada 45 segundos
  checkLatestNews();
  const interval = setInterval(checkLatestNews, 45000);
  return () => clearInterval(interval);
}
