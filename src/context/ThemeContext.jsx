import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Si el usuario guardó explícitamente una preferencia en localStorage
    const saved = localStorage.getItem('neblina_theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Si no ha guardado, adaptarse automáticamente al tema del dispositivo (SO)
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Escuchar en tiempo real cambios de tema en el dispositivo/sistema operativo
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      // Solo actualizamos si el usuario no ha forzado un override manual
      const manualOverride = localStorage.getItem('neblina_theme_manual');
      if (!manualOverride) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, []);

  // Sincronizar clases CSS y color de barra en el navegador
  useEffect(() => {
    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#001E4D');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#FFFFFF');
    }
    localStorage.setItem('neblina_theme', theme);
  }, [theme]);

  // Permitir al usuario cambiar manualmente el tema en cualquier momento
  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('neblina_theme_manual', 'true');
      return nextTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
