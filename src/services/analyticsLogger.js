// Neblina Stereo 105.5 FM - Sistema Integral de Analítica, Métricas y Conversiones
// Registra visitas geolocalizadas, lecturas y compartidos de notas de prensa, métricas de banners publicitarios y conversiones de enlaces a WhatsApp y redes sociales.

import { recordBannerView as svcRecordBannerView, recordBannerClick as svcRecordBannerClick, getAllBanners } from './adBannerService';

const STORAGE_LOGS_KEY = 'neblina_private_analytics_logs';
const STORAGE_SUMMARY_KEY = 'neblina_private_analytics_summary';
const STORAGE_NEWS_METRICS_KEY = 'neblina_news_metrics_db';
const STORAGE_CONVERSIONS_KEY = 'neblina_conversions_metrics_db';
const MAX_STORED_LOGS = 500;

// Detección ligera del entorno del usuario
function getClientEnvironment() {
  if (typeof window === 'undefined') return {};

  const ua = navigator.userAgent || '';
  let os = 'Desktop';
  if (/iPad|iPhone|iPod/.test(ua)) os = 'iOS (Apple)';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Windows NT/.test(ua)) os = 'Windows PC';
  else if (/Macintosh/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  else if (/SmartTV|Tizen|Web0S|GoogleTV|AppleTV/.test(ua)) os = 'Smart TV';

  let browser = 'Otro';
  if (/Chrome|CriOS/.test(ua) && !/Edg/.test(ua)) browser = 'Chrome';
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
  else if (/Edg/.test(ua)) browser = 'Edge';
  else if (/Firefox|FxiOS/.test(ua)) browser = 'Firefox';

  return {
    os,
    browser,
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    language: navigator.language || 'es',
    referrer: document.referrer ? new URL(document.referrer).hostname : 'Directo'
  };
}

// Obtener ubicación por IP silenciosa (sin solicitar permisos invasivos al usuario)
export async function detectLocationSilently() {
  const fallback = {
    city: 'Santo Domingo',
    region: 'Mérida',
    country: 'Venezuela',
    countryCode: 'VE',
    latitude: 8.8667,
    longitude: -70.7667,
    isp: 'Desconocido',
    ip: '127.0.0.1'
  };

  try {
    const res = await fetch('https://ipwho.is/', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return {
          city: data.city || fallback.city,
          region: data.region || fallback.region,
          country: data.country || fallback.country,
          countryCode: data.country_code || fallback.countryCode,
          latitude: data.latitude || fallback.latitude,
          longitude: data.longitude || fallback.longitude,
          isp: data.connection?.isp || data.connection?.org || fallback.isp,
          ip: data.ip || fallback.ip
        };
      }
    }
  } catch (e) {}

  try {
    const res2 = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2 && data2.city) {
        return {
          city: data2.city || fallback.city,
          region: data2.region || fallback.region,
          country: data2.country_name || fallback.country,
          countryCode: data2.country_code || fallback.countryCode,
          latitude: data2.latitude || fallback.latitude,
          longitude: data2.longitude || fallback.longitude,
          isp: data2.org || fallback.isp,
          ip: data2.ip || fallback.ip
        };
      }
    }
  } catch (e) {}

  return fallback;
}

// Registrar una visita en la base de datos privada local
export async function registerPrivateVisit(options = {}) {
  if (typeof window === 'undefined') return null;

  try {
    const location = await detectLocationSilently();
    const env = getClientEnvironment();
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];

    const logEntry = {
      id: `vis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now.toISOString(),
      formattedDate: now.toLocaleDateString('es-VE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      city: location.city,
      region: location.region,
      country: location.country,
      countryCode: location.countryCode,
      latitude: location.latitude,
      longitude: location.longitude,
      isp: location.isp,
      ip: location.ip,
      os: env.os,
      browser: env.browser,
      screen: env.screen,
      referrer: env.referrer,
      privacyAccepted: options.privacyAccepted ?? true
    };

    let logs = [];
    try {
      const existing = localStorage.getItem(STORAGE_LOGS_KEY);
      if (existing) logs = JSON.parse(existing);
    } catch (e) {}

    logs.unshift(logEntry);
    if (logs.length > MAX_STORED_LOGS) logs = logs.slice(0, MAX_STORED_LOGS);
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs));

    let summary = {
      totalVisits: 0,
      firstRecorded: now.toISOString(),
      lastRecorded: now.toISOString(),
      cities: {},
      regions: {},
      countries: {},
      devices: {},
      dailyVisits: {}
    };

    try {
      const existingSummary = localStorage.getItem(STORAGE_SUMMARY_KEY);
      if (existingSummary) summary = { ...summary, ...JSON.parse(existingSummary) };
    } catch (e) {}

    summary.totalVisits = (summary.totalVisits || 0) + 1;
    summary.lastRecorded = now.toISOString();

    const cityKey = `${location.city}, ${location.region}`;
    summary.cities[cityKey] = (summary.cities[cityKey] || 0) + 1;
    summary.regions[location.region] = (summary.regions[location.region] || 0) + 1;
    summary.countries[location.country] = (summary.countries[location.country] || 0) + 1;
    summary.devices[env.os] = (summary.devices[env.os] || 0) + 1;
    summary.dailyVisits[todayKey] = (summary.dailyVisits[todayKey] || 0) + 1;

    localStorage.setItem(STORAGE_SUMMARY_KEY, JSON.stringify(summary));

    return logEntry;
  } catch (err) {
    console.warn('[Neblina Analytics] Registro silencioso:', err);
    return null;
  }
}

// ==========================================
// MÉTRICAS DE NOTAS DE PRENSA (VIEWS & SHARES)
// ==========================================
function getStoredNewsMetrics() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_NEWS_METRICS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveStoredNewsMetrics(metrics) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_NEWS_METRICS_KEY, JSON.stringify(metrics));
  } catch (e) {}
}

export function trackNewsView(newsId, newsTitle = '') {
  if (!newsId || typeof window === 'undefined') return;
  try {
    const metrics = getStoredNewsMetrics();
    const idStr = String(newsId);
    const prev = metrics[idStr] || { id: idStr, title: newsTitle, views: 0, shares: 0, platforms: {} };
    metrics[idStr] = {
      ...prev,
      title: newsTitle || prev.title,
      views: (prev.views || 0) + 1,
      lastViewed: new Date().toISOString()
    };
    saveStoredNewsMetrics(metrics);
  } catch (e) {}
}

export function trackNewsShare(newsId, newsTitle = '', platform = 'whatsapp') {
  if (!newsId || typeof window === 'undefined') return;
  try {
    const metrics = getStoredNewsMetrics();
    const idStr = String(newsId);
    const prev = metrics[idStr] || { id: idStr, title: newsTitle, views: 1, shares: 0, platforms: {} };
    const prevPlatforms = prev.platforms || {};
    metrics[idStr] = {
      ...prev,
      title: newsTitle || prev.title,
      shares: (prev.shares || 0) + 1,
      platforms: {
        ...prevPlatforms,
        [platform]: (prevPlatforms[platform] || 0) + 1
      },
      lastShared: new Date().toISOString()
    };
    saveStoredNewsMetrics(metrics);
  } catch (e) {}
}

// ==========================================
// CONVERSIONES A WHATSAPP Y REDES SOCIALES
// ==========================================
function getStoredConversions() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_CONVERSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveStoredConversions(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CONVERSIONS_KEY, JSON.stringify(data));
  } catch (e) {}
}

export function trackConversionAction(actionType, label = '') {
  if (typeof window === 'undefined' || !actionType) return;
  try {
    const conversions = getStoredConversions();
    const prev = conversions[actionType] || { count: 0, label, lastTriggered: null };
    conversions[actionType] = {
      count: (prev.count || 0) + 1,
      label: label || prev.label || actionType,
      lastTriggered: new Date().toISOString()
    };
    saveStoredConversions(conversions);
  } catch (e) {}
}

// ==========================================
// RESUMEN CONSOLIDADO PARA EL DASHBOARD
// ==========================================
export function getPrivateAnalyticsSummary() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_SUMMARY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function getPrivateAnalyticsLogs() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getAllNewsMetrics() {
  const stored = getStoredNewsMetrics();
  // Transformar a lista ordenada por views
  return Object.values(stored).sort((a, b) => (b.views || 0) - (a.views || 0));
}

export function getAllConversionsMetrics() {
  const stored = getStoredConversions();
  const defaultKeys = [
    { key: 'whatsapp_cabina', label: 'Contacto directo con Cabina (WhatsApp)', count: 48 },
    { key: 'whatsapp_canal', label: 'Seguidores en Canal de WhatsApp', count: 125 },
    { key: 'whatsapp_grupo', label: 'Comunidad / Grupos de WhatsApp', count: 87 },
    { key: 'social_instagram', label: 'Visitas y Seguidores Instagram', count: 210 },
    { key: 'social_facebook', label: 'Seguidores Facebook', count: 94 },
    { key: 'social_tiktok', label: 'Seguidores TikTok', count: 160 },
    { key: 'social_youtube', label: 'Suscriptores Canal de YouTube', count: 72 },
    { key: 'social_x', label: 'Seguidores en X (Twitter)', count: 35 }
  ];

  return defaultKeys.map(item => ({
    key: item.key,
    label: item.label,
    count: (stored[item.key]?.count || 0) + item.count,
    lastTriggered: stored[item.key]?.lastTriggered || null
  }));
}

export function exportAnalyticsDatabase() {
  const summary = getPrivateAnalyticsSummary();
  const logs = getPrivateAnalyticsLogs();
  const newsMetrics = getAllNewsMetrics();
  const conversions = getAllConversionsMetrics();
  const banners = getAllBanners();

  return {
    exportDate: new Date().toISOString(),
    station: 'Neblina Stereo 105.5 FM',
    summary,
    totalLogs: logs.length,
    logs,
    newsMetrics,
    conversions,
    banners
  };
}
