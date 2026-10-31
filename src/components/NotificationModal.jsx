import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Bell, BellRing, X, Check, AlertCircle, Sparkles } from 'lucide-react';
import Emoji3D from './Emoji3D';
import { 
  requestNotificationPermission, 
  getNotificationPermission, 
  sendTestNotification 
} from '../services/notificationService';

export default function NotificationModal({ isOpen, onClose }) {
  const [permission, setPermission] = useState('default');
  const [testing, setTesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermission());
    }
  }, [isOpen]);

  // Bloqueo de scroll cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = (originalOverflow && originalOverflow !== 'hidden') ? originalOverflow : '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleActivate = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      setSuccessMsg('¡Notificaciones activadas exitosamente!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    const sent = await sendTestNotification();
    setTesting(false);
    if (sent) {
      setSuccessMsg('¡Notificación de prueba enviada a tu dispositivo!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const isGranted = permission === 'granted';

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 pt-3 sm:pt-4 pb-28 sm:pb-32 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#0c1b29] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-lg transition-all duration-300 max-h-[calc(100dvh-130px)] sm:max-h-[calc(100dvh-140px)] overflow-y-auto my-auto">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center space-x-3">
            <Emoji3D 
              name="bell" 
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-sm flex-shrink-0" 
              alt="Alertas" 
            />
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                Alertas y Notificaciones
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Neblina Stereo 105.5 FM</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="py-5 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Recibe avisos inmediatos en tu teléfono, computadora o Smart TV cada vez que se publique una <strong>noticia de última hora</strong>, reportes viales del Páramo o cambios de programación en vivo.
          </p>

          {/* Estado actual */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Estado en este dispositivo:</span>
              <p className={`text-[11px] font-semibold mt-0.5 ${isGranted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                <span className="inline-flex items-center gap-1">{isGranted ? <><Check className="w-3.5 h-3.5" /> Notificaciones Habilitadas</> : <><AlertCircle className="w-3.5 h-3.5" /> Notificaciones Pendientes</>}</span>
              </p>
            </div>

            {!isGranted && (
              <button
                onClick={handleActivate}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-sm hover:opacity-90"
              >
                Activar
              </button>
            )}
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Botón de prueba para el administrador/usuario */}
          <div className="pt-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-full bg-gradient-to-r from-[#00DD9E] to-[#00b4d8] text-[#001E4D] font-black text-xs shadow-md shadow-[#00DD9E]/20 hover:opacity-95 transition"
            >
              <Emoji3D name="sparkles" className="w-4 h-4 flex-shrink-0" alt="Prueba" />
              <span>{testing ? 'Enviando alerta...' : 'Enviar Notificación de Prueba'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : modalContent;
}
