import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Tv, 
  Sun, 
  Moon,
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  Download, 
  QrCode,
  Calendar,
  Clock
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useTheme } from '../context/ThemeContext';
import { getCachedBcvRates, fetchLiveBcvRates } from '../services/bcvService';
import { getCombinedNews, getAllNews } from '../services/newsData';
import { getActiveBannersForPlacement, recordBannerView } from '../services/adBannerService';
import Emoji3D from '../components/Emoji3D';

// Coordenadas de Santo Domingo, Mérida como base
const FALLBACK_COORDS = { lat: 8.8667, lon: -70.7667, city: 'Santo Domingo, Mérida' };

function getWeatherCondition(code) {
  if (code === 0) return { label: 'Despejado', icon: Sun, color: 'text-amber-400' };
  if (code >= 1 && code <= 2) return { label: 'Parcial', icon: CloudSun, color: 'text-sky-400' };
  if (code === 3) return { label: 'Nublado', icon: Cloud, color: 'text-slate-300 dark:text-slate-400' };
  if (code === 45 || code === 48) return { label: 'Neblina en la Cima', icon: CloudFog, color: 'text-[#00DD9E]' };
  if (code >= 51 && code <= 67) return { label: 'Lluvias', icon: CloudRain, color: 'text-blue-400' };
  if (code >= 71 && code <= 77) return { label: 'Aguanieve', icon: CloudSnow, color: 'text-cyan-300' };
  if (code >= 80 && code <= 82) return { label: 'Chubascos', icon: CloudRain, color: 'text-indigo-400' };
  if (code >= 95) return { label: 'Tormenta Eléctrica', icon: CloudLightning, color: 'text-amber-400' };
  return { label: 'Tiempo Estable', icon: CloudSun, color: 'text-sky-400' };
}

export default function SmartTvPage() {
  const { isPlaying, togglePlay, metadata } = useAudioPlayer();
  const { theme, toggleTheme } = useTheme();

  // 0. Estudio de resolución de pantalla para centrado perfecto y cálculo de escala
  const [screenInfo, setScreenInfo] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080
  }));

  useEffect(() => {
    const handleResize = () => {
      setScreenInfo({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isPlaying) {
        try {
          const res = togglePlay();
          if (res && typeof res.catch === 'function') {
            res.catch(() => {});
          }
        } catch (e) {
          // Autoplay policy
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // 2. Tasas del Dólar y Euro oficial BCV
  const [bcvRates, setBcvRates] = useState(() => getCachedBcvRates());
  useEffect(() => {
    fetchLiveBcvRates().then(rates => {
      if (rates) setBcvRates(rates);
    });
    const interval = setInterval(() => {
      fetchLiveBcvRates().then(rates => {
        if (rates) setBcvRates(rates);
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // 3. Clima de la ubicación del dispositivo (IP / Open-Meteo)
  const [weather, setWeather] = useState({
    temp: 18,
    conditionCode: 45,
    humidity: 80,
    city: 'Santo Domingo, Mérida',
    loading: false
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        let lat = FALLBACK_COORDS.lat;
        let lon = FALLBACK_COORDS.lon;
        let city = FALLBACK_COORDS.city;

        // Detección por IP
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.latitude && ipData.longitude) {
              lat = ipData.latitude;
              lon = ipData.longitude;
              city = `${ipData.city || 'Mérida'}, ${ipData.region_code || 'VE'}`;
            }
          }
        } catch (e) {}

        const meteoRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`
        );
        if (meteoRes.ok) {
          const data = await meteoRes.json();
          if (data.current) {
            setWeather({
              temp: Math.round(data.current.temperature_2m),
              conditionCode: data.current.weather_code,
              humidity: Math.round(data.current.relative_humidity_2m),
              city: city,
              loading: false
            });
          }
        }
      } catch (err) {
        setWeather(prev => ({ ...prev, loading: false }));
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 4. Reloj y fecha viva en tiempo real para el widget del clima
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 5. Últimas 15 Noticias para el Teleprompter
  const [newsList, setNewsList] = useState(() => {
    const list = getAllNews() || getCombinedNews() || [];
    return list.slice(0, 15);
  });

  // 6. Banner Superior de Publicidad para Smart TV
  const [tvBanners, setTvBanners] = useState(() => getActiveBannersForPlacement('smart-tv'));
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setTvBanners(getActiveBannersForPlacement('smart-tv'));
    };
    window.addEventListener('neblina_banners_updated', handleUpdate);
    return () => window.removeEventListener('neblina_banners_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (!tvBanners || tvBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % tvBanners.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [tvBanners]);

  const activeBanner = tvBanners && tvBanners.length > 0 ? tvBanners[currentBannerIndex] : null;

  useEffect(() => {
    if (activeBanner?.id) {
      recordBannerView(activeBanner.id);
    }
  }, [activeBanner?.id]);

  // 7. Detección / Instalación de la App en Smart TV
  const [isTvInstalled, setIsTvInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const isSavedInstalled = localStorage.getItem('neblina_smart_tv_app_installed') === 'true';

    if (isStandalone || isSavedInstalled) {
      setIsTvInstalled(true);
      setShowInstallPrompt(false);
    } else {
      setIsTvInstalled(false);
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstallTvApp = async () => {
    if (window.__neblinaDeferredPrompt) {
      window.__neblinaDeferredPrompt.prompt();
      window.__neblinaDeferredPrompt.userChoice.then(choice => {
        if (choice.outcome === 'accepted') {
          localStorage.setItem('neblina_smart_tv_app_installed', 'true');
          setIsTvInstalled(true);
          setShowInstallPrompt(false);
        }
      });
    } else {
      localStorage.setItem('neblina_smart_tv_app_installed', 'true');
      setIsTvInstalled(true);
      setShowInstallPrompt(false);
    }
  };

  // 8. Visibilidad del botón de pausa/reproducción al interactuar con el control
  const [showPlayControl, setShowPlayControl] = useState(false);
  const playControlTimerRef = useRef(null);

  const triggerPlayControlVisibility = () => {
    setShowPlayControl(true);
    if (playControlTimerRef.current) {
      clearTimeout(playControlTimerRef.current);
    }
    // Si está reproduciendo, se desvanece suavemente a los 3.2 segundos
    playControlTimerRef.current = setTimeout(() => {
      setShowPlayControl(false);
    }, 3200);
  };

  const handleTogglePlayWithAnimation = () => {
    triggerPlayControlVisibility();
    try {
      const res = togglePlay();
      if (res && typeof res.catch === 'function') {
        res.catch(() => {});
      }
    } catch (e) {}
  };

  const weatherCond = getWeatherCondition(weather.conditionCode);
  const WeatherIcon = weatherCond.icon;
  const tvBannerImage = activeBanner?.tvBannerUrl || activeBanner?.mediaUrl || activeBanner?.images?.[0]?.desktopUrl || '';

  // URL del Código QR hacia neblina105fm.com ampliado en alta definición
  const qrTargetUrl = 'https://neblina105fm.com/?utm_source=smart_tv&utm_medium=qr_code';
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&format=svg&margin=0&color=${theme === 'dark' ? '00DD9E' : '001E4D'}&bgcolor=transparent&data=${encodeURIComponent(qrTargetUrl)}`;

  // Carátula con actualización de metadatos o default de la app
  const coverImage = metadata?.artwork || '/icon-512.png';

  // Fecha y hora formateada para el widget de clima
  const formattedDate = currentDateTime.toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short' });
  const formattedTime = currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Fecha de vigencia de la tasa BCV
  const bcvEffectiveDate = bcvRates?.fechaValor || (bcvRates?.lastUpdated ? new Date(bcvRates.lastUpdated).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Vigente hoy');

  return (
    <div 
      onMouseMove={triggerPlayControlVisibility}
      onClick={triggerPlayControlVisibility}
      className={`fixed inset-0 w-screen h-screen ${theme === 'dark' ? 'dark bg-[#001433] text-white' : 'light bg-[#eef2f5] text-[#001E4D]'} flex flex-col justify-between overflow-hidden select-none font-sans z-[99999] transition-colors duration-500`}
    >
      
      {/* Contenedor Adaptativo de Escala Centrado Dinámicamente para Smart TV (Previene desfases de esquina) */}
      <div 
        style={{
          transform: screenInfo.width < 1280 ? 'scale(0.92)' : screenInfo.width <= 1920 ? 'scale(0.97)' : 'scale(1)',
          transformOrigin: 'center center',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
        className="w-full h-full relative"
      >
      
      {/* Fondo Ambiental Sutil con Brillo Oficial Aero Glass */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {theme === 'dark' ? (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#002866]/35 rounded-full blur-[140px]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] bg-[#00DD9E]/15 rounded-full blur-[110px]" />
            <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-[#001E4D]/75 rounded-full blur-[120px]" />
          </>
        ) : (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#B9EBFF]/40 rounded-full blur-[140px]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] bg-[#00DD9E]/20 rounded-full blur-[110px]" />
            <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-white/70 rounded-full blur-[120px]" />
          </>
        )}
      </div>

      {/* ============================================================== */}
      {/* 1. BANNER PUBLICITARIO SUPERIOR CENTRAL COMPACTO PARA SMART TV */}
      {/* ============================================================== */}
      <header className="relative z-20 w-full px-4 sm:px-6 pt-2 pb-1">
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-3">
          
          {/* Banner Publicitario Central con Efecto Aero Glass Compacto */}
          <div className="flex-1 h-14 sm:h-16 rounded-xl overflow-hidden aeroglass-card border border-white/20 dark:border-white/10 shadow-lg relative flex items-center justify-between px-4 bg-white/75 dark:bg-[#001E4D]/80 backdrop-blur-2xl">
            {tvBannerImage ? (
              <div className="absolute inset-0 z-0">
                <img 
                  src={tvBannerImage} 
                  alt={activeBanner?.title || 'Publicidad'} 
                  className="w-full h-full object-cover opacity-25 filter saturate-125"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/90 dark:from-[#001433]/95 dark:via-[#001E4D]/85 dark:to-[#001433]/95" />
              </div>
            ) : (
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#001E4D]/10 via-[#00DD9E]/10 to-[#001E4D]/10 dark:from-[#001E4D] dark:via-[#002d73] dark:to-[#001E4D]" />
            )}

            <div className="relative z-10 flex items-center space-x-3 min-w-0">
              <Emoji3D name="megaphone" className="w-6 h-6 drop-shadow-md flex-shrink-0 animate-pulse" alt="Publicidad" />
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-[#00DD9E] text-[#001E4D]">
                    {activeBanner?.badge || 'Publicidad Oficial en Smart TV'}
                  </span>
                  {activeBanner?.clientName && (
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                      • {activeBanner.clientName}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-xs sm:text-sm text-[#001E4D] dark:text-white truncate mt-0.5">
                  {activeBanner?.title || 'Pauta tu marca en la señal digital de Neblina Stereo 105.5 FM'}
                </h3>
              </div>
            </div>

            <div className="relative z-10 hidden md:flex items-center space-x-2.5 flex-shrink-0">
              {activeBanner?.subtitle && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 max-w-xs truncate text-right">
                  {activeBanner.subtitle}
                </p>
              )}
              <div className="px-2.5 py-1 rounded-lg bg-[#00DD9E]/20 border border-[#00DD9E]/40 text-[#001E4D] dark:text-[#00DD9E] text-[11px] font-bold">
                {activeBanner?.ctaText || 'Pauta Comercial'}
              </div>
            </div>
          </div>

          {/* Botón de Alternar Tema (Solo Icono, sin texto) */}
          <div className="flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="h-12 w-12 rounded-xl aeroglass-card border border-white/30 dark:border-white/10 bg-white/80 dark:bg-[#001E4D]/80 backdrop-blur-xl text-[#001E4D] dark:text-white shadow-md flex items-center justify-center hover:border-[#00DD9E]/50 transition active:scale-95 cursor-pointer"
              title={theme === 'dark' ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
              aria-label="Cambiar tema de color"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. SECCIÓN CENTRAL: CARÁTULA Y METADATOS TOTALMENTE CENTRADOS  */}
      {/* ============================================================== */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-1 my-auto">
        <div className="relative flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          
          {/* Carátula Central con Escala Balanceada, Pulso Luminoso y Ondas Expansivas */}
          <div 
            onClick={handleTogglePlayWithAnimation}
            className="relative z-10 group cursor-pointer flex items-center justify-center"
          >
            {/* Ondas Concéntricas que Palpitan y se Pierden hacia afuera */}
            {isPlaying && (
              <>
                <div className="absolute inset-0 rounded-2xl border-2 border-[#00DD9E]/50 anim-tv-pulse-wave-1" />
                <div className="absolute inset-0 rounded-2xl border-2 border-[#00DD9E]/40 anim-tv-pulse-wave-2" />
                <div className="absolute inset-0 rounded-2xl border border-[#00DD9E]/30 anim-tv-pulse-wave-3" />
              </>
            )}

            {/* Halo de luz / Refracción difusa bajo la carátula */}
            <div 
              className={`absolute -inset-3 rounded-2xl blur-xl transition-all duration-700 pointer-events-none ${
                isPlaying ? 'opacity-90 scale-105' : 'opacity-25 scale-95'
              }`}
              style={{
                background: isPlaying 
                  ? 'radial-gradient(circle, rgba(0,221,158,0.7) 0%, rgba(0,30,77,0.4) 65%, transparent 100%)' 
                  : 'radial-gradient(circle, rgba(185,235,255,0.4) 0%, transparent 70%)'
              }}
            />

            {/* Contenedor Físico de la Carátula (Reducido y acotado para evitar salirse de pantalla) */}
            <div className={`relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-52 lg:h-52 max-h-[30vh] max-w-[30vh] rounded-2xl overflow-hidden border-2 transition-all duration-500 bg-slate-900 ${
              isPlaying 
                ? 'scale-100 border-[#00DD9E] anim-tv-glow-breathe ring-2 ring-[#00DD9E]/40' 
                : 'scale-95 border-white/40 dark:border-white/20 shadow-xl brightness-90'
            }`}>
              <img 
                key={coverImage}
                src={coverImage} 
                alt="En Vivo" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/icon-512.png'; }}
              />

              {/* Botón de Pausa / Reproducción Centrado con Animación Sutil (Aparece y Desaparece) */}
              <div 
                className={`absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center transition-all duration-300 ${
                  (!isPlaying || showPlayControl) 
                    ? 'opacity-100 scale-100 pointer-events-auto' 
                    : 'opacity-0 scale-90 pointer-events-none'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-white/90 dark:bg-[#001E4D]/90 text-[#001E4D] dark:text-[#00DD9E] border border-white/40 shadow-lg flex items-center justify-center transform active:scale-90 transition-transform">
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-1" />
                  )}
                </div>
              </div>

              {/* Botón "AL AIRE" Ubicado en el Borde Lateral Inferior de la Carátula */}
              <div className="absolute bottom-2 right-2 z-20">
                <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-400">
                    AL AIRE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información de la Canción: Título y Artista perfectamente CENTRADOS */}
          <div className="relative z-10 pt-2.5 space-y-0.5 min-w-0 max-w-sm sm:max-w-md text-center">
            <h1 className="font-display font-extrabold text-base sm:text-lg lg:text-xl text-[#001E4D] dark:text-white tracking-tight line-clamp-1 text-center">
              {metadata?.songtitle || 'Neblina Stereo 105.5 FM'}
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider line-clamp-1 text-center">
              {metadata?.artist || 'Contigo en la Cima · Señal Abierta y Digital'}
            </p>
          </div>

        </div>
      </main>

      {/* ============================================================== */}
      {/* 3. PARTE INFERIOR: QR A LA IZQ Y TELEPROMPTERS A LA DER (DIVIDIDO Y NOTICIAS) */}
      {/* ============================================================== */}
      <footer className="relative z-20 w-full px-5 sm:px-8 pb-3 pt-0.5">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* LADO IZQUIERDO: WIDGET PARA ESCANEAR CON QR */}
          <div className="flex-shrink-0 flex items-center space-x-3 p-2 rounded-xl aeroglass-card border border-white/30 dark:border-white/10 bg-white/85 dark:bg-[#001E4D]/90 backdrop-blur-2xl shadow-lg">
            <div className="w-20 h-20 sm:w-22 sm:h-22 p-1 rounded-lg bg-white flex items-center justify-center shadow-inner">
              <img 
                src={qrImageUrl} 
                alt="QR neblina105fm.com" 
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
            <div className="text-left pr-1.5">
              <div className="flex items-center space-x-1 text-[#00DD9E]">
                <QrCode className="w-3.5 h-3.5 text-[#00DD9E]" />
                <span className="text-[11px] font-black uppercase tracking-wider text-[#001E4D] dark:text-white">
                  Escanea con tu Móvil
                </span>
              </div>
              <p className="text-xs font-black text-[#001E4D] dark:text-[#00DD9E] mt-0.5">
                neblina105fm.com
              </p>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-300 block">
                Radio en vivo y noticias
              </span>
            </div>
          </div>

          {/* LADO DERECHO: BARRA SUPERIOR DIVIDIDA (BCV A LA IZQ, CLIMA A LA DER) + NOTICIAS ABAJO */}
          <div className="flex-1 w-full flex flex-col justify-between gap-2 min-w-0">
            
            {/* FILA SUPERIOR: BARRA DIVIDIDA (LADO IZQ: TASA OFICIAL BCV | LADO DER: CLIMA, FECHA Y HORA) */}
            <div className="w-full flex flex-col md:flex-row items-center gap-2">
              
              {/* IZQUIERDA DE LA BARRA: TELEPROMPTER EN MOVIMIENTO CONTINUO TASA OFICIAL BCV */}
              <div className="flex-1 w-full min-w-0 h-9 px-2 rounded-lg aeroglass-card border border-white/30 dark:border-white/10 bg-white/85 dark:bg-[#001E4D]/90 backdrop-blur-xl shadow-sm overflow-hidden relative flex items-center marquee-mask">
                <div className="anim-marquee-tv-bcv whitespace-nowrap text-[11px] font-bold text-center flex items-center space-x-6">
                  {[1, 2, 3].map((_, loopIdx) => (
                    <div key={`bcv-${loopIdx}`} className="inline-flex items-center space-x-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-[#00DD9E] text-[10px] font-black uppercase tracking-wider flex-shrink-0">
                        BCV Oficial
                      </span>
                      <span className="font-mono text-[#001E4D] dark:text-white flex-shrink-0">
                        Dólar: $ {(bcvRates.usd || 884.75).toFixed(2)} Bs.
                      </span>
                      <span className="text-slate-400 font-normal flex-shrink-0">•</span>
                      <span className="font-mono text-teal-600 dark:text-teal-300 flex-shrink-0">
                        Euro: € {(bcvRates.eur || 993.21).toFixed(2)} Bs.
                      </span>
                      <span className="text-slate-400 font-normal flex-shrink-0">•</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 flex-shrink-0">
                        <Calendar className="w-3 h-3 text-[#00DD9E]" />
                        <span>Vigencia: {bcvEffectiveDate}</span>
                      </span>
                      <span className="text-slate-400 font-normal flex-shrink-0">•</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DERECHA DE LA BARRA: TELEPROMPTER EN MOVIMIENTO CONTINUO CLIMA, FECHA Y HORA */}
              <div className="flex-1 w-full min-w-0 h-9 px-2 rounded-lg aeroglass-card border border-white/30 dark:border-white/10 bg-white/85 dark:bg-[#001E4D]/90 backdrop-blur-xl shadow-sm overflow-hidden relative flex items-center marquee-mask">
                <div className="anim-marquee-tv-weather whitespace-nowrap text-[11px] font-bold text-center flex items-center space-x-6">
                  {[1, 2, 3].map((_, loopIdx) => (
                    <div key={`weather-${loopIdx}`} className="inline-flex items-center space-x-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-700 dark:text-sky-300 text-[10px] font-black uppercase tracking-wider flex-shrink-0">
                        Clima {weather.city || 'Santo Domingo, Mérida'}
                      </span>
                      <div className="inline-flex items-center space-x-1 text-[#001E4D] dark:text-white font-mono flex-shrink-0">
                        <WeatherIcon className={`w-3.5 h-3.5 ${weatherCond.color} flex-shrink-0`} />
                        <span>{weather.temp}°C ({weatherCond.label})</span>
                      </div>
                      <span className="text-slate-400 font-normal flex-shrink-0">•</span>
                      <span className="capitalize text-[10px] text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {formattedDate}
                      </span>
                      <span className="text-slate-400 font-normal flex-shrink-0">•</span>
                      <div className="inline-flex items-center space-x-1 font-mono text-[10px] text-[#001E4D] dark:text-slate-200 flex-shrink-0">
                        <Clock className="w-3 h-3 text-[#00DD9E] flex-shrink-0" />
                        <span>{formattedTime}</span>
                      </div>
                      <span className="text-slate-400 font-normal flex-shrink-0">•</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* FILA INFERIOR: TELEPROMPTER DE NOTICIAS (DESDE EL WIDGET QR HASTA EL EXTREMO DERECHO) */}
            <div className="w-full h-8 px-2.5 rounded-lg aeroglass-card border border-white/30 dark:border-white/10 bg-white/85 dark:bg-[#001E4D]/90 backdrop-blur-xl shadow-sm overflow-hidden relative flex items-center marquee-mask">
              <div className="anim-marquee whitespace-nowrap text-[11px] font-bold text-[#001E4D] dark:text-slate-100 flex items-center space-x-6">
                {[...newsList, ...newsList].map((item, idx) => (
                  <div key={`${item.id || idx}-${idx}`} className="inline-flex items-center space-x-2">
                    <span className="px-1.5 py-0.2 rounded bg-[#00DD9E]/20 text-[#001E4D] dark:text-[#00DD9E] text-[11px] font-black uppercase flex-shrink-0">
                      {item.category || 'Noticia'}
                    </span>
                    <span className="text-[11px] font-medium hover:text-[#00DD9E] transition-colors">
                      {item.title}
                    </span>
                    <span className="text-slate-400 font-normal">•</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* LEYENDA DISCRETA AL PIE */}
        <div className="w-full text-center pt-1">
          <p className="text-[11px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
            Para mayor información y cobertura de noticias, visita nuestra web oficial en{' '}
            <span className="font-bold text-[#001E4D] dark:text-[#00DD9E] underline">neblina105fm.com</span>
          </p>
        </div>
      </footer>

      </div>

      {/* ============================================================== */}
      {/* MODAL / SOLICITUD DE INSTALACIÓN PARA SMART TV                 */}
      {/* ============================================================== */}
      {showInstallPrompt && !isTvInstalled && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md p-5 sm:p-6 rounded-2xl aeroglass-card border border-[#00DD9E]/40 bg-white dark:bg-[#001E4D]/95 text-[#001E4D] dark:text-white shadow-lg text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00DD9E] to-teal-400 text-[#001E4D] mx-auto flex items-center justify-center shadow-lg">
              <Tv className="w-6 h-6" />
            </div>

            <h3 className="font-display font-bold text-lg sm:text-xl text-[#001E4D] dark:text-white">
              ¿Instalar Neblina Stereo 105.5 FM en este Smart TV?
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Disfruta de la transmisión en vivo, tasa oficial BCV, noticias en tiempo real y clima directamente desde la pantalla principal de tu televisor.
            </p>

            <div className="pt-1 flex items-center justify-center space-x-2.5">
              <button
                type="button"
                onClick={handleInstallTvApp}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-[#00DD9E] text-[#001E4D] font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar en este TV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowInstallPrompt(false);
                }}
                className="h-10 px-3.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-medium text-xs transition cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
