import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  History,
  Radio,
  MessageCircle,
  Maximize2,
  ChevronDown,
  Share2,
  Check
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { STATION_INFO } from '../services/api';
import Emoji3D from './Emoji3D';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function MixStylePlayer({ onOpenHistory }) {
  const { 
    isPlaying, 
    isBuffering, 
    playbackType, 
    activePodcast, 
    currentTime,
    duration,
    seekTo,
    volume, 
    isMuted, 
    metadata, 
    currentShow, 
    togglePlay, 
    returnToLive, 
    setVolume, 
    setIsMuted,
    internalStreamServer,
    isNewsBackupActive
  } = useAudioPlayer();

  // Estado para el Reproductor Expandido estilo Spotify (solo para dispositivos móviles)
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Cerrar vista expandida si la pantalla pasa a escritorio y bloquear el scroll del fondo
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileExpanded) {
        setIsMobileExpanded(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileExpanded]);

  // Prevenir que el scroll o swipe del móvil mueva o pierda la vista del reproductor expandido
  useEffect(() => {
    if (isMobileExpanded) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isMobileExpanded]);

  const isPodcast = playbackType === 'podcast';
  const isNewsBackup = Boolean(isNewsBackupActive || internalStreamServer === 'noticiero102');

  // Carátula del programa activo al aire según la parrilla
  const activeShowCover = currentShow?.image || currentShow?.artwork;

  // Carátula de programa personalizada (excluyendo placeholders o logos previos)
  const hasCustomShowCover = Boolean(
    activeShowCover && 
    !activeShowCover.includes('default.jpg') && 
    !activeShowCover.includes('logo-tight') && 
    !activeShowCover.includes('icon-tight') &&
    activeShowCover !== '/cover-default.png'
  );

  // Carátula real de canción obtenida desde metadatos de la señal o iTunes
  const hasRealSongCover = Boolean(
    metadata?.hasSongCover && 
    metadata.artwork && 
    metadata.artwork !== '/cover-default.png' && 
    metadata.artwork !== '/icon-tight.svg' && 
    metadata.artwork !== '/logo-tight.svg'
  );

  // Prioridad de Carátula solicitada:
  // 1. Si es podcast: carátula del podcast
  // 2. Si se obtuvo el cover de la canción con los metadatos enviados: cover de la canción
  // 3. Cuando no se consigan o no envíen metadatos de la canción:
  //    - Si hay un programa específico al aire con carátula propia personalizada: carátula del programa
  //    - En cualquier otro caso: la nueva carátula oficial por defecto (/cover-default.png)
  const displayImage = isPodcast 
    ? (activePodcast?.cover_url || '/cover-default.png') 
    : (hasRealSongCover 
        ? metadata.artwork 
        : (hasCustomShowCover ? activeShowCover : '/cover-default.png'));

  // Si la metadata es la genérica de la estación, destacar el nombre y locutor del programa al aire
  const isGenericMetadata = !metadata.song || metadata.song.includes('Neblina') || metadata.song.includes('Radio En Vivo');

  const displayTitle = isPodcast 
    ? (activePodcast?.title || 'Podcast') 
    : (isNewsBackup 
        ? 'Noticiero 102 · Emisión en Vivo' 
        : (!isGenericMetadata ? metadata.song : (currentShow?.title || 'Neblina Stereo 105.5 FM')));

  const displaySubtitle = isPodcast 
    ? (`${activePodcast?.show || 'Podcast'} · ${activePodcast?.author || 'Neblina'}`) 
    : (isNewsBackup
        ? 'Estudio 102.7 FM (Respaldo Oficial) · Retornará a Neblina automáticamente'
        : (!isGenericMetadata 
            ? (currentShow?.title ? `${metadata.artist || '105.5 FM'} · En: ${currentShow.title}` : (metadata.artist ? `${metadata.artist} · 105.5 FM` : 'Santo Domingo - Mérida · En Vivo'))
            : (currentShow?.host ? `Con ${currentShow.host} · 105.5 FM` : 'Santo Domingo - Mérida · En Vivo')));

  const handleShareStream = async () => {
    const shareText = `🎧 Escuchando en vivo: "${displayTitle}" en Neblina Stereo 105.5 FM (Santo Domingo - Mérida)`;
    const shareUrl = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Neblina Stereo 105.5 FM',
          text: shareText,
          url: shareUrl
        });
        return;
      } catch {
        // Fallback a portapapeles
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* REPRODUCTOR EXPANDIDO ESTILO SPOTIFY (SOLO DISPOSITIVOS MÓVILES < md)     */}
      {/* ========================================================================= */}
      {isMobileExpanded && (
        <div className="md:hidden fixed inset-0 z-[100] h-[100dvh] w-screen flex flex-col justify-between overflow-hidden bg-[#060d1a]/95 backdrop-blur-3xl text-white px-5 pt-4 pb-6 animate-fadeIn select-none touch-none overscroll-none">
          {/* Fondo atmosférico dinámico con la carátula difuminada estilo Spotify */}
          <div 
            className="absolute inset-0 opacity-35 blur-3xl scale-125 pointer-events-none bg-center bg-cover transition-all duration-700"
            style={{ backgroundImage: `url(${displayImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#001E4D]/60 via-[#040b17]/80 to-[#02060d]/95 pointer-events-none" />

          {/* Barra superior del reproductor Spotify */}
          <div className="relative z-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsMobileExpanded(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl flex items-center justify-center text-white active:scale-95 transition cursor-pointer"
              aria-label="Minimizar reproductor"
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center text-center">
              <span className="text-[11px] font-black uppercase tracking-widest text-white/65">
                {isPodcast ? 'Reproduciendo Podcast' : 'Transmitiendo desde Santo Domingo'}
              </span>
              <span className="text-xs font-black text-[#00DD9E] tracking-wide mt-0.5">
                Neblina Stereo 105.5 FM
              </span>
            </div>

            <button
              type="button"
              onClick={handleShareStream}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl flex items-center justify-center text-white active:scale-95 transition cursor-pointer"
              aria-label="Compartir sintonía"
              title="Compartir lo que suena"
            >
              {copiedShare ? <Check className="w-4 h-4 text-[#00DD9E]" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Carátula Principal Grande estilo Spotify */}
          <div className="relative z-10 my-auto py-2 flex flex-col items-center">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20 bg-black/40">
              <img
                src={displayImage}
                alt={displayTitle}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/cover-default.png'; }}
              />
            </div>

            {/* Badge EN VIVO palpitante con borde rojo en la vista Spotify */}
            <div className="mt-4 flex items-center justify-center">
              {isPodcast ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Episodio Podcast</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-600/20 border border-red-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
                  </span>
                  <span className="text-red-100 drop-shadow-xs">
                    {isNewsBackup ? 'Noticiero 102 · En Vivo' : 'En Vivo · 105.5 FM'}
                  </span>
                </div>
              )}
            </div>

            {/* Información de la Canción / Programa */}
            <div className="mt-4 w-full text-center px-2">
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white leading-tight line-clamp-2">
                {displayTitle}
              </h2>
              <p className="text-sm font-semibold text-[#00DD9E] mt-1.5 line-clamp-2">
                {displaySubtitle}
              </p>
              {currentShow?.host && !isPodcast && (
                <p className="text-xs text-white/65 mt-1">
                  Locución: {currentShow.host} {currentShow.timeRange ? `• ${currentShow.timeRange}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Controles Inferiores estilo Spotify */}
          <div className="relative z-10 space-y-5">
            {/* Barra de progreso o línea de onda en vivo */}
            {isPodcast ? (
              <div>
                <input
                  type="range"
                  min="0"
                  max={duration > 0 ? duration : 100}
                  step="1"
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00DD9E]"
                  aria-label="Posición del podcast"
                />
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-white/70 mt-1.5">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden p-0.5">
                  <div className={`h-full rounded-full transition-all duration-500 ${isPlaying ? 'w-full bg-[#00DD9E]' : 'w-1/3 bg-white/30'}`} />
                </div>
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-white/60">
                  <span>Señal Digital HD</span>
                  <span className="text-red-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    Transmisión Continua
                  </span>
                </div>
              </div>
            )}

            {/* Botonera Principal (Historial, Play/Pause Gigante, Pedir por WhatsApp) */}
            <div className="flex items-center justify-around">
              <button
                type="button"
                onClick={() => {
                  setIsMobileExpanded(false);
                  if (onOpenHistory) onOpenHistory();
                }}
                className="flex flex-col items-center space-y-1 text-white/80 hover:text-white active:scale-95 transition cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center">
                  <Emoji3D name="history" className="w-6 h-6" alt="Historial" />
                </div>
                <span className="text-[11px] font-bold">Ya Sonó</span>
              </button>

              <button
                type="button"
                onClick={togglePlay}
                disabled={isBuffering}
                className="w-20 h-20 rounded-full bg-[#00DD9E] text-[#001E4D] hover:bg-[#00c98f] active:scale-95 flex items-center justify-center shadow-[0_10px_35px_rgba(0,221,158,0.5)] border-2 border-white/80 transition cursor-pointer"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isBuffering ? (
                  <RefreshCw className="w-8 h-8 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-9 h-9 fill-current" />
                ) : (
                  <Play className="w-9 h-9 fill-current ml-1" />
                )}
              </button>

              <a
                href={STATION_INFO.whatsappSongRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center space-y-1 text-white/80 hover:text-white active:scale-95 transition cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center">
                  <Emoji3D name="whatsapp" className="w-6 h-6" alt="Cabina WhatsApp" />
                </div>
                <span className="text-[11px] font-bold">Cabina</span>
              </a>
            </div>

            {/* Control de Volumen Deslizante en Vista Spotify */}
            <div className="flex items-center space-x-3 px-3 py-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="text-white/80 hover:text-white cursor-pointer"
                aria-label="Silenciar"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-[#00DD9E]" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-white/25 accent-[#00DD9E]"
                aria-label="Volumen"
              />
              <span className="text-[11px] font-mono font-bold text-white/80 w-9 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            {isPodcast && (
              <button
                type="button"
                onClick={returnToLive}
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Emoji3D name="radio" className="w-4 h-4" />
                <span>Volver a la Señal En Vivo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BARRA REPRODUCTOR PRINCIPAL CON EFECTO AEROGLASS TRASLÚCIDO               */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center">
        <div className="w-full max-w-4xl pointer-events-auto px-2 sm:px-6">
          
          {/* Contenedor AeroGlass Traslúcido real con refracción de fondo */}
          <div className="relative bg-white/55 dark:bg-[#001E4D]/55 backdrop-blur-2xl backdrop-saturate-200 border-t border-x border-white/75 dark:border-white/20 player-glow-drift rounded-t-[26px] sm:rounded-t-[30px] shadow-[0_-12px_40px_rgba(0,30,77,0.18),inset_0_1px_2px_rgba(255,255,255,0.85)] dark:shadow-[0_-14px_48px_rgba(0,0,0,0.75),inset_0_1px_1.5px_rgba(255,255,255,0.22)] px-3.5 sm:px-7 py-2.5 sm:py-3 transition-all duration-300">
            
            {/* BARRA DE PROGRESO INTERACTIVA PARA PODCASTS (Seekbar) */}
            {isPodcast && (
              <div className="mb-2.5 pt-0.5">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 mb-1 px-1">
                  <span className="text-[#001E4D] dark:text-[#00DD9E] font-semibold">{formatTime(currentTime)}</span>
                  <span className="text-[11px] uppercase font-sans font-extrabold tracking-wider text-slate-600 dark:text-slate-300">
                    Desliza para avanzar
                  </span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="relative flex items-center group">
                  <input
                    type="range"
                    min="0"
                    max={duration > 0 ? duration : 100}
                    step="1"
                    value={currentTime}
                    onChange={(e) => seekTo(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-300/70 dark:bg-black/50 rounded-lg appearance-none cursor-pointer accent-[#00DD9E] transition hover:h-2.5"
                    aria-label="Barra de posición del podcast"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 sm:gap-5">
              
              {/* Lado izquierdo: Ícono Squircle iOS + Textos (En móvil abre el modo Spotify al tocar la carátula/título) */}
              <div 
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsMobileExpanded(true);
                  }
                }}
                className="flex items-center space-x-3 min-w-0 flex-1 max-w-[44%] sm:max-w-xs md:max-w-sm cursor-pointer md:cursor-default"
                title={!isPodcast && currentShow?.title ? `Programa al aire: ${currentShow.title} (${currentShow.timeRange || 'En Vivo'})` : displayTitle}
              >
                <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-[22%] overflow-hidden ${isPlaying ? "anim-vinyl-playing" : ""} bg-white/50 dark:bg-black/40 border border-white/80 dark:border-[#00DD9E]/40 flex-shrink-0 flex items-center justify-center shadow-sm group`}>
                  <img 
                    src={displayImage} 
                    alt={displayTitle} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:-translate-y-0.5"
                    onError={(e) => { e.currentTarget.src = '/cover-default.png'; }}
                  />
                </div>

                <div className="min-w-0 flex-1 leading-tight">
                  <h4 className="font-display font-black text-xs sm:text-sm truncate tracking-tight text-slate-900 dark:text-white drop-shadow-2xs">
                    {displayTitle}
                  </h4>
                  <p className="text-[11px] sm:text-[11px] text-[#001E4D] dark:text-[#00DD9E] font-bold truncate mt-0.5">
                    {displaySubtitle}
                  </p>
                </div>
              </div>

              {/* Centro: Botón Play Circular + Indicador EN VIVO con Borde Rojo Palpitante (Visible en TODOS los dispositivos) */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                
                {/* Botón Circular de Reproducción Oficial */}
                <button
                  onClick={togglePlay}
                  disabled={isBuffering}
                  className="w-11 h-11 sm:w-12 sm:h-12 shimmer-hover btn-spring-press rounded-full bg-[#00DD9E] text-[#001E4D] hover:bg-[#00c98f] active:scale-95 flex items-center justify-center transition-all duration-200 shadow-md shadow-black/20 dark:shadow-black/50 border border-white/70 flex-shrink-0 cursor-pointer"
                  aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isBuffering ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Indicador "En vivo" con Borde Rojo y Efecto Palpitante en TODOS los dispositivos */}
                {isPodcast ? (
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500 text-amber-800 dark:text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-[11px] sm:text-[11px] font-bold uppercase tracking-wider">Podcast</span>
                  </div>
                ) : (
                  <div 
                    className={`anim-live-breathe inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-red-500/80 bg-red-500/10 dark:bg-red-500/20 backdrop-blur-md transition-all duration-300 ${
                      isPlaying 
                        ? 'shadow-xs border-red-500' 
                        : 'shadow-sm opacity-80'
                    }`}
                    title={isNewsBackup ? 'Emitiendo vía respaldo de Estudio 102.7 FM para Noticiero 102.' : 'Transmisión en Vivo Neblina 105.5 FM'}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-500 flex-shrink-0 shadow-[0_0_6px_#ef4444]" />
                    <span className="text-[11px] sm:text-[11px] font-bold uppercase tracking-wider text-red-700 dark:text-red-200 whitespace-nowrap">
                      {isNewsBackup ? 'Noticiero 102' : 'En vivo'}
                    </span>
                  </div>
                )}
              </div>

              {/* Lado derecho: Control de Volumen + Acciones + Botón Agrandar estilo Spotify en Móvil */}
              <div className="flex items-center space-x-1.5 sm:space-x-3">
                
                {/* Control de Volumen en Escritorio */}
                <div className="hidden md:flex items-center space-x-2.5">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Volumen</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-16 lg:w-20 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-300/80 dark:bg-black/40 accent-[#00DD9E]"
                  />
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-slate-700 dark:text-slate-200 hover:text-[#00DD9E] dark:hover:text-[#00DD9E] transition cursor-pointer"
                    aria-label="Silenciar"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-500" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* BOTÓN "VOLVER A EN VIVO" si se está reproduciendo un podcast */}
                {isPodcast ? (
                  <button
                    onClick={returnToLive}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-[11px] sm:text-[11px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                    title="Pausar podcast y volver a la transmisión de radio en vivo"
                  >
                    <Emoji3D name="radio" className="w-3.5 h-3.5 drop-shadow-xs" />
                    <span className="hidden sm:inline">Volver a En Vivo</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    <span className="hidden lg:inline text-[11px] font-black uppercase tracking-widest text-[#001E4D] dark:text-[#00DD9E]">
                      105.5 FM
                    </span>
                    <button
                      onClick={onOpenHistory}
                      className="min-w-[36px] min-h-[36px] sm:min-w-[38px] sm:min-h-[38px] p-1.5 sm:p-2 rounded-xl bg-white/45 dark:bg-white/10 border border-white/60 dark:border-white/15 backdrop-blur-md flex items-center justify-center hover:-translate-y-0.5 active:scale-95 transition-transform duration-200 cursor-pointer"
                      title="Ver historial de canciones (Ya Sonó)"
                      aria-label="Historial de canciones"
                    >
                      <Emoji3D name="history" className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs" alt="Historial" />
                    </button>

                    <a
                      href={STATION_INFO.whatsappSongRequestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:flex min-w-[38px] min-h-[38px] p-2 rounded-xl bg-white/45 dark:bg-white/10 border border-white/60 dark:border-white/15 backdrop-blur-md items-center justify-center hover:-translate-y-0.5 active:scale-95 transition-transform duration-200 cursor-pointer"
                      title="Pedir canción o reportar sintonía por WhatsApp (+58 424 745 9774)"
                      aria-label="Pedir canción por WhatsApp"
                    >
                      <Emoji3D name="whatsapp" className="w-5 h-5 drop-shadow-xs" alt="WhatsApp" />
                    </a>
                  </div>
                )}

                {/* Botón exclusivo para Móviles (< md): Agrandar Reproductor estilo Spotify */}
                <button
                  type="button"
                  onClick={() => setIsMobileExpanded(true)}
                  className="md:hidden min-w-[36px] min-h-[36px] p-2 rounded-xl bg-white/55 dark:bg-white/15 border border-white/75 dark:border-[#00DD9E]/40 text-[#001E4D] dark:text-[#00DD9E] backdrop-blur-md flex items-center justify-center shadow-xs active:scale-95 transition cursor-pointer"
                  title="Agrandar reproductor"
                  aria-label="Agrandar reproductor estilo Spotify"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

              </div>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}
