/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neblina: {
          // Colores Principales Oficiales
          navy: '#001E4D',          // Azul Marino Profundo (HEX: #001E4D | RGB: 0, 30, 77)
          deep: '#001438',          // Azul Marino Nocturno
          turquesa: '#00DD9E',      // Cian / Verde Turquesa Brillante (HEX: #00DD9E | RGB: 0, 221, 158)
          cyan: '#00DD9E',          // Alias oficial
          teal: '#00DD9E',          // Alias oficial
          white: '#FFFFFF',         // Blanco Puro (HEX: #FFFFFF)
          
          // Colores Secundarios Oficiales (Tonos Pastel)
          skyPastel: '#B9EBFF',     // Azul Celeste Pastel (RGB: 185, 235, 255)
          lavenderPastel: '#EBE1FA',// Lavanda / Lila Suave (RGB: 235, 225, 250)
          
          // Superficies y Contenedores Corporativos
          dark: '#001E4D',
          surface: '#00183f',
          card: '#001e4d',
          border: 'rgba(0, 221, 158, 0.25)',
          accent: '#00DD9E'
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, #001E4D, #00DD9E)',
        'brand-gradient-diagonal': 'linear-gradient(135deg, #001E4D 0%, #00DD9E 100%)',
        'brand-gradient-light': 'linear-gradient(135deg, #B9EBFF 0%, #EBE1FA 50%, #FFFFFF 100%)',
        'brand-glass-dark': 'linear-gradient(160deg, rgba(0, 30, 77, 0.92) 0%, rgba(0, 20, 56, 0.95) 100%)',
        'brand-glass-light': 'linear-gradient(160deg, rgba(255, 255, 255, 0.96) 0%, rgba(245, 250, 255, 0.94) 100%)',
      },
      fontFamily: {
        sans: ['Lato', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Lato', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'equalizer': 'equalizer 1s infinite ease-in-out'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' }
        },
        equalizer: {
          '0%, 100%': { height: '6px' },
          '50%': { height: '24px' }
        }
      }
    },
  },
  plugins: [],
}
