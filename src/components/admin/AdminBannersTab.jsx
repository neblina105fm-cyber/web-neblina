import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Megaphone, 
  Video, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  BarChart3, 
  Info, 
  X,
  Play,
  Copy,
  Check,
  Building2,
  UserCheck,
  Smartphone,
  Monitor,
  Film,
  Layers,
  ArrowRight,
  ShieldCheck,
  MousePointerClick,
  TrendingUp
} from 'lucide-react';
import Emoji3D from '../Emoji3D';
import ClientAdReportModal from './ClientAdReportModal';
import { 
  getAllBanners, 
  saveBanner, 
  deleteBanner, 
  toggleBannerActive, 
  BANNER_SPECS 
} from '../../services/adBannerService';
import { getAllClients, getAllGenres } from '../../services/radioClientsService';

export default function AdminBannersTab({ onShowToast, selectedClientId = null }) {
  const [banners, setBanners] = useState(() => getAllBanners());
  const [clients, setClients] = useState(() => getAllClients().filter(c => !c.trashed));
  const [genres, setGenres] = useState(() => getAllGenres());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [filterClient, setFilterClient] = useState(selectedClientId || 'all');
  const [copiedSpecs, setCopiedSpecs] = useState(false);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('specs'); // 'specs' | 'safeZone'
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportClientId, setReportClientId] = useState(null);

  // Estado del formulario de creación/edición de banner
  const [form, setForm] = useState({
    clientId: '',
    clientName: '',
    title: '',
    subtitle: '',
    badge: 'Pauta Comercial',
    type: 'mixed', // 'image' | 'video' | 'mixed' | 'gradient'
    mediaUrl: '',
    images: [],
    videos: [],
    ctaText: 'Escribir a WhatsApp',
    ctaLink: 'https://wa.me/584247459774?text=%C2%A1Hola!%20Deseo%20m%C3%A1s%20informaci%C3%B3n',
    placements: 'all', // 'home' | 'news' | 'all'
    active: true
  });

  useEffect(() => {
    const handleUpdate = () => {
      setBanners(getAllBanners());
      setClients(getAllClients().filter(c => !c.trashed));
    };
    window.addEventListener('neblina_banners_updated', handleUpdate);
    window.addEventListener('neblina_clients_updated', handleUpdate);
    return () => {
      window.removeEventListener('neblina_banners_updated', handleUpdate);
      window.removeEventListener('neblina_clients_updated', handleUpdate);
    };
  }, []);

  // Si cambia el prop selectedClientId, actualizar el filtro
  useEffect(() => {
    if (selectedClientId) setFilterClient(selectedClientId);
  }, [selectedClientId]);

  // Apertura para crear nuevo banner
  const handleOpenCreate = (preselectedClientId = '') => {
    setEditingBanner(null);
    let defaultTitle = '';
    let defaultBadge = 'Pauta Comercial';
    let defaultClientName = '';
    let defaultCtaLink = 'https://wa.me/584247459774?text=%C2%A1Hola!%20Deseo%20informaci%C3%B3n';

    if (preselectedClientId) {
      const foundClient = clients.find(c => String(c.id) === String(preselectedClientId));
      if (foundClient) {
        defaultClientName = foundClient.businessName;
        defaultTitle = `¡Visita ${foundClient.businessName}!`;
        const genre = genres.find(g => g.id === foundClient.genreId);
        defaultBadge = genre?.name ? genre.name.split('&')[0].trim() : 'Aliado Comercial';
        if (foundClient.ownerPhone) {
          const cleanPhone = foundClient.ownerPhone.replace(/[^0-9]/g, '');
          defaultCtaLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${foundClient.businessName}! Vi su publicidad en Neblina 105.5 FM`)}`;
        }
      }
    }

    setForm({
      clientId: preselectedClientId || '',
      clientName: defaultClientName,
      title: defaultTitle,
      subtitle: '',
      badge: defaultBadge,
      type: 'mixed',
      mediaUrl: '',
      images: [
        {
          id: `img_${Date.now()}_1`,
          desktopUrl: '',
          mobileUrl: '',
          caption: 'Arte Principal'
        }
      ],
      videos: [],
      ctaText: 'Escribir a WhatsApp',
      ctaLink: defaultCtaLink,
      placements: 'all',
      active: true
    });
    setIsModalOpen(true);
    scrollToBannerSubpanel();
  };

  const scrollToBannerSubpanel = () => {
    setTimeout(() => {
      document.getElementById('banner-form-inline')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  };

  // Apertura para editar banner existente
  const handleOpenEdit = (b) => {
    setEditingBanner(b);
    setForm({
      clientId: b.clientId || '',
      clientName: b.clientName || '',
      title: b.title || '',
      subtitle: b.subtitle || '',
      badge: b.badge || 'Pauta Publicitaria',
      type: b.type || 'mixed',
      mediaUrl: b.mediaUrl || '',
      images: Array.isArray(b.images) && b.images.length > 0 
        ? [...b.images] 
        : b.mediaUrl && b.type !== 'video'
          ? [{ id: `img_${Date.now()}_1`, desktopUrl: b.mediaUrl, mobileUrl: '', caption: 'Arte Principal' }]
          : [],
      videos: Array.isArray(b.videos) && b.videos.length > 0
        ? [...b.videos]
        : b.mediaUrl && b.type === 'video'
          ? [{ id: `vid_${Date.now()}_1`, videoUrl: b.mediaUrl, caption: 'Spot Principal' }]
          : [],
      ctaText: b.ctaText || 'Contactar',
      ctaLink: b.ctaLink || b.link || '',
      placements: b.placements || 'all',
      gridWideUrl: b.gridWideUrl || '',
      gridSquareUrl: b.gridSquareUrl || '',
      active: b.active ?? true
    });
    setIsModalOpen(true);
    scrollToBannerSubpanel();
  };

  // Al seleccionar un cliente en el modal, auto-completar datos si están vacíos
  const handleClientSelectChange = (cId) => {
    if (!cId) {
      setForm(prev => ({
        ...prev,
        clientId: '',
        clientName: 'Neblina 105.5 FM Oficial',
        badge: 'Publicidad Radial'
      }));
      return;
    }
    const found = clients.find(c => String(c.id) === String(cId));
    if (found) {
      const genre = genres.find(g => g.id === found.genreId);
      const cleanPhone = (found.ownerPhone || found.adminContactPhone || '584247459774').replace(/[^0-9]/g, '');
      setForm(prev => ({
        ...prev,
        clientId: found.id,
        clientName: found.businessName,
        badge: genre ? genre.name.split('&')[0].trim() : 'Aliado Comercial',
        title: prev.title ? prev.title : `¡Conoce lo mejor de ${found.businessName}!`,
        ctaLink: prev.ctaLink.includes('wa.me') 
          ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${found.businessName}! Vi su banner en Neblina 105.5 FM`)}`
          : prev.ctaLink
      }));
    }
  };

  // ==========================================
  // MANIPULACIÓN DE IMÁGENES (1 a 5 imágenes)
  // ==========================================
  const handleAddImage = () => {
    if (form.images.length >= 5) {
      if (onShowToast) onShowToast('Límite alcanzado: Máximo 5 imágenes por banner');
      return;
    }
    const newImg = {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      desktopUrl: '',
      mobileUrl: '',
      caption: `Imagen ${form.images.length + 1}`
    };
    setForm(prev => ({ ...prev, images: [...prev.images, newImg] }));
  };

  const handleUpdateImage = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.images];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, images: updated };
    });
  };

  const handleRemoveImage = (index) => {
    setForm(prev => {
      const updated = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: updated };
    });
  };

  // ==========================================
  // MANIPULACIÓN DE VIDEOS (2 a 3 videos)
  // ==========================================
  const handleAddVideo = () => {
    if (form.videos.length >= 3) {
      if (onShowToast) onShowToast('Límite alcanzado: Máximo 3 videos por cliente');
      return;
    }
    const newVid = {
      id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      videoUrl: '',
      caption: `Spot Publicitario ${form.videos.length + 1}`
    };
    setForm(prev => ({ ...prev, videos: [...prev.videos, newVid] }));
  };

  const handleUpdateVideo = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.videos];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, videos: updated };
    });
  };

  const handleRemoveVideo = (index) => {
    setForm(prev => {
      const updated = prev.videos.filter((_, i) => i !== index);
      return { ...prev, videos: updated };
    });
  };

  // Guardar formulario
  const handleSaveSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Por favor ingrese el título principal del banner.');
      return;
    }

    // Filtrar imágenes vacías
    const cleanImages = (form.images || []).filter(img => img.desktopUrl?.trim() || img.mobileUrl?.trim());
    const cleanVideos = (form.videos || []).filter(vid => vid.videoUrl?.trim());

    // Auto-determinar tipo de contenido
    let calculatedType = form.type;
    if (cleanVideos.length > 0 && cleanImages.length > 0) {
      calculatedType = 'mixed';
    } else if (cleanVideos.length > 0) {
      calculatedType = 'video';
    } else if (cleanImages.length > 0) {
      calculatedType = 'image';
    }

    const payload = {
      ...(editingBanner ? { id: editingBanner.id } : {}),
      ...form,
      type: calculatedType,
      images: cleanImages,
      videos: cleanVideos,
      mediaUrl: cleanImages[0]?.desktopUrl || cleanVideos[0]?.videoUrl || form.mediaUrl || ''
    };

    saveBanner(payload);
    setBanners(getAllBanners());
    setIsModalOpen(false);
    if (onShowToast) onShowToast(editingBanner ? 'Banner actualizado exitosamente' : 'Banner creado y asignado al cliente');
  };

  const handleToggle = (id) => {
    toggleBannerActive(id);
    setBanners(getAllBanners());
    if (onShowToast) onShowToast('Estado del banner actualizado');
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este banner publicitario?')) {
      deleteBanner(id);
      setBanners(getAllBanners());
      if (onShowToast) onShowToast('Banner eliminado');
    }
  };

  // Copiar especificaciones oficiales al portapapeles
  const handleCopySpecs = () => {
    const textSpecs = `
NEBLINA STEREO 105.5 FM - ESPECIFICACIONES TÉCNICAS OFICIALES DE BANNERS PUBLICITARIOS

1. COMPUTADORA Y TABLETS (DESKTOP)
- Proporción (Aspect Ratio): 4:1 (Ultra Panorámico) o 3:1
- Medida Estándar (1x): 1200 x 300 px
- Medida HD Retina (2x): 2400 x 600 px (Recomendada para máxima nitidez)
- Formatos: WebP (85-90% calidad), PNG-24 o JPG progresivo en espacio de color sRGB
- Peso máximo: < 450 KB (ideal < 280 KB para carga instantánea)

2. SMARTPHONES Y CELULARES (MÓVIL)
- Proporción: 2:1 (Panorámico móvil para pantallas de 360px a 430px)
- Medida Estándar (1x): 800 x 400 px
- Medida HD Retina (2x): 1600 x 800 px (Nitidez perfecta en OLED/Retina)
- Formatos: WebP (85%) o JPG optimizado
- Peso máximo: < 220 KB

3. VIDEOS PUBLICITARIOS EN BUCLE (SPOTS)
- Medidas: 1200 x 300 px (Desktop) / 800 x 400 px (Móvil)
- Formato y Códec: MP4 (H.264 / AVC) y WebM (VP9)
- Atributos obligatorios: Autoplay, Muted (Silenciado), Loop (Bucle), Playsinline
- Bitrate: 1.5 a 2.2 Mbps a 30 fps
- Audio: Sin pista de audio o silenciado (Requisito estricto de iOS WebKit y Android Chrome para auto-reproducción)
- Duración sugerida: 6 a 15 segundos
- Peso máximo: < 4.5 MB

4. BANNER EN CUADRÍCULA DE NOTICIAS (SALA DE PRENSA)
- Ocupa las celdas vacías de la última fila de la cuadrícula de noticias
- Ancho (ocupa 2 columnas en computadora): 800 x 400 px (1x) / 1600 x 800 px (2x Retina) - Proporción 2:1
- Cuadrado (1 columna en tablet/celular): 400 x 400 px (1x) / 800 x 800 px (2x Retina) - Proporción 1:1
- Formatos: WebP o JPG. Peso máximo: < 300 KB
- Mantener textos y logotipos en la zona segura central

5. ZONA SEGURA DE INTERACCIÓN (BOTÓN DE WHATSAPP)
- Anclaje: Cuadrante inferior derecho (Right: 20px, Bottom: 14px en computadoras)
- Margen libre: Dejar una caja de 280 x 65 px en la esquina inferior derecha 100% libre de logotipos o textos importantes para que el botón interactivo no tape información clave.
    `.trim();

    navigator.clipboard.writeText(textSpecs).then(() => {
      setCopiedSpecs(true);
      if (onShowToast) onShowToast('¡Especificaciones técnicas copiadas al portapapeles!');
      setTimeout(() => setCopiedSpecs(false), 3000);
    });
  };

  // Filtrado de banners por cliente
  const filteredBanners = filterClient === 'all'
    ? banners
    : filterClient === 'unassigned'
      ? banners.filter(b => !b.clientId)
      : banners.filter(b => String(b.clientId) === String(filterClient));

  // Métricas
  const totalViews = filteredBanners.reduce((acc, b) => acc + (b.viewsCount || 0), 0);
  const totalClicks = filteredBanners.reduce((acc, b) => acc + (b.clicksCount || 0), 0);
  const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ============================================================== */}
      {/* GUÍA TÉCNICA OFICIAL & DIMENSIONES SEGÚN DISPOSITIVO */}
      {/* ============================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl aeroglass-card border border-blue-500/20 dark:border-[#00DD9E]/30 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Emoji3D name="megaphone" className="w-10 h-10 flex-shrink-0" alt="Medidas" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-blue-600 text-white shadow-xs">
                  Especificaciones Oficiales Apple HIG
                </span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Calidad Sin Pérdida
                </span>
              </div>
              <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white mt-0.5">
                Medidas Exactas de Imágenes y Videos para Clientes
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
            >
              <span>{isSpecsExpanded ? '▲ Ocultar Medidas' : '▼ Ver Medidas Exactas'}</span>
            </button>
            <button
              onClick={handleCopySpecs}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs transition cursor-pointer"
              title="Copiar guía completa para enviar a diseñadores o clientes"
            >
              {copiedSpecs ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSpecs ? '¡Copiado!' : 'Copiar Ficha Técnica'}</span>
            </button>
          </div>
        </div>

        {isSpecsExpanded && (
        <div className="space-y-4 pt-2 border-t border-slate-200/80 dark:border-white/10 animate-fadeIn">
          {/* Pestañas de la guía: Especificaciones vs Zona Segura */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 pt-1 text-xs">
          {/* Formato Desktop */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold">
                <Monitor className="w-4 h-4" />
                <span>1. Computadora & Tablets</span>
              </div>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">4:1 / 3:1</span>
            </div>
            <div>
              <p className="font-mono font-black text-sm text-slate-900 dark:text-white">
                1200 x 300 px <span className="text-[11px] font-normal text-slate-500">(1x Estándar)</span>
              </p>
              <p className="font-mono font-bold text-xs text-emerald-600 dark:text-[#00DD9E]">
                2400 x 600 px <span className="text-[11px] font-normal text-slate-400">(2x Retina HD)</span>
              </p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Formatos: <strong>WebP (85-90%)</strong>, PNG-24 (para logos nítidos) o JPG progresivo en sRGB. Peso máx &lt; 450 KB.
            </p>
          </div>

          {/* Formato Móvil */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-[#00DD9E] font-bold">
                <Smartphone className="w-4 h-4" />
                <span>2. Celulares & Móviles</span>
              </div>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-[#00DD9E] font-bold">2:1</span>
            </div>
            <div>
              <p className="font-mono font-black text-sm text-slate-900 dark:text-white">
                800 x 400 px <span className="text-[11px] font-normal text-slate-500">(1x Estándar)</span>
              </p>
              <p className="font-mono font-bold text-xs text-emerald-600 dark:text-[#00DD9E]">
                1600 x 800 px <span className="text-[11px] font-normal text-slate-400">(2x OLED / Retina)</span>
              </p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Optimizado para celulares de 360px a 430px de ancho. Formatos: WebP (85%) o JPG. Peso máx &lt; 220 KB.
            </p>
          </div>

          {/* Formato Video */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-bold">
                <Film className="w-4 h-4" />
                <span>3. Videos en Bucle (Loop)</span>
              </div>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">MP4</span>
            </div>
            <div>
              <p className="font-mono font-black text-sm text-slate-900 dark:text-white">
                1200 x 300 px <span className="text-[11px] font-normal text-slate-500">(o 800x400)</span>
              </p>
              <p className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                Códec H.264 / WebM (VP9)
              </p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Autoplay silenciado en loop (obligatorio para iOS y Android). Bitrate 1.5-2.2 Mbps a 30 fps. Máx 4.5 MB.
            </p>
          </div>

          {/* Formato Cuadrícula de Noticias */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#001E4D] dark:text-[#00DD9E] font-bold">
                <Layers className="w-4 h-4" />
                <span>4. Banner en Cuadrícula de Noticias</span>
              </div>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold">2:1 / 1:1</span>
            </div>
            <div>
              <p className="font-mono font-black text-sm text-slate-900 dark:text-white">
                800 x 400 px <span className="text-[11px] font-normal text-slate-500">(Ancho, 2 columnas)</span>
              </p>
              <p className="font-mono font-bold text-xs text-emerald-600 dark:text-[#00DD9E]">
                1600 x 800 px <span className="text-[11px] font-normal text-slate-400">(2x Retina)</span>
              </p>
              <p className="font-mono font-black text-sm text-slate-900 dark:text-white mt-1">
                400 x 400 px <span className="text-[11px] font-normal text-slate-500">(Cuadrado, 1 columna)</span>
              </p>
              <p className="font-mono font-bold text-xs text-emerald-600 dark:text-[#00DD9E]">
                800 x 800 px <span className="text-[11px] font-normal text-slate-400">(2x Retina)</span>
              </p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Rellena la última fila de la Sala de Prensa. WebP o JPG, máx &lt; 300 KB. Textos y logos en la zona segura central.
            </p>
          </div>

          {/* Formato Smart TV */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold">
                <Monitor className="w-4 h-4" />
                <span>5. Banner Superior para Smart TV</span>
              </div>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">16:9 / 6:1</span>
            </div>
            <div>
              <p className="font-mono font-black text-sm text-slate-900 dark:text-white">
                1920 x 320 px <span className="text-[11px] font-normal text-slate-500">(1080p Full HD)</span>
              </p>
              <p className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                3840 x 640 px <span className="text-[11px] font-normal text-slate-400">(4K Ultra HD)</span>
              </p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Banner superior de la interfaz para televisores Smart TV. Formatos WebP o PNG-24 sin pixelado. Máx 600 KB.
            </p>
          </div>
        </div>

        {/* Zona Segura del Botón de WhatsApp */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start space-x-3 text-xs text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#00DD9E] mt-0.5 flex-shrink-0" />
          <div className="leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Zona Segura de Interacción (Botón WhatsApp / Más Info): </strong>
            Se sitúa en la <strong>esquina inferior derecha</strong> (Right: 20px, Bottom: 14px). 
            Se recomienda dejar una caja de <strong>280 x 65 px libre de logotipos o teléfonos</strong> en esa esquina para evitar que el botón interactivo los tape.
          </div>
        </div>
        </div>
      )}
      </div>

      {/* ============================================================== */}
      {/* FILTROS & BARRA DE ACCIÓN */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E] cursor-pointer"
            >
              <option value="all">Ver Banners de Todos los Clientes ({banners.length})</option>
              <option value="unassigned">Pautas Generales Neblina FM</option>
              {clients.map(c => {
                const count = banners.filter(b => String(b.clientId) === String(c.id)).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.businessName} ({count} {count === 1 ? 'banner' : 'banners'})
                  </option>
                );
              })}
            </select>
          </div>

          <span className="text-xs text-slate-500">
            {filteredBanners.length} {filteredBanners.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => {
              const targetId = filterClient !== 'all' && filterClient !== 'unassigned' ? filterClient : (clients[0]?.id || null);
              setReportClientId(targetId);
              setIsReportModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-500/25 text-xs font-black transition shadow-xs hover:opacity-90 active:scale-95 duration-200 flex items-center justify-center space-x-1.5 cursor-pointer"
            title="Generar informe individualizado de rendimiento publicitario por cliente"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Generar Informe de Cliente</span>
          </button>

          <button
            onClick={() => handleOpenCreate(filterClient !== 'all' && filterClient !== 'unassigned' ? filterClient : '')}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#001E4D] to-teal-800 dark:from-[#00DD9E] dark:to-teal-400 text-white dark:text-[#001E4D] text-xs font-black transition shadow-sm hover:opacity-90 active:scale-95 duration-200 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Banner a Cliente</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TARJETAS RESUMEN DE RENDIMIENTO DE BANNERS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" />Visualizaciones / Impresiones</span>
          <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1">
            {totalViews.toLocaleString('es-VE')}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-[#00DD9E] font-bold">Rotación fluida sin duplicados</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 inline-flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" />Clics en Botones (WhatsApp / Web)</span>
          <p className="font-display font-black text-2xl text-emerald-600 dark:text-[#00DD9E] mt-1">
            {totalClicks.toLocaleString('es-VE')}
          </p>
          <span className="text-[11px] text-slate-400">Conversiones directas registradas</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 inline-flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />Tasa de Clics (CTR)</span>
          <p className="font-display font-black text-2xl text-sky-600 dark:text-sky-400 mt-1">
            {avgCtr}%
          </p>
          <span className="text-[11px] text-slate-400">Rendimiento publicitario efectivo</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL CREAR / EDITAR BANNER (MULTI-IMAGEN & MULTI-VIDEO) */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div id="banner-form-inline" className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn my-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center space-x-2.5">
                <Megaphone className="w-6 h-6 text-[#00DD9E]" />
                <div>
                  <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                    {editingBanner ? 'Editar Banner Publicitario' : 'Crear Nuevo Banner para Cliente'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Soporte para 1 a 5 imágenes y 2 a 3 videos con medidas adaptadas para computadoras y móviles
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              
              {/* ASOCIACIÓN AL CLIENTE COMERCIAL */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-2">
                <label className="block font-bold text-slate-900 dark:text-white">
                  Cliente / Establecimiento Comercial Asociado:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={form.clientId}
                    onChange={(e) => handleClientSelectChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#19222e] border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                  >
                    <option value="">-- Pauta Institucional Neblina 105.5 FM --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} (RIF: {c.businessRif || 'N/A'})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Nombre comercial visible (ej. El Fogón del Páramo)"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#19222e] border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                  />
                </div>
              </div>

              {/* TÍTULO Y SUBTÍTULO */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Título Principal de la Publicidad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: ¡El Mejor Sabor Criollo y Carnes a la Brasa en Santo Domingo!"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subtítulo / Mensaje Promocional</label>
                  <input
                    type="text"
                    placeholder="Ej: Música en vivo los fines de semana, estacionamiento y vista panorámica."
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Distintivo / Badge</label>
                  <input
                    type="text"
                    placeholder="Ej: Restaurante Aliado, Patrocinador Premium, etc."
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                  />
                </div>
              </div>

              {/* ============================================================== */}
              {/* SECCIÓN 1: IMÁGENES DEL BANNER (1 A 5 IMÁGENES INDEPENDIENTES) */}
              {/* ============================================================== */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/20 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-[#00DD9E]" />
                    <span className="font-display font-black text-slate-900 dark:text-white">
                      Imágenes del Banner ({form.images.length}/5)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (Medidas: 1200x300 Desktop / 800x400 Móvil)
                    </span>
                  </div>

                  {form.images.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir Imagen</span>
                    </button>
                  )}
                </div>

                {form.images.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    No has agregado imágenes aún. Haz clic en "Añadir Imagen" para ingresar una o más fotos (hasta 5).
                  </p>
                ) : (
                  <div className="space-y-3">
                    {form.images.map((img, idx) => (
                      <div 
                        key={img.id || idx}
                        className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          <span className="flex items-center space-x-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-[#00DD9E] flex items-center justify-center font-mono text-[11px]">
                              {idx + 1}
                            </span>
                            <span>Imagen #{idx + 1}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="text-rose-500 hover:text-rose-600 font-bold inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">
                              <span className="inline-flex items-center gap-1"><Monitor className="w-3 h-3" /> URL Computadora (Desktop 1200x300 o 2400x600 px)</span>
                            </label>
                            <input
                              type="url"
                              placeholder="https://.../banner-desktop.webp"
                              value={img.desktopUrl}
                              onChange={(e) => handleUpdateImage(idx, 'desktopUrl', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#19222e] border border-slate-300 dark:border-white/10 font-mono text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">
                              <span className="inline-flex items-center gap-1"><Smartphone className="w-3 h-3" /> URL Celular (Móvil 800x400 o 1600x800 px - Opcional)</span>
                            </label>
                            <input
                              type="url"
                              placeholder="https://.../banner-movil.webp"
                              value={img.mobileUrl}
                              onChange={(e) => handleUpdateImage(idx, 'mobileUrl', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#19222e] border border-slate-300 dark:border-white/10 font-mono text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                            />
                          </div>
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Descripción de la foto (ej. Fachada, platos criollos, etc.)"
                            value={img.caption || ''}
                            onChange={(e) => handleUpdateImage(idx, 'caption', e.target.value)}
                            className="w-full px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#19222e] border border-slate-200 dark:border-white/5 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none"
                          />
                        </div>

                        {/* Miniatura previa si hay URL */}
                        {(img.desktopUrl || img.mobileUrl) && (
                          <div className="h-14 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 relative bg-slate-100 dark:bg-black/40">
                            <img 
                              src={img.desktopUrl || img.mobileUrl} 
                              alt="Vista previa" 
                              className="w-full h-full object-cover" 
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <span className="absolute bottom-1 right-2 text-[11px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white">
                              Vista previa
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ============================================================== */}
              {/* SECCIÓN 2: VIDEOS DEL BANNER (2 A 3 VIDEOS EN BUCLE) */}
              {/* ============================================================== */}
              <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-white/5 border border-purple-500/20 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Film className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-display font-black text-slate-900 dark:text-white">
                      Videos Publicitarios del Cliente ({form.videos.length}/3)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (MP4 H.264 / WebM silenciado)
                    </span>
                  </div>

                  {form.videos.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddVideo}
                      className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir Video</span>
                    </button>
                  )}
                </div>

                {form.videos.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    No has agregado videos aún. Puedes ingresar de 1 a 3 spots de video para reproducir en bucle.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {form.videos.map((vid, idx) => (
                      <div 
                        key={vid.id || idx}
                        className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          <span className="flex items-center space-x-1.5">
                            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-mono text-[11px]">
                              {idx + 1}
                            </span>
                            <span>Spot en Video #{idx + 1}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(idx)}
                            className="text-rose-500 hover:text-rose-600 font-bold inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-0.5">
                            <span className="inline-flex items-center gap-1"><Film className="w-3 h-3" /> URL del Video MP4 (H.264 / AAC o WebM - Máx 4.5 MB)</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://.../spot-publicitario.mp4"
                            value={vid.videoUrl}
                            onChange={(e) => handleUpdateVideo(idx, 'videoUrl', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#19222e] border border-slate-300 dark:border-white/10 font-mono text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Título del Spot (ej. Promo Almuerzos Ejecutivos, Rumba de Fin de Semana)"
                            value={vid.caption || ''}
                            onChange={(e) => handleUpdateVideo(idx, 'caption', e.target.value)}
                            className="w-full px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#19222e] border border-slate-200 dark:border-white/5 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none"
                          />
                        </div>

                        {/* Mini reproductor de prueba */}
                        {vid.videoUrl && (
                          <div className="h-16 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 relative bg-black/60">
                            <video
                              src={vid.videoUrl}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover opacity-60"
                            />
                            <span className="absolute bottom-1 right-2 text-[11px] font-bold px-1.5 py-0.5 rounded bg-purple-900/80 text-white">
                              Vista previa video loop
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BOTÓN INTERACTIVO Y UBICACIÓN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Texto del Botón (CTA)</label>
                  <input
                    type="text"
                    placeholder="Ej: Escribir a WhatsApp, Reservar Mesa, Ver Menú"
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ubicación del Banner</label>
                  <select
                    value={form.placements}
                    onChange={(e) => setForm({ ...form, placements: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="all">Todas las Ubicaciones (Web, Prensa y Smart TV)</option>
                    <option value="home">Solo en la Página de Inicio</option>
                    <option value="news">Solo en las Notas de Prensa</option>
                    <option value="news-grid">Cuadrícula de Sala de Prensa (Noticias)</option>
                    <option value="smart-tv">Banner Superior para Smart TV (Televisores)</option>
                  </select>
                </div>
              </div>

              {(form.placements === 'news-grid' || form.placements === 'all') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md">
                  <div>
                    <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <Monitor className="w-3.5 h-3.5" /> URL Banner Ancho (800x400 / 1600x800 px)
                    </label>
                    <input
                      type="url"
                      placeholder="https://.../banner-cuadricula-ancho.webp"
                      value={form.gridWideUrl || ''}
                      onChange={(e) => setForm({ ...form, gridWideUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-mono text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <Smartphone className="w-3.5 h-3.5" /> URL Banner Cuadrado (400x400 / 800x800 px)
                    </label>
                    <input
                      type="url"
                      placeholder="https://.../banner-cuadricula-cuadrado.webp"
                      value={form.gridSquareUrl || ''}
                      onChange={(e) => setForm({ ...form, gridSquareUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-mono text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>
                </div>
              )}

              {/* URL Específica para Smart TV Banner */}
              {(form.placements === 'smart-tv' || form.placements === 'all') && (
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
                  <label className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
                    <Monitor className="w-3.5 h-3.5 text-indigo-500" /> URL Banner Smart TV Panorámico (1920x320 px / 4K 3840x640 px)
                  </label>
                  <input
                    type="url"
                    placeholder="https://.../banner-smart-tv.webp"
                    value={form.tvBannerUrl || ''}
                    onChange={(e) => setForm({ ...form, tvBannerUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 font-mono text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Diseñado en ultra-alta resolución para reproducirse en la cabecera de la interfaz de televisores Smart TV (1080p / 4K).
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enlace del Botón (WhatsApp del Cliente o Enlace Web)
                </label>
                <input
                  type="text"
                  placeholder="https://wa.me/584247459774?text=..."
                  value={form.ctaLink}
                  onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="bannerActiveCheckbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="bannerActiveCheckbox" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Activar este banner de inmediato en la rotación de la web
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-md transition hover:opacity-90 active:scale-95 duration-200"
                >
                  {editingBanner ? 'Guardar Cambios' : 'Crear y Publicar Banner'}
                </button>
              </div>
            </form>
        </div>
      )}

      
      {/* ============================================================== */}
      {/* LISTADO DE BANNERS CON TARJETAS DETALLADAS */}
      {/* ============================================================== */}
      <div className="space-y-3">
        {filteredBanners.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 text-slate-500 space-y-2">
            <Megaphone className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
            <p className="text-sm font-bold">No hay banners publicitarios para este filtro.</p>
            <p className="text-xs">Crea un banner personalizado con hasta 5 imágenes y 3 videos para este cliente.</p>
          </div>
        ) : (
          filteredBanners.map((b, idx) => {
            const ctr = b.viewsCount > 0 ? (((b.clicksCount || 0) / b.viewsCount) * 100).toFixed(1) : '0.0';
            const imgCount = b.images?.length || (b.mediaUrl && b.type !== 'video' ? 1 : 0);
            const vidCount = b.videos?.length || (b.mediaUrl && b.type === 'video' ? 1 : 0);
            const clientObj = clients.find(c => String(c.id) === String(b.clientId));

            return (
              <div
                key={b.id || idx}
                className={`p-4 rounded-2xl bg-white dark:bg-[#19222e] border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs ${
                  b.active 
                    ? 'border-slate-200 dark:border-white/10 hover:border-[#00DD9E]/40' 
                    : 'border-slate-200 dark:border-white/5 opacity-60 bg-slate-50 dark:bg-black/20'
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    {vidCount > 0 ? (
                      <Video className="w-6 h-6 text-purple-500" />
                    ) : b.images?.[0]?.desktopUrl || b.mediaUrl ? (
                      <img 
                        src={b.images?.[0]?.desktopUrl || b.images?.[0]?.mobileUrl || b.mediaUrl} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Emoji3D name="megaphone" className="w-8 h-8" alt="Pauta" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-[#00DD9E]">
                        {b.badge || 'Pauta'}
                      </span>

                      {/* Cliente asociado */}
                      {clientObj ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <UserCheck className="w-3 h-3 text-emerald-500" />
                          <span>{clientObj.businessName}</span>
                        </span>
                      ) : b.clientName ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                          <span>{b.clientName}</span>
                        </span>
                      ) : null}

                      {/* Conteo de recursos multiformato */}
                      {imgCount > 0 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold inline-flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3 text-emerald-500" />
                          <span>{imgCount} {imgCount === 1 ? 'imagen' : 'imágenes'}</span>
                        </span>
                      )}

                      {vidCount > 0 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold inline-flex items-center space-x-1">
                          <Film className="w-3 h-3 text-purple-500" />
                          <span>{vidCount} {vidCount === 1 ? 'video' : 'videos'}</span>
                        </span>
                      )}

                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-500 font-medium">
                        {b.placements === 'home' ? 'Solo Inicio' : b.placements === 'news' ? 'Solo Prensa' : b.placements === 'news-grid' ? 'Cuadrícula Noticias' : 'Inicio + Prensa'}
                      </span>
                    </div>

                    <h5 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                      {b.title}
                    </h5>

                    {b.subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{b.subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Métricas del Banner y Acciones */}
                <div className="flex items-center space-x-4 self-end md:self-center flex-shrink-0">
                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Vistas</span>
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{b.viewsCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Clics</span>
                      <span className="font-mono font-bold text-xs text-emerald-600 dark:text-[#00DD9E]">{b.clicksCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">CTR</span>
                      <span className="font-mono font-bold text-xs text-sky-500">{ctr}%</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200 dark:border-white/10">
                    {b.clientId && (
                      <button
                        onClick={() => {
                          setReportClientId(b.clientId);
                          setIsReportModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl hover:bg-blue-500/10 text-blue-500 transition cursor-pointer"
                        title="Generar Informe Publicitario Oficial de este Cliente"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleToggle(b.id)}
                      className={`p-1.5 rounded-xl transition cursor-pointer ${
                        b.active 
                          ? 'text-emerald-500 hover:bg-emerald-500/10' 
                          : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                      title={b.active ? 'Desactivar banner' : 'Activar banner'}
                    >
                      {b.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      title="Editar Banner"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                      title="Eliminar Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL DE INFORME DETALLADO DE CLIENTE */}
      {/* ============================================================== */}
      <ClientAdReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        clientId={reportClientId}
        onShowToast={onShowToast}
      />

    </div>
  );
}
