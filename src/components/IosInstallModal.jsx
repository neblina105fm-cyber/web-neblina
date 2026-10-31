import React from 'react';
import { X, Share, PlusSquare, Smartphone } from 'lucide-react';
import Emoji3D from './Emoji3D';

const AppleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.61 1.35-.55.63-.99 1.68-.86 2.7.99.08 2.03-.51 2.55-1.2"/>
  </svg>
);

export default function IosInstallModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pt-3 sm:pt-4 pb-28 sm:pb-32 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#0c1b29] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-2xl p-6 shadow-lg transition-all duration-300 max-h-[calc(100dvh-130px)] sm:max-h-[calc(100dvh-140px)] overflow-y-auto my-auto">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center space-x-3">
            <Emoji3D name="apple" className="w-9 h-9 drop-shadow-md flex-shrink-0" alt="Apple" />
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                Instalar en Apple / iOS
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">iPhone, iPad & Mac</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vista previa del icono oficial estilo iOS */}
        <div className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 my-4 shadow-sm">
          <img 
            src="./apple-touch-icon.png?v=2026.2" 
            alt="Icono Neblina 105.5 FM estilo iOS" 
            className="w-14 h-14 rounded-2xl shadow-md border border-white/20 object-cover flex-shrink-0"
          />
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#001E4D] dark:text-[#00DD9E]">
              Icono Oficial de Aplicación
            </span>
            <h4 className="font-display font-black text-sm text-slate-900 dark:text-white">
              Neblina 105.5 FM
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Quedará instalado en tu escritorio o pantalla de inicio
            </p>
          </div>
        </div>

        {/* Pasos de instalación estilo Apple */}
        <div className="py-5 space-y-4">
          <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              1
            </div>
            <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">Pulsa el botón Compartir:</span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                En la barra inferior de Safari, pulsa el icono de <Share className="w-3.5 h-3.5 inline mx-1 text-blue-500" /> Compartir.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              2
            </div>
            <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">Añadir a pantalla de inicio:</span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                Desplázate hacia abajo y selecciona <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-500" /> <strong>"Añadir a pantalla de inicio"</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 px-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Emoji3D name="sparkles" className="w-4 h-4 flex-shrink-0 drop-shadow-xs" />
            <span>La app se abrirá en pantalla completa y con reproductor persistente en la Dynamic Island y pantalla de bloqueo.</span>
          </div>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-[#001E4D] hover:bg-[#002b66] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] font-black text-xs shadow-md transition cursor-pointer"
        >
          Entendido
        </button>

      </div>
    </div>
  );
}
