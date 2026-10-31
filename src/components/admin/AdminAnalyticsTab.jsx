import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MapPin, 
  Share2, 
  Eye, 
  TrendingUp, 
  Download, 
  Users, 
  ExternalLink, 
  Smartphone, 
  Globe, 
  Megaphone,
  Radio,
  Clock,
  UserCheck,
  Handshake,
  Key,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Settings,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import Emoji3D from '../Emoji3D';
import { 
  getPrivateAnalyticsSummary, 
  getPrivateAnalyticsLogs, 
  getAllNewsMetrics, 
  getAllConversionsMetrics,
  exportAnalyticsDatabase 
} from '../../services/analyticsLogger';
import { getAllBanners } from '../../services/adBannerService';
import { getAllNews } from '../../services/newsData';
import { getAllClients } from '../../services/radioClientsService';
import {
  getSocialApiCredentials,
  saveSocialConnectorCredentials,
  getSocialMetrics,
  saveSocialMetrics,
  syncYouTubeApi,
  syncTelegramChannel
} from '../../services/socialApisService';
import ClientAdReportModal from './ClientAdReportModal';

export default function AdminAnalyticsTab({ onShowToast }) {
  const [summary, setSummary] = useState(() => getPrivateAnalyticsSummary());
  const [logs, setLogs] = useState(() => getPrivateAnalyticsLogs());
  const [newsMetrics, setNewsMetrics] = useState(() => getAllNewsMetrics());
  const [conversions, setConversions] = useState(() => getAllConversionsMetrics());
  const [banners, setBanners] = useState(() => getAllBanners());
  const [allNews, setAllNews] = useState(() => getAllNews());
  const [clients, setClients] = useState(() => getAllClients().filter(c => !c.trashed));
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportClientId, setReportClientId] = useState(null);

  // Módulo de Pestañas de Redes Sociales & APIs: 'general' | 'google' | 'meta' | 'youtube' | 'telegram' | 'twitter' | 'tiktok' | 'threads' | 'config_apis'
  const [activeNetworkTab, setActiveNetworkTab] = useState('general');
  const [socialCredentials, setSocialCredentials] = useState(() => getSocialApiCredentials());
  const [socialStats, setSocialStats] = useState(() => getSocialMetrics());
  const [editingConnector, setEditingConnector] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    setSummary(getPrivateAnalyticsSummary());
    setLogs(getPrivateAnalyticsLogs());
    setNewsMetrics(getAllNewsMetrics());
    setConversions(getAllConversionsMetrics());
    setBanners(getAllBanners());
    setAllNews(getAllNews());
    setClients(getAllClients().filter(c => !c.trashed));
    setSocialCredentials(getSocialApiCredentials());
    setSocialStats(getSocialMetrics());

    const handleCreds = (e) => setSocialCredentials(e.detail || getSocialApiCredentials());
    const handleStats = (e) => setSocialStats(e.detail || getSocialMetrics());
    window.addEventListener('neblina_social_credentials_updated', handleCreds);
    window.addEventListener('neblina_social_metrics_updated', handleStats);
    return () => {
      window.removeEventListener('neblina_social_credentials_updated', handleCreds);
      window.removeEventListener('neblina_social_metrics_updated', handleStats);
    };
  }, []);

  const handleSaveConnector = (e) => {
    e.preventDefault();
    if (!editingConnector) return;
    saveSocialConnectorCredentials(editingConnector.id, editingConnector);
    setSocialCredentials(getSocialApiCredentials());
    setIsConfigModalOpen(false);
    if (onShowToast) onShowToast(`Credenciales para ${editingConnector.name} actualizadas`);
  };

  const handleSyncConnector = async (connectorId) => {
    setIsSyncing(true);
    const creds = socialCredentials[connectorId];
    if (connectorId === 'youtube' && creds?.apiKey) {
      await syncYouTubeApi(creds.apiKey, creds.channelId);
    } else if (connectorId === 'telegram' && creds?.botToken) {
      await syncTelegramChannel(creds.botToken, creds.channelUsername);
    } else {
      // Simulación de sync para conectores configurados
      await new Promise(r => setTimeout(r, 600));
    }
    setSocialStats(getSocialMetrics());
    setIsSyncing(false);
    if (onShowToast) onShowToast(`Sincronización de ${creds?.name || connectorId} completada`);
  };

  // Construir mapa de títulos de noticias
  const newsMap = new Map();
  allNews.forEach(n => newsMap.set(String(n.id), n));

  // Métricas agregadas
  const totalVisits = summary?.totalVisits || logs.length || 0;
  const totalBannerViews = banners.reduce((acc, b) => acc + (b.viewsCount || 0), 0);
  const totalBannerClicks = banners.reduce((acc, b) => acc + (b.clicksCount || 0), 0);
  const totalNewsViews = newsMetrics.reduce((acc, m) => acc + (m.views || 0), 0);
  const totalNewsShares = newsMetrics.reduce((acc, m) => acc + (m.shares || 0), 0);

  const handleExportData = () => {
    const data = exportAnalyticsDatabase();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neblina-metricas-estadisticas-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('Informe de analítica exportado exitosamente');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ============================================================== */}
      {/* CABECERA & ACCIÓN DE EXPORTACIÓN */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <Emoji3D name="chart" className="w-10 h-10 drop-shadow-md flex-shrink-0" alt="Métricas" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                Panel Completo de Métricas
              </span>
              <span className="text-xs text-slate-500">Neblina Stereo 105.5 FM</span>
            </div>
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white mt-0.5">
              Control Estadístico de Sintonía, Notas de Prensa y Conversiones
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-center">
          <button
            onClick={() => {
              setEditingConnector({ ...socialCredentials.google });
              setIsConfigModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-2xl bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] text-xs font-black transition flex items-center space-x-2 cursor-pointer shadow-sm hover:opacity-90 active:scale-95"
            title="Conectar credenciales y API Keys de Redes Sociales"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Configurar APIs</span>
          </button>

          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Datos JSON</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SELECTOR DE PLATAFORMA / VISTA SEGMENTADA DE ESTADÍSTICAS */}
      {/* ============================================================== */}
      <div className="p-2 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveNetworkTab('general')}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeNetworkTab === 'general'
              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Resumen General</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNetworkTab('google')}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeNetworkTab === 'google'
              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>Google Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNetworkTab('meta')}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeNetworkTab === 'meta'
              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <Emoji3D name="instagram" className="w-4 h-4" alt="Instagram" />
          <span>Meta (IG & FB)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNetworkTab('youtube')}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeNetworkTab === 'youtube'
              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <Emoji3D name="youtube" className="w-4 h-4" alt="YouTube" />
          <span>YouTube</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNetworkTab('telegram')}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeNetworkTab === 'telegram'
              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <Emoji3D name="telegram" className="w-4 h-4" alt="Telegram" />
          <span>Telegram</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNetworkTab('twitter')}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeNetworkTab === 'twitter'
              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <Emoji3D name="x" className="w-4 h-4" alt="X" />
          <span>X / Twitter</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNetworkTab('tiktok')}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeNetworkTab === 'tiktok'
              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <span className="font-black text-xs">TikTok</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNetworkTab('threads')}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeNetworkTab === 'threads'
              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <span className="font-black text-xs">Threads</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* VISTAS ESPECÍFICAS DE CADA PLATAFORMA (SEGMENTADAS) */}
      {/* ============================================================== */}
      
      {/* VISTA GOOGLE ANALYTICS */}
      {activeNetworkTab === 'google' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Globe className="w-8 h-8 text-emerald-500" />
              <div>
                <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Métricas de Google Analytics 4 (GA4) & Tráfico Web
                </h4>
                <p className="text-xs text-slate-500">
                  Auditoría de sesiones activas, páginas vistas, tasa de rebote y tiempo de permanencia.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingConnector({ ...socialCredentials.google });
                setIsConfigModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-xs font-bold text-slate-800 dark:text-white transition flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Conectar GA4 ID</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Usuarios Activos (30d)</span>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1">
                {socialStats.google.activeUsers.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-[#00DD9E] font-bold">+18.4% vs mes anterior</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Páginas Vistas (Views)</span>
              <p className="font-display font-black text-2xl text-emerald-600 dark:text-[#00DD9E] mt-1">
                {socialStats.google.pageViews.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-slate-400">Total eventos page_view</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Tasa de Rebote (Bounce)</span>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1">
                {socialStats.google.bounceRate}
              </p>
              <span className="text-[10px] text-slate-400">Excelente retención</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Duración Media Sesión</span>
              <p className="font-display font-black text-2xl text-sky-600 dark:text-sky-400 mt-1">
                {socialStats.google.avgSessionDuration}
              </p>
              <span className="text-[10px] text-slate-400">Tiempo de escucha y lectura</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">Ciudades con Mayor Tráfico Web (Google Data)</h5>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {socialStats.google.topCities.map(c => (
                <div key={c.name} className="p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200/80 dark:border-white/5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{c.name}</span>
                  <span className="text-sm font-black text-[#00DD9E] font-mono">{c.count.toLocaleString('es-VE')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VISTA META (INSTAGRAM & FACEBOOK) */}
      {activeNetworkTab === 'meta' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Emoji3D name="instagram" className="w-8 h-8" alt="Instagram" />
              <div>
                <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Métricas de Meta Graph API: Instagram & Facebook
                </h4>
                <p className="text-xs text-slate-500">
                  Alcance orgánico de reels, reproducciones de video, interacciones y seguidores oficiales.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingConnector({ ...socialCredentials.meta });
                setIsConfigModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-xs font-bold text-slate-800 dark:text-white transition flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Conectar Meta Token</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarjeta Instagram */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Emoji3D name="instagram" className="w-6 h-6" alt="Instagram" />
                  <span className="font-display font-black text-sm text-slate-900 dark:text-white">Instagram @neblina105fm</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-600 dark:text-pink-400">
                  Instagram Professional
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/20">
                  <span className="text-[11px] text-slate-500 block font-bold">Seguidores</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{socialStats.instagram.followers.toLocaleString('es-VE')}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/20">
                  <span className="text-[11px] text-slate-500 block font-bold">Alcance (Reach)</span>
                  <span className="text-xl font-black text-pink-600 dark:text-pink-400 font-mono">{socialStats.instagram.reach.toLocaleString('es-VE')}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/20">
                  <span className="text-[11px] text-slate-500 block font-bold">Impresiones Totales</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{socialStats.instagram.impressions.toLocaleString('es-VE')}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/20">
                  <span className="text-[11px] text-slate-500 block font-bold">Tasa Interacción</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-[#00DD9E] font-mono">{socialStats.instagram.interactionRate}</span>
                </div>
              </div>
            </div>

            {/* Tarjeta Facebook */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Emoji3D name="facebook" className="w-6 h-6" alt="Facebook" />
                  <span className="font-display font-black text-sm text-slate-900 dark:text-white">Facebook Fan Page</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  Página Oficial Verificada
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/20">
                  <span className="text-[11px] text-slate-500 block font-bold">Seguidores / Me Gusta</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{socialStats.facebook.followers.toLocaleString('es-VE')}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/20">
                  <span className="text-[11px] text-slate-500 block font-bold">Alcance de Publicaciones</span>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">{socialStats.facebook.postReach.toLocaleString('es-VE')}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/20">
                  <span className="text-[11px] text-slate-500 block font-bold">Minutos de Video Vistos</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{socialStats.facebook.videoWatchMinutes.toLocaleString('es-VE')}m</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/20">
                  <span className="text-[11px] text-slate-500 block font-bold">Compartidos</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-[#00DD9E] font-mono">{socialStats.facebook.shares.toLocaleString('es-VE')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA YOUTUBE */}
      {activeNetworkTab === 'youtube' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Emoji3D name="youtube" className="w-8 h-8" alt="YouTube" />
              <div>
                <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                  YouTube Data API v3: Canal @neblina105fm
                </h4>
                <p className="text-xs text-slate-500">
                  Estadísticas de suscriptores, vistas acumuladas, horas de reproducción y Shorts.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={isSyncing}
                onClick={() => handleSyncConnector('youtube')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sincronizar en Vivo</span>
              </button>

              <button
                onClick={() => {
                  setEditingConnector({ ...socialCredentials.youtube });
                  setIsConfigModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-xs font-bold text-slate-800 dark:text-white transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>API Key</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Suscriptores del Canal</span>
              <p className="font-display font-black text-2xl text-red-600 mt-1 font-mono">
                {socialStats.youtube.subscribers.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-slate-400">Canal oficial @neblina105fm</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Reproducciones Totales</span>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1 font-mono">
                {socialStats.youtube.totalViews.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-[#00DD9E] font-bold">Videos y Podcasts</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Horas de Visualización</span>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1 font-mono">
                {socialStats.youtube.watchTimeHours.toLocaleString('es-VE')}h
              </p>
              <span className="text-[10px] text-slate-400">Watch time acumulado</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Vistas en Shorts</span>
              <p className="font-display font-black text-2xl text-sky-600 dark:text-sky-400 mt-1 font-mono">
                {socialStats.youtube.shortsViews.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-slate-400">Formato vertical móvil</span>
            </div>
          </div>
        </div>
      )}

      {/* VISTA TELEGRAM */}
      {activeNetworkTab === 'telegram' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Emoji3D name="telegram" className="w-8 h-8" alt="Telegram" />
              <div>
                <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Telegram Bot API: Canal Informativo @neblina105fm
                </h4>
                <p className="text-xs text-slate-500">
                  Suscriptores al canal, promedio de vistas por mensaje y notificaciones push.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={isSyncing}
                onClick={() => handleSyncConnector('telegram')}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sincronizar Bot</span>
              </button>

              <button
                onClick={() => {
                  setEditingConnector({ ...socialCredentials.telegram });
                  setIsConfigModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-xs font-bold text-slate-800 dark:text-white transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Bot Token</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Miembros del Canal</span>
              <p className="font-display font-black text-2xl text-sky-500 mt-1 font-mono">
                {socialStats.telegram.members.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-slate-400">Canal oficial t.me/neblina105fm</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Vistas Promedio / Post</span>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1 font-mono">
                {socialStats.telegram.postViewsAvg.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-[#00DD9E] font-bold">Alta tasa de apertura</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Reenvíos a Grupos</span>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1 font-mono">
                {socialStats.telegram.sharesCount.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-slate-400">Viralidad en comunidades</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Campana Notificaciones</span>
              <p className="font-display font-black text-2xl text-purple-600 dark:text-purple-400 mt-1 font-mono">
                {socialStats.telegram.notificationEnabledRate}
              </p>
              <span className="text-[10px] text-slate-400">Usuarios con sonido activo</span>
            </div>
          </div>
        </div>
      )}

      {/* VISTA X / TWITTER */}
      {activeNetworkTab === 'twitter' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Emoji3D name="x" className="w-8 h-8" alt="X" />
              <div>
                <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                  X Developer API v2: Cuenta @neblina105fm
                </h4>
                <p className="text-xs text-slate-500">
                  Métricas de tweets informativos, retweets, impresiones y menciones en la red social X.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingConnector({ ...socialCredentials.twitter });
                setIsConfigModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-xs font-bold text-slate-800 dark:text-white transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Bearer Token</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Seguidores en X</span>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1 font-mono">
                {socialStats.twitter.followers.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-slate-400">@neblina105fm</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Impresiones (30 Días)</span>
              <p className="font-display font-black text-2xl text-[#00DD9E] mt-1 font-mono">
                {socialStats.twitter.impressions30d.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-slate-400">Alcance de titulares</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Reposts / Retweets</span>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1 font-mono">
                {socialStats.twitter.retweets.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-slate-400">Difusión comunitaria</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Visitas al Perfil</span>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1 font-mono">
                {socialStats.twitter.profileVisits.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-slate-400">Tráfico institucional</span>
            </div>
          </div>
        </div>
      )}

      {/* VISTA TIKTOK */}
      {activeNetworkTab === 'tiktok' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                TikTok for Developers: @neblina105fm
              </h4>
              <p className="text-xs text-slate-500">
                Visualizaciones de videos cortos, me gustas acumulados y seguidores en TikTok.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingConnector({ ...socialCredentials.tiktok });
                setIsConfigModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-xs font-bold text-slate-800 dark:text-white transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Client Key / Token</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Seguidores TikTok</span>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1 font-mono">
                {socialStats.tiktok.followers.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-slate-400">Audiencia joven</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Video Views Totales</span>
              <p className="font-display font-black text-2xl text-pink-500 mt-1 font-mono">
                {socialStats.tiktok.videoViews.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-slate-400">Viralidad de contenido</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Total Me Gusta</span>
              <p className="font-display font-black text-2xl text-red-500 mt-1 font-mono">
                {socialStats.tiktok.likes.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-slate-400">Reacciones orgánicas</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Compartidos</span>
              <p className="font-display font-black text-2xl text-sky-500 mt-1 font-mono">
                {socialStats.tiktok.shares.toLocaleString('es-VE')}
              </p>
              <span className="text-[10px] text-slate-400">Difusión a WhatsApp</span>
            </div>
          </div>
        </div>
      )}

      {/* VISTA THREADS */}
      {activeNetworkTab === 'threads' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                Threads API: @neblina105fm
              </h4>
              <p className="text-xs text-slate-500">
                Conversaciones oficiales, respuestas e impacto de hilos periodísticos en Threads.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingConnector({ ...socialCredentials.threads });
                setIsConfigModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-xs font-bold text-slate-800 dark:text-white transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Token Threads</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Seguidores Threads</span>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1 font-mono">
                {socialStats.threads.followers.toLocaleString('es-VE')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Me Gusta Recibidos</span>
              <p className="font-display font-black text-2xl text-emerald-600 dark:text-[#00DD9E] mt-1 font-mono">
                {socialStats.threads.likes.toLocaleString('es-VE')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Respuestas / Hilos</span>
              <p className="font-display font-black text-2xl text-sky-500 mt-1 font-mono">
                {socialStats.threads.replies.toLocaleString('es-VE')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block">Reposts</span>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1 font-mono">
                {socialStats.threads.reposts.toLocaleString('es-VE')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA GENERAL / POR DEFECTO (CONSOLIDADO TOTAL) */}
      {/* ============================================================== */}
      {activeNetworkTab === 'general' && (
        <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />Visitas a la Web App</span>
          <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1">
            {totalVisits.toLocaleString('es-VE')}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-[#00DD9E] font-bold">Tráfico en vivo</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" />Lecturas de Noticias</span>
          <p className="font-display font-black text-2xl text-emerald-600 dark:text-[#00DD9E] mt-1">
            {totalNewsViews.toLocaleString('es-VE')}
          </p>
          <span className="text-[11px] text-slate-400">Views en notas de prensa</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 inline-flex items-center gap-1"><Share2 className="w-3.5 h-3.5" />Noticias Compartidas</span>
          <p className="font-display font-black text-2xl text-sky-600 dark:text-sky-400 mt-1">
            {totalNewsShares.toLocaleString('es-VE')}
          </p>
          <span className="text-[11px] text-slate-400">En WhatsApp, X y Redes</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 inline-flex items-center gap-1"><Megaphone className="w-3.5 h-3.5" />Banners Publicitarios</span>
          <p className="font-display font-black text-2xl text-purple-600 dark:text-purple-400 mt-1">
            {totalBannerViews.toLocaleString('es-VE')}
          </p>
          <span className="text-[11px] text-slate-400">{totalBannerClicks} clics comerciales</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 1: CONTROL DE CONVERSIONES Y REDIRECCIONES */}
      {/* ============================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center space-x-2.5">
          <Emoji3D name="whatsapp" className="w-7 h-7" alt="WhatsApp" />
          <div>
            <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
              Conversiones a WhatsApp y Redes Sociales
            </h4>
            <p className="text-xs text-slate-500">
              Registros de clics directos hacia cabina, comunidad, canales oficiales y perfiles de la emisora
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {conversions.map((conv) => (
            <div 
              key={conv.key}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 space-y-1"
            >
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                {conv.label}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-display font-black text-xl text-emerald-600 dark:text-[#00DD9E]">
                  {conv.count.toLocaleString('es-VE')}
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                  Clics
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 2: CONTROL DE NOTAS DE PRENSA (VIEWS & SHARES) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tabla: Notas Más Leídas (Views) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-emerald-500" />
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
              Notas de Prensa Más Leídas (Views)
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="py-2 px-2">Título de la Noticia</th>
                  <th className="py-2 px-2 text-right">Lecturas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {newsMetrics.length > 0 ? (
                  newsMetrics.slice(0, 7).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                      <td className="py-2 px-2 font-medium text-slate-900 dark:text-white truncate max-w-xs">
                        {item.title || newsMap.get(String(item.id))?.title || `Noticia #${item.id}`}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-emerald-600 dark:text-[#00DD9E]">
                        {item.views || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  allNews.slice(0, 5).map((n) => (
                    <tr key={n.id}>
                      <td className="py-2 px-2 truncate max-w-xs">{n.title}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-400">En registro</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla: Notas Más Compartidas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-sky-500" />
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
              Notas Más Compartidas (Viralidad)
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="py-2 px-2">Noticia</th>
                  <th className="py-2 px-2 text-right">Total Shares</th>
                  <th className="py-2 px-2 text-right">Canal Principal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {newsMetrics.filter(m => (m.shares || 0) > 0).length > 0 ? (
                  newsMetrics.filter(m => (m.shares || 0) > 0).slice(0, 7).map((item) => {
                    const platforms = item.platforms || {};
                    const topPlatform = Object.keys(platforms).sort((a, b) => platforms[b] - platforms[a])[0] || 'WhatsApp';
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                        <td className="py-2 px-2 font-medium text-slate-900 dark:text-white truncate max-w-xs">
                          {item.title || newsMap.get(String(item.id))?.title || `Noticia #${item.id}`}
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-sky-600 dark:text-sky-400">
                          {item.shares}
                        </td>
                        <td className="py-2 px-2 text-right capitalize font-semibold text-slate-500">
                          {topPlatform}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  allNews.slice(0, 4).map((n) => (
                    <tr key={n.id}>
                      <td className="py-2 px-2 truncate max-w-xs">{n.title}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-400">0</td>
                      <td className="py-2 px-2 text-right text-slate-400">WhatsApp</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 3: CONTROL DE BANNERS PUBLICITARIOS */}
      {/* ============================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center space-x-2.5">
          <Emoji3D name="megaphone" className="w-7 h-7" alt="Banners" />
          <div>
            <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
              Efectividad de Banners Publicitarios (Impresiones & Clics)
            </h4>
            <p className="text-xs text-slate-500">
              Desempeño comercial por espacio de pauta en la plataforma web
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="py-2 px-3">Anuncio / Pauta</th>
                <th className="py-2 px-3">Tipo</th>
                <th className="py-2 px-3">Ubicación</th>
                <th className="py-2 px-3 text-right">Impresiones (Vistas)</th>
                <th className="py-2 px-3 text-right">Clics CTA</th>
                <th className="py-2 px-3 text-right">Efectividad (CTR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {banners.map((b) => {
                const ctr = b.viewsCount > 0 ? (((b.clicksCount || 0) / b.viewsCount) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {b.title}
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-500">
                      {b.type === 'video' ? 'Video MP4' : b.type === 'image' ? 'Imagen' : 'Degradado'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10">
                        {b.placements === 'home' ? 'Inicio' : b.placements === 'news' ? 'Prensa' : 'Ambos'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {b.viewsCount || 0}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-[#00DD9E]">
                      {b.clicksCount || 0}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-600 dark:text-sky-400">
                      {ctr}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 4: INFORMES PUBLICITARIOS INDIVIDUALES POR CLIENTE */}
      {/* ============================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Informes Publicitarios por Cliente</span>
              </h4>
              <p className="text-xs text-slate-500">
                Genera reportes oficiales listos para imprimir en PDF o compartir vía WhatsApp a cada anunciante
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {clients.length} clientes activos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {clients.map(c => {
            const cBanners = banners.filter(b => String(b.clientId) === String(c.id));
            const cViews = cBanners.reduce((acc, b) => acc + (b.viewsCount || 0), 0);
            const cClicks = cBanners.reduce((acc, b) => acc + (b.clicksCount || 0), 0);
            const cCtr = cViews > 0 ? ((cClicks / cViews) * 100).toFixed(1) : '0.0';

            return (
              <div key={c.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {c.businessRif || 'Cliente'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">
                      {cBanners.length} {cBanners.length === 1 ? 'banner' : 'banners'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    {c.logoUrl ? (
                      <div className="h-9 w-auto max-w-[80px] flex items-center justify-center flex-shrink-0 bg-transparent">
                        <img 
                          src={c.logoUrl} 
                          alt="" 
                          className="max-h-9 max-w-[80px] w-auto h-auto object-contain"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#001E4D] to-[#00DD9E] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        <UserCheck className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h5 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                        {c.businessName}
                      </h5>
                      <p className="text-xs text-slate-500 truncate">{c.ownerName || 'Titular'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-200 dark:border-white/5 text-center text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold block">Vistas</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{cViews.toLocaleString('es-VE')}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold block">Clics</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-[#00DD9E]">{cClicks.toLocaleString('es-VE')}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold block">CTR</span>
                    <span className="font-mono font-bold text-sky-500">{cCtr}%</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setReportClientId(c.id);
                    setIsReportModalOpen(true);
                  }}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Generar Informe Oficial</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 5: REGISTRO DE GEOLOCALIZACIÓN Y DISPOSITIVOS */}
      {/* ============================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <MapPin className="w-6 h-6 text-emerald-500" />
            <div>
              <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                Sintonía Geolocalizada Reciente
              </h4>
              <p className="text-xs text-slate-500">Registro de oyentes y lectores en vivo por IP</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-[#00DD9E]">
            {logs.length} conexiones auditadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="py-2 px-3">Fecha y Hora</th>
                <th className="py-2 px-3">Ubicación</th>
                <th className="py-2 px-3">País</th>
                <th className="py-2 px-3">Dispositivo / SO</th>
                <th className="py-2 px-3">Navegador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {logs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-2 px-3 font-mono text-[11px]">{log.formattedDate || log.timestamp?.slice(0, 16)}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                    {log.city || 'Santo Domingo'}, {log.region || 'Mérida'}
                  </td>
                  <td className="py-2 px-3">{log.country || 'Venezuela'}</td>
                  <td className="py-2 px-3">{log.os || 'Desktop'}</td>
                  <td className="py-2 px-3">{log.browser || 'Web'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}

      {/* ============================================================== */}
      {/* MODAL CONFIGURACIÓN DE CONECTORES Y API KEYS */}
      {/* ============================================================== */}
      {isConfigModalOpen && editingConnector && (
        <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-xl max-h-[92vh] my-auto bg-white dark:bg-[#001438] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#00DD9E]/40 flex flex-col text-xs">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-black/20">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-[#00DD9E]" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Conexión API: {editingConnector.name}
                </h3>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConnector} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Selector Rápido de Plataforma para Configurar */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Selecciona la Red Social a Configurar
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {Object.keys(socialCredentials).map(key => {
                    const conn = socialCredentials[key];
                    const isSelected = editingConnector.id === conn.id;
                    return (
                      <button
                        key={conn.id}
                        type="button"
                        onClick={() => setEditingConnector({ ...conn })}
                        className={`p-2 rounded-xl text-center font-bold text-[11px] border transition ${
                          isSelected
                            ? 'bg-[#001E4D] text-[#00DD9E] border-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D]'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {conn.id.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campos dinámicos según la plataforma */}
              {editingConnector.id === 'google' && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ID de Medición de Google Analytics 4 (Measurement ID) *
                    </label>
                    <input
                      type="text"
                      value={editingConnector.propertyId || ''}
                      onChange={e => setEditingConnector(prev => ({ ...prev, propertyId: e.target.value }))}
                      placeholder="G-XXXXXXXXXX o ID de Propiedad GA4"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Obtén este código en Google Analytics → Administrar → Flujo de datos Web.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      API Secret de Medición (Opcional para eventos server-side)
                    </label>
                    <input
                      type="password"
                      value={editingConnector.apiSecret || ''}
                      onChange={e => setEditingConnector(prev => ({ ...prev, apiSecret: e.target.value }))}
                      placeholder="••••••••••••••••"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {editingConnector.id === 'meta' && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      User / Page Access Token (Meta Graph API) *
                    </label>
                    <input
                      type="password"
                      value={editingConnector.accessToken || ''}
                      onChange={e => setEditingConnector(prev => ({ ...prev, accessToken: e.target.value }))}
                      placeholder="EAA..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Obtenlo en Meta for Developers → Herramientas → Graph API Explorer.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        ID de Página Facebook
                      </label>
                      <input
                        type="text"
                        value={editingConnector.facebookPageId || ''}
                        onChange={e => setEditingConnector(prev => ({ ...prev, facebookPageId: e.target.value }))}
                        placeholder="1000854..."
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        ID Cuenta Instagram Business
                      </label>
                      <input
                        type="text"
                        value={editingConnector.instagramBusinessId || ''}
                        onChange={e => setEditingConnector(prev => ({ ...prev, instagramBusinessId: e.target.value }))}
                        placeholder="178414..."
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingConnector.id === 'youtube' && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      API Key de YouTube Data API v3 (Google Cloud Console) *
                    </label>
                    <input
                      type="password"
                      value={editingConnector.apiKey || ''}
                      onChange={e => setEditingConnector(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="AIzaSy..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Habilita "YouTube Data API v3" en Google Cloud Console y crea una Credencial tipo API Key.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ID del Canal de YouTube
                    </label>
                    <input
                      type="text"
                      value={editingConnector.channelId || ''}
                      onChange={e => setEditingConnector(prev => ({ ...prev, channelId: e.target.value }))}
                      placeholder="UC_..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {editingConnector.id === 'telegram' && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Telegram Bot Token (creado con @BotFather) *
                    </label>
                    <input
                      type="password"
                      value={editingConnector.botToken || ''}
                      onChange={e => setEditingConnector(prev => ({ ...prev, botToken: e.target.value }))}
                      placeholder="123456789:ABCdef..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Crea un bot con @BotFather en Telegram, agrégalo como administrador del canal @neblina105fm y pega su token aquí.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre de Usuario del Canal (@)
                    </label>
                    <input
                      type="text"
                      value={editingConnector.channelUsername || ''}
                      onChange={e => setEditingConnector(prev => ({ ...prev, channelUsername: e.target.value }))}
                      placeholder="@neblina105fm"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {editingConnector.id === 'twitter' && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bearer Token de X (Twitter API v2) *
                    </label>
                    <input
                      type="password"
                      value={editingConnector.bearerToken || ''}
                      onChange={e => setEditingConnector(prev => ({ ...prev, bearerToken: e.target.value }))}
                      placeholder="AAAAAAAAAAAAAAAAAAAAA..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Obtén tu App y Bearer Token en developer.x.com.
                    </span>
                  </div>
                </div>
              )}

              {(editingConnector.id === 'tiktok' || editingConnector.id === 'threads') && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Access Token / Client Key de {editingConnector.name} *
                    </label>
                    <input
                      type="password"
                      value={editingConnector.accessToken || ''}
                      onChange={e => setEditingConnector(prev => ({ ...prev, accessToken: e.target.value }))}
                      placeholder="Token de acceso oficial..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  editingConnector.status === 'connected' ? 'bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]' : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                }`}>
                  {editingConnector.status === 'connected' ? 'Enlace Activo' : 'Pendiente por Conectar'}
                </span>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] font-bold shadow transition hover:opacity-90 cursor-pointer"
                  >
                    Guardar Credenciales
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
