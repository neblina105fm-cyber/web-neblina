import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio,
  HeartHandshake, 
  Newspaper, 
  Calendar, 
  Store, 
  Headphones, 
  Phone, 
  Menu, 
  X, 
  Download, 
  Sparkles,
  Trophy,
  Mic,
  Clock,
  Sun,
  Moon,
  ChevronDown,
  Building2,
  ExternalLink,
  MessageCircle,
  MoreHorizontal
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { STATION_INFO } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import Emoji3D from './Emoji3D';
import { isAppInstalled, detectDevice } from '../utils/deviceDetector';
import { GooglePlayStoreIcon, AppleAppStoreIcon } from './UniversalInstallModal';

const WindowsIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M2.5 3.5h8.75v8.75H2.5V3.5zm9.75 0H21v8.75h-8.75V3.5zM2.5 13.25h8.75V22H2.5v-8.75zm9.75 0H21V22h-8.75v-8.75z" />
  </svg>
);

const AppleLogoIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.32c.67-.81 1.12-1.94 1-3.07-.96.04-2.13.64-2.82 1.45-.61.71-1.15 1.86-1 2.97 1.07.08 2.15-.54 2.82-1.35" />
  </svg>
);

export default function Navbar({ activeTab, setActiveTab }) {
  const { isPlaying, playbackType } = useAudioPlayer();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [device, setDevice] = useState({ isApple: false, isAndroid: false, isSmartTV: false });
  const moreMenuRef = useRef(null);

  useEffect(() => {
    setInstalled(isAppInstalled());
    setDevice(detectDevice());
  }, []);

  // Cerrar menú "Más" al hacer clic fuera o pulsar Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setMoreMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMoreMenuOpen(false);
      }
    };
    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreMenuOpen]);

  // Bloqueo de scroll en el body cuando el menú móvil está desplegado
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Navegación Primaria (Destinos Principales de Acceso Inmediato)
  const primaryNavItems = [
    { id: 'live', label: 'Inicio', icon: Radio },
    { id: 'news', label: 'Noticias', icon: Newspaper },
    { id: 'ranking', label: 'Ranking', fullLabel: 'Ranking de Neblina', icon: Trophy },
    { id: 'schedule', label: 'Programación', icon: Clock },
    { id: 'talents', label: 'Talentos', icon: Mic }
  ];

  // Navegación Secundaria (Agrupada bajo Menú "Más" en laptops y resoluciones medianas)
  const secondaryNavItems = [
    { id: 'events', label: 'Eventos', icon: Calendar },
    { id: 'sponsors', label: 'Aliados', icon: Store },
    { id: 'public_service', label: 'Servicio Público', fullLabel: 'Servicio Público & Ayudas', icon: HeartHandshake },
    { id: 'podcasts', label: 'Podcasts', icon: Headphones },
    { id: 'contact', label: 'Contacto', icon: Phone }
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];
  const isSecondaryActive = secondaryNavItems.some(item => item.id === activeTab);

  const handleOpenInstall = () => {
    window.dispatchEvent(new CustomEvent('neblina_open_install_modal'));
  };

  return (
    <>
      {/* Cabecera Superpuesta Aeroglass Estilo Apple macOS / iOS */}
      <header className="sticky top-0 left-0 right-0 z-50 w-full aeroglass-nav border-x-0 border-t-0 border-b border-slate-200/70 dark:border-white/10 transition-colors duration-300">
        <div className="w-full max-w-[1700px] mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
            
            {/* ========================================================================= */}
            {/* 1. VISTA MÓVIL Y TABLET VERTICAL (< xl: Menú Hamburguesa Simétrico)       */}
            {/* En resoluciones menores a xl (1280px), se muestra esta barra limpia       */}
            {/* para evitar que las 9 secciones colapsen o choquen entre sí.              */}
            {/* ========================================================================= */}
            <div className="flex xl:hidden items-center justify-between h-full w-full">
              
              {/* Columna Izquierda: Botón Circular de Menú con Pill "Secciones" */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/40 dark:border-white/15 bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white hover:-translate-y-0.5 active:scale-95 transition-all shadow-xs cursor-pointer flex-shrink-0"
                aria-label="Abrir Menú de Secciones"
              >
                <Menu className="w-4.5 h-4.5 stroke-[2.2] text-[#00DD9E]" />
                <span className="text-xs font-bold hidden sm:inline">Secciones</span>
              </button>

              {/* Columna Central: Logotipo Oficial Neblina 105.5 FM Centrado */}
              <div 
                className="relative flex items-center justify-center cursor-pointer py-1 select-none mx-auto active:scale-95 transition-transform duration-150" 
                onClick={() => { setActiveTab('live'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                title="Neblina Stereo 105.5 FM"
              >
                <img 
                  src="./logo-tight.svg" 
                  alt="Neblina Stereo 105.5 FM" 
                  width="130"
                  height="36"
                  className="h-9 sm:h-11 w-auto object-contain relative z-10 transition-transform duration-200"
                />
              </div>

              {/* Columna Derecha: Acciones Compactas (Cabina + Tema) */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <a
                  href={STATION_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-900 dark:text-[#00DD9E] px-2.5 h-8 rounded-lg text-xs font-bold border border-emerald-500/35 transition-all shadow-xs"
                  title="WhatsApp Cabina"
                >
                  <Emoji3D name="whatsapp" className="w-3.5 h-3.5 flex-shrink-0" alt="WhatsApp" />
                  <span>Cabina</span>
                </a>

                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/40 dark:border-white/15 bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white flex items-center justify-center hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                  title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                  aria-label="Cambiar tema"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4.5 h-4.5 text-amber-400" />
                  ) : (
                    <Moon className="w-4.5 h-4.5 text-indigo-600" />
                  )}
                </button>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* 2. VISTA ESCRITORIO COMPLETA (XL+: MONITORES >= 1280px)                   */}
            {/* Permite disfrutar de todas las pestañas extendidas con holgura y sin solapamiento. */}
            {/* ========================================================================= */}
            <div className="hidden xl:flex items-center justify-between h-full w-full gap-2 lg:gap-4">
              
              {/* Logo Oficial Neblina 105.5 FM */}
              <div 
                className="relative flex items-center cursor-pointer py-1 select-none shrink-0 mr-2 xl:mr-4 active:scale-95 transition-transform duration-150" 
                onClick={() => { setActiveTab('live'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                title="Neblina Stereo 105.5 FM - Inicio"
              >
                <img 
                  src="./logo-tight.svg" 
                  alt="Neblina Stereo 105.5 FM" 
                  width="150"
                  height="40"
                  className="h-9 xl:h-10 2xl:h-11 w-auto object-contain relative z-10 transition-transform duration-200"
                />
              </div>

              {/* Menú de Navegación Desktop */}
              <nav className="flex items-center gap-0.5 xl:gap-1 justify-center shrink min-w-0 px-1">
                {allNavItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`px-2.5 2xl:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
                        isActive
                          ? 'bg-[#001E4D]/85 dark:bg-[#00DD9E]/20 text-white dark:text-[#00DD9E] backdrop-blur-md border border-[#001E4D]/30 dark:border-[#00DD9E]/40 font-bold shadow-xs'
                          : 'text-slate-700 dark:text-white/85 hover:text-[#001E4D] dark:hover:text-[#00DD9E] hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Lado Derecho Desktop: Tema · Cabina · Portal para Aliados · Instalar App */}
              <div className="flex items-center gap-1.5 2xl:gap-2 shrink-0">

                {/* Botón de elección del tema */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center bg-[#001E4D]/12 hover:bg-[#001E4D]/22 dark:bg-white/12 dark:hover:bg-white/20 backdrop-blur-md text-[#001E4D] dark:text-white w-9 h-8 rounded-lg border border-[#001E4D]/20 dark:border-white/20 active:scale-95 transition-all cursor-pointer"
                  title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                  aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                </button>
                
                {/* Botón WhatsApp Cabina */}
                <a
                  href={STATION_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 backdrop-blur-md active:scale-95 text-emerald-900 dark:text-[#00DD9E] px-3 h-8 rounded-lg text-xs font-bold border border-emerald-500/35 dark:border-[#00DD9E]/35 transition-all shadow-xs whitespace-nowrap cursor-pointer"
                  title="Escribir a Cabina de Transmisión por WhatsApp"
                >
                  <Emoji3D name="whatsapp" className="w-4 h-4 flex-shrink-0" alt="WhatsApp Cabina" />
                  <span>Cabina</span>
                </a>

                {/* Botón Portal para Aliados */}
                <button
                  onClick={() => { window.location.hash = '#clientes'; }}
                  className="flex items-center gap-1.5 bg-[#001E4D]/12 hover:bg-[#001E4D]/22 dark:bg-white/12 dark:hover:bg-white/20 backdrop-blur-md active:scale-95 text-[#001E4D] dark:text-white px-3 h-8 rounded-lg text-xs font-bold border border-[#001E4D]/20 dark:border-white/20 transition-all shadow-xs cursor-pointer whitespace-nowrap"
                  title="Acceso al Portal para Aliados"
                >
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Portal para Aliados</span>
                </button>

                {/* Botón Universal de Instalar App */}
                <button
                  onClick={handleOpenInstall}
                  className="flex items-center gap-1.5 bg-[#001E4D]/12 hover:bg-[#001E4D]/22 dark:bg-white/12 dark:hover:bg-white/20 backdrop-blur-md active:scale-95 text-[#001E4D] dark:text-white px-3 h-8 rounded-lg text-xs font-bold border border-[#001E4D]/20 dark:border-white/20 transition-all cursor-pointer whitespace-nowrap"
                  title="Instalar App Oficial en tu Dispositivo"
                >
                  {device.isAndroid ? (
                    <GooglePlayStoreIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : device.isApple ? (
                    <AppleLogoIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <WindowsIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  <span>Instalar App</span>
                </button>

              </div>

            </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. CAJÓN DE MENÚ MÓVIL DESPLEGABLE (PANTALLA COMPLETA ESTILO APPLE)        */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[100] xl:hidden flex flex-col bg-white/98 dark:bg-[#001E4D]/98 backdrop-blur-2xl anim-drawer-in overflow-y-auto h-[100dvh] w-full"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de Navegación"
        >
          {/* Cabecera del Cajón Móvil */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 shrink-0">
            <div className="flex items-center space-x-2">
              <img 
                src="./logo-tight.svg" 
                alt="Neblina 105.5 FM" 
                width="140"
                height="40"
                className="h-8 w-auto object-contain"
              />
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/15 bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer"
              aria-label="Cerrar Menú"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Lista de Navegación en Tarjetas de Alto Rendimiento */}
          <div className="p-4 sm:p-6 space-y-2 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
              Secciones Oficiales
            </p>
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#00DD9E] text-[#001E4D] shadow-md shadow-[#00DD9E]/20 scale-[1.01]'
                      : 'bg-slate-100/80 dark:bg-white/5 text-slate-800 dark:text-white hover:bg-slate-200/80 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#001E4D]' : 'text-[#00DD9E]'}`} />
                    <span>{item.fullLabel || item.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#001E4D] animate-ping" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Acciones del Fondo del Cajón */}
          <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-white/10 space-y-3 shrink-0 bg-slate-50 dark:bg-black/20">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.location.hash = '#clientes';
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-white dark:bg-white/10 text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-white/10"
            >
              <Building2 className="w-4 h-4 text-[#00DD9E]" />
              <span>Acceso al Portal para Aliados</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenInstall();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] font-black text-xs"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Aplicación Oficial</span>
            </button>

            <a
              href={STATION_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-[#25D366] text-white font-bold text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar a Cabina por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
