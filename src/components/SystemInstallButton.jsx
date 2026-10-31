import React, { useState, useEffect } from 'react';
import { Download, Check, Smartphone, Monitor } from 'lucide-react';

export default function SystemInstallButton({ appName = 'Sistema', className = '' }) {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Detectar si ya corre en modo standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // Detectar iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    if (window.__neblinaDeferredPrompt) {
      setCanInstall(true);
    }

    const handlePromptReady = () => {
      setCanInstall(true);
    };

    window.addEventListener('neblina_install_prompt_ready', handlePromptReady);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setCanInstall(false);
    });

    return () => {
      window.removeEventListener('neblina_install_prompt_ready', handlePromptReady);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(!showIosGuide);
      return;
    }

    const promptEvent = window.__neblinaDeferredPrompt;
    if (!promptEvent) {
      // Si el navegador soporta instalación manual o instrucciones
      alert(`Para instalar ${appName} en tu dispositivo: abre el menú de opciones de tu navegador y pulsa 'Instalar aplicación' o 'Agregar a pantalla principal'.`);
      return;
    }

    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    if (result.outcome === 'accepted') {
      setInstalled(true);
      setCanInstall(false);
      window.__neblinaDeferredPrompt = null;
    }
  };

  if (installed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00DD9E] text-xs font-bold border border-emerald-500/20">
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">App Instalada</span>
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 dark:bg-white/5 hover:bg-[#00DD9E] hover:text-[#001E4D] text-slate-700 dark:text-slate-200 border border-slate-300/40 dark:border-white/10 backdrop-blur-md text-xs font-black transition cursor-pointer shadow-xs active:scale-95 ${className}`}
        title={`Instalar ${appName} como App Independiente`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>

      {/* Guía flotante para iOS Safari (Adaptable a Modo Claro y Oscuro con Efecto Aero Glass) */}
      {showIosGuide && (
        <div className="absolute right-0 top-full mt-2 w-64 p-3.5 rounded-2xl bg-white/95 dark:bg-[#001E4D]/95 text-slate-800 dark:text-white border border-slate-200 dark:border-[#00DD9E]/40 shadow-xl backdrop-blur-2xl text-xs space-y-2 z-50 animate-fadeIn">
          <p className="font-black text-emerald-600 dark:text-[#00DD9E] flex items-center gap-1.5">
            <Smartphone className="w-4 h-4" />
            <span>Instalar en iPhone / iPad:</span>
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-200 text-[11px] leading-relaxed">
            <li>Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha arriba) en Safari.</li>
            <li>Baja en el menú y selecciona <strong>"Agregar al inicio"</strong>.</li>
            <li>Confirma tocando <strong>Agregar</strong> en la esquina superior.</li>
          </ol>
          <button 
            type="button" 
            onClick={() => setShowIosGuide(false)} 
            className="w-full mt-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold text-[11px] transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      )}
    </div>
  );
}
