import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Music, 
  Mic2, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Minus, 
  RefreshCw, 
  Share2, 
  Check, 
  ExternalLink,
  Flame,
  Award,
  Play,
  Clock,
  Calendar,
  ListMusic
} from 'lucide-react';
import { fetchRankingData, fetchArtworkForSong, STATION_INFO, getSongRequestUrl } from '../services/api';
import { 
  buildHybridRanking, 
  getRankingYoutubePlaylist, 
  checkAndPromoteQueuedPlaylist, 
  extractYouTubeEmbedInfo,
  DEFAULT_YOUTUBE_RECOMMENDED_TRACKS,
  getNextSlotDate
} from '../services/rankingService';
import Emoji3D from './Emoji3D';

// Las 4 categorías principales solicitadas para el Ranking Musical
const RANKING_TABS = [
  {
    id: '24h_songs',
    label: 'Canción Más Sonada (24h)',
    shortLabel: 'Canciones 24h',
    apiType: 'songs',
    apiPeriod: '24h',
    icon: Music,
    badge: 'Últimas 24 Horas'
  },
  {
    id: '24h_artists',
    label: 'Artista Más Sonado (24h)',
    shortLabel: 'Artistas 24h',
    apiType: 'artists',
    apiPeriod: '24h',
    icon: Mic2,
    badge: 'Artistas del Día'
  },
  {
    id: 'weekly',
    label: 'Top 10 de la Semana',
    shortLabel: 'Top 10 Semanal',
    apiType: 'songs',
    apiPeriod: '7d',
    icon: Flame,
    badge: 'Conteo Semanal (7 Días)'
  },
  {
    id: 'monthly',
    label: 'Top 10 Mensual',
    shortLabel: 'Top 10 Mensual',
    apiType: 'songs',
    apiPeriod: '30d',
    icon: Trophy,
    badge: 'Conteo Mensual (30 Días)'
  }
];

export default function RankingSection() {
  const [activeTabId, setActiveTabId] = useState('24h_songs');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [artworks, setArtworks] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Estado de la Playlist Oficial de YouTube (única plataforma en Recomendaciones)
  const [playlistConfig, setPlaylistConfig] = useState(() => checkAndPromoteQueuedPlaylist());
  const [selectedTrack, setSelectedTrack] = useState(null); // null = reproducir URL de playlist configurada, o un tema específico

  const currentTab = RANKING_TABS.find(t => t.id === activeTabId) || RANKING_TABS[0];
  const activeType = currentTab.apiType; // 'songs' | 'artists'

  // Cargar datos del ranking combinando API en vivo + detector de streaming
  const loadRanking = async () => {
    setLoading(true);
    try {
      const data = await fetchRankingData(currentTab.apiType, currentTab.apiPeriod, 15);
      const apiItems = data && data.ok && Array.isArray(data.items) ? data.items : [];
      const top10 = buildHybridRanking(apiItems, activeTabId);
      setItems(top10);
      loadArtworks(top10, currentTab.apiType);
    } catch (e) {
      const fallbackTop10 = buildHybridRanking([], activeTabId);
      setItems(fallbackTop10);
      loadArtworks(fallbackTop10, currentTab.apiType);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, [activeTabId]);

  useEffect(() => {
    const handlePlaylistUpdated = () => {
      setPlaylistConfig(checkAndPromoteQueuedPlaylist());
      setSelectedTrack(null);
    };
    const handleRankingUpdated = () => {
      loadRanking();
    };
    window.addEventListener('neblina_youtube_playlist_updated', handlePlaylistUpdated);
    window.addEventListener('neblina_ranking_updated', handleRankingUpdated);
    return () => {
      window.removeEventListener('neblina_youtube_playlist_updated', handlePlaylistUpdated);
      window.removeEventListener('neblina_ranking_updated', handleRankingUpdated);
    };
  }, [activeTabId]);

  // Obtener carátulas HD de iTunes para canciones o artistas
  const loadArtworks = async (rankingItems, type) => {
    for (const item of rankingItems.slice(0, 10)) {
      const artist = item.artist || '';
      const title = type === 'songs' ? (item.title || '') : '';
      const key = `${artist}-${title}`;
      if (item.artwork && !artworks[key]) {
        setArtworks(prev => ({ ...prev, [key]: item.artwork }));
      }
      fetchArtworkForSong(artist, title).then(art => {
        if (art && !art.includes('cover-default')) {
          setArtworks(prev => ({ ...prev, [key]: art }));
        }
      });
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const top1 = items[0];
  const top2 = items[1];
  const top3 = items[2];
  const restItems = items.slice(3, 10);

  // Construir URL del iframe de YouTube
  const embedInfo = extractYouTubeEmbedInfo(playlistConfig.currentUrl);
  const activeEmbedUrl = selectedTrack
    ? `https://www.youtube.com/embed/${selectedTrack.videoId}?autoplay=1&rel=0`
    : embedInfo.embedUrl;

  const nextSwitchDate = getNextSlotDate(playlistConfig.scheduledSlot || 'lunes_12');
  const nextSwitchStr = nextSwitchDate.toLocaleDateString('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Renderizar indicador de tendencia
  const renderTrend = (trend) => {
    if (!trend) return null;
    if (trend.is_new || trend.state === 'new') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/25">
          <Emoji3D name="sparkles" className="w-3.5 h-3.5" alt="Nuevo" />
          <span>NUEVO</span>
        </span>
      );
    }
    if (trend.state === 'up') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
          <TrendingUp className="w-2.5 h-2.5" />
          <span>▲ {trend.delta || ''}</span>
        </span>
      );
    }
    if (trend.state === 'down') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
          <TrendingDown className="w-2.5 h-2.5" />
          <span>▼ {trend.delta || ''}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400">
        <Minus className="w-2.5 h-2.5" />
        <span>ESTABLE</span>
      </span>
    );
  };

  return (
    <section className="py-4 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Encabezado Hero Aero Glass */}
      <div className="glass-card p-6 sm:p-8 relative overflow-hidden border border-[#e6e6e8] dark:border-white/10 rounded-2xl shadow-sm">
        
        {/* Glows de Degradados Leves iOS */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/10 dark:bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-[#00DD9E]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm">
                <Emoji3D name="musical-notes" className="w-4 h-4 inline-block" alt="Ranking de Neblina" />
                <span>RANKING OFICIAL · NEBLINA 105.5 FM</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            
            <h1 className="font-display font-black text-2xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
              Ranking Musical · Lo Más Sonado
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed font-medium">
              Monitoreo automático en tiempo real de las canciones y artistas con mayor rotación en las últimas 24 horas, el Top 10 de la Semana y el conteo Mensual de Neblina Stereo.
            </p>
          </div>

          {/* Botón Refrescar */}
          <div className="flex items-center space-x-2">
            <button
              onClick={loadRanking}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold border border-slate-300 dark:border-white/10 transition shadow-sm cursor-pointer disabled:opacity-50"
              title="Actualizar Ranking en Tiempo Real"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* 2. Selector de las 4 Categorías de Ranking (24h Canciones, 24h Artistas, Top 10 Semana, Top 10 Mensual) */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {RANKING_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#001E4D] text-white dark:bg-[#00DD9E] dark:text-[#001E4D] border-[#001E4D] dark:border-[#00DD9E] shadow-md scale-[1.01]'
                      : 'bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 border-slate-200/90 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-white/15 dark:bg-[#001E4D]/15'
                        : 'bg-slate-100 dark:bg-white/10'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black truncate">{tab.label}</p>
                      <p className={`text-[11px] font-semibold truncate ${
                        isSelected ? 'text-white/80 dark:text-[#001E4D]/80' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {tab.badge}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Podio TOP 3 Espectacular (1° Oro Centro, 2° Plata Izquierda, 3° Bronce Derecha) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-2xl glass-card animate-pulse border border-slate-200 dark:border-white/10" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-200 dark:border-white/10">
          <Emoji3D name="musical-notes" className="w-12 h-12 mx-auto mb-3 drop-shadow-md opacity-70" alt="Ranking de Neblina" />
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Sin datos en este periodo</h3>
          <p className="text-xs text-slate-500 mt-1">Prueba seleccionando otro rango de tiempo o actualiza en unos minutos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          {/* #2 Puesto - Plata (Izquierda) */}
          {top2 && (
            <div className="order-2 md:order-1 glass-card p-5 sm:p-6 rounded-2xl border border-slate-300/80 dark:border-slate-400/25 relative overflow-hidden flex flex-col items-center text-center shadow-md hover:scale-[1.01] transition-transform">
              <Emoji3D name="medal-2nd" className="absolute top-3 left-3 w-9 h-9 drop-shadow-md z-10" alt="2° Puesto" />
              <span className="inline-flex items-center space-x-1 text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                <Emoji3D name="medal-2nd" className="w-4 h-4 inline-block" alt="Plata" />
                <span>Medalla de Plata · #2</span>
              </span>
              
              <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg border border-slate-300 dark:border-white/20 mb-3 bg-black/40">
                <img 
                  src={artworks[`${top2.artist}-${activeType === 'songs' ? (top2.title || '') : ''}`] || top2.artwork || STATION_INFO.cover} 
                  alt={top2.artist}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                {activeType === 'songs' ? top2.title : top2.artist}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-1 mb-2 font-medium">
                {activeType === 'songs' ? top2.artist : `${top2.unique_titles || 1} temas distintos en rotación`}
              </p>

              <div className="flex items-center gap-2 mt-auto">
                <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white">
                  {top2.plays || top2.total_plays} {activeType === 'songs' ? 'reproducciones' : 'veces al aire'}
                </span>
                {renderTrend(top2.trend)}
              </div>
            </div>
          )}

          {/* #1 Puesto - Oro (Centro, Más Elevado y Prominente) */}
          {top1 && (
            <div className="order-1 md:order-2 glass-card p-6 sm:p-8 rounded-2xl border-2 border-amber-400/70 dark:border-amber-400/50 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent relative overflow-hidden flex flex-col items-center text-center shadow-xl hover:scale-[1.02] transition-transform md:-translate-y-2">
              <Emoji3D name="medal-1st" className="absolute top-3 left-3 w-11 h-11 drop-shadow-lg z-10" alt="1° Puesto" />

              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 mb-3">
                <Emoji3D name="medal-1st" className="w-4 h-4 inline-block" alt="Oro" />
                <span>NÚMERO 1 · {currentTab.shortLabel.toUpperCase()}</span>
              </div>
              
              <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-amber-400/80 mb-4 bg-black/40 ring-4 ring-amber-400/20">
                <img 
                  src={artworks[`${top1.artist}-${activeType === 'songs' ? (top1.title || '') : ''}`] || top1.artwork || STATION_INFO.cover} 
                  alt={top1.artist}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white line-clamp-1">
                {activeType === 'songs' ? top1.title : top1.artist}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold line-clamp-1 mb-3">
                {activeType === 'songs' ? top1.artist : `${top1.unique_titles || 1} canciones distintas en rotación`}
              </p>

              <div className="flex items-center gap-2 mt-auto">
                <span className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-sm">
                  {top1.plays || top1.total_plays} {activeType === 'songs' ? 'reproducciones' : 'veces al aire'}
                </span>
                {renderTrend(top1.trend)}
              </div>
            </div>
          )}

          {/* #3 Puesto - Bronce (Derecha) */}
          {top3 && (
            <div className="order-3 md:order-3 glass-card p-5 sm:p-6 rounded-2xl border border-amber-700/40 dark:border-amber-600/30 relative overflow-hidden flex flex-col items-center text-center shadow-md hover:scale-[1.01] transition-transform">
              <Emoji3D name="medal-3rd" className="absolute top-3 left-3 w-9 h-9 drop-shadow-md z-10" alt="3° Puesto" />
              <span className="inline-flex items-center space-x-1 text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-500 mb-2">
                <Emoji3D name="medal-3rd" className="w-4 h-4 inline-block" alt="Bronce" />
                <span>Medalla de Bronce · #3</span>
              </span>
              
              <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg border border-amber-700/30 dark:border-white/20 mb-3 bg-black/40">
                <img 
                  src={artworks[`${top3.artist}-${activeType === 'songs' ? (top3.title || '') : ''}`] || top3.artwork || STATION_INFO.cover} 
                  alt={top3.artist}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                {activeType === 'songs' ? top3.title : top3.artist}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-1 mb-2 font-medium">
                {activeType === 'songs' ? top3.artist : `${top3.unique_titles || 1} temas distintos en rotación`}
              </p>

              <div className="flex items-center gap-2 mt-auto">
                <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white">
                  {top3.plays || top3.total_plays} {activeType === 'songs' ? 'reproducciones' : 'veces al aire'}
                </span>
                {renderTrend(top3.trend)}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. Lista de Posiciones Restantes del Top 10 (Puestos 4 al 10) */}
      {restItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 pt-2">
            <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-[#f5f5f7] flex items-center space-x-2">
              <Emoji3D name="fire" className="w-4 h-4 drop-shadow-xs" alt="Tendencia" />
              <span>Conteo Oficial · Puestos #4 al #{items.length} ({currentTab.label})</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-[#86868b]">
              Sincronizado con la señal en vivo
            </span>
          </div>

          <div className="glass-card rounded-2xl border border-[#e6e6e8] dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden shadow-sm">
            {restItems.map((item, idx) => {
              const rankNum = idx + 4;
              const title = activeType === 'songs' ? (item.title || 'Tema Musical') : item.artist;
              const subtitle = activeType === 'songs' ? item.artist : `${item.unique_titles || 1} canciones emitidas`;
              const plays = item.plays || item.total_plays;
              const artKey = `${item.artist}-${activeType === 'songs' ? (item.title || '') : ''}`;
              const artUrl = artworks[artKey] || item.artwork || STATION_INFO.cover;

              return (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-150 gap-3"
                >
                  {/* Puesto y Carátula */}
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <span className="w-6 sm:w-8 text-center font-display font-black text-sm sm:text-base text-slate-600 dark:text-slate-300">
                      #{rankNum}
                    </span>

                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-white/10 bg-black/40">
                      <img 
                        src={artUrl} 
                        alt={title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {title}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 font-medium truncate">
                        {subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Reproducciones y Tendencia */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="hidden sm:inline-block px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-[#f5f5f7]">
                      {plays} {activeType === 'songs' ? 'reproducciones' : 'veces'}
                    </span>

                    {renderTrend(item.trend)}

                    {/* Copiar Info */}
                    <button
                      onClick={() => handleCopy(rankNum, `${title} - ${subtitle}`)}
                      className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                      title="Copiar nombre del tema"
                    >
                      {copiedId === rankNum ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Solicitar canción / complacencia por WhatsApp */}
                    <a
                      href={getSongRequestUrl(title, activeType === 'songs' ? subtitle : '')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:scale-110 transition-transform cursor-pointer drop-shadow-xs"
                      title="Solicitar este tema a cabina por WhatsApp (+58 424 745 9774)"
                    >
                      <Emoji3D name="whatsapp" className="w-4 h-4" alt="WhatsApp" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. RECOMENDACIONES EN NEBLINA — EXCLUSIVAMENTE YOUTUBE PLAYLIST EMBEBIDA EN LA PÁGINA */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-[#e6e6e8] dark:border-white/10 shadow-md relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-red-600 text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                <Emoji3D name="youtube" className="w-3.5 h-3.5" alt="YouTube" />
                <span>Recomendaciones en Neblina · Playlist Oficial YouTube</span>
              </div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
                {playlistConfig.currentTitle || 'Selección Musical de la Semana en YouTube'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                Escucha y disfruta la lista oficial recomendada por nuestros locutores directamente aquí, sin salir de la página.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-white/10">
                <Calendar className="w-3.5 h-3.5 text-[#008f7a] dark:text-[#00DD9E]" />
                <span>Renovación semanal: {nextSwitchStr}</span>
              </span>

              {playlistConfig.queuedUrl && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E] font-bold border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Próxima Playlist en Cola Lista</span>
                </span>
              )}
            </div>
          </div>

          {/* Reproductor Embebido de YouTube + Selector Rápido de Temas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Iframe Embebido (Reproduce dentro de la misma página) */}
            <div className="lg:col-span-7 xl:col-span-8 rounded-xl overflow-hidden border border-slate-300 dark:border-white/15 bg-black shadow-lg aspect-video relative">
              <iframe
                key={activeEmbedUrl}
                src={activeEmbedUrl}
                title="Playlist Oficial Recomendada - Neblina Stereo 105.5 FM"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Lista Interactiva de Canciones de la Playlist para cambiar sin abrir otra pestaña */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between rounded-xl bg-white/70 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/10">
                <div className="flex items-center space-x-2">
                  <ListMusic className="w-4 h-4 text-red-500" />
                  <h3 className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    Reproducir aquí mismo
                  </h3>
                </div>
                {selectedTrack && (
                  <button
                    onClick={() => setSelectedTrack(null)}
                    className="text-[11px] font-bold text-[#008f7a] dark:text-[#00DD9E] hover:underline cursor-pointer"
                  >
                    Ver Playlist Completa
                  </button>
                )}
              </div>

              <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
                {DEFAULT_YOUTUBE_RECOMMENDED_TRACKS.map((track, idx) => {
                  const isPlayingThis = selectedTrack?.id === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => setSelectedTrack(track)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer border ${
                        isPlayingThis
                          ? 'bg-red-600 text-white border-red-500 shadow-sm'
                          : 'bg-white/90 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                          isPlayingThis ? 'bg-white text-red-600' : 'bg-red-500/15 text-red-600 dark:text-red-400'
                        }`}>
                          {isPlayingThis ? <Play className="w-3 h-3 fill-current" /> : idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{track.title}</p>
                          <p className={`text-[11px] truncate ${isPlayingThis ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                            {track.artist}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[11px] font-mono font-bold shrink-0 px-2 py-0.5 rounded ${
                        isPlayingThis ? 'bg-black/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                      }`}>
                        {track.duration}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Actualización automática semanal</span>
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">YouTube Oficial</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
