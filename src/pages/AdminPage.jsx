import React from 'react';
import AdminModal from '../components/admin/AdminModal';

/**
 * AdminPage - Página Administrativa Independiente y Dedicada de Neblina Stereo 105.5 FM
 * Funciona bajo la misma dirección web (/admin, #admin, #panel) pero con una vista 100%
 * autónoma y dedicada (no una ventana modal sobrepuesta), adaptada a monitores de escritorio
 * y dispositivos móviles.
 */
export default function AdminPage({ onClose, onBackToWeb }) {
  const handleBack = () => {
    if (onBackToWeb) {
      onBackToWeb();
    } else if (onClose) {
      onClose();
    } else {
      // Limpiar hash y volver a la web principal
      window.history.replaceState(null, '', window.location.pathname + window.location.search.replace(/[?&]admin=[^&]+/, ''));
      window.location.hash = '';
    }
  };

  return (
    <AdminModal 
      isOpen={true} 
      onClose={handleBack} 
      isStandalonePage={true} 
    />
  );
}
