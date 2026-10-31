import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Emoji3D from './Emoji3D';
import { STATION_INFO } from '../services/api';
import CitizenReportModal from './CitizenReportModal';

export default function CitizenReportBanner() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="py-2 select-none bg-transparent">
        <div className="relative rounded-2xl aeroglass-card p-4 sm:p-6 transition-all duration-300 overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            
            {/* Lado izquierdo: Icono y Textos */}
            <div className="flex items-start space-x-4 max-w-2xl">
              <Emoji3D 
                name="siren" 
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-sm flex-shrink-0" 
                alt="Denuncia" 
              />

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/25 flex items-center space-x-1.5">
                    <Emoji3D name="warning" className="w-3.5 h-3.5" alt="Alerta" />
                    <span>DENUNCIA CIUDADANA</span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-300 hidden sm:inline">• Línea Directa {STATION_INFO.whatsapp}</span>
                </div>

                <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  ¿Tienes una denuncia o reporte en tu comunidad?
                </h3>
                
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  Haz escuchar la voz de tu sector. Reporta fallas de vialidad, averías, servicios públicos o emergencias directamente a nuestra sala informativa por WhatsApp con hora, lugar y fotos/videos de evidencia.
                </p>

                {/* Nota pequeña de Privacidad y Confidencialidad */}
                <div className="pt-1 flex items-center space-x-1.5 text-[11px] font-bold text-[#001E4D] dark:text-[#00DD9E]">
                  <Emoji3D name="shield" className="w-3.5 h-3.5 flex-shrink-0" alt="Privacidad" />
                  <span>Privacidad garantizada: Tus datos son confidenciales y no serán compartidos con ninguna persona ni ente de seguridad.</span>
                </div>
              </div>
            </div>

            {/* Lado derecho: Un solo botón en rojo con efecto Aero Glass rojizo */}
            <div className="flex items-center flex-shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="w-full md:w-auto inline-flex items-center justify-center space-x-2.5 px-5 py-3 rounded-xl bg-rose-600/80 hover:bg-rose-600/95 dark:bg-rose-600/70 dark:hover:bg-rose-500/85 backdrop-blur-xl text-white text-xs sm:text-sm font-black border border-rose-400/50 shadow-lg shadow-rose-600/20 hover:shadow-rose-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <Emoji3D name="siren" className="w-4 h-4 flex-shrink-0" alt="Denuncia" />
                <span>Realizar Denuncia</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Modal con Formulario Asistido */}
      <CitizenReportModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
