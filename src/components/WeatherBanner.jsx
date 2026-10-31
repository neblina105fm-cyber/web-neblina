import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  MapPin, 
  Droplets, 
  Wind,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { fetchWordPressNews } from '../services/api';
import { getCombinedNews } from '../services/newsData';
import NewsModal from './NewsModal';
import Emoji3D from './Emoji3D';

// Coordenadas oficiales de respaldo: Santo Domingo, Mérida, Venezuela (Sede de Neblina 105.5 FM)
const FALLBACK_COORDS = {
  lat: 8.8667,
  lon: -70.7667,
  city: 'Santo Domingo, Mérida'
};

const WEATHER_CACHE_KEY = 'neblina_cached_weather_v2';

function getWeatherCondition(code) {
  if (code === 0) return { label: 'Cielo Despejado', emoji: 'sun', icon: Sun, color: 'text-amber-500' };
  if (code >= 1 && code <= 2) return { label: 'Parcialmente Nublado', emoji: 'cloud-sun', icon: CloudSun, color: 'text-sky-500' };
  if (code === 3) return { label: 'Nublado', emoji: 'cloud', icon: Cloud, color: 'text-slate-400' };
  if (code === 45 || code === 48) return { label: 'Neblina en la Cima', emoji: 'cloud-fog', icon: CloudFog, color: 'text-teal-400' };
  if (code >= 51 && code <= 67) return { label: 'Lluvias / Lloviznas', emoji: 'cloud-rain', icon: CloudRain, color: 'text-blue-500' };
  if (code >= 71 && code <= 77) return { label: 'Aguanieve en Páramo', emoji: 'cloud-snow', icon: CloudSnow, color: 'text-cyan-300' };
  if (code >= 80 && code <= 82) return { label: 'Chubascos Andinos', emoji: 'cloud-rain', icon: CloudRain, color: 'text-indigo-400' };
  if (code >= 95) return { label: 'Tormenta Eléctrica', emoji: 'cloud-lightning', icon: CloudLightning, color: 'text-amber-400' };
  return { label: 'Tiempo Estable', emoji: 'cloud-sun', icon: CloudSun, color: 'text-sky-400' };
}

export default function WeatherBanner() {
  // Estado del Clima
  const [weather, setWeather] = useState({
    temp: 18,
    conditionCode: 45,
    humidity: 80,
    wind: 5,
    city: FALLBACK_COORDS.city,
    loading: true,
    lastUpdated: null
  });

  // Estado del Teleprompter "Es viral" inicializado con los 9 titulares oficiales
  const [headlines, setHeadlines] = useState(() => (getCombinedNews() || []).slice(0, 9));
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isTickerPaused, setIsTickerPaused] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // 1. Obtener datos meteorológicos de Open-Meteo
  const fetchWeatherData = async (lat, lon, cityName) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al consultar Open-Meteo');
      const data = await res.json();
      const current = data.current || {};

      const newWeather = {
        temp: Math.round(current.temperature_2m ?? 18),
        conditionCode: current.weather_code ?? 45,
        humidity: Math.round(current.relative_humidity_2m ?? 80),
        wind: Math.round(current.wind_speed_10m ?? 5),
        city: cityName || FALLBACK_COORDS.city,
        loading: false,
        lastUpdated: Date.now()
      };

      setWeather(newWeather);

      // Guardar en caché local para carga instantánea en próximas visitas
      try {
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
          ...newWeather,
          lat,
          lon
        }));
      } catch (e) {}
    } catch (err) {
      console.warn('Error fetching weather data:', err);
      setWeather(prev => ({ ...prev, loading: false }));
    }
  };

  // 2. Detección Inteligente de Ubicación Real (IP + GPS Fallback)
  const detectLocationAndWeather = async (forceRefresh = false) => {
    setWeather(prev => ({ ...prev, loading: true }));

    // Cargar caché si es reciente (menos de 20 minutos) y no es recarga forzada
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(WEATHER_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - (parsed.lastUpdated || 0) < 20 * 60 * 1000) {
            setWeather({ ...parsed, loading: false });
            return;
          }
        }
      } catch (e) {}
    }

    let detectedViaIP = false;

    // A) Detección inmediata por IP (sin requerir permisos ni popups del navegador)
    try {
      const geoRes = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=es');
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const lat = geoData.latitude || FALLBACK_COORDS.lat;
        const lon = geoData.longitude || FALLBACK_COORDS.lon;
        
        let detectedCity = 'Tu Ubicación';
        if (geoData.city) {
          const clean = geoData.city.replace(/^Municipio\s+/i, '');
          detectedCity = geoData.principalSubdivision && !clean.toLowerCase().includes(geoData.principalSubdivision.toLowerCase())
            ? `${clean}, ${geoData.principalSubdivision}`
            : clean;
        } else if (geoData.principalSubdivision) {
          detectedCity = geoData.principalSubdivision;
        } else if (geoData.countryName) {
          detectedCity = geoData.countryName;
        }

        detectedViaIP = true;
        await fetchWeatherData(lat, lon, detectedCity);
      }
    } catch (e) {
      console.warn('IP geocode error:', e);
    }

    // B) Detección precisa por HTML5 GPS (si el usuario la tiene autorizada)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let preciseCity = 'Tu Ubicación';
          try {
            const gpsGeoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`);
            if (gpsGeoRes.ok) {
              const gpsGeo = await gpsGeoRes.json();
              const cleanCity = gpsGeo.locality || gpsGeo.city?.replace(/^Municipio\s+/i, '') || gpsGeo.principalSubdivision;
              if (cleanCity) {
                preciseCity = gpsGeo.principalSubdivision && !cleanCity.toLowerCase().includes(gpsGeo.principalSubdivision.toLowerCase())
                  ? `${cleanCity}, ${gpsGeo.principalSubdivision}`
                  : cleanCity;
              }
            }
          } catch (e) {}
          fetchWeatherData(latitude, longitude, preciseCity);
        },
        () => {
          // Si no hay permiso GPS y tampoco funcionó IP, usar coordenadas de la estación
          if (!detectedViaIP) {
            fetchWeatherData(FALLBACK_COORDS.lat, FALLBACK_COORDS.lon, FALLBACK_COORDS.city);
          }
        },
        { timeout: 6000, maximumAge: 300000, enableHighAccuracy: false }
      );
    } else if (!detectedViaIP) {
      fetchWeatherData(FALLBACK_COORDS.lat, FALLBACK_COORDS.lon, FALLBACK_COORDS.city);
    }
  };

  // 3. Carga de los últimos 9 titulares de noticias (sincronizados con neblina105fm.com)
  const loadLatestHeadlines = async () => {
    try {
      const wpData = await fetchWordPressNews(1, 9);
      const combined = getCombinedNews(wpData);
      const top9 = (combined || [])
        .filter(item => !item.status || item.status === 'published')
        .slice(0, 9);

      if (top9.length > 0) {
        setHeadlines(top9);
      }
    } catch (err) {
      const fallback = (getCombinedNews([]) || []).slice(0, 9);
      if (fallback.length > 0) setHeadlines(fallback);
    }
  };

  // Efecto inicial de carga del clima y titulares
  useEffect(() => {
    detectLocationAndWeather();
    loadLatestHeadlines();

    // Actualizar periódicamente noticias cada minuto
    const newsInterval = setInterval(loadLatestHeadlines, 60000);
    const handleNewsUpdate = () => loadLatestHeadlines();
    window.addEventListener('neblina_news_updated', handleNewsUpdate);

    return () => {
      clearInterval(newsInterval);
      window.removeEventListener('neblina_news_updated', handleNewsUpdate);
    };
  }, []);

  // Efecto del Teleprompter: rotación de titulares cada 4 segundos
  useEffect(() => {
    if (headlines.length <= 1 || isTickerPaused) return;

    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % headlines.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [headlines.length, isTickerPaused]);

  const condition = getWeatherCondition(weather.conditionCode);
  const IconComponent = condition.icon;
  const currentHeadline = headlines[tickerIndex];

  return (
    <div className="w-full select-none bg-transparent">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl aeroglass-card transition-all duration-300 text-xs">
        
        {/* FILA SUPERIOR EN MÓVIL / IZQUIERDA EN ESCRITORIO: Ubicación y Clima */}
        <div className="flex items-center justify-between sm:justify-start space-x-2 sm:space-x-2.5 flex-shrink-0">
          
          {/* Ubicación detectada */}
          <div 
            className="flex items-center space-x-1.5 text-slate-900 dark:text-white font-bold cursor-pointer"
            onClick={() => detectLocationAndWeather(true)}
            title="Tu ubicación actual detectada. Haz clic para refrescar."
          >
            <Emoji3D name="pin" className="w-4 h-4 flex-shrink-0" alt="Ubicación" />
            <span className="truncate max-w-[130px] sm:max-w-[160px] md:max-w-[180px]">
              {weather.city}
            </span>
          </div>

          <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>

          {/* Condición con icono 3D */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <Emoji3D name={condition.emoji || 'cloud-sun'} className="w-5 h-5 drop-shadow-sm flex-shrink-0" alt={condition.label} />
            <span className="text-slate-700 dark:text-slate-200 font-semibold hidden md:inline">
              {condition.label}
            </span>
          </div>

          {/* En móvil, mostrar temperatura aquí en la primera fila */}
          <div className="flex items-center space-x-2 sm:hidden font-mono">
            <span className="text-xs font-black font-sans text-slate-900 dark:text-white">
              {weather.temp}°C
            </span>
            <button
              onClick={() => detectLocationAndWeather(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              title="Actualizar clima"
            >
              <RefreshCw className={`w-3 h-3 ${weather.loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ESPACIO CENTRAL: TELEPROMPTER "Es viral" (Aprovecha el espacio en blanco) */}
        <div className="flex-1 sm:order-first mx-0 sm:mr-3 min-w-0 flex items-center gap-2 py-0.5 border-t sm:border-t-0 sm:border-r border-slate-300/40 dark:border-white/10 pt-1.5 sm:pt-0 sm:pr-3">
          
          {/* Chip informativo "Es viral" en color turquesa oficial de la marca (#00DD9E), estilo HIG Apple */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-bold text-[11px] sm:text-[11px] bg-[#00DD9E]/15 text-[#001E4D] dark:text-[#00DD9E] border border-[#00DD9E]/30 flex-shrink-0 select-none"
            title="Titulares más destacados"
          >
            <Emoji3D name="fire" className="w-3.5 h-3.5 flex-shrink-0" alt="Viral" />
            <span>Es viral</span>
          </span>

          {/* Teleprompter: Titular animado de las últimas 9 noticias */}
          <div 
            className="flex-1 min-w-0 overflow-hidden relative h-5 sm:h-6 flex items-center cursor-pointer group"
            onMouseEnter={() => setIsTickerPaused(true)}
            onMouseLeave={() => setIsTickerPaused(false)}
            onClick={() => currentHeadline && setSelectedPost(currentHeadline)}
            title={currentHeadline ? `${currentHeadline.title} (Clic para leer)` : 'Cargando titulares...'}
          >
            <div 
              key={tickerIndex}
              className="animate-teleprompter flex items-center w-full"
            >
              <p className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-[#00DD9E] dark:group-hover:text-[#00DD9E] transition-colors">
                {currentHeadline ? currentHeadline.title : 'Cargando últimos titulares...'}
              </p>
            </div>
          </div>

          {/* Contador sutil de titular (Ej: 1/9) */}
          {headlines.length > 0 && (
            <span className="hidden lg:inline text-[11px] font-mono text-slate-500 dark:text-slate-400 flex-shrink-0">
              {tickerIndex + 1}/{headlines.length}
            </span>
          )}
        </div>

        {/* MÉTRICAS COMPLETAS DE CLIMA (Visible en pantallas medianas y escritorio) */}
        <div className="hidden sm:flex items-center space-x-2.5 text-slate-800 dark:text-slate-200 font-mono flex-shrink-0">
          <span className="text-sm font-black font-sans text-slate-900 dark:text-white">
            {weather.temp}°C
          </span>

          <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-300 border-l border-slate-300 dark:border-white/15 pl-2.5">
            <span className="flex items-center space-x-1" title="Humedad relativa">
              <Droplets className="w-3 h-3 text-cyan-500" />
              <span>{weather.humidity}%</span>
            </span>
            <span className="flex items-center space-x-1" title="Velocidad del viento">
              <Wind className="w-3 h-3 text-slate-400" />
              <span>{weather.wind} km/h</span>
            </span>
          </div>

          <button
            onClick={() => detectLocationAndWeather(true)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title="Actualizar clima según tu ubicación"
            aria-label="Actualizar clima"
          >
            <RefreshCw className={`w-3 h-3 ${weather.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Modal Lector si el usuario pulsa en el titular del Teleprompter */}
      {selectedPost && <NewsModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  );
}
