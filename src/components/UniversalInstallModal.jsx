import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, 
  Download, 
  Tv, 
  Smartphone, 
  Laptop, 
  Share, 
  PlusSquare, 
  Sparkles, 
  Radio, 
  Zap,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { detectDevice, isAppInstalled } from '../utils/deviceDetector';
import { autoEnableNotifications } from '../services/notificationService';
import Emoji3D from './Emoji3D';

// =========================================================================
// ICONOS VECTORIALES OFICIALES DE TIENDAS Y PLATAFORMAS (HIG / MATERIAL UI)
// =========================================================================

// 1. Icono Vectorial de Google Play Store (Monocromático currentColor para heredar el color del texto en botones)
export const GooglePlayStoreIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3.61 1.814 13.793 12 3.61 22.186a1.47 1.47 0 0 1-.485-1.123V2.937c0-.44.178-.846.485-1.123zm11.246 11.246 2.862 2.862-11.96 6.89a1.48 1.48 0 0 1-.965.174l10.063-9.926zm3.888-2.299 2.212 1.275c.725.418.725 1.51 0 1.928l-2.212 1.275-2.89-2.239 2.89-2.239zM5.758 1.188l11.96 6.89-2.862 2.862L4.793 1.014c.316-.044.658.008.965.174z" />
  </svg>
);

// 2. Icono Vectorial de Apple App Store (Monocromático currentColor para heredar el color del texto en botones)
export const AppleAppStoreIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.624 7.222c-.876 0-2.232-.996-3.66-.96-1.884.024-3.612 1.092-4.584 2.784-1.956 3.396-.504 8.412 1.404 11.172.936 1.344 2.04 2.856 3.504 2.808 1.404-.06 1.932-.912 3.636-.912 1.692 0 2.172.912 3.66.876 1.512-.024 2.472-1.368 3.396-2.724 1.068-1.56 1.512-3.072 1.536-3.156-.036-.012-2.94-1.128-2.976-4.488-.024-2.808 2.292-4.152 2.4-4.212-1.32-1.932-3.348-2.148-4.056-2.196-1.848-.144-3.396 1.008-4.26 1.008zm3.12-2.832c.78-.936 1.308-2.244 1.164-3.54-1.128.048-2.484.756-3.288 1.692-.708.816-1.344 2.148-1.176 3.432 1.26.096 2.52-.648 3.3-1.584z" />
  </svg>
);

// 3. Icono Vectorial de Android TV / Google TV (Monocromático currentColor)
export const AndroidTvIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="13" rx="2.5" />
    <path d="M8 20h8M12 17v3" />
    <path d="M9 11.5a3 3 0 0 1 6 0" />
    <circle cx="10.5" cy="11" r="0.6" fill="currentColor" />
    <circle cx="13.5" cy="11" r="0.6" fill="currentColor" />
    <path d="M10 7.5 8.5 6M14 7.5 15.5 6" />
  </svg>
);

// 4. Icono Vectorial de Apple TV (Monocromático currentColor)
export const AppleTvIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="4" />
    <path d="M9 9v6M7 10.5h4" />
    <path d="m13.5 10.5 2 4.5 2-4.5" />
  </svg>
);

export default function UniversalInstallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [device, setDevice] = useState({ os: 'Dispositivo', isApple: false, isAndroid: false, isSmartTV: false });
  const [selectedPlatform, setSelectedPlatform] = useState('android');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    const dev = detectDevice();
    setDevice(dev);
    const installed = isAppInstalled();
    setIsInstalled(installed);

    // Inicializar la pestaña seleccionada según el dispositivo detectado
    if (dev.isSmartTV) {
      setSelectedPlatform(dev.isAppleTV ? 'apple-tv' : 'android-tv');
    } else if (dev.isApple) {
      setSelectedPlatform('ios');
    } else if (dev.isAndroid) {
      setSelectedPlatform('android');
    } else {
      setSelectedPlatform('pc');
    }

    // Escuchar el evento de instalación nativa PWA
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__neblinaDeferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Escuchar si la app ya fue instalada
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      setTimeout(() => setIsOpen(false), 2000);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Escuchar peticiones para abrir el modal desde el Navbar o cualquier botón
    const handleOpenRequest = () => {
      autoEnableNotifications();
      setIsOpen(true);
    };
    window.addEventListener('neblina_open_install_modal', handleOpenRequest);

    // Atajo de teclado Escape para cerrar
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('neblina_open_install_modal', handleOpenRequest);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Bloqueo controlado de scroll cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = (originalOverflow && originalOverflow !== 'hidden') ? originalOverflow : '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleInstallAction = async () => {
    autoEnableNotifications();

    const promptEvent = deferredPrompt || window.__neblinaDeferredPrompt;

    if (promptEvent && (selectedPlatform === 'android' || selectedPlatform === 'pc')) {
      try {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setInstallSuccess(true);
          setTimeout(() => setIsOpen(false), 2200);
        }
        setDeferredPrompt(null);
        window.__neblinaDeferredPrompt = null;
      } catch (e) {
        console.warn('Error en prompt de instalación:', e);
      }
      return;
    }

    setInstallSuccess(true);
    setTimeout(() => setIsOpen(false), 2500);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 pt-3 sm:pt-4 pb-28 sm:pb-32 bg-slate-950/75 dark:bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#001438] border border-slate-200/90 dark:border-white/15 rounded-2xl p-5 sm:p-7 shadow-lg transition-all duration-300 max-h-[calc(100dvh-120px)] sm:max-h-[calc(100dvh-130px)] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cierre */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer z-10"
          aria-label="Cerrar ventana de instalación"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================================================================= */}
        {/* CASO: INSTALACIÓN EXITOSA */}
        {/* ================================================================= */}
        {installSuccess ? (
          <div className="text-center py-8 space-y-3">
            <Emoji3D name="sparkles" className="w-16 h-16 mx-auto  drop-shadow-xl" />
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
              ¡Neblina 105.5 FM Lista!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
              La aplicación oficial se ha configurado con su icono de esquinas redondeadas, alertas automáticas de noticias y streaming HD 24/7.
            </p>
          </div>
        ) : (
          <>
            {/* ============================================================= */}
            {/* CABECERA CON EL NUEVO ICONO OFICIAL PNG CON ESQUINAS REDONDEADAS */}
            {/* ============================================================= */}
            <div className="flex items-center space-x-3.5 mb-4">
              <div className="relative flex-shrink-0">
                {/* Icono Oficial PNG con Esquinas Redondeadas Transparentes */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 dark:bg-white/5 p-1 flex items-center justify-center border border-slate-200/80 dark:border-white/15 shadow-md">
                  <img 
                    src="./apple-touch-icon.png?v=2026.4" 
                    alt="Icono Oficial Neblina 105.5 FM" 
                    className="w-full h-full object-contain drop-shadow-sm select-none"
                    loading="eager"
                  />
                </div>
                {/* Indicador de señal activa */}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00DD9E] border-2 border-white dark:border-[#001438] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#001E4D] animate-ping" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-[#00DD9E]/15 text-[#001E4D] dark:text-[#00DD9E] border border-[#00DD9E]/30">
                    <Sparkles className="w-3 h-3 text-[#00DD9E]" />
                    <span>App oficial · PNG Squircle</span>
                  </span>
                </div>

                <h3 id="install-modal-title" className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-tight mt-0.5">
                  Instalar Neblina 105.5 FM
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Streaming digital HD sin interrupciones
                </p>
              </div>
            </div>

            {/* ============================================================= */}
            {/* SELECTOR DE PLATAFORMA / TIENDA (ANDROID, IOS, SMART TV, PC) */}
            {/* ============================================================= */}
            <div className="space-y-1.5 my-3">
              <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Selecciona tu dispositivo o tienda:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {/* 1. Android (Google Play Store) */}
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('android')}
                  className={`flex items-center space-x-2 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedPlatform === 'android'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-slate-900 dark:text-white ring-1 ring-emerald-500/30'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <GooglePlayStoreIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Android</span>
                </button>

                {/* 2. iOS / Apple (App Store) */}
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('ios')}
                  className={`flex items-center space-x-2 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedPlatform === 'ios'
                      ? 'bg-blue-500/15 border-blue-500/50 text-slate-900 dark:text-white ring-1 ring-blue-500/30'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <AppleAppStoreIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Apple iOS</span>
                </button>

                {/* 3. Android TV (Google Play) */}
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('android-tv')}
                  className={`flex items-center space-x-2 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedPlatform === 'android-tv'
                      ? 'bg-teal-500/15 border-teal-500/50 text-slate-900 dark:text-white ring-1 ring-teal-500/30'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <AndroidTvIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Android TV</span>
                </button>

                {/* 4. Apple TV (App Store) */}
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('apple-tv')}
                  className={`flex items-center space-x-2 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedPlatform === 'apple-tv'
                      ? 'bg-purple-500/15 border-purple-500/50 text-slate-900 dark:text-white ring-1 ring-purple-500/30'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <AppleTvIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Apple TV</span>
                </button>
              </div>
            </div>

            {/* ============================================================= */}
            {/* INSTRUCCIONES ESPECÍFICAS SEGÚN LA TIENDA Y PLATAFORMA */}
            {/* ============================================================= */}

            {/* CASO 1: ANDROID (TIENDA DE APLICACIONES GOOGLE PLAY) */}
            {selectedPlatform === 'android' && (
              <div className="space-y-3 my-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-white/[0.03] border border-emerald-500/20 text-xs">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-emerald-500/20">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center p-1.5 border border-slate-200 dark:border-white/10">
                    <GooglePlayStoreIcon className="w-full h-full" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs block">
                      Instalación para Android
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-[#00DD9E] font-semibold">
                      Compatible con el ecosistema de Google Play
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-slate-700 dark:text-slate-200">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">1</span>
                    <p className="leading-snug">
                      Pulsa el botón verde inferior <strong>"Instalar en Android"</strong> para añadir la app inmediatamente.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">2</span>
                    <p className="leading-snug">
                      Si tu navegador no muestra la ventana directa, pulsa los tres puntos <strong>(⋮)</strong> arriba a la derecha de Chrome y elige <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">3</span>
                    <p className="leading-snug">
                      El icono oficial con esquinas redondeadas aparecerá en tu escritorio y cajón de apps de Android.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CASO 2: APPLE IOS (TIENDA DE APLICACIONES APPLE APP STORE) */}
            {selectedPlatform === 'ios' && (
              <div className="space-y-3 my-3 p-4 rounded-2xl bg-blue-50/50 dark:bg-white/[0.03] border border-blue-500/20 text-xs">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-blue-500/20">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center p-1 border border-slate-200 dark:border-white/10">
                    <AppleAppStoreIcon className="w-full h-full" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs block">
                      Instalación en iPhone & iPad (iOS)
                    </span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                      Experiencia nativa Apple App Store
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-slate-700 dark:text-slate-200">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">1</span>
                    <p className="leading-snug">
                      En la barra inferior de <strong>Safari</strong> en tu iPhone o iPad, pulsa el botón <Share className="w-3.5 h-3.5 inline text-blue-500 mx-0.5" /> <strong>Compartir</strong>.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">2</span>
                    <p className="leading-snug">
                      Desplázate hacia abajo en el menú y selecciona <PlusSquare className="w-3.5 h-3.5 inline text-blue-500 mx-0.5" /> <strong>"Añadir a pantalla de inicio"</strong>.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">3</span>
                    <p className="leading-snug">
                      Pulsa <strong>"Añadir"</strong> arriba a la derecha. El icono PNG oficial con bordes squircle se instalará en tu pantalla de inicio.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CASO 3: SMART TV CON ANDROID (ANDROID TV / GOOGLE TV) */}
            {selectedPlatform === 'android-tv' && (
              <div className="space-y-3 my-3 p-4 rounded-2xl bg-teal-50/50 dark:bg-white/[0.03] border border-teal-500/20 text-xs">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-teal-500/20">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center p-1.5 border border-slate-200 dark:border-white/10">
                    <AndroidTvIcon className="w-full h-full" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs block">
                      Smart TV con Sistema Android (Android TV / Google TV)
                    </span>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                      Sony, Xiaomi, TCL, Chromecast & Android Box
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-slate-700 dark:text-slate-200">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">1</span>
                    <p className="leading-snug">
                      Abre el navegador web de tu Android TV (Chrome, Puffin TV o navegador nativo).
                    </p>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">2</span>
                    <p className="leading-snug">
                      Presiona el botón de <strong>Menú / Opciones</strong> del control remoto y elige <strong>"Fijar en pantalla de inicio de TV"</strong> o <strong>"Añadir a Marcadores"</strong>.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">3</span>
                    <p className="leading-snug">
                      La app quedará guardada como canal de audio directo para disfrutar en tu sala o negocio.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CASO 4: SMART TV DE APPLE (APPLE TV / AIRPLAY) */}
            {selectedPlatform === 'apple-tv' && (
              <div className="space-y-3 my-3 p-4 rounded-2xl bg-purple-50/50 dark:bg-white/[0.03] border border-purple-500/20 text-xs">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-purple-500/20">
                  <div className="w-8 h-8 rounded-xl bg-black shadow-sm flex items-center justify-center p-1 border border-white/20">
                    <AppleTvIcon className="w-full h-full" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs block">
                      Televisores Inteligentes Apple (Apple TV & AirPlay)
                    </span>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                      Transmisión HD inalámbrica y control remoto
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-slate-700 dark:text-slate-200">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">1</span>
                    <p className="leading-snug">
                      Abre Neblina 105.5 FM en tu iPhone, iPad o Mac y reproduce la señal en vivo.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">2</span>
                    <p className="leading-snug">
                      Pulsa el icono de <strong>AirPlay</strong> en el reproductor y selecciona tu <strong>Apple TV</strong> o televisor compatible.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">3</span>
                    <p className="leading-snug">
                      El audio sonará con sonido envolvente en tu HomePod o sistema de altavoces de la televisión.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CASO 5: COMPUTADORAS / PC & MAC */}
            {selectedPlatform === 'pc' && (
              <div className="space-y-3 my-3 p-4 rounded-2xl bg-sky-50/50 dark:bg-white/[0.03] border border-sky-500/20 text-xs">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-sky-500/20">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center p-1 border border-slate-200 dark:border-white/10 text-sky-500">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs block">
                      Computadora & Portátil (PC / Mac)
                    </span>
                    <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                      Chrome, Edge, Brave o Safari
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-slate-700 dark:text-slate-200">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">1</span>
                    <p className="leading-snug">
                      Pulsa el botón <strong>"Instalar en PC"</strong> ubicado abajo.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">2</span>
                    <p className="leading-snug">
                      O haz clic en el icono de instalación <strong>(⊕ o ⭳)</strong> ubicado al final de la barra de direcciones de tu navegador.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* BOTÓN DE ACCIÓN PRINCIPAL CON ICONO DE LA TIENDA CORRESPONDIENTE */}
            {/* ============================================================= */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleInstallAction}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#001E4D] via-[#002a66] to-[#00DD9E] text-white font-black text-sm shadow-lg shadow-[#00DD9E]/20 hover:shadow-[#00DD9E]/35 active:scale-[0.99] transition-all duration-200 flex items-center justify-center space-x-2.5 cursor-pointer border border-[#00DD9E]/40"
              >
                {selectedPlatform === 'android' && (
                  <>
                    <GooglePlayStoreIcon className="w-5 h-5 flex-shrink-0" />
                    <span>Instalar Aplicación en Android (Google Play)</span>
                  </>
                )}

                {selectedPlatform === 'ios' && (
                  <>
                    <AppleAppStoreIcon className="w-5 h-5 flex-shrink-0" />
                    <span>Instalar desde Safari en iOS (App Store)</span>
                  </>
                )}

                {selectedPlatform === 'android-tv' && (
                  <>
                    <AndroidTvIcon className="w-5 h-5 flex-shrink-0" />
                    <span>Fijar en mi Smart TV (Android TV)</span>
                  </>
                )}

                {selectedPlatform === 'apple-tv' && (
                  <>
                    <AppleTvIcon className="w-5 h-5 flex-shrink-0" />
                    <span>Sintonizar en mi Apple TV</span>
                  </>
                )}

                {selectedPlatform === 'pc' && (
                  <>
                    <Laptop className="w-5 h-5 text-[#00DD9E] flex-shrink-0" />
                    <span>Instalar Aplicación en Computadora</span>
                  </>
                )}
              </button>

              <button
                onClick={handleClose}
                className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              >
                Continuar navegando en la web
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : modalContent;
}
