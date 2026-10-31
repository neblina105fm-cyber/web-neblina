import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { fetchRankingData, fetchArtworkForSong, STATION_INFO } from '../services/api';
import Emoji3D from './Emoji3D';

const FALLBACK_TOP_3 = [
  {
    rank: 1,
    title: "Topic - In My Arms",
    artist: "Mflex Sounds",
    plays: 1,
    badge: "#1 MÁS SONADO"
  },
  {
    rank: 2,
    title: "Sin Voluntad",
    artist: "Gilberto Santa Rosa",
    plays: 1,
    badge: "#2 TENDENCIA"
  },
  {
    rank: 3,
    title: "La que no pasa de moda",
    artist: "Reymusik",
    plays: 1,
    badge: "#3 EN ALZA"
  }
];

export default function HomeRankingBanner({ onOpenRanking }) {
  const [topSongs, setTopSongs] = useState(FALLBACK_TOP_3);
  const [artworks, setArtworks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadTop3 = async () => {
      try {
        const data = await fetchRankingData('songs', '7d', 3);
        if (!isMounted) return;

        let items = [];
        if (data && data.ok && Array.isArray(data.items) && data.items.length > 0) {
          items = data.items.slice(0, 3).map((item, idx) => ({
            ...item,
            rank: idx + 1,
            badge: idx === 0 ? '#1 MÁS SONADO' : idx === 1 ? '#2 TENDENCIA' : '#3 EN ALZA'
          }));
        } else {
          items = FALLBACK_TOP_3;
        }

        setTopSongs(items);

        // Cargar carátulas en paralelo desde iTunes o el artwork del API
        const artMap = {};
        await Promise.all(
          items.map(async (song) => {
            const key = `${song.artist}-${song.title}`;
            if (song.artwork && song.artwork.startsWith('http')) {
              artMap[key] = song.artwork;
            } else if (song.artist && song.title) {
              const art = await fetchArtworkForSong(song.artist, song.title);
              if (art) {
                artMap[key] = art;
              }
            }
          })
        );

        if (isMounted) {
          setArtworks(artMap);
        }
      } catch (err) {
        console.warn('Error cargando top 3 para HomeRankingBanner:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTop3();
    const intervalId = setInterval(loadTop3, 45000);
    const onRankingUpdate = () => loadTop3();
    window.addEventListener('neblina_ranking_updated', onRankingUpdate);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('neblina_ranking_updated', onRankingUpdate);
    };
  }, []);

  const handleClick = () => {
    if (onOpenRanking) {
      onOpenRanking();
    } else {
      window.location.hash = '#ranking';
    }
  };

  const getRankBadgeStyle = (rank) => {
    if (rank === 1) {
      return 'text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-500/25';
    }
    if (rank === 2) {
      return 'text-slate-700 dark:text-slate-300 bg-slate-200/80 dark:bg-white/10 border-slate-300 dark:border-white/15';
    }
    return 'text-amber-800 dark:text-amber-400 bg-amber-700/15 border-amber-700/25';
  };

  const getCardBorder = (rank) => {
    if (rank === 1) {
      return 'border-amber-400/40 dark:border-amber-400/30 bg-amber-500/[0.04] dark:bg-amber-400/[0.03] hover:border-amber-400';
    }
    if (rank === 2) {
      return 'border-slate-300/60 dark:border-white/10 bg-slate-500/[0.03] dark:bg-white/[0.02] hover:border-slate-400 dark:hover:border-white/20';
    }
    return 'border-amber-800/25 dark:border-amber-700/20 bg-amber-800/[0.03] dark:bg-amber-700/[0.02] hover:border-amber-700/40';
  };

  return (
    <div 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      className="p-3.5 sm:p-5 rounded-2xl aeroglass-card hover:scale-[1.006] transition-all duration-300 cursor-pointer flex flex-col group relative overflow-hidden select-none my-2"
      title="Clic para ver el Ranking de Neblina Completo"
    >
      {/* Resplandores ambientales Apple aeroglass */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-500/10 dark:bg-[#00DD9E]/10 blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-amber-500/10 dark:bg-[#FEDC01]/08 blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

      {/* 1. Cabecera del Banner: Distintivo Oficial + Botón Ver Ranking */}
      <div className="relative z-10 flex items-center justify-between gap-3 pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
        <div className="flex items-center space-x-2.5 min-w-0">
          <span className="inline-flex items-center space-x-1.5 text-[11px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-[#00DD9E] bg-emerald-500/15 backdrop-blur-md px-3 py-1 rounded-lg border border-emerald-500/30 shrink-0">
            <Emoji3D name="musical-notes" className="w-3.5 h-3.5" alt="Ranking de Neblina" />
            <span>RANKING DE NEBLINA · TOP 3</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block shrink-0" title="Al aire" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
            Lo más sonado de la semana
          </span>
        </div>

        {/* Botón Ver Ranking Completo (Efecto Aero Glass) */}
        <div className="shrink-0 flex items-center">
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#001E4D]/75 hover:bg-[#001E4D]/90 dark:bg-[#00DD9E]/20 dark:hover:bg-[#00DD9E]/30 backdrop-blur-xl text-white dark:text-[#00DD9E] text-xs font-black border border-[#00DD9E]/45 transition-all duration-200 shadow-sm group-hover:shadow-md whitespace-nowrap cursor-pointer">
            <span>Ver Ranking <span className="hidden sm:inline">Completo</span></span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>

      {/* 2. Grid de las 3 Canciones del Podio (1°, 2°, 3°) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5 pt-3.5">
        {topSongs.map((song, idx) => {
          const rank = song.rank || (idx + 1);
          const medalName = rank === 1 ? 'medal-1st' : rank === 2 ? 'medal-2nd' : 'medal-3rd';
          const artKey = `${song.artist}-${song.title}`;
          const artUrl = artworks[artKey] || (rank === 1 ? STATION_INFO.cover : null);

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border backdrop-blur-md transition-all duration-300 flex items-center space-x-3 group/item shadow-xs hover:shadow-md ${getCardBorder(rank)}`}
            >
              {/* Carátula de la Canción con Medalla 3D Oficial */}
              <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-md bg-black/40 shrink-0 group-hover/item:scale-105 transition-transform duration-300">
                {artUrl ? (
                  <img
                    src={artUrl}
                    alt={`${song.title} - ${song.artist}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-800 to-slate-900 text-white">
                    <Emoji3D name="musical-notes" className="w-6 h-6 drop-shadow-sm" alt="Música" />
                  </div>
                )}

                {/* Medalla 3D del puesto */}
                <Emoji3D 
                  name={medalName} 
                  className="absolute -top-1.5 -left-1.5 w-6 h-6 drop-shadow-md z-10" 
                  alt={`${rank}° Puesto`} 
                />
              </div>

              {/* Textos de la Canción */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <span className={`inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${getRankBadgeStyle(rank)}`}>
                  {song.badge || `#${rank}`}
                </span>

                <h4 className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover/item:text-[#001E4D] dark:group-hover/item:text-[#00DD9E] transition-colors">
                  {song.title || 'Tema Musical'}
                </h4>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-semibold">
                  {song.artist || 'Neblina 105.5 FM'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
