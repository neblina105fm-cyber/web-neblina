import React, { useState } from 'react';
import { User } from 'lucide-react';

/**
 * AvatarWithFallback - Componente a prueba de fallos para avatares y fotos de perfil
 * Muestra la imagen si existe y carga sin errores; si la imagen falla (404, enlace roto)
 * o si está vacía, renderiza inmediatamente un squircle aeroglass con el icono de usuario
 * de Neblina Stereo (#00DD9E).
 */
export default function AvatarWithFallback({ 
  src, 
  alt = 'Usuario', 
  className = 'w-full h-full object-cover',
  containerClassName = 'w-12 h-12 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border-2 border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden',
  iconClassName = 'w-6 h-6 text-[#00DD9E]'
}) {
  const [hasError, setHasError] = useState(false);

  const shouldShowImg = Boolean(src && String(src).trim() !== '' && !hasError);

  return (
    <div className={containerClassName}>
      {shouldShowImg ? (
        <img
          src={src}
          alt={alt}
          className={className}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <User className={iconClassName} />
      )}
    </div>
  );
}
