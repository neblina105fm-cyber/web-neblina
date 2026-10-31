// Utilidad para procesar y optimizar contenido HTML con incrustaciones y enlaces de Redes Sociales
// Soporta con máxima compatibilidad y alta fidelidad:
// - Instagram (Posts, Reels, Carousels y Blockquotes oficiales)
// - Facebook (Posts, Videos, Reels y Links directos)
// - YouTube (Videos estándar, Enlaces cortos y Shorts)
// - Twitter / X (Tweets, Hilos y Blockquotes)
// - TikTok (Videos, Enlaces cortos y Blockquotes)
// - Threads (Publicaciones y Blockquotes)
// - Enlaces externos generales (seguridad _blank y alto contraste)

export function processSocialContent(html) {
  if (!html || typeof html !== 'string') return '';

  let processed = html;
  const placeholders = [];

  // Aislamiento por tokens para evitar que expresiones regulares posteriores
  // re-procesen los atributos href o src de los embeds generados (evitando fugas de código o bucles en iframes).
  const storeEmbed = (embedHtml) => {
    const token = `<!--__NEBLINA_EMBED_SLOT_${placeholders.length}__-->`;
    placeholders.push({ token, embedHtml });
    return token;
  };

  // =========================================================================
  // 1. INSTAGRAM: BLOCKQUOTES EXISTENTES Y ENLACES DIRECTOS (POSTS & REELS)
  // =========================================================================
  
  // 1A. Transformar Blockquotes de Instagram existentes (incluyendo el envoltorio <figure> de WordPress si existe)
  // en iframes responsivos oficiales directos para que NUNCA se queden en estado de texto estático / carga rota.
  processed = processed.replace(
    /(?:<figure[^>]*class="[^"]*wp-block-embed-instagram[^"]*"[^>]*>\s*<div[^>]*class="[^"]*wp-block-embed__wrapper[^"]*"[^>]*>\s*)?<blockquote([^>]*)class="([^"]*instagram-media[^"]*)"([^>]*)>([\s\S]*?)<\/blockquote>(?:\s*<script[^>]*><\/script>)?(?:\s*<\/div>\s*<\/figure>)?/gi,
    (match, p1, p2, p3, inner) => {
      const full = `${p1 || ''} ${p3 || ''} ${inner || ''}`;
      // Buscar código permalink (ej: /p/DBU_xyz/ o /reel/DBU_xyz/)
      const matchCode = full.match(/instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
      
      let type = 'p';
      let code = '';
      if (matchCode) {
        type = matchCode[1].toLowerCase();
        code = matchCode[2];
      }

      // Si pudimos extraer el código de Instagram, renderizar el reproductor iframe oficial + barra de acceso directo
      if (code) {
        const cleanUrl = `https://www.instagram.com/${type}/${code}/`;
        const embedUrl = `https://www.instagram.com/${type}/${code}/embed/captioned/`;
        const isReel = type === 'reel';

        return storeEmbed(`
          <div class="my-6 not-prose flex flex-col items-center w-full">
            <div class="w-full max-w-[540px]">
              <div class="instagram-embed-header mb-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/30 flex items-center justify-between flex-wrap gap-2 shadow-sm">
                <div class="flex items-center space-x-2 text-xs font-bold text-pink-600 dark:text-pink-400">
                  <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  <span class="text-xs font-bold text-pink-600 dark:text-pink-400">${isReel ? 'Reel de Instagram' : 'Publicación de Instagram'}</span>
                </div>
                <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-bold shadow-sm transition cursor-pointer">
                  <span>Abrir en Instagram ↗</span>
                </a>
              </div>
              <div class="w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121214]">
                <iframe 
                  src="${embedUrl}" 
                  class="w-full border-0 rounded-2xl" 
                  style="min-height: 540px; width: 100%; border: none;" 
                  scrolling="no" 
                  allowtransparency="true" 
                  allow="encrypted-media"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        `);
      }

      // Si no pudimos extraer el código, dejar el contenido original
      return match;
    }
  );

  // 1B. Transformar Enlaces Directos de Instagram pegados en párrafos standalone
  // (ej: <p>https://www.instagram.com/p/DBU_.../ </p> o <p><a href="...">...</a></p>)
  processed = processed.replace(
    /<p[^>]*>\s*(?:<a[^>]*>\s*)?(?:https?:\/\/)?(?:www\.)?instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)[^\s<"']*(?:\s*<\/a>)?\s*<\/p>/gi,
    (match, typeMatch, code) => {
      const type = (typeMatch || 'p').toLowerCase();
      const isReel = type === 'reel';
      const cleanUrl = `https://www.instagram.com/${type}/${code}/`;
      const embedUrl = `https://www.instagram.com/${type}/${code}/embed/captioned/`;

      return storeEmbed(`
        <div class="my-6 not-prose flex flex-col items-center w-full">
          <div class="w-full max-w-[540px]">
            <div class="instagram-embed-header mb-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/30 flex items-center justify-between flex-wrap gap-2 shadow-sm">
              <div class="flex items-center space-x-2 text-xs font-bold text-pink-600 dark:text-pink-400">
                <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                <span class="text-xs font-bold text-pink-600 dark:text-pink-400">${isReel ? 'Reel de Instagram' : 'Publicación de Instagram'}</span>
              </div>
              <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-bold shadow-sm transition cursor-pointer">
                <span>Abrir en Instagram ↗</span>
              </a>
            </div>
            <div class="w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121214]">
              <iframe 
                src="${embedUrl}" 
                class="w-full border-0 rounded-2xl" 
                style="min-height: 540px; width: 100%; border: none;" 
                scrolling="no" 
                allowtransparency="true" 
                allow="encrypted-media"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      `);
    }
  );

  // =========================================================================
  // 2. FACEBOOK: DIVS EMBEBIDOS OFICIALES Y ENLACES DIRECTOS (POSTS & VIDEOS)
  // =========================================================================

  // 2A. Divs oficiales de Facebook
  processed = processed.replace(
    /<div([^>]*)class="([^"]*fb-(?:post|video)[^"]*)"([^>]*)data-href="([^"]+)"([^>]*)>([\s\S]*?)<\/div>/gi,
    (match, p1, p2, p3, fbUrl, p5, inner) => {
      const isVideo = p2.includes('fb-video') || fbUrl.includes('/videos/') || fbUrl.includes('/watch');
      const cleanFbUrl = fbUrl.replace(/&amp;/g, '&');
      const fbIframeUrl = `https://www.facebook.com/plugins/${isVideo ? 'video' : 'post'}.php?href=${encodeURIComponent(cleanFbUrl)}&show_text=true&width=500`;

      return storeEmbed(`
        <div class="my-6 not-prose flex flex-col items-center w-full">
          <div class="w-full max-w-[500px]">
            <div class="facebook-embed-header mb-2.5 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-between flex-wrap gap-2 shadow-sm">
              <div class="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>${isVideo ? 'Video de Facebook' : 'Publicación de Facebook'}</span>
              </div>
              <a href="${cleanFbUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white text-[11px] font-bold shadow-sm transition cursor-pointer">
                <span>Abrir en Facebook ↗</span>
              </a>
            </div>
            <div class="w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c131c]">
              <iframe 
                src="${fbIframeUrl}" 
                class="w-full border-0" 
                style="min-height: 480px; width: 100%; border: none; overflow: hidden;" 
                scrolling="no" 
                frameborder="0" 
                allowfullscreen="true" 
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      `);
    }
  );

  // 2B. Enlaces directos de Facebook pegados como URLs en párrafos standalone
  processed = processed.replace(
    /<p[^>]*>\s*(?:<a[^>]*>\s*)?(https?:\/\/(?:www\.|m\.)?(?:facebook\.com\/(?:[^/]+\/(?:posts|videos|reel)\/|watch\/\?v=)|fb\.watch\/)[^\s<"']+)(?:\s*<\/a>)?\s*<\/p>/gi,
    (match, fbUrl) => {
      const cleanFbUrl = fbUrl.replace(/&amp;/g, '&');
      const isVideo = cleanFbUrl.includes('/videos/') || cleanFbUrl.includes('/watch') || cleanFbUrl.includes('fb.watch') || cleanFbUrl.includes('/reel/');
      const fbIframeUrl = `https://www.facebook.com/plugins/${isVideo ? 'video' : 'post'}.php?href=${encodeURIComponent(cleanFbUrl)}&show_text=true&width=500`;

      return storeEmbed(`
        <div class="my-6 not-prose flex flex-col items-center w-full">
          <div class="w-full max-w-[500px]">
            <div class="facebook-embed-header mb-2.5 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-between flex-wrap gap-2 shadow-sm">
              <div class="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>${isVideo ? 'Video de Facebook' : 'Publicación de Facebook'}</span>
              </div>
              <a href="${cleanFbUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white text-[11px] font-bold shadow-sm transition cursor-pointer">
                <span>Abrir en Facebook ↗</span>
              </a>
            </div>
            <div class="w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c131c]">
              <iframe 
                src="${fbIframeUrl}" 
                class="w-full border-0" 
                style="min-height: 480px; width: 100%; border: none; overflow: hidden;" 
                scrolling="no" 
                frameborder="0" 
                allowfullscreen="true" 
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      `);
    }
  );

  // =========================================================================
  // 3. TIKTOK: BLOCKQUOTES EXISTENTES Y ENLACES DIRECTOS A VIDEOS
  // =========================================================================

  // 3A. Blockquotes existentes de TikTok (incluyendo envoltorio wp-block-embed-tiktok si existe)
  processed = processed.replace(
    /(?:<figure[^>]*class="[^"]*wp-block-embed-tiktok[^"]*"[^>]*>\s*<div[^>]*class="[^"]*wp-block-embed__wrapper[^"]*"[^>]*>\s*)?<blockquote([^>]*)class="([^"]*tiktok-embed[^"]*)"([^>]*)cite="([^"]+)"([^>]*)>([\s\S]*?)<\/blockquote>(?:\s*<script[^>]*><\/script>)?(?:\s*<\/div>\s*<\/figure>)?/gi,
    (match, p1, p2, p3, citeUrl, p5, inner) => {
      const matchVideoId = citeUrl.match(/\/video\/(\d+)/i) || inner.match(/data-video-id="(\d+)"/i);
      const videoId = matchVideoId ? matchVideoId[1] : '';

      if (videoId) {
        return storeEmbed(`
          <div class="my-6 not-prose flex flex-col items-center w-full">
            <div class="w-full max-w-[340px] sm:max-w-[360px]">
              <div class="tiktok-embed-header mb-2.5 p-3.5 rounded-2xl bg-black/10 dark:bg-white/5 border border-pink-500/25 flex items-center justify-between flex-wrap gap-2 shadow-sm">
                <div class="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.73 1.34-.03 2.53-.92 2.93-2.21.13-.42.18-.86.18-1.3V0z"/></svg>
                  <span>Video de TikTok</span>
                </div>
                <a href="${citeUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white text-[11px] font-bold shadow-sm transition border border-white/20">
                  <span>Abrir en TikTok ↗</span>
                </a>
              </div>
              <div class="w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10 bg-black">
                <iframe 
                  src="https://www.tiktok.com/embed/v2/${videoId}" 
                  class="w-full border-0 rounded-2xl" 
                  style="height: 580px; width: 100%; border: none;" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        `);
      }

      return match;
    }
  );

  // 3B. Enlaces directos de TikTok pegados como URL en párrafos standalone
  processed = processed.replace(
    /<p[^>]*>\s*(?:<a[^>]*>\s*)?(https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\/@([a-zA-Z0-9_.]+)\/video\/(\d+)[^\s<"']*)(?:\s*<\/a>)?\s*<\/p>/gi,
    (match, fullUrl, username, videoId) => {
      return storeEmbed(`
        <div class="my-6 not-prose flex flex-col items-center w-full">
          <div class="w-full max-w-[340px] sm:max-w-[360px]">
            <div class="tiktok-embed-header mb-2.5 p-3.5 rounded-2xl bg-black/10 dark:bg-white/5 border border-pink-500/25 flex items-center justify-between flex-wrap gap-2 shadow-sm">
              <div class="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.73 1.34-.03 2.53-.92 2.93-2.21.13-.42.18-.86.18-1.3V0z"/></svg>
                <span>Video de TikTok (@${username})</span>
              </div>
              <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white text-[11px] font-bold shadow-sm transition border border-white/20">
                <span>Abrir en TikTok ↗</span>
              </a>
            </div>
            <div class="w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10 bg-black">
              <iframe 
                src="https://www.tiktok.com/embed/v2/${videoId}" 
                class="w-full border-0 rounded-2xl" 
                style="height: 580px; width: 100%; border: none;" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      `);
    }
  );

  // =========================================================================
  // 4. TWITTER / X: BLOCKQUOTES Y ENLACES DIRECTOS A TWEETS / POSTS
  // =========================================================================

  // 4A. Blockquotes de Twitter / X (incluyendo envoltorio wp-block-embed-twitter si existe)
  processed = processed.replace(
    /(?:<figure[^>]*class="[^"]*wp-block-embed-twitter[^"]*"[^>]*>\s*<div[^>]*class="[^"]*wp-block-embed__wrapper[^"]*"[^>]*>\s*)?<blockquote([^>]*)class="([^"]*twitter-tweet[^"]*)"([^>]*)>([\s\S]*?)<\/blockquote>(?:\s*<script[^>]*><\/script>)?(?:\s*<\/div>\s*<\/figure>)?/gi,
    (match, p1, p2, p3, inner) => {
      const linkMatch = inner.match(/href="([^"]+)"/i);
      const tweetUrl = linkMatch ? linkMatch[1] : 'https://x.com';

      return storeEmbed(`
        <div class="my-6 not-prose flex flex-col items-center w-full">
          <div class="w-full max-w-[500px]">
            <div class="twitter-embed-header mb-2.5 p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-2 shadow-sm">
              <div class="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span>Publicación en X (Twitter)</span>
              </div>
              <a href="${tweetUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white text-[11px] font-bold shadow-sm transition border border-white/20">
                <span>Ver en X ↗</span>
              </a>
            </div>
            <div class="twitter-embed-wrapper w-full flex justify-center">
              <blockquote class="twitter-tweet" data-dnt="true" data-theme="dark">
                <a href="${tweetUrl}"></a>
              </blockquote>
            </div>
          </div>
        </div>
      `);
    }
  );

  // 4B. Enlaces directos a Twitter / X pegados en párrafos standalone
  processed = processed.replace(
    /<p[^>]*>\s*(?:<a[^>]*>\s*)?(https?:\/\/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)[^\s<"']*)(?:\s*<\/a>)?\s*<\/p>/gi,
    (match, tweetUrl, username, statusId) => {
      return storeEmbed(`
        <div class="my-6 not-prose flex flex-col items-center w-full">
          <div class="w-full max-w-[500px]">
            <div class="twitter-embed-header mb-2.5 p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-2 shadow-sm">
              <div class="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span>Publicación en X (@${username})</span>
              </div>
              <a href="${tweetUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white text-[11px] font-bold shadow-sm transition border border-white/20">
                <span>Ver en X ↗</span>
              </a>
            </div>
            <div class="twitter-embed-wrapper w-full flex justify-center">
              <blockquote class="twitter-tweet" data-dnt="true" data-theme="dark">
                <a href="${tweetUrl}"></a>
              </blockquote>
            </div>
          </div>
        </div>
      `);
    }
  );

  // =========================================================================
  // 5. YOUTUBE: VIDEOS, SHORTS Y ENLACES CORTOS (YOU.TU.BE)
  // =========================================================================
  processed = processed.replace(
    /(?:<figure[^>]*class="[^"]*wp-block-embed-youtube[^"]*"[^>]*>\s*<div[^>]*class="[^"]*wp-block-embed__wrapper[^"]*"[^>]*>\s*)?<p[^>]*>\s*(?:<a[^>]*>\s*)?(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s<"']*)?(?:\s*<\/a>)?\s*<\/p>(?:\s*<\/div>\s*<\/figure>)?/gi,
    (match, videoId) => {
      const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
      return storeEmbed(`
        <div class="my-6 not-prose w-full">
          <div class="p-3 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-between flex-wrap gap-2 mb-2.5">
            <div class="flex items-center space-x-2 text-xs font-bold text-red-600 dark:text-red-400">
              <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              <span>Video de YouTube</span>
            </div>
            <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold shadow-sm transition cursor-pointer">
              <span>Abrir en YouTube ↗</span>
            </a>
          </div>
          <div class="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10 bg-black">
            <iframe 
              src="https://www.youtube.com/embed/${videoId}" 
              title="Reproductor de YouTube" 
              class="w-full h-full border-0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen 
              loading="lazy"
            ></iframe>
          </div>
        </div>
      `);
    }
  );

  // =========================================================================
  // 6. THREADS: BLOCKQUOTES Y ENLACES DIRECTOS
  // =========================================================================
  processed = processed.replace(
    /<blockquote([^>]*)class="([^"]*text-post-media[^"]*)"([^>]*)>([\s\S]*?)<\/blockquote>(?:\s*<script[^>]*><\/script>)?/gi,
    (match, p1, p2, p3, inner) => {
      const fullAttrs = `${p1} ${p3}`;
      const permalinkMatch = fullAttrs.match(/data-text-post-permalink="([^"]+)"/i) || inner.match(/href="([^"]+threads\.net[^"]+)"/i);
      const threadsUrl = permalinkMatch ? permalinkMatch[1] : 'https://www.threads.net';

      return storeEmbed(`
        <div class="my-6 not-prose flex flex-col items-center w-full">
          <div class="w-full max-w-[500px]">
            <div class="threads-embed-header mb-2.5 p-3.5 rounded-2xl bg-neutral-900/10 dark:bg-white/5 border border-neutral-300 dark:border-white/10 flex items-center justify-between flex-wrap gap-2 shadow-sm">
              <div class="flex items-center space-x-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12.001 2c-5.523 0-10 4.477-10 10 0 5.093 3.807 9.297 8.742 9.907v-3.774a3.1 3.1 0 0 1-1.742-.716 3.4 3.4 0 0 1-1.096-2.527c0-2.074 1.62-3.73 3.935-3.73 2.133 0 3.722 1.48 3.722 3.484 0 2.45-1.637 4.09-4.298 4.09-.914 0-1.776-.23-2.493-.66l-.72 2.68c1.03.49 2.22.77 3.48.77 4.148 0 7.031-2.735 7.031-6.88 0-3.528-2.756-6.196-6.722-6.196-4.32 0-7.24 3.092-7.24 6.953 0 4.237 3.328 7.378 7.64 7.378 1.464 0 2.827-.374 4.02-1.03l-.75-2.61c-.96.48-2.07.75-3.27.75-2.9 0-5.01-1.99-5.01-4.738 0-2.45 1.76-4.37 4.38-4.37 2.37 0 3.9 1.6 3.9 3.65 0 1.25-.8 2.05-1.78 2.05-.72 0-1.2-.42-1.2-1.08v-1.92h-1.5v1.92c0 1.62 1.15 2.68 2.7 2.68 1.95 0 3.28-1.5 3.28-3.65 0-2.8-2.18-4.85-5.4-4.85-3.5 0-5.87 2.4-5.87 5.56 0 3.35 2.48 5.75 5.87 5.75.96 0 1.88-.2 2.72-.58v3.45C18.67 20.89 22 16.84 22 12c0-5.523-4.477-10-10-10z"/></svg>
                <span>Publicación en Threads</span>
              </div>
              <a href="${threadsUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white text-[11px] font-bold shadow-sm transition border border-white/10 cursor-pointer">
                <span>Ver en Threads ↗</span>
              </a>
            </div>
            <div class="threads-embed-wrapper w-full flex justify-center">
              <blockquote class="text-post-media" data-text-post-permalink="${threadsUrl}">
                <a href="${threadsUrl}"></a>
              </blockquote>
            </div>
          </div>
        </div>
      `);
    }
  );

  // 6B. Enlaces directos a Threads pegados en párrafos standalone
  processed = processed.replace(
    /<p[^>]*>\s*(?:<a[^>]*>\s*)?(https?:\/\/(?:www\.)?threads\.net\/@[a-zA-Z0-9_.]+\/post\/[a-zA-Z0-9_-]+[^\s<"']*)(?:\s*<\/a>)?\s*<\/p>/gi,
    (match, threadsUrl) => {
      return storeEmbed(`
        <div class="my-6 not-prose flex flex-col items-center w-full">
          <div class="w-full max-w-[500px]">
            <div class="threads-embed-header mb-2.5 p-3.5 rounded-2xl bg-neutral-900/10 dark:bg-white/5 border border-neutral-300 dark:border-white/10 flex items-center justify-between flex-wrap gap-2 shadow-sm">
              <div class="flex items-center space-x-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12.001 2c-5.523 0-10 4.477-10 10 0 5.093 3.807 9.297 8.742 9.907v-3.774a3.1 3.1 0 0 1-1.742-.716 3.4 3.4 0 0 1-1.096-2.527c0-2.074 1.62-3.73 3.935-3.73 2.133 0 3.722 1.48 3.722 3.484 0 2.45-1.637 4.09-4.298 4.09-.914 0-1.776-.23-2.493-.66l-.72 2.68c1.03.49 2.22.77 3.48.77 4.148 0 7.031-2.735 7.031-6.88 0-3.528-2.756-6.196-6.722-6.196-4.32 0-7.24 3.092-7.24 6.953 0 4.237 3.328 7.378 7.64 7.378 1.464 0 2.827-.374 4.02-1.03l-.75-2.61c-.96.48-2.07.75-3.27.75-2.9 0-5.01-1.99-5.01-4.738 0-2.45 1.76-4.37 4.38-4.37 2.37 0 3.9 1.6 3.9 3.65 0 1.25-.8 2.05-1.78 2.05-.72 0-1.2-.42-1.2-1.08v-1.92h-1.5v1.92c0 1.62 1.15 2.68 2.7 2.68 1.95 0 3.28-1.5 3.28-3.65 0-2.8-2.18-4.85-5.4-4.85-3.5 0-5.87 2.4-5.87 5.56 0 3.35 2.48 5.75 5.87 5.75.96 0 1.88-.2 2.72-.58v3.45C18.67 20.89 22 16.84 22 12c0-5.523-4.477-10-10-10z"/></svg>
                <span>Publicación en Threads</span>
              </div>
              <a href="${threadsUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white text-[11px] font-bold shadow-sm transition border border-white/10 cursor-pointer">
                <span>Ver en Threads ↗</span>
              </a>
            </div>
            <div class="threads-embed-wrapper w-full flex justify-center">
              <blockquote class="text-post-media" data-text-post-permalink="${threadsUrl}">
                <a href="${threadsUrl}"></a>
              </blockquote>
            </div>
          </div>
        </div>
      `);
    }
  );

  // =========================================================================
  // 7. ENLACES EXTERNOS GENERALES <a>
  // Asegurar que abran en nueva pestaña (_blank) con alto contraste para no cortar la radio.
  // Nota: Al ejecutarse antes de restaurar los placeholders, NUNCA alterará las clases
  // ni los botones de los widgets sociales embebidos.
  // =========================================================================
  processed = processed.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
    let cleanAttrs = attrs;

    // Si ya tiene target, asegurar que sea _blank
    if (/target=["'][^"']*["']/i.test(cleanAttrs)) {
      cleanAttrs = cleanAttrs.replace(/target=["'][^"']*["']/i, 'target="_blank"');
    } else {
      cleanAttrs += ' target="_blank"';
    }

    // Asegurar rel="noopener noreferrer"
    if (/rel=["'][^"']*["']/i.test(cleanAttrs)) {
      cleanAttrs = cleanAttrs.replace(/rel=["'][^"']*["']/i, 'rel="noopener noreferrer"');
    } else {
      cleanAttrs += ' rel="noopener noreferrer"';
    }

    // Asegurar clases de alto contraste y estilo Apple
    if (/class=["']([^"']*)["']/i.test(cleanAttrs)) {
      cleanAttrs = cleanAttrs.replace(/class=["']([^"']*)["']/i, (cMatch, existingClasses) => {
        if (!existingClasses.includes('text-[#001E4D]') && !existingClasses.includes('dark:text-[#00DD9E]')) {
          return `class="${existingClasses} text-[#001E4D] dark:text-[#00DD9E] hover:underline font-bold transition-colors"`;
        }
        return cMatch;
      });
    } else {
      cleanAttrs += ' class="text-[#001E4D] dark:text-[#00DD9E] hover:underline font-bold transition-colors"';
    }

    return `<a${cleanAttrs}>`;
  });

  // =========================================================================
  // 8. RESTAURACIÓN DE SLOTS DE EMBEDS
  // Inyectar de vuelta los componentes HTML limpios y aislados en sus posiciones
  // =========================================================================
  for (const { token, embedHtml } of placeholders) {
    processed = processed.replace(token, embedHtml);
  }

  return processed;
}
