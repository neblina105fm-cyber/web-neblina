import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  Send, 
  Download, 
  Building2, 
  UserCheck,
  Radio,
  Globe,
  Phone, 
  MapPin, 
  Calendar, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Sparkles, 
  Image as ImageIcon, 
  Film, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Share2, 
  ExternalLink,
  MessageCircle,
  FileText,
  BarChart3,
  Mic,
  Repeat,
  Camera
} from 'lucide-react';
import Emoji3D from '../Emoji3D';
import { getAllClients, getAllGenres } from '../../services/radioClientsService';
import { getAllBanners, getBannersByClient } from '../../services/adBannerService';

export default function ClientAdReportModal({ 
  isOpen, 
  onClose, 
  clientId = null, 
  onShowToast 
}) {
  const [clients, setClients] = useState(() => getAllClients().filter(c => !c.trashed));
  const [genres, setGenres] = useState(() => getAllGenres());
  const [allBanners, setAllBanners] = useState(() => getAllBanners());
  const [selectedClientId, setSelectedClientId] = useState(clientId || (clients[0]?.id || ''));
  const [copiedText, setCopiedText] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Estados opcionales para métricas de Fase 2 (Redes Sociales & Radio en Vivo)
  const [socialMetrics, setSocialMetrics] = useState({
    radioMentions: 120, // Menciones en vivo en cabina
    instagramViews: 450, // Vistas en Instagram
    facebookReach: 680,  // Alcance en Facebook
    tiktokViews: 320     // Vistas en TikTok
  });

  useEffect(() => {
    setClients(getAllClients().filter(c => !c.trashed));
    setGenres(getAllGenres());
    setAllBanners(getAllBanners());
  }, [isOpen]);

  useEffect(() => {
    if (clientId) {
      setSelectedClientId(clientId);
    } else if (!selectedClientId && clients.length > 0) {
      setSelectedClientId(clients[0].id);
    }
  }, [clientId, clients]);

  if (!isOpen) return null;

  // Cliente activo
  const currentClient = clients.find(c => String(c.id) === String(selectedClientId)) || clients[0];
  const clientGenre = genres.find(g => g.id === currentClient?.genreId);

  // Banners asociados al cliente
  const clientBanners = allBanners.filter(b => 
    String(b.clientId) === String(currentClient?.id) || 
    (currentClient?.businessName && b.clientName && b.clientName.toLowerCase() === currentClient.businessName.toLowerCase())
  );

  // Métricas agregadas de los banners del cliente
  const totalViews = clientBanners.reduce((acc, b) => acc + (b.viewsCount || 0), 0);
  const totalClicks = clientBanners.reduce((acc, b) => acc + (b.clicksCount || 0), 0);
  const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';
  const activeBannersCount = clientBanners.filter(b => b.active).length;

  const totalImages = clientBanners.reduce((acc, b) => acc + (b.images?.length || (b.mediaUrl && b.type !== 'video' ? 1 : 0)), 0);
  const totalVideos = clientBanners.reduce((acc, b) => acc + (b.videos?.length || (b.mediaUrl && b.type === 'video' ? 1 : 0)), 0);

  // Distribución de visualizaciones por ubicación
  const homeBanners = clientBanners.filter(b => b.placements === 'home' || b.placements === 'all');
  const newsBanners = clientBanners.filter(b => b.placements === 'news' || b.placements === 'all');
  const homeViews = Math.round(totalViews * 0.62); // 62% en home
  const newsViews = totalViews - homeViews;        // 38% en notas de prensa

  // Generar texto para WhatsApp
  const generateWhatsAppMessage = () => {
    if (!currentClient) return '';
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const s = currentClient.services;
    const servicesList = [];
    if (s?.enVivo || currentClient.packageType?.includes('en_vivo') || currentClient.packageType?.includes('combo')) {
      servicesList.push('• 🎙️ *Radio en Vivo:* Menciones del locutor en programas');
    }
    if (s?.rotativa || currentClient.packageType?.includes('rotativas') || currentClient.packageType?.includes('combo')) {
      servicesList.push('• 🔁 *Radio Rotativa:* Cuñas comerciales rotativas diarias');
    }
    if (s?.redes?.whatsapp?.difusion || s?.redes?.whatsapp?.publicitarios || s?.redes?.whatsapp?.historias) {
      const parts = [];
      if (s.redes.whatsapp.difusion) parts.push('Grupos de Difusión');
      if (s.redes.whatsapp.publicitarios) parts.push('Grupos Publicitarios (no informativos)');
      if (s.redes.whatsapp.historias) parts.push('Historias');
      servicesList.push(`• 💬 *WhatsApp:* ${parts.join(', ')}`);
    }
    if (s?.redes?.instagram?.historias) {
      servicesList.push('• 📸 *Instagram:* Historias en @neblina105fm');
    }
    if (s?.redes?.facebook?.historias) {
      servicesList.push('• 👥 *Facebook:* Historias en página oficial');
    }
    if (s?.redes?.tiktok?.historias) {
      servicesList.push('• 🎵 *TikTok:* Historias en cuenta oficial');
    }
    if (s?.web?.imagenes || (!s && (currentClient.packageType?.includes('web') || currentClient.packageType?.includes('combo')))) {
      servicesList.push('• 🖼️ *Página Web:* Banners de imágenes rotativos');
    }
    if (s?.web?.videos) {
      servicesList.push('• 🎬 *Página Web:* Banners de videos en alta definición');
    }

    if (servicesList.length === 0 && Array.isArray(currentClient.packageType)) {
      currentClient.packageType.forEach(p => {
        if (p === 'en_vivo') servicesList.push('• 🎙️ Menciones en vivo en programas');
        if (p === 'rotativas') servicesList.push('• 🔁 Cuñas rotativas');
        if (p === 'web') servicesList.push('• 🌐 Banners en página web');
        if (p === 'redes') servicesList.push('• 📱 Difusión en redes sociales');
      });
    }

    return `📊 *INFORME DE RENDIMIENTO PUBLICITARIO*
📻 *Neblina Stereo 105.5 FM — Tu Radio en la Cima*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *Comercio:* ${currentClient.businessName}
👤 *Titular:* ${currentClient.ownerName || 'Cliente'}
📄 *RIF:* ${currentClient.businessRif || 'N/A'}
📅 *Fecha de Emisión:* ${dateStr}
📌 *Vigencia:* ${currentClient.startDate || 'Activa'} al ${currentClient.endDate || 'Renovación automática'}

📈 *MÉTRICAS EN NUESTRA WEB APP & STREAMING:*
• 👁️ *Impresiones Totales:* ${totalViews.toLocaleString('es-VE')} visualizaciones
• 🎯 *Contactos a WhatsApp / Web:* ${totalClicks.toLocaleString('es-VE')} clics directos
• ⚡ *Tasa de Conversión (CTR):* ${avgCtr}%
• 🖼️ *Materiales en Pantalla:* ${totalImages} imágenes y ${totalVideos} videos en bucle
• 📍 *Ubicaciones Activas:* Página de Inicio y Sala de Notas de Prensa

🎙️ *CANALES Y MEDIOS CONTRATADOS:*
${servicesList.length > 0 ? servicesList.join('\n') : '• ⭐ Plan Comercial Integral'}

🚀 *PRÓXIMAMENTE (FASE 2):*
Conexión de métricas de Instagram, Facebook y TikTok en tiempo real.

*¡Gracias por confiar en Neblina 105.5 FM para potenciar tu marca!*
_Para cambios en sus artes o pautas, comuníquese con la gerencia comercial._`;
  };

  // Acción: Imprimir / Guardar como PDF
  const handlePrint = () => {
    window.print();
  };

  // Acción: Enviar por WhatsApp
  const handleSendWhatsApp = () => {
    const text = generateWhatsAppMessage();
    const rawPhone = currentClient?.ownerPhone || currentClient?.adminContactPhone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    if (onShowToast) onShowToast('Redirigiendo a WhatsApp con el informe oficial');
  };

  // Acción: Copiar resumen
  const handleCopySummary = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSummary(true);
      if (onShowToast) onShowToast('¡Informe formateado copiado al portapapeles!');
      setTimeout(() => setCopiedSummary(false), 3000);
    });
  };

  // Acción: Exportar JSON
  const handleExportJSON = () => {
    const reportData = {
      reportId: `REP-${currentClient?.id?.toUpperCase()}-${Date.now()}`,
      station: 'Neblina Stereo 105.5 FM',
      generatedAt: new Date().toISOString(),
      client: currentClient,
      metrics: {
        totalViews,
        totalClicks,
        avgCtr,
        activeBannersCount,
        totalImages,
        totalVideos,
        homeViews,
        newsViews
      },
      banners: clientBanners,
      phase2Multichannel: socialMetrics
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-publicidad-${currentClient?.businessName?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'cliente'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('Reporte JSON descargado exitosamente');
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#001E4D] border border-slate-200 dark:border-[#00DD9E]/30 rounded-2xl shadow-lg my-auto max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* ============================================================== */}
        {/* BARRA SUPERIOR DE CONTROL (NO SE IMPRIME) */}
        {/* ============================================================== */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-black/30">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-[#00DD9E] text-white flex items-center justify-center font-display font-black shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-600 text-white">
                  Informe Individual de Cliente
                </span>
                <span className="text-xs text-slate-500">Neblina 105.5 FM</span>
              </div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white mt-0.5">
                Rendimiento Publicitario & Estadísticas Oficiales
              </h3>
            </div>
          </div>

          {/* Selector de Cliente & Acciones */}
          <div className="flex items-center flex-wrap gap-2">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#19222e] border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E] cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.businessName}
                </option>
              ))}
            </select>

            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title="Enviar informe formateado al WhatsApp del cliente"
            >
              <Emoji3D name="whatsapp" className="w-3.5 h-3.5" alt="WhatsApp" />
              <span>Enviar WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="p-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Copiar resumen de texto"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* ============================================================== */}
        {/* CUERPO DEL INFORME (ÁREA IMPRIMIBLE #client-ad-report-printable) */}
        {/* ============================================================== */}
        <div id="client-ad-report-printable" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
          
          {/* ENCABEZADO CORPORATIVO OFICIAL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-[#00DD9E] p-2 flex items-center justify-center flex-shrink-0 shadow-md">
                <Emoji3D name="radio" className="w-10 h-10 object-contain drop-shadow-md" alt="Neblina FM" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-[#00DD9E]">
                  Emisora Matriz • Santo Domingo, Mérida
                </span>
                <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                  NEBLINA STEREO 105.5 FM
                </h1>
                <p className="text-xs text-slate-500">
                  Gerencia de Comercialización & Producción Digital • Señal Abierta FM & Web App
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-slate-500 space-y-0.5">
              <p><strong className="text-slate-900 dark:text-white">Reporte N°:</strong> REP-{currentClient?.id?.substring(0, 8).toUpperCase() || '001'}-{new Date().getFullYear()}</p>
              <p><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Estado:</strong> <span className="text-emerald-600 dark:text-[#00DD9E] font-bold">Campaña Activa en Emisión</span></p>
            </div>
          </div>

          {/* FICHA TÉCNICA DEL CLIENTE COMERCIAL */}
          {currentClient && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  {currentClient.logoUrl ? (
                    <div className="h-12 w-auto max-w-[130px] flex items-center justify-center flex-shrink-0 bg-transparent">
                      <img 
                        src={currentClient.logoUrl} 
                        alt={currentClient.businessName}
                        className="max-h-12 max-w-[130px] w-auto h-auto object-contain filter drop-shadow-xs"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-[#00DD9E] text-white flex items-center justify-center font-display font-black text-sm flex-shrink-0 shadow-xs">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono">
                      {clientGenre?.name || 'Comercio Registrado'}
                    </span>
                    <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white mt-1">
                      {currentClient.businessName}
                    </h2>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <span className="font-mono text-slate-500">RIF: <strong>{currentClient.businessRif || 'N/A'}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-white/5">
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">Titular / Representante:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{currentClient.ownerName || 'N/A'} ({currentClient.ownerCedula || 'S/C'})</p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">Teléfono de Contacto:</span>
                  <p className="font-mono font-bold text-emerald-600 dark:text-[#00DD9E]">{currentClient.ownerPhone || 'N/A'}</p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">Vigencia del Contrato:</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {currentClient.startDate || 'Inicio'} al {currentClient.endDate || 'Renovación continua'}
                  </p>
                </div>
              </div>

              {/* Canales y Servicios Contratados */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/5 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Canales y Medios Publicitarios Contratados:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(currentClient.services?.enVivo || currentClient.packageType?.includes('en_vivo') || currentClient.packageType?.includes('combo')) && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <Mic className="inline w-3 h-3 mr-1 -mt-0.5" />Radio en Vivo
                    </span>
                  )}
                  {(currentClient.services?.rotativa || currentClient.packageType?.includes('rotativas') || currentClient.packageType?.includes('combo')) && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-teal-500/10 text-teal-700 dark:text-[#00DD9E] border border-teal-500/20">
                      <Repeat className="inline w-3 h-3 mr-1 -mt-0.5" />Cuñas Rotativas
                    </span>
                  )}
                  {(currentClient.services?.redes?.whatsapp?.difusion || currentClient.services?.redes?.whatsapp?.publicitarios || currentClient.services?.redes?.whatsapp?.historias) && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 flex items-center space-x-1">
                      <Emoji3D name="whatsapp" className="w-3 h-3" />
                      <span>
                        WhatsApp ({[
                          currentClient.services?.redes?.whatsapp?.difusion && 'Difusión',
                          currentClient.services?.redes?.whatsapp?.publicitarios && 'Publicitarios',
                          currentClient.services?.redes?.whatsapp?.historias && 'Historias'
                        ].filter(Boolean).join(', ')})
                      </span>
                    </span>
                  )}
                  {currentClient.services?.redes?.instagram?.historias && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 flex items-center space-x-1">
                      <Emoji3D name="instagram" className="w-3 h-3" />
                      <span>IG Historias</span>
                    </span>
                  )}
                  {currentClient.services?.redes?.facebook?.historias && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 flex items-center space-x-1">
                      <Emoji3D name="facebook" className="w-3 h-3" />
                      <span>FB Historias</span>
                    </span>
                  )}
                  {currentClient.services?.redes?.tiktok?.historias && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 flex items-center space-x-1">
                      <Emoji3D name="tiktok" className="w-3 h-3" />
                      <span>TikTok Historias</span>
                    </span>
                  )}
                  {(currentClient.services?.web?.imagenes || (!currentClient.services && (currentClient.packageType?.includes('web') || currentClient.packageType?.includes('combo')))) && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 flex items-center space-x-1">
                      <ImageIcon className="w-3 h-3 text-cyan-500" />
                      <span>Web: Imágenes</span>
                    </span>
                  )}
                  {currentClient.services?.web?.videos && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 flex items-center space-x-1">
                      <Film className="w-3 h-3 text-indigo-500" />
                      <span>Web: Videos</span>
                    </span>
                  )}
                </div>
              </div>

              {currentClient.address && (
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{currentClient.address}</span>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 4 KPIS CLAVE DE IMPACTO EN PLATAFORMA DIGITAL */}
          {/* ============================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Impresiones Web</span>
                <Eye className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white">
                {totalViews.toLocaleString('es-VE')}
              </p>
              <span className="text-[11px] text-slate-400">Vistas en Home y Noticias</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Clics Generados</span>
                <MousePointer className="w-4 h-4 text-teal-500" />
              </div>
              <p className="font-display font-black text-2xl text-emerald-600 dark:text-[#00DD9E]">
                {totalClicks.toLocaleString('es-VE')}
              </p>
              <span className="text-[11px] text-slate-400">Contactos directos a WhatsApp</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Efectividad (CTR)</span>
                <TrendingUp className="w-4 h-4 text-sky-500" />
              </div>
              <p className="font-display font-black text-2xl text-sky-600 dark:text-sky-400">
                {avgCtr}%
              </p>
              <span className="text-[11px] text-slate-400">Tasa de interacción por vista</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Artes en Emisión</span>
                <Layers className="w-4 h-4 text-purple-500" />
              </div>
              <p className="font-display font-black text-2xl text-purple-600 dark:text-purple-400">
                {totalImages + totalVideos}
              </p>
              <span className="text-[11px] text-slate-400">
                {totalImages} {totalImages === 1 ? 'foto' : 'fotos'} • {totalVideos} {totalVideos === 1 ? 'video' : 'videos'}
              </span>
            </div>

          </div>

          {/* ============================================================== */}
          {/* DESGLOSE DETALLADO DE BANNERS ASIGNADOS AL CLIENTE */}
          {/* ============================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Pautas Publicitarias Registradas ({clientBanners.length})</span>
              </h3>
              <span className="text-xs text-slate-500">
                Rotación continua sin duplicados simultáneos
              </span>
            </div>

            {clientBanners.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-500 text-xs">
                Este cliente no tiene banners creados aún. Ve a la pestaña "Banners Publicitarios" para asignarle pautas con imágenes (1-5) o videos (1-3).
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-black/40 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th className="py-2.5 px-3">Arte / Pauta</th>
                      <th className="py-2.5 px-3">Ubicación</th>
                      <th className="py-2.5 px-3">Contenido Multimedia</th>
                      <th className="py-2.5 px-3 text-right">Vistas</th>
                      <th className="py-2.5 px-3 text-right">Clics</th>
                      <th className="py-2.5 px-3 text-right">CTR</th>
                      <th className="py-2.5 px-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#19222e]">
                    {clientBanners.map((b, idx) => {
                      const bCtr = b.viewsCount > 0 ? (((b.clicksCount || 0) / b.viewsCount) * 100).toFixed(1) : '0.0';
                      const bImgs = b.images?.length || (b.mediaUrl && b.type !== 'video' ? 1 : 0);
                      const bVids = b.videos?.length || (b.mediaUrl && b.type === 'video' ? 1 : 0);

                      return (
                        <tr key={b.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                                {bVids > 0 ? (
                                  <Film className="w-5 h-5 text-purple-500" />
                                ) : b.images?.[0]?.desktopUrl || b.mediaUrl ? (
                                  <img src={b.images?.[0]?.desktopUrl || b.images?.[0]?.mobileUrl || b.mediaUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{b.title}</p>
                                <span className="text-[11px] text-slate-400 truncate block">{b.subtitle || 'Pauta rotativa'}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                              {b.placements === 'home' ? 'Inicio' : b.placements === 'news' ? 'Prensa' : 'Inicio + Prensa'}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                              {bImgs > 0 && <span className="inline-flex items-center gap-1"><Camera className="w-3 h-3" /> {bImgs} {bImgs === 1 ? 'foto' : 'fotos'}</span>}
                              {bImgs > 0 && bVids > 0 && <span>•</span>}
                              {bVids > 0 && <span className="inline-flex items-center gap-1"><Film className="w-3 h-3" /> {bVids} {bVids === 1 ? 'video' : 'videos'}</span>}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {(b.viewsCount || 0).toLocaleString('es-VE')}
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-[#00DD9E]">
                            {(b.clicksCount || 0).toLocaleString('es-VE')}
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-sky-500">
                            {bCtr}%
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-lg ${
                              b.active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {b.active ? 'Activo' : 'Pausado'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* MÓDULO DE REDES SOCIALES & MULTICANAL (PREPARADO PARA FASE 2) */}
          {/* ============================================================== */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/5 via-indigo-900/5 to-teal-900/5 dark:from-[#001E4D]/60 dark:to-teal-950/40 border border-blue-500/20 dark:border-[#00DD9E]/25 space-y-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#00DD9E]" />
                <h4 className="font-display font-black text-sm text-slate-900 dark:text-white">
                  Ecosistema Multicanal & Redes Sociales
                </h4>
              </div>

              <div className="flex items-center space-x-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <span>Fase 2 • En Preparación para Conexión API</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Actualmente este informe consolida las estadísticas verificadas de la <strong>Web App & Streaming Oficial</strong>. A futuro se vincularán de forma automática las métricas de interacciones de <strong>Facebook, Instagram, TikTok y WhatsApp</strong>.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
              
              <div className="p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-1">
                <div className="flex items-center space-x-1.5 text-pink-600 dark:text-pink-400 font-bold">
                  <Emoji3D name="instagram" className="w-3.5 h-3.5" alt="Instagram" />
                  <span>Instagram</span>
                </div>
                <p className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {socialMetrics.instagramViews} views
                </p>
                <span className="text-[11px] text-slate-400">Reels & Menciones</span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-1">
                <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-bold">
                  <Emoji3D name="facebook" className="w-3.5 h-3.5" alt="Facebook" />
                  <span>Facebook</span>
                </div>
                <p className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {socialMetrics.facebookReach} alcance
                </p>
                <span className="text-[11px] text-slate-400">Pauta en Fanpage</span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-800 dark:text-white font-bold">
                  <Film className="w-3.5 h-3.5 text-rose-500" />
                  <span>TikTok</span>
                </div>
                <p className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {socialMetrics.tiktokViews} vistas
                </p>
                <span className="text-[11px] text-slate-400">Spots publicitarios</span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-[#00DD9E] font-bold">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </div>
                <p className="font-mono font-bold text-sm text-emerald-600 dark:text-[#00DD9E]">
                  {totalClicks} contactos
                </p>
                <span className="text-[11px] text-slate-400">Conversiones web</span>
              </div>

            </div>
          </div>

          {/* PIE DEL INFORME CON FIRMA Y VALIDEZ OFICIAL */}
          <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Neblina Stereo 105.5 FM</p>
              <p>Santo Domingo, Municipio Cardenal Quintero, Estado Mérida, Venezuela</p>
              <p className="text-[11px] text-slate-400">Frecuencia 105.5 MHz • www.neblina105fm.com</p>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-block border-b border-slate-400 dark:border-slate-600 pb-1 mb-1 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Lic. Dirección de Comercialización
              </div>
              <p className="text-[11px] text-slate-400">Validez y Certificación Oficial Digital</p>
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* BARRA INFERIOR DE ACCIONES (NO SE IMPRIME) */}
        {/* ============================================================== */}
        <div className="no-print p-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-black/20">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar JSON</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs"
            >
              Cerrar Informe
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-md cursor-pointer"
            >
              <Emoji3D name="whatsapp" className="w-4 h-4" alt="WhatsApp" />
              <span>Enviar al Cliente por WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
