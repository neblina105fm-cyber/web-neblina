import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, 
  Calendar, 
  Share2, 
  Check, 
  Mail, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  User, 
  Clock, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { STATION_INFO } from '../services/api';
import { processSocialContent } from '../utils/socialEmbedParser';
import { 
  getPublicApprovedComments, 
  submitNewsComment 
} from '../services/newsCommentsService';
import { addUnifiedContact } from '../services/unifiedContactsService';
import { trackNewsView, trackNewsShare } from '../services/analyticsLogger';
import { getActiveBannersForPlacement } from '../services/adBannerService';
import AdCarousel from './AdCarousel';
import Emoji3D from './Emoji3D';
import NewsImageCarousel from './NewsImageCarousel';

// Convertir texto a Negrita Matemática Sans-Serif Unicode (para X, Threads y Facebook)
function toUnicodeBold(text = '') {
  const map = {
    A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',
    N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',
    a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',
    n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',
    '0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵',
    'Á':'𝗔́','É':'𝗘́','Í':'𝗜́','Ó':'𝗢́','Ú':'𝗨́','Ñ':'𝗡̃',
    'á':'𝗮́','é':'𝗲́','í':'𝗶́','ó':'𝗼́','ú':'𝘂́','ñ':'𝗻̃'
  };
  return String(text).split('').map(ch => map[ch] || ch).join('');
}

// Limpiar etiquetas HTML y normalizar espacios para generar resúmenes limpios
function stripHtmlToPlainText(html = '') {
  return String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// Generar resumen con suspenso e intriga entre 300 y 500 caracteres cortado en límite de palabra
function buildSuspenseSummary(post) {
  const rawBody = stripHtmlToPlainText(post?.content || post?.excerpt || '');
  const rawExcerpt = stripHtmlToPlainText(post?.excerpt || '');
  const combined = rawBody.length >= 260 ? rawBody : `${rawExcerpt} ${rawBody}`.trim();
  const hookSuffix = '… ¿Qué ocurrió realmente? Conoce todos los detalles aquí.';
  const targetMax = 440; // Para que junto con el gancho quede entre 300 y 500 caracteres

  if (combined.length <= targetMax) {
    return `${combined}${hookSuffix}`;
  }
  const sliced = combined.slice(0, targetMax);
  const lastSpace = sliced.lastIndexOf(' ');
  const cleanCut = lastSpace > 240 ? sliced.slice(0, lastSpace) : sliced;
  return `${cleanCut.replace(/[.,;:!?]+$/, '')}${hookSuffix}`;
}

// Generar descripción extendida (~850 caracteres) para envío por Correo Electrónico
function buildExtendedEmailDescription(post) {
  const rawBody = stripHtmlToPlainText(post?.content || post?.excerpt || '');
  if (rawBody.length <= 850) return rawBody;
  const sliced = rawBody.slice(0, 850);
  const lastSpace = sliced.lastIndexOf(' ');
  return `${(lastSpace > 600 ? sliced.slice(0, lastSpace) : sliced).replace(/[.,;:!?]+$/, '')}…`;
}

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.8-.23-.09-.39-.13-.56.13-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.76-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.56-1.34-.77-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.2-.59.2-1.09.14-1.19-.06-.1-.22-.16-.47-.28z"/>
  </svg>
);

const XTwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TelegramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

const ThreadsIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.001 2c-5.523 0-10 4.477-10 10 0 5.093 3.807 9.297 8.742 9.907v-3.774a3.1 3.1 0 0 1-1.742-.716 3.4 3.4 0 0 1-1.096-2.527c0-2.074 1.62-3.73 3.935-3.73 2.133 0 3.722 1.48 3.722 3.484 0 2.45-1.637 4.09-4.298 4.09-.914 0-1.776-.23-2.493-.66l-.72 2.68c1.03.49 2.22.77 3.48.77 4.148 0 7.031-2.735 7.031-6.88 0-3.528-2.756-6.196-6.722-6.196-4.32 0-7.24 3.092-7.24 6.953 0 4.237 3.328 7.378 7.64 7.378 1.464 0 2.827-.374 4.02-1.03l-.75-2.61c-.96.48-2.07.75-3.27.75-2.9 0-5.01-1.99-5.01-4.738 0-2.45 1.76-4.37 4.38-4.37 2.37 0 3.9 1.6 3.9 3.65 0 1.25-.8 2.05-1.78 2.05-.72 0-1.2-.42-1.2-1.08v-1.92h-1.5v1.92c0 1.62 1.15 2.68 2.7 2.68 1.95 0 3.28-1.5 3.28-3.65 0-2.8-2.18-4.85-5.4-4.85-3.5 0-5.87 2.4-5.87 5.56 0 3.35 2.48 5.75 5.87 5.75.96 0 1.88-.2 2.72-.58v3.45C18.67 20.89 22 16.84 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const YouTubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// Función para dividir la redacción de la noticia e insertar el banner publicitario a la mitad sin romper etiquetas HTML
function splitNewsContent(htmlContent) {
  if (!htmlContent) return { firstPart: '', secondPart: '', hasMid: false };

  // 1. Intentar dividir por párrafos completos de HTML (<p>...</p>)
  const pTags = htmlContent.split('</p>');
  if (pTags.length >= 3) {
    const midPoint = Math.ceil((pTags.length - 1) / 2);
    const firstPart = pTags.slice(0, midPoint).join('</p>') + '</p>';
    const secondPart = pTags.slice(midPoint).join('</p>');
    return { firstPart, secondPart, hasMid: true };
  }

  // 2. Intentar dividir por saltos de línea dobles (<br/><br/> o \n\n)
  const brSplits = htmlContent.split(/<br\s*\/?>\s*<br\s*\/?>|\n\n+/i);
  if (brSplits.length >= 2) {
    const midPoint = Math.ceil(brSplits.length / 2);
    const firstPart = brSplits.slice(0, midPoint).join('<br/><br/>');
    const secondPart = brSplits.slice(midPoint).join('<br/><br/>');
    return { firstPart, secondPart, hasMid: true };
  }

  // 3. Si el texto es lo suficientemente extenso (> 350 caracteres), dividir en el punto y seguido más cercano al centro
  if (htmlContent.length > 350) {
    const midTarget = Math.floor(htmlContent.length / 2);
    const periodIdx = htmlContent.indexOf('. ', midTarget);
    if (periodIdx !== -1 && periodIdx < htmlContent.length - 60) {
      const firstPart = htmlContent.substring(0, periodIdx + 1);
      const secondPart = htmlContent.substring(periodIdx + 2);
      return { firstPart, secondPart, hasMid: true };
    }
  }

  return { firstPart: htmlContent, secondPart: '', hasMid: false };
}

export default function NewsModal({ post, onClose }) {
  const [copied, setCopied] = useState(false);
  const [copiedEmailCard, setCopiedEmailCard] = useState(false);

  // Estados de Comentarios Ciudadanos
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({
    name: '',
    cedula: '',
    phone: '',
    location: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Cargar comentarios aprobados para esta noticia y registrar view
  useEffect(() => {
    if (!post?.id) return;
    
    // Registrar vista en métricas
    trackNewsView(post.id, post.title);

    const loadComments = () => {
      setComments(getPublicApprovedComments(post.id));
    };
    loadComments();

    const handleCommentsUpdated = (e) => {
      if (!e.detail?.newsId || String(e.detail.newsId) === String(post.id)) {
        loadComments();
      }
    };

    window.addEventListener('neblina_comments_updated', handleCommentsUpdated);
    return () => window.removeEventListener('neblina_comments_updated', handleCommentsUpdated);
  }, [post?.id]);

  // Bloquear el scroll del fondo (body) solo mientras la sobreventana esté efectivamente abierta
  useEffect(() => {
    if (!post) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = (originalOverflow && originalOverflow !== 'hidden') ? originalOverflow : '';
    };
  }, [post]);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!commentForm.name.trim()) {
      setSubmitError('Por favor ingresa tu nombre y apellido.');
      return;
    }
    if (!commentForm.cedula.trim()) {
      setSubmitError('Por favor ingresa tu cédula de identidad para el registro interno.');
      return;
    }
    if (!commentForm.phone.trim()) {
      setSubmitError('Por favor ingresa tu número de teléfono o WhatsApp.');
      return;
    }
    if (!commentForm.location.trim()) {
      setSubmitError('Por favor indícanos de qué parte nos escribes (ciudad o sector).');
      return;
    }
    if (!commentForm.comment.trim()) {
      setSubmitError('Por favor redacta tu comentario.');
      return;
    }

    setIsSubmitting(true);
    try {
      submitNewsComment({
        newsId: post.id,
        newsTitle: post.title,
        newsUrl: window.location.href,
        authorName: commentForm.name,
        authorCedula: commentForm.cedula,
        authorPhone: commentForm.phone,
        authorLocation: commentForm.location,
        comment: commentForm.comment
      });

      // Registrar de forma unificada en la base de datos de usuarios y contactos
      try {
        addUnifiedContact({
          name: commentForm.name,
          phone: commentForm.phone,
          cedula: commentForm.cedula,
          location: commentForm.location,
          origin: 'Comentario de Noticia',
          details: `Noticia: ${post.title} — Comentario: ${commentForm.comment}`
        });
      } catch (e) {
        console.warn('Error sincronizando contacto unificado:', e);
      }

      setCommentForm({
        name: '',
        cedula: '',
        phone: '',
        location: '',
        comment: ''
      });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 8000);
    } catch (err) {
      setSubmitError('Ocurrió un error al enviar tu comentario. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inicialización y procesamiento automático de Widgets de Redes Sociales
  // (Instagram, Twitter/X, Facebook, Threads, TikTok)
  useEffect(() => {
    if (!post) return;

    // 1. Instagram: forzar procesamiento si hay blockquotes no procesados
    const processInstagram = () => {
      if (window.instgrm?.Embeds?.process) {
        window.instgrm.Embeds.process();
      } else if (!document.getElementById('instagram-embed-script')) {
        const s = document.createElement('script');
        s.id = 'instagram-embed-script';
        s.src = 'https://www.instagram.com/embed.js';
        s.async = true;
        s.defer = true;
        s.onload = () => {
          setTimeout(() => window.instgrm?.Embeds?.process?.(), 100);
        };
        document.body.appendChild(s);
      }
    };

    // 2. Twitter / X: procesar tweets
    const processTwitter = () => {
      const container = document.querySelector('.news-article-content');
      if (window.twttr?.widgets?.load) {
        if (container) window.twttr.widgets.load(container);
        else window.twttr.widgets.load();
      } else if (!document.getElementById('twitter-wjs')) {
        const s = document.createElement('script');
        s.id = 'twitter-wjs';
        s.src = 'https://platform.twitter.com/widgets.js';
        s.async = true;
        s.onload = () => {
          setTimeout(() => {
            const cont = document.querySelector('.news-article-content');
            if (cont) window.twttr?.widgets?.load?.(cont);
            else window.twttr?.widgets?.load?.();
          }, 100);
        };
        document.body.appendChild(s);
      }
    };

    // 3. Facebook: procesar posts/videos embebidos
    const processFacebook = () => {
      const container = document.querySelector('.news-article-content');
      if (window.FB?.XFBML?.parse) {
        if (container) window.FB.XFBML.parse(container);
        else window.FB.XFBML.parse();
      } else if (!document.getElementById('facebook-jssdk')) {
        const s = document.createElement('script');
        s.id = 'facebook-jssdk';
        s.src = 'https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v18.0';
        s.async = true;
        s.defer = true;
        s.crossOrigin = 'anonymous';
        document.body.appendChild(s);
      }
    };

    // 4. Threads
    const processThreads = () => {
      if (!document.getElementById('threads-embed-script')) {
        const s = document.createElement('script');
        s.id = 'threads-embed-script';
        s.src = 'https://www.threads.net/embed.js';
        s.async = true;
        document.body.appendChild(s);
      }
    };

    // 5. TikTok
    const processTikTok = () => {
      if (!document.getElementById('tiktok-embed-script')) {
        const s = document.createElement('script');
        s.id = 'tiktok-embed-script';
        s.src = 'https://www.tiktok.com/embed.js';
        s.async = true;
        document.body.appendChild(s);
      }
    };

    // Ejecutar de inmediato y con reintentos escalonados para atrapar el montaje del DOM
    const timers = [
      setTimeout(processInstagram, 60),
      setTimeout(processTwitter, 80),
      setTimeout(processFacebook, 100),
      setTimeout(processThreads, 120),
      setTimeout(processTikTok, 140),
      // Reintentos clave para conexiones móviles
      setTimeout(processInstagram, 400),
      setTimeout(processInstagram, 1000),
      setTimeout(processTwitter, 350),
      setTimeout(processTwitter, 850),
      setTimeout(processFacebook, 500)
    ];

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [post]);

  if (!post) return null;

  const articleUrl = post.link || `${window.location.origin}${window.location.pathname}#noticia-${post.id}`;
  const cleanHeadline = stripHtmlToPlainText(post.title || 'Noticia Neblina 105.5 FM');
  const suspenseSummary = buildSuspenseSummary(post);
  const extendedEmailDesc = buildExtendedEmailDescription(post);

  // Formatos de texto con titular en negrita + línea en blanco + resumen de suspenso (300-500 caracteres) + línea en blanco + -Más detalles ⬇️ + link
  const whatsappShareBody = `*${cleanHeadline}*\n\n${suspenseSummary}\n\n-Más detalles ⬇️\n${articleUrl}`;
  const telegramShareBody = `**${cleanHeadline}**\n\n${suspenseSummary}\n\n-Más detalles ⬇️\n${articleUrl}`;
  const unicodeBoldShareBody = `${toUnicodeBold(cleanHeadline)}\n\n${suspenseSummary}\n\n-Más detalles ⬇️\n${articleUrl}`;

  // Obtener un banner publicitario activo de los aliados comerciales para incluir al final del correo
  const emailSponsorBanner = (getActiveBannersForPlacement('news') || [])[0] || {
    clientName: 'Neblina Stereo 105.5 FM',
    title: 'Anuncia tu marca en la emisora líder del páramo merideño',
    subtitle: 'Cobertura total en Santo Domingo, Mérida y el mundo entero vía streaming HD.',
    ctaText: 'Solicitar Tarifas Publicitarias',
    ctaLink: 'https://wa.me/584247459774'
  };

  const emailPlainTextBody = `${cleanHeadline.toUpperCase()}
Categoría: ${post.category || 'Noticias'} | Fecha: ${post.date || 'Hoy'}
------------------------------------------------------------

${extendedEmailDesc}

👉 Leer más en Neblina 105.5 FM:
${articleUrl}

============================================================
📢 ESPACIO PUBLICITARIO PATROCINADO POR:
${emailSponsorBanner.clientName || 'Neblina Stereo 105.5 FM'}
"${emailSponsorBanner.title}"
${emailSponsorBanner.subtitle || ''}
🔗 Más información: ${emailSponsorBanner.ctaLink || 'https://wa.me/584247459774'}
============================================================
Enviado desde el Portal Informativo de Neblina Stereo 105.5 FM · Santo Domingo - Mérida`;

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappShareBody)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(unicodeBoldShareBody)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(`**${cleanHeadline}**\n\n${suspenseSummary}\n\n-Más detalles ⬇️`)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(unicodeBoldShareBody)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}&quote=${encodeURIComponent(unicodeBoldShareBody)}`,
    email: `mailto:?subject=${encodeURIComponent(`📰 ${cleanHeadline} | Neblina 105.5 FM`)}&body=${encodeURIComponent(emailPlainTextBody)}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappShareBody);
    setCopied(true);
    trackNewsShare(post.id, post.title, 'copy_link');
    setTimeout(() => setCopied(false), 2500);
  };

  // Copiar tarjeta HTML enriquecida para pegar directamente en Gmail / Outlook / Apple Mail con foto, descripción extendida, botón Leer más y banner publicitario
  const handleCopyHtmlEmailCard = async () => {
    const heroImg = (post.images && post.images[0]) || post.image || 'https://neblina105fm.com/wp-content/uploads/2026/10/Neblina-2026-10-4.png';
    const bannerImg = emailSponsorBanner.mediaUrl || (emailSponsorBanner.images && emailSponsorBanner.images[0]?.desktopUrl) || '';

    const htmlCard = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; color: #0f172a;">
        <div style="background-color: #001E4D; padding: 14px 20px; color: #ffffff;">
          <span style="display: inline-block; background-color: #00DD9E; color: #001E4D; font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">${post.category || 'Noticias'}</span>
          <span style="font-size: 12px; color: #cbd5e1; margin-left: 10px;">Neblina Stereo 105.5 FM · ${post.date || ''}</span>
        </div>
        <img src="${heroImg}" alt="${cleanHeadline}" style="width: 100%; max-height: 340px; object-fit: cover; display: block;" />
        <div style="padding: 24px;">
          <h2 style="margin: 0 0 14px 0; font-size: 22px; line-height: 1.3; color: #001E4D; font-weight: 800;">${cleanHeadline}</h2>
          <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.65; color: #334155;">${extendedEmailDesc}</p>
          <div style="margin: 24px 0;">
            <a href="${articleUrl}" target="_blank" style="display: inline-block; background-color: #001E4D; color: #00DD9E; font-weight: 800; font-size: 14px; padding: 12px 22px; border-radius: 8px; text-decoration: none;">👉 Leer más en Neblina 105.5 FM</a>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Enlace directo: <a href="${articleUrl}" style="color: #001E4D;">${articleUrl}</a></p>
        </div>
        <div style="background-color: #f8fafc; border-top: 2px solid #00DD9E; padding: 18px 24px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #008f7a; letter-spacing: 0.08em; margin-bottom: 6px;">📢 Espacio Publicitario Patrocinado</div>
          ${bannerImg ? `<img src="${bannerImg}" alt="${emailSponsorBanner.clientName}" style="width: 100%; max-height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; display: block;" />` : ''}
          <div style="font-size: 15px; font-weight: 800; color: #0f172a;">${emailSponsorBanner.clientName || 'Aliado Comercial Neblina 105.5 FM'}</div>
          <div style="font-size: 13px; color: #475569; margin: 4px 0 10px 0;">${emailSponsorBanner.title} — ${emailSponsorBanner.subtitle || ''}</div>
          <a href="${emailSponsorBanner.ctaLink || 'https://wa.me/584247459774'}" target="_blank" style="display: inline-block; background-color: #00DD9E; color: #001E4D; font-weight: 800; font-size: 12px; padding: 8px 14px; border-radius: 6px; text-decoration: none;">${emailSponsorBanner.ctaText || 'Contactar Patrocinante'}</a>
        </div>
      </div>
    `;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new window.ClipboardItem({
          'text/html': new Blob([htmlCard], { type: 'text/html' }),
          'text/plain': new Blob([emailPlainTextBody], { type: 'text/plain' })
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(emailPlainTextBody);
      }
      setCopiedEmailCard(true);
      trackNewsShare(post.id, post.title, 'email_html_card');
      setTimeout(() => setCopiedEmailCard(false), 3000);
    } catch (e) {
      navigator.clipboard.writeText(emailPlainTextBody);
      setCopiedEmailCard(true);
      setTimeout(() => setCopiedEmailCard(false), 3000);
    }
  };

  const processedBody = processSocialContent(post.content);
  const newsParts = useMemo(() => splitNewsContent(processedBody), [processedBody]);

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 pt-4 pb-28 sm:pb-32 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[calc(100dvh-130px)] sm:max-h-[calc(100dvh-140px)] bg-white dark:bg-[#001E4D] border border-slate-200 dark:border-[#00DD9E]/25 rounded-2xl overflow-hidden flex flex-col shadow-lg transition-colors duration-300 my-auto">
        
        {/* Cabecera del Modal Estilo Apple */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-[#f5f5f7]/95 dark:bg-[#001438]/95 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-[#001E4D]/75 dark:bg-[#00DD9E]/20 backdrop-blur-xl text-[#00DD9E] border border-[#00DD9E]/45 shadow-xs">
              {post.category}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-1 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#001E4D] dark:text-[#00DD9E]" />
              <span>{post.date}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            aria-label="Cerrar noticia"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable del artículo con alto contraste */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          <h1 
            className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-[#f5f5f7] leading-tight"
            dangerouslySetInnerHTML={{ __html: post.title }}
          />

          {/* Carrusel de Fotografías (1 a 3 fotos de la noticia) */}
          <NewsImageCarousel 
            images={post.images || (post.image ? [post.image] : [])} 
            fallbackImage={post.image}
            alt={post.title}
            className="h-64 sm:h-80 md:h-96"
          />

          {/* Cuerpo de la Noticia con Inserción No Invasiva de Banner a Mitad de Redacción */}
          {newsParts.hasMid ? (
            <div className="space-y-4">
              <div 
                className="news-article-content prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-[#f5f5f7] text-sm sm:text-base leading-relaxed space-y-4 font-normal"
                dangerouslySetInnerHTML={{ __html: newsParts.firstPart }}
              />

              {/* Banner Publicitario a Mitad de la Nota de Prensa (No invasivo, elegante, para no perderse) */}
              <div className="py-1">
                <AdCarousel 
                  variant="news-mid" 
                  placement="news" 
                  excludeId={[
                    typeof window !== 'undefined' ? window.__activeHomeBannerId : null
                  ].filter(Boolean)} 
                />
              </div>

              <div 
                className="news-article-content prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-[#f5f5f7] text-sm sm:text-base leading-relaxed space-y-4 font-normal"
                dangerouslySetInnerHTML={{ __html: newsParts.secondPart }}
              />
            </div>
          ) : (
            <div 
              className="news-article-content prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-[#f5f5f7] text-sm sm:text-base leading-relaxed space-y-4 font-normal"
              dangerouslySetInnerHTML={{ __html: processedBody }}
            />
          )}

          {/* Bloque de Créditos y Firma del Periodista Redactor */}
          {(post.isPressNote || post.author || post.journalistName) && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-[#001438]/80 backdrop-blur-xl border border-slate-200/80 dark:border-[#00DD9E]/25 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-xs">
              <div className="relative shrink-0">
                {post.journalistAvatar ? (
                  <img
                    src={post.journalistAvatar}
                    alt={post.journalistName || post.author}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#00DD9E]/40 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-teal-500 p-0.5 shadow-sm flex items-center justify-center">
                    <div className="w-full h-full bg-[#001438] rounded-[14px] flex items-center justify-center text-white">
                      <User className="w-6 h-6 text-[#00DD9E]" />
                    </div>
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#001E4D] text-[#00DD9E] border border-[#00DD9E]/40 shadow-xs" title="Firma Oficial Acreditada">
                  <ShieldCheck className="w-3 h-3" />
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#001E4D]/80 dark:bg-[#00DD9E]/20 text-[#00DD9E] border border-[#00DD9E]/30">
                    Créditos Editoriales
                  </span>
                  {post.journalistCnp && (
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      · {post.journalistCnp}
                    </span>
                  )}
                  {post.category && (
                    <span className="text-[10px] text-slate-400 dark:text-white/30">
                      · {post.category}
                    </span>
                  )}
                </div>

                <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  {post.journalistName || post.author || 'Sala de Redacción Neblina 105.5 FM'}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-pre-line mt-0.5 leading-relaxed">
                  {post.journalistSignature || post.journalistRole || 'Periodista y Corresponsal de Neblina Stereo 105.5 FM · Mérida, Venezuela.'}
                </p>

                {(post.journalistInstagram || post.journalistTwitter) && (
                  <div className="flex items-center gap-3 mt-2 text-xs font-bold text-[#001E4D] dark:text-[#00DD9E]">
                    {post.journalistInstagram && (
                      <span className="inline-flex items-center space-x-1">
                        <Emoji3D name="instagram" className="w-3.5 h-3.5" alt="Instagram" />
                        <span>{post.journalistInstagram}</span>
                      </span>
                    )}
                    {post.journalistTwitter && (
                      <span className="inline-flex items-center space-x-1">
                        <Emoji3D name="x" className="w-3.5 h-3.5" alt="X" />
                        <span>{post.journalistTwitter}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bloque para Compartir en Redes Sociales */}
          <div className="pt-6 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#001E4D] dark:text-[#00DD9E] mb-3">
              <Share2 className="w-4 h-4" />
              <span>Compartir esta noticia:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              
              {/* WhatsApp */}
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackNewsShare(post.id, post.title, 'whatsapp')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                title="Compartir por WhatsApp"
              >
                <Emoji3D name="whatsapp" className="w-4 h-4 flex-shrink-0" alt="WhatsApp" />
                <span>WhatsApp</span>
              </a>

              {/* X / Twitter */}
              <a
                href={shareLinks.x}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackNewsShare(post.id, post.title, 'x')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold border border-white/20 transition shadow-sm"
                title="Compartir en X"
              >
                <Emoji3D name="x" className="w-4 h-4 flex-shrink-0" alt="X" />
                <span>X</span>
              </a>

              {/* Telegram */}
              <a
                href={shareLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackNewsShare(post.id, post.title, 'telegram')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition shadow-sm"
                title="Compartir por Telegram"
              >
                <Emoji3D name="telegram" className="w-4 h-4 flex-shrink-0" alt="Telegram" />
                <span>Telegram</span>
              </a>

              {/* Threads */}
              <a
                href={shareLinks.threads}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackNewsShare(post.id, post.title, 'threads')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white text-xs font-bold border border-white/10 transition shadow-sm"
                title="Compartir en Threads"
              >
                <ThreadsIcon className="w-3.5 h-3.5" />
                <span>Threads</span>
              </a>

              {/* YouTube Canal Oficial */}
              <a
                href={STATION_INFO.youtube}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackNewsShare(post.id, post.title, 'youtube')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-sm"
                title="Ver Canal de YouTube de Neblina 105.5 FM"
              >
                <Emoji3D name="youtube" className="w-4 h-4 flex-shrink-0" alt="YouTube" />
                <span>YouTube</span>
              </a>

              {/* Correo Electrónico (Con Descripción Extendida + Link Leer más + Banner Publicitario) */}
              <a
                href={shareLinks.email}
                onClick={() => trackNewsShare(post.id, post.title, 'email')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition shadow-sm"
                title="Enviar por Correo con descripción extendida y banner publicitario"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar por Correo</span>
              </a>

              {/* Copiar Tarjeta HTML Completa para Correo (Con Imagen + Descripción + Leer más + Banner) */}
              <button
                type="button"
                onClick={handleCopyHtmlEmailCard}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#001E4D] hover:bg-[#002b6e] text-[#00DD9E] text-xs font-bold border border-[#00DD9E]/30 transition cursor-pointer shadow-sm"
                title="Copia la tarjeta visual completa con foto, resumen extendido y banner publicitario para pegarla en Gmail u Outlook"
              >
                {copiedEmailCard ? <Check className="w-4 h-4 text-[#00DD9E]" /> : <Mail className="w-4 h-4" />}
                <span>{copiedEmailCard ? '¡Tarjeta de Correo Copiada!' : 'Copiar Tarjeta Correo (Con Foto y Banner)'}</span>
              </button>

              {/* Copiar Texto con Resumen de Intriga */}
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white text-xs font-bold border border-slate-300 dark:border-white/10 transition cursor-pointer"
                title="Copiar titular en negrita + resumen de intriga + enlace"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? '¡Resumen Copiado!' : 'Copiar Resumen'}</span>
              </button>

            </div>
          </div>

          {/* Banner Publicitario al Final de la Nota de Prensa (con rotación sin repetir el del inicio ni el del medio) */}
          <div className="pt-2">
            <AdCarousel 
              variant="news" 
              placement="news" 
              excludeId={[
                typeof window !== 'undefined' ? window.__activeHomeBannerId : null,
                typeof window !== 'undefined' ? window.__activeNewsMidBannerId : null
              ].filter(Boolean)} 
            />
          </div>

          {/* ============================================================== */}
          {/* SECCIÓN DE COMENTARIOS CIUDADANOS (NOTAS DE PRENSA) */}
          {/* ============================================================== */}
          <div className="pt-8 border-t border-slate-200 dark:border-white/10 space-y-6">
            
            {/* Encabezado de la sección */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Emoji3D name="chat" className="w-8 h-8 drop-shadow-md flex-shrink-0" alt="Comentarios" />
                <div>
                  <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
                    Comentarios de la Comunidad
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Opiniones ciudadanas verificadas de nuestros oyentes y lectores
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10">
                {comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}
              </span>
            </div>

            {/* Listado de comentarios públicos aprobados */}
            {comments.length > 0 ? (
              <div className="space-y-3.5">
                {comments.map((item) => {
                  const initials = (item.authorName || 'C')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(n => n[0].toUpperCase())
                    .join('');

                  return (
                    <div 
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#f8fafc] dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#001E4D] to-[#00DD9E] text-white text-xs font-black flex items-center justify-center shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <h5 className="font-display font-bold text-xs text-slate-900 dark:text-white">
                              {item.authorName}
                            </h5>
                            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                              <Clock className="w-2.5 h-2.5 text-[#00DD9E]" />
                              <span>{item.formattedDate}</span>
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#00DD9E] border border-emerald-500/20">
                          Verificado
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed pl-10">
                        {item.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/10 text-center space-y-1">
                <Emoji3D name="chat" className="w-8 h-8 mx-auto mb-1 drop-shadow-sm" alt="Comentarios" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Aún no hay comentarios publicados en esta nota.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sé el primero en compartir tu opinión con la comunidad de Neblina 105.5 FM.
                </p>
              </div>
            )}

            {/* Formulario para dejar comentario */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#00173d] border border-slate-200 dark:border-[#00DD9E]/20 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <div>
                  <h4 className="font-display font-black text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <Emoji3D name="pencil" className="w-4 h-4 drop-shadow-xs" alt="Escribir" />
                    <span>Deja tu Comentario en esta Nota</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tu opinión es fundamental para nuestra comunidad de oyentes y lectores.
                  </p>
                </div>
              </div>

              {/* Mensaje de Éxito al enviar */}
              {submitSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-[#00DD9E]" />
                  <div>
                    <strong className="block font-bold">¡Comentario recibido con éxito!</strong>
                    <span>
                      Ha sido enviado a moderación interna. Una vez verificado por nuestro equipo editorial, se publicará en esta nota de prensa.
                    </span>
                  </div>
                </div>
              )}

              {/* Mensaje de Error */}
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitComment} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre y Apellido * <span className="text-[11px] text-emerald-600 dark:text-[#00DD9E] font-bold">(Visible al público)</span>
                    </label>
                    <input
                      type="text"
                      value={commentForm.name}
                      onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                      placeholder="Ej: Carlos Ramírez"
                      required
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white dark:bg-[#001026] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cédula de Identidad * <span className="text-[11px] text-slate-400 font-medium">(Registro interno privado)</span>
                    </label>
                    <input
                      type="text"
                      value={commentForm.cedula}
                      onChange={(e) => setCommentForm({ ...commentForm, cedula: e.target.value })}
                      placeholder="Ej: V-18.452.910"
                      required
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white dark:bg-[#001026] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Teléfono o WhatsApp * <span className="text-[11px] text-slate-400 font-medium">(Registro interno privado)</span>
                    </label>
                    <input
                      type="tel"
                      value={commentForm.phone}
                      onChange={(e) => setCommentForm({ ...commentForm, phone: e.target.value })}
                      placeholder="Ej: +58 414 7568921"
                      required
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white dark:bg-[#001026] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ¿De qué parte nos escribes? * <span className="text-[11px] text-slate-400 font-medium">(Registro interno privado)</span>
                    </label>
                    <input
                      type="text"
                      value={commentForm.location}
                      onChange={(e) => setCommentForm({ ...commentForm, location: e.target.value })}
                      placeholder="Ej: Santo Domingo, Pueblo Llano, Mérida..."
                      required
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white dark:bg-[#001026] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tu Comentario * <span className="text-[11px] text-emerald-600 dark:text-[#00DD9E] font-bold">(Visible al público una vez aprobado)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={commentForm.comment}
                    onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                    placeholder="Escribe tu opinión respetuosa sobre esta nota de prensa..."
                    required
                    className="w-full text-xs font-normal p-3 rounded-xl bg-white dark:bg-[#001026] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E] resize-none"
                  />
                </div>

                {/* Aviso de Privacidad y Verificación Ciudadana */}
                <div className="p-3.5 rounded-xl bg-slate-200/50 dark:bg-black/30 border border-slate-300/60 dark:border-white/5 flex items-start space-x-2.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-[#00DD9E] shrink-0 mt-0.5" />
                  <span>
                    <strong>Política de Verificación y Privacidad:</strong> Tu cédula, teléfono y procedencia se solicitan únicamente para control y validación interna por la dirección de Neblina 105.5 FM. <strong>Nunca</strong> serán mostrados en la página web pública; al público únicamente se presentará tu nombre y tu comentario aprobado.
                  </span>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#00DD9E] hover:bg-[#00DD9E]/90 text-[#001E4D] font-black text-xs transition shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Enviando...' : 'Enviar Comentario para Aprobación'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-[#001E4D] hover:bg-[#002b66] dark:bg-[#00DD9E] dark:hover:bg-[#00c98f] text-white dark:text-[#001E4D] text-xs font-black transition shadow-sm cursor-pointer"
            >
              Cerrar Noticia
            </button>
          </div>

        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : modalContent;
}
