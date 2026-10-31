import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, User, Radio, Sparkles, X, Share2, Volume2, Info, ChevronRight, Check } from 'lucide-react';
import Emoji3D from './Emoji3D';
import { getCurrentLiveShow } from '../services/api';
import { getAllSchedule } from '../services/scheduleData';
import { useAudioPlayer } from '../context/AudioPlayerContext';

export default function ScheduleSection({ onPlayLive }) {
  let playLiveStream = null;
  try {
    const player = useAudioPlayer();
    playLiveStream = player ? player.playLiveStream : null;
  } catch (e) {}
  const [scheduleList, setScheduleList] = useState(getAllSchedule());
  const currentShow = getCurrentLiveShow();
  const [filterDay, setFilterDay] = useState('all'); // 'all' | 'weekdays' | 'weekend'
  const [selectedShow, setSelectedShow] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setScheduleList(getAllSchedule());
    };
    window.addEventListener('neblina_schedule_updated', handleUpdate);
    return () => window.removeEventListener('neblina_schedule_updated', handleUpdate);
  }, []);

  const daysLabel = {
    1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom'
  };

  const fullDaysMap = [
    { id: 1, name: 'Lunes', short: 'Lun' },
    { id: 2, name: 'Martes', short: 'Mar' },
    { id: 3, name: 'Miércoles', short: 'Mié' },
    { id: 4, name: 'Jueves', short: 'Jue' },
    { id: 5, name: 'Viernes', short: 'Vie' },
    { id: 6, name: 'Sábado', short: 'Sáb' },
    { id: 7, name: 'Domingo', short: 'Dom' }
  ];

  const activeShows = scheduleList.filter(show => show.active !== false);

  const filteredSchedule = activeShows.filter(show => {
    if (filterDay === 'weekdays') {
      return (show.days || []).some(d => d >= 1 && d <= 5);
    }
    if (filterDay === 'weekend') {
      return (show.days || []).some(d => d === 6 || d === 7);
    }
    return true;
  });

  const handleShare = async (show) => {
    const text = `📻 ¡Escucha "${show.title}" con ${show.host} por Neblina Stereo 105.5 FM! 🏔️ Horario: ${show.startTime} a ${show.endTime}`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${show.title} - Neblina 105.5 FM`,
          text,
          url
        });
        return;
      } catch (err) {
        // Ignorar si el usuario canceló
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (e) {
      console.warn('Error copiando al portapapeles:', e);
    }
  };

  const sanitizeImage = (url) => {
    if (!url) return './default-cover.png';
    return url.replace('https://player.mipanel.stream/player/uploads', 'https://mipanel.stream/player/uploads');
  };

  return (
    <section className="py-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-[#00DD9E] text-xs font-black uppercase tracking-widest mb-1">
            <Emoji3D name="clock" className="w-4 h-4 inline-block" alt="Parrilla" />
            <span>Parrilla Radial</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Programación Oficial
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
            Los mejores locutores y producciones en la señal de Neblina 105.5 FM · Santo Domingo, Mérida
          </p>
        </div>

        {/* Filtros de días con alto contraste */}
        <div className="flex items-center space-x-1.5 bg-slate-200/80 dark:bg-white/5 p-1 rounded-2xl border border-slate-300 dark:border-white/10 self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setFilterDay('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterDay === 'all'
                ? 'bg-[#00DD9E] text-[#001E4D] font-bold shadow-sm border border-white/40'
                : 'aeroglass-subcard text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white border border-white/20 dark:border-white/10'
            }`}
          >
            Toda la Semana
          </button>
          <button
            onClick={() => setFilterDay('weekdays')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterDay === 'weekdays'
                ? 'bg-[#00DD9E] text-[#001E4D] font-bold shadow-sm border border-white/40'
                : 'aeroglass-subcard text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white border border-white/20 dark:border-white/10'
            }`}
          >
            Lunes a Viernes
          </button>
          <button
            onClick={() => setFilterDay('weekend')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterDay === 'weekend'
                ? 'bg-[#00DD9E] text-[#001E4D] font-bold shadow-sm border border-white/40'
                : 'aeroglass-subcard text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white border border-white/20 dark:border-white/10'
            }`}
          >
            Fines de Semana
          </button>
        </div>
      </div>

      {/* Grid de Programas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchedule.map((prog) => {
          const isLiveNow = currentShow.id === prog.id;

          return (
            <div
              key={prog.id}
              onClick={() => setSelectedShow(prog)}
              className={`group relative rounded-2xl overflow-hidden glass-card transition-all duration-300 flex flex-col justify-between border cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
                isLiveNow
                  ? 'border-[#00DD9E] ring-2 ring-[#00DD9E]/50 shadow-lg shadow-[#00DD9E]/20'
                  : 'border-slate-200 dark:border-white/10 hover:border-[#00DD9E]/50'
              }`}
            >
              {/* Imagen del programa con gradiente y fallback de alta calidad */}
              <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-[#001E4D]/40">
                <img
                  src={sanitizeImage(prog.image)}
                  alt={prog.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { 
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = './default-cover.png'; 
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                {/* Badge Al Aire si está en vivo */}
                {isLiveNow && (
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-[#00DD9E] backdrop-blur-md px-3 py-1 rounded-lg text-[#001E4D] text-[11px] font-black uppercase tracking-wider shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-[#001E4D] animate-ping"></span>
                    <span>AL AIRE AHORA</span>
                  </div>
                )}

                {/* Horario */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-xs font-mono font-bold border border-white/10 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-[#00DD9E]" />
                  <span>{prog.startTime} - {prog.endTime}</span>
                </div>

                {/* Indicador de Click para ver Ficha */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-white font-bold flex items-center space-x-1 border border-white/20">
                  <span>Ver Ficha</span>
                  <ChevronRight className="w-3 h-3 text-[#00DD9E]" />
                </div>
              </div>

              {/* Detalles */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Días de emisión */}
                  <div className="flex flex-wrap items-center gap-1 mb-2">
                    {(prog.days || []).map((d) => (
                      <span
                        key={d}
                        className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/5"
                      >
                        {daysLabel[d] || d}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-[#00DD9E] transition-colors">
                    {prog.title}
                  </h3>

                  <div className="flex items-center space-x-1.5 text-xs text-[#001E4D] dark:text-[#00DD9E] font-bold mb-3">
                    <User className="w-3.5 h-3.5" />
                    <span>Conduce: {prog.host}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {prog.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ficha Oficial</span>
                  </span>
                  {isLiveNow ? (
                    <span className="text-[#00DD9E] font-bold flex items-center space-x-1">
                      <Radio className="w-3.5 h-3.5" />
                      <span>Transmitiendo</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 group-hover:text-[#00DD9E] font-medium transition-colors">
                      Ver Detalles →
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* =========================================================================
          MODAL: FICHA TÉCNICA OFICIAL DEL PROGRAMA
      ========================================================================= */}
      {selectedShow && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 dark:bg-black/60 backdrop-blur-xl animate-fadeIn select-none"
          onClick={() => setSelectedShow(null)}
        >
          <div 
            className="relative w-full max-w-xl max-h-[88vh] bg-white/95 dark:bg-[#001438]/95 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl overflow-hidden animate-scaleUp flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Cabecera / Portada del Programa */}
            <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-900">
              <img
                src={sanitizeImage(selectedShow.image)}
                alt={selectedShow.title}
                className="w-full h-full object-cover"
                onError={(e) => { 
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = './default-cover.png'; 
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => setSelectedShow(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition cursor-pointer border border-white/20"
                title="Cerrar Ficha"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Badge Al Aire o Neblina Oficial */}
              <div className="absolute top-4 left-4">
                {currentShow.id === selectedShow.id ? (
                  <span className="flex items-center space-x-1.5 bg-[#00DD9E] px-3 py-1 rounded-xl text-[#001E4D] text-xs font-black uppercase tracking-wider shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#001E4D] animate-ping"></span>
                    <span>AL AIRE AHORA</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-bold border border-white/10">
                    <Radio className="w-3.5 h-3.5 text-[#00DD9E]" />
                    <span>Parrilla Oficial 105.5 FM</span>
                  </span>
                )}
              </div>

              {/* Título y Conducción sobre imagen */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00DD9E] bg-[#00DD9E]/10 px-2 py-0.5 rounded-md inline-block mb-1 border border-[#00DD9E]/20">
                  {selectedShow.startTime} — {selectedShow.endTime}
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white leading-tight drop-shadow-md">
                  {selectedShow.title}
                </h3>
                <p className="text-sm text-slate-300 font-semibold flex items-center space-x-1.5 mt-1">
                  <User className="w-4 h-4 text-[#00DD9E]" />
                  <span>Conduce: <strong className="text-white">{selectedShow.host}</strong></span>
                </p>
              </div>
            </div>

            {/* Contenido de la Ficha */}
            <div className="p-6 sm:p-7 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Sinopsis / Descripción */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-[#00DD9E]" />
                  <span>Sinopsis del Programa</span>
                </h4>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                  {selectedShow.description}
                </p>
              </div>

              {/* Días de Emisión Semanal */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-[#00DD9E]" />
                  <span>Días de Transmisión</span>
                </h4>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {fullDaysMap.map((dayObj) => {
                    const isAssigned = (selectedShow.days || []).includes(dayObj.id);
                    return (
                      <div
                        key={dayObj.id}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          isAssigned
                            ? 'bg-emerald-500/15 dark:bg-[#00DD9E]/20 border-emerald-500/40 text-emerald-800 dark:text-[#00DD9E] font-black shadow-xs'
                            : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500 font-medium'
                        }`}
                      >
                        <span className="block text-xs font-black">{dayObj.short}</span>
                        <span className="text-[10px] hidden sm:block font-bold">
                          {isAssigned ? 'Al Aire' : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Datos de Emisión y Cobertura */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Emisión Oficial</span>
                  <span className="font-bold text-slate-800 dark:text-white">Neblina 105.5 FM & Streaming HD Global</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Ubicación de Estudio</span>
                  <span className="font-bold text-slate-800 dark:text-white">Santo Domingo, Mérida - Venezuela</span>
                </div>
              </div>
            </div>

            {/* Barra de Acciones Inferior */}
            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-white/[0.03] border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleShare(selectedShow)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Compartir Programa</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {(onPlayLive || playLiveStream) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onPlayLive) onPlayLive();
                      else if (playLiveStream) playLiveStream();
                      setSelectedShow(null);
                    }}
                    className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#00DD9E] text-[#001E4D] font-black text-xs shadow-md hover:bg-[#00c98f] transition cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Escuchar Señal en Vivo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedShow(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
