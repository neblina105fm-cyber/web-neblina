import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { initNewsNotificationMonitor, autoEnableNotifications } from './services/notificationService';
import './index.css';

// Activar notificaciones por default automáticamente
autoEnableNotifications();

// Capturar evento de instalación PWA para instalar bajo demanda desde los sistemas
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__neblinaDeferredPrompt = e;
  window.dispatchEvent(new Event('neblina_install_prompt_ready'));
});

// Registrar Service Worker para PWA y Notificaciones en segundo plano
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        // Inicializar monitor de noticias en segundo plano
        initNewsNotificationMonitor();
      })
      .catch((err) => {
        console.log('SW registration error:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AudioPlayerProvider>
      <App />
    </AudioPlayerProvider>
  </React.StrictMode>
);
