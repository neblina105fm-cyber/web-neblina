import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  STREAM_CONFIG, 
  fetchNowPlaying, 
  getCurrentLiveShow, 
  STATION_INFO,
  isNoticiero102Window,
  probeAudioStream
} from '../services/api';
import { recordSongPlay } from '../services/rankingService';

const AudioPlayerContext = createContext(null);

export function AudioPlayerProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  
  // 'live' (Radio en vivo) o 'podcast' (Audio grabado)
  const [playbackType, setPlaybackType] = useState('live'); 
  const [activePodcast, setActivePodcast] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Servidor interno (oculto al usuario):
  // 'primary' (Éxtasis HD) | 'backup' (Zeno Neblina) | 'noticiero102' (Estudio 102.7 FM Respaldo Especial L-V 7-8am / 12-1pm)
  const [internalStreamServer, setInternalStreamServer] = useState('primary');

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Metadatos en vivo
  const [metadata, setMetadata] = useState({
    songtitle: 'Neblina Stereo 105.5 FM',
    artist: 'Contigo en la cima',
    song: 'Radio En Vivo',
    artwork: STATION_INFO.cover,
    hasSongCover: false,
    history: []
  });
  const [currentShow, setCurrentShow] = useState(getCurrentLiveShow());

  // Referencias mutables para evitar re-crear listeners en useEffect
  const audioRef = useRef(null);
  const playbackTypeRef = useRef('live');
  const internalStreamServerRef = useRef('primary');
  const isPlayingRef = useRef(false);
  const bufferingWatchdogRef = useRef(null);
  const isSwitchingRef = useRef(false);
  const lastFailoverTimeRef = useRef(0);

  useEffect(() => {
    playbackTypeRef.current = playbackType;
  }, [playbackType]);

  useEffect(() => {
    internalStreamServerRef.current = internalStreamServer;
  }, [internalStreamServer]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  
  // Genera URL de streaming en vivo con query param para conectar en el instante presente (Live Edge)
  const getLiveStreamUrl = (serverKey) => {
    const baseUrl = STREAM_CONFIG[serverKey]?.url || STREAM_CONFIG.primary.url;
    // Agrega timestamp único para saltar buffers HTTP / proxy caches intermedios
    const delimiter = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${delimiter}_t=${Date.now()}`;
  };

  // Función unificada de conmutación de servidor de streaming
  const switchToStream = (serverKey) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isSwitchingRef.current) {
      console.log(`[AudioPlayer] Conmutación ya en curso. Omitiendo solicitud concurrente para ${serverKey}.`);
      return;
    }
    isSwitchingRef.current = true;

    const targetConfig = STREAM_CONFIG[serverKey];
    if (!targetConfig) {
      isSwitchingRef.current = false;
      return;
    }

    console.log(`[AudioPlayer] Conmutando a servidor: ${targetConfig.name} (${serverKey}) -> ${targetConfig.url}`);
    internalStreamServerRef.current = serverKey;
    setInternalStreamServer(serverKey);

    try {
      audio.pause();
      audio.src = getLiveStreamUrl(serverKey);
      audio.load();
    } catch (e) {}

    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        setIsPlaying(true);
        setIsBuffering(false);
        isSwitchingRef.current = false;
      }).catch((err) => {
        isSwitchingRef.current = false;
        if (err.name === 'AbortError') {
          // Descarte normal de promesa interrumpida por nueva carga
          return;
        }
        console.warn(`[AudioPlayer] Fallo al reproducir ${serverKey}:`, err);
        handleStreamFailover(serverKey);
      });
    } else {
      isSwitchingRef.current = false;
    }
  };

  // Manejador centralizado de conmutación por fallas (failover) con limitador de frecuencia
  const handleStreamFailover = (failedServer = internalStreamServerRef.current) => {
    const now = Date.now();
    if (now - lastFailoverTimeRef.current < 900) {
      return;
    }
    lastFailoverTimeRef.current = now;

    const inNewsWindow = isNoticiero102Window();

    if (failedServer === 'primary') {
      console.warn('[Failover] Señal primaria Éxtasis HD con problemas. Conmutando a señal de respaldo propia (Zeno Neblina)...');
      switchToStream('backup');
    } else if (failedServer === 'backup') {
      // Si el respaldo de Neblina falla:
      // ¿Estamos en la ventana horaria del Noticiero 102 (L-V 7-8am / 12-1pm)?
      if (inNewsWindow) {
        console.warn('[Failover] Ambas señales de Neblina inactivas durante emisión de Noticiero 102. Conmutando a señal de respaldo de Estudio 102.7 FM...');
        switchToStream('noticiero102');
      } else {
        // Fuera del horario de noticias, no se usa Estudio 102.7; reintentar la primaria de Neblina
        console.warn('[Failover] Señal de respaldo Neblina caída fuera de horario de noticias. Reintentando señal primaria...');
        setTimeout(() => {
          if (audioRef.current && isPlayingRef.current && playbackTypeRef.current === 'live') {
            switchToStream('primary');
          }
        }, 3500);
      }
    } else if (failedServer === 'noticiero102') {
      // Si falló el stream de Estudio 102.7, reintentar las señales de Neblina para verificar si ya volvieron
      console.warn('[Failover] Falla en enlace de Estudio 102.7 FM. Verificando si señales de Neblina ya están activas...');
      setTimeout(() => {
        if (audioRef.current && isPlayingRef.current && playbackTypeRef.current === 'live') {
          switchToStream('primary');
        }
      }, 3500);
    }
  };

  // Inicializar el elemento de audio UNA SOLA VEZ al montar el proveedor
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    const onPlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      if (bufferingWatchdogRef.current) {
        clearTimeout(bufferingWatchdogRef.current);
        bufferingWatchdogRef.current = null;
      }
    };

    const onPause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      if (bufferingWatchdogRef.current) {
        clearTimeout(bufferingWatchdogRef.current);
        bufferingWatchdogRef.current = null;
      }
    };

    const onWaiting = () => {
      setIsBuffering(true);
      // Watchdog para evitar silencios prolongados si un streaming se congela (>12s)
      if (playbackTypeRef.current === 'live' && isPlayingRef.current) {
        if (bufferingWatchdogRef.current) clearTimeout(bufferingWatchdogRef.current);
        bufferingWatchdogRef.current = setTimeout(() => {
          console.warn('[AudioPlayer Watchdog] Buffering prolongado detectado (>12s). Activando conmutación de servidor...');
          handleStreamFailover(internalStreamServerRef.current);
        }, 12000);
      }
    };

    const onCanPlay = () => {
      setIsBuffering(false);
      if (bufferingWatchdogRef.current) {
        clearTimeout(bufferingWatchdogRef.current);
        bufferingWatchdogRef.current = null;
      }
    };

    const onError = (e) => {
      if (isSwitchingRef.current) return;
      console.warn('Audio playback error:', e);
      setIsBuffering(false);
      if (bufferingWatchdogRef.current) {
        clearTimeout(bufferingWatchdogRef.current);
        bufferingWatchdogRef.current = null;
      }

      // Si falla mientras se está en vivo, activar conmutación inteligente
      if (playbackTypeRef.current === 'live') {
        handleStreamFailover(internalStreamServerRef.current);
      }
    };

    const onEnded = () => {
      if (playbackTypeRef.current === 'podcast') {
        returnToLive();
      }
    };

    const onTimeUpdate = () => {
      if (playbackTypeRef.current === 'podcast') {
        setCurrentTime(audio.currentTime || 0);
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      }
    };

    const onLoadedMetadata = () => {
      if (playbackTypeRef.current === 'podcast') {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      }
    };

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    // Monitor de retardo de buffer: Si la conexión del cliente acumuló mucho buffer viejo (>5s de atraso),
    // resincronizar suavemente con el borde en vivo para estar lo más actualizado posible.
    const onProgress = () => {
      if (playbackTypeRef.current !== 'live' || !isPlayingRef.current || !audio) return;
      try {
        if (audio.buffered && audio.buffered.length > 0) {
          const liveEdge = audio.buffered.end(audio.buffered.length - 1);
          const lag = liveEdge - audio.currentTime;
          // Si el desfase acumulado en buffer supera los 5.5 segundos, saltar discretamente al borde vivo
          if (lag > 5.5 && isFinite(liveEdge)) {
            audio.currentTime = liveEdge - 0.5;
          }
        }
      } catch (e) {}
    };

    audio.addEventListener('progress', onProgress);


    return () => {
      audio.pause();
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('progress', onProgress);
      if (bufferingWatchdogRef.current) clearTimeout(bufferingWatchdogRef.current);
    };
  }, []);

  // Control de volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Monitor de Auto-Recuperación cuando Estudio 102.7 FM (Noticiero 102) está activo:
  // Conmuta de vuelta a los servidores propios de Neblina en el momento exacto en que comiencen a transmitir,
  // o cuando la ventana horaria del noticiero culmine.
  useEffect(() => {
    if (internalStreamServer !== 'noticiero102' || playbackType !== 'live') {
      return;
    }

    let isMounted = true;
    console.log('[Noticiero 102 Respaldo] Monitor de auto-recuperación activo. Sondeando regreso de servidores de Neblina...');

    const intervalId = setInterval(async () => {
      if (!isMounted) return;

      // 1. Si culminó la ventana horaria del noticiero, retornar de inmediato a la señal habitual
      if (!isNoticiero102Window()) {
        console.log('[Noticiero 102] Culminó la ventana del noticiero (7-8am / 12-1pm L-V). Retornando a señal de Neblina...');
        switchToStream('primary');
        return;
      }

      // 2. Si todavía estamos en el horario del noticiero, sondear si Neblina principal ya comenzó a transmitir
      try {
        const primaryOk = await probeAudioStream(STREAM_CONFIG.primary.url, 3500);
        if (!isMounted) return;

        if (primaryOk) {
          console.log('[Auto-Recuperación] ¡Señal principal de Neblina (Éxtasis HD) activa y transmitiendo! Retornando automáticamente...');
          switchToStream('primary');
          return;
        }

        // Si la principal aún no, sondear el respaldo propio de Neblina (Zeno)
        const backupOk = await probeAudioStream(STREAM_CONFIG.backup.url, 3500);
        if (!isMounted) return;

        if (backupOk) {
          console.log('[Auto-Recuperación] ¡Señal de respaldo de Neblina (Zeno) activa y transmitiendo! Retornando automáticamente...');
          switchToStream('backup');
          return;
        }

        console.log('[Noticiero 102] Servidores propios de Neblina aún no transmiten. Manteniendo Estudio 102.7 FM...');
      } catch (err) {
        console.warn('Error en sondeo de auto-recuperación:', err);
      }
    }, 15000); // Comprobación cada 15 segundos

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [internalStreamServer, playbackType]);

  // Monitor secundario: Si estamos en el respaldo de Neblina (Zeno), sondear el regreso de la principal (Éxtasis HD)
  useEffect(() => {
    if (internalStreamServer !== 'backup' || playbackType !== 'live') {
      return;
    }

    let isMounted = true;
    const intervalId = setInterval(async () => {
      if (!isMounted) return;
      try {
        const primaryOk = await probeAudioStream(STREAM_CONFIG.primary.url, 3500);
        if (!isMounted) return;
        if (primaryOk) {
          console.log('[Auto-Recuperación] Señal principal Éxtasis HD recuperada. Conmutando a primaria...');
          switchToStream('primary');
        }
      } catch (e) {}
    }, 45000); // Comprobación cada 45 segundos

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [internalStreamServer, playbackType]);

  // Actualizar metadatos cada 10 segundos y escuchar cambios en la parrilla radial
  useEffect(() => {
    let isMounted = true;
    const updateMeta = async () => {
      const data = await fetchNowPlaying();
      if (isMounted) {
        setMetadata(data);
        setCurrentShow(getCurrentLiveShow());
        if (data && data.song && data.artist) {
          recordSongPlay(data);
        }

        // Verificación de horario: Si estamos en noticiero102 y ya pasó la hora, salir del respaldo
        if (internalStreamServerRef.current === 'noticiero102' && !isNoticiero102Window()) {
          console.log('[Horario] Fin de la ventana de Noticiero 102 detectado por el reloj. Regresando a señal de Neblina...');
          switchToStream('primary');
        }
      }
    };

    const handleScheduleUpdated = () => {
      if (isMounted) {
        setCurrentShow(getCurrentLiveShow());
      }
    };

    updateMeta();
    const interval = setInterval(updateMeta, 10000);
    window.addEventListener('neblina_schedule_updated', handleScheduleUpdated);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('neblina_schedule_updated', handleScheduleUpdated);
    };
  }, []);

  // Media Session API para pantalla de bloqueo, Smart TV y centro de notificaciones nativo
  useEffect(() => {
    if ('mediaSession' in navigator) {
      const isLive = playbackType === 'live';
      const isNewsBackup = internalStreamServer === 'noticiero102';
      
      const artworkUrl = isLive 
        ? (metadata.hasSongCover ? metadata.artwork : (currentShow?.image || STATION_INFO.cover)) 
        : (activePodcast?.cover_url || STATION_INFO.cover);
      
      const absoluteArtwork = (typeof window !== 'undefined' && artworkUrl && !artworkUrl.startsWith('http'))
        ? window.location.origin + artworkUrl
        : (artworkUrl || (typeof window !== 'undefined' ? window.location.origin + '/cover-default.png' : '/cover-default.png'));

      const liveTitle = isNewsBackup 
        ? 'Noticiero 102 · Estudio 102.7 FM (Respaldo Oficial)' 
        : (currentShow?.title || metadata.song || 'Neblina 105.5 FM');

      const liveArtist = isNewsBackup 
        ? 'Estudio 102.7 FM · Transmisión de Respaldo' 
        : (currentShow?.host || metadata.artist || 'Santo Domingo - Mérida · En Vivo');

      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: isLive ? liveTitle : (activePodcast?.title || 'Podcast'),
          artist: isLive ? liveArtist : (activePodcast?.author || 'Neblina Stereo'),
          album: isLive ? (isNewsBackup ? 'Noticiero 102' : (currentShow.title || 'Neblina Stereo 105.5 FM')) : (activePodcast?.show || 'Podcast'),
          artwork: [
            { src: absoluteArtwork, sizes: '96x96', type: 'image/jpeg' },
            { src: absoluteArtwork, sizes: '192x192', type: 'image/jpeg' },
            { src: absoluteArtwork, sizes: '512x512', type: 'image/jpeg' }
          ]
        });

        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

        navigator.mediaSession.setActionHandler('play', () => togglePlay());
        navigator.mediaSession.setActionHandler('pause', () => togglePlay());
        navigator.mediaSession.setActionHandler('stop', () => {
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        });
      } catch (err) {
        console.warn('Error setting mediaSession:', err);
      }
    }
  }, [metadata, currentShow, playbackType, activePodcast, isPlaying, internalStreamServer]);

  // Reproducir transmisión en vivo
  const playLiveStream = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setPlaybackType('live');
    playbackTypeRef.current = 'live';
    setActivePodcast(null);
    setIsBuffering(true);

    const inNewsWindow = isNoticiero102Window();

    // Si estábamos en noticiero102 pero ya no es horario de noticiero, resetear a primaria
    if (internalStreamServerRef.current === 'noticiero102' && !inNewsWindow) {
      internalStreamServerRef.current = 'primary';
      setInternalStreamServer('primary');
    }

    const currentKey = internalStreamServerRef.current;
    const freshLiveUrl = getLiveStreamUrl(currentKey);
    
    // Siempre refrescar src al borde en vivo presente para evitar reproducir audio almacenado previamente en buffer
    try {
      audio.pause();
      audio.src = freshLiveUrl;
      audio.load();
    } catch(e) {}

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.warn(`[AudioPlayer] Fallo al iniciar señal (${currentKey}), ejecutando conmutación:`, err);
          handleStreamFailover(currentKey);
        });
    }
  };

  // Reproducir un podcast en el reproductor unificado
  const playPodcast = (podcast) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playbackType === 'podcast' && activePodcast?.id === podcast.id) {
      if (audio.paused) {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        audio.pause();
        setIsPlaying(false);
      }
      return;
    }

    setPlaybackType('podcast');
    playbackTypeRef.current = 'podcast';
    setActivePodcast(podcast);
    setIsBuffering(true);

    audio.src = podcast.audio_url;
    audio.load();
    audio.play()
      .then(() => {
        setIsPlaying(true);
        setIsBuffering(false);
      })
      .catch((err) => {
        console.error('Error al reproducir podcast:', err);
        setIsBuffering(false);
      });
  };

  // Volver a la transmisión en vivo
  const returnToLive = () => {
    setCurrentTime(0);
    setDuration(0);
    playLiveStream();
  };

  // Adelantar o retroceder en el podcast
  const seekTo = (seconds) => {
    const audio = audioRef.current;
    if (audio && playbackType === 'podcast') {
      audio.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  // Alternar reproducción / pausa
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      setIsBuffering(false);
    } else {
      if (playbackType === 'podcast' && activePodcast) {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        playLiveStream();
      }
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
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
        playLiveStream,
        playPodcast,
        returnToLive,
        setVolume,
        setIsMuted,
        internalStreamServer,
        isNewsBackupActive: internalStreamServer === 'noticiero102',
        streamServerInfo: STREAM_CONFIG[internalStreamServer],
        inNewsWindow: isNoticiero102Window(),
        switchToStream
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}
