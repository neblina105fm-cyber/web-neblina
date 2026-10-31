import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock } from 'lucide-react';
import Emoji3D from './Emoji3D';
import { registerPrivateVisit } from '../services/analyticsLogger';

export default function PrivacyConsentModal() {
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    // 1. Aceptación directa e inmediata sin interrumpir al usuario
    localStorage.setItem('neblina_privacy_consent', 'accepted');
    registerPrivateVisit({ privacyAccepted: true });

    // 2. Escuchar evento bajo demanda si el usuario hace clic en Privacidad desde el footer
    const handleOpenPrivacy = () => {
      setDetailsOpen(true);
    };
    window.addEventListener('neblina_open_privacy_modal', handleOpenPrivacy);

    return () => {
      window.removeEventListener('neblina_open_privacy_modal', handleOpenPrivacy);
    };
  }, []);

  return (
    <>
      {/* Modal Informativo Detallado (Bajo Demanda desde el Footer o Ajustes) */}
      {detailsOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pt-3 sm:pt-4 pb-28 sm:pb-32 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailsOpen(false);
          }}
        >
          <div className="relative w-full max-w-md bg-white dark:bg-[#1d1d1f] border border-[#e6e6e8] dark:border-white/10 rounded-2xl overflow-hidden p-6 shadow-lg transition-colors duration-300 max-h-[calc(100dvh-130px)] sm:max-h-[calc(100dvh-140px)] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center space-x-2.5">
                <Emoji3D name="shield" className="w-6 h-6 drop-shadow-sm flex-shrink-0" />
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Privacidad & Términos Oficiales
                </h3>
              </div>
              <button
                onClick={() => setDetailsOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-[#86868b] leading-relaxed">
              <p>
                En <strong>Neblina Stereo 105.5 FM</strong> respetamos y protegemos la privacidad de nuestros oyentes.
              </p>
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 text-emerald-900 dark:text-emerald-200 text-xs">
                <Lock className="inline w-3.5 h-3.5 mr-1 -mt-0.5" /><strong>Garantía de Confidencialidad:</strong> Tus datos de sintonía, reportes ciudadanos y solicitudes no serán compartidos con ninguna persona, empresa ni ente de seguridad.
              </div>
              <p>
                Al navegar en nuestra Web App, disfrutas de una experiencia optimizada para streaming continuo, libre de publicidad invasiva y con almacenamiento local seguro en tu dispositivo.
              </p>
            </div>

            <button
              onClick={() => setDetailsOpen(false)}
              className="w-full mt-5 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-sm transition hover:opacity-90 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
