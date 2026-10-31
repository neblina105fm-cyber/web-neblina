import React, { useState, useEffect, Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import AdCarousel from './components/AdCarousel';
import WeatherBanner from './components/WeatherBanner';
import HomeBcvBanner from './components/HomeBcvBanner';
import NewsCarousel from './components/NewsCarousel';
import SponsorsCarousel from './components/SponsorsCarousel';
import WhatsAppCommunitySection from './components/WhatsAppCommunitySection';
import YouTubeShortsSection from './components/YouTubeShortsSection';
import HomeRankingBanner from './components/HomeRankingBanner';
import CitizenReportBanner from './components/CitizenReportBanner';
import MixStylePlayer from './components/MixStylePlayer';
import PrivacyConsentModal from './components/PrivacyConsentModal';
import UniversalInstallModal from './components/UniversalInstallModal';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';
import Emoji3D from './components/Emoji3D';
import { ThemeProvider } from './context/ThemeContext';

// Carga Dinámica (Code-Splitting) para Máxima Velocidad en Móviles y Reducción del Bundle Inicial
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminModal = lazy(() => import('./components/admin/AdminModal'));
const NewsSection = lazy(() => import('./components/NewsSection'));
const RankingSection = lazy(() => import('./components/RankingSection'));
const EventsSection = lazy(() => import('./components/EventsSection'));
const SponsorsDirectorySection = lazy(() => import('./components/SponsorsDirectorySection'));
const PublicServiceSection = lazy(() => import('./components/PublicServiceSection'));
const ScheduleSection = lazy(() => import('./components/ScheduleSection'));
const TalentsSection = lazy(() => import('./components/TalentsSection'));
const PodcastsSection = lazy(() => import('./components/PodcastsSection'));
const ContactSection = lazy(() => import('./components/ContactSection'));
const SongHistoryModal = lazy(() => import('./components/SongHistoryModal'));
const ClientPortalModal = lazy(() => import('./components/client/ClientPortalModal'));
const StaffPortalModal = lazy(() => import('./components/staff/StaffPortalModal'));
const JournalistPortalModal = lazy(() => import('./components/journalists/JournalistPortalModal'));
const SmartTvPage = lazy(() => import('./pages/SmartTvPage'));

function TabLoadingFallback() {
  return (
    <div className="py-24 flex flex-col items-center justify-center space-y-3 min-h-[360px]" aria-busy="true">
      <div className="w-9 h-9 rounded-full border-2 border-slate-300 dark:border-white/10 border-t-[#00DD9E] animate-spin" />
      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase animate-pulse">
        Cargando sección...
      </span>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [clientPortalOpen, setClientPortalOpen] = useState(false);
  const [staffPortalOpen, setStaffPortalOpen] = useState(false);
  const [journalistPortalOpen, setJournalistPortalOpen] = useState(false);
  const [smartTvOpen, setSmartTvOpen] = useState(false);

  // Escuchar apertura del Portal de Clientes o ruta #clientes / #portal / #aliados
  useEffect(() => {
    const handleOpenClientPortal = () => {
      window.location.hash = '#clientes';
    };
    window.addEventListener('neblina_open_client_portal', handleOpenClientPortal);

    const checkPortalRoute = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const path = (window.location.pathname || '').toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const isClientRoute = (
        hash === '#clientes' ||
        hash === '#portal' ||
        hash === '#cliente' ||
        hash === '#aliados' ||
        path === '/clientes' ||
        path === '/aliados' ||
        params.get('portal') === 'clientes'
      );
      setClientPortalOpen(isClientRoute);
    };
    checkPortalRoute();
    window.addEventListener('hashchange', checkPortalRoute);
    window.addEventListener('popstate', checkPortalRoute);

    return () => {
      window.removeEventListener('neblina_open_client_portal', handleOpenClientPortal);
      window.removeEventListener('hashchange', checkPortalRoute);
      window.removeEventListener('popstate', checkPortalRoute);
    };
  }, []);

  // Escuchar apertura del Portal de Locutores & Ventas o ruta #locutores / #staff
  useEffect(() => {
    const handleOpenStaffPortal = () => {
      window.location.hash = '#locutores';
    };
    window.addEventListener('neblina_open_staff_portal', handleOpenStaffPortal);

    const checkStaffRoute = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const path = (window.location.pathname || '').toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const isStaffRoute = (
        hash === '#locutores' ||
        hash === '#staff' ||
        hash === '#comercial' ||
        hash === '#locutor' ||
        path === '/locutores' ||
        params.get('portal') === 'locutores'
      );
      setStaffPortalOpen(isStaffRoute);
    };
    checkStaffRoute();
    window.addEventListener('hashchange', checkStaffRoute);
    window.addEventListener('popstate', checkStaffRoute);

    return () => {
      window.removeEventListener('neblina_open_staff_portal', handleOpenStaffPortal);
      window.removeEventListener('hashchange', checkStaffRoute);
      window.removeEventListener('popstate', checkStaffRoute);
    };
  }, []);

  // Escuchar apertura del Portal de Periodistas o ruta #periodistas / #redaccion / #prensa / /periodistas
  useEffect(() => {
    const handleOpenJournalistPortal = () => {
      window.location.hash = '#periodistas';
    };
    window.addEventListener('neblina_open_journalist_portal', handleOpenJournalistPortal);

    const checkJournalistRoute = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const path = (window.location.pathname || '').toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const isJournalistRoute = (
        hash === '#periodistas' ||
        hash === '#redaccion' ||
        hash === '#prensa-portal' ||
        hash === '#periodista' ||
        path === '/periodistas' ||
        path === '/redaccion' ||
        params.get('portal') === 'periodistas' ||
        params.get('app') === 'periodistas'
      );
      setJournalistPortalOpen(isJournalistRoute);
    };
    checkJournalistRoute();
    window.addEventListener('hashchange', checkJournalistRoute);
    window.addEventListener('popstate', checkJournalistRoute);

    return () => {
      window.removeEventListener('neblina_open_journalist_portal', handleOpenJournalistPortal);
      window.removeEventListener('hashchange', checkJournalistRoute);
      window.removeEventListener('popstate', checkJournalistRoute);
    };
  }, []);

  // Escuchar ruta para la App de Smart TV (#tv, /tv, ?tv=true)
  useEffect(() => {
    const checkTvRoute = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const path = (window.location.pathname || '').toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const isTvRoute = (
        hash === '#tv' ||
        hash === '#smart-tv' ||
        hash === '#smarttv' ||
        hash === '#television' ||
        path === '/tv' ||
        path === '/smart-tv' ||
        params.get('tv') === 'true' ||
        params.get('app') === 'smart-tv'
      );
      setSmartTvOpen(isTvRoute);
    };
    checkTvRoute();
    window.addEventListener('hashchange', checkTvRoute);
    window.addEventListener('popstate', checkTvRoute);

    return () => {
      window.removeEventListener('hashchange', checkTvRoute);
      window.removeEventListener('popstate', checkTvRoute);
    };
  }, []);

  // Detección de link privado para el Sistema Interno (#admin, #panel, /admin, ?admin=true)
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const path = (window.location.pathname || '').toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const isAdminRoute = (
        hash === '#admin' || 
        hash === '#panel' || 
        hash === '#sistema' || 
        path === '/admin' ||
        path === '/panel' ||
        params.get('admin') === 'true' || 
        params.get('admin') === '1'
      );
      if (isAdminRoute) {
        setAdminOpen(true);
      } else {
        setAdminOpen(false);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);

    // Atajo discreto de teclado para administradores (Ctrl + Shift + A o Alt + A)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
          (e.altKey && (e.key === 'A' || e.key === 'a'))) {
        e.preventDefault();
        setAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Intercambiar dinámicamente el Web App Manifest y Título para las apps independientes
  useEffect(() => {
    let manifestUrl = './manifest.json';
    let appTitle = 'Neblina Stereo 105.5 FM - Contigo en la Cima';

    if (smartTvOpen) {
      manifestUrl = './manifest-tv.json';
      appTitle = 'Neblina 105.5 · Smart TV';
    } else if (adminOpen) {
      manifestUrl = './manifest-admin.json';
      appTitle = 'Neblina 105.5 · Sistema Interno';
    } else if (clientPortalOpen) {
      manifestUrl = './manifest-clientes.json';
      appTitle = 'Neblina 105.5 · Portal Aliados Comerciales';
    } else if (staffPortalOpen) {
      manifestUrl = './manifest-locutores.json';
      appTitle = 'Neblina 105.5 · Portal Locutores & Ventas';
    } else if (journalistPortalOpen) {
      manifestUrl = './manifest-periodistas.json';
      appTitle = 'Neblina 105.5 · Portal Periodistas & Redacción';
    }

    document.title = appTitle;

    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = manifestUrl;
  }, [smartTvOpen, adminOpen, clientPortalOpen, staffPortalOpen, journalistPortalOpen]);

  // Optimización de Fluidez Apple: Pausar animaciones pesadas durante scroll para 120 FPS continuos
  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      if (!document.body.classList.contains('is-scrolling')) {
        document.body.classList.add('is-scrolling');
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleCloseAdmin = () => {
    setAdminOpen(false);
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();
    if (hash === '#admin' || hash === '#panel' || hash === '#sistema' || path === '/admin' || path === '/panel') {
      window.history.replaceState(null, '', window.location.pathname.replace(/\/(admin|clientes|aliados|locutores|periodistas|redaccion)$/, '') || window.location.pathname);
    }
  };

  const handleCloseClientPortal = () => {
    setClientPortalOpen(false);
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();
    if (hash === '#clientes' || hash === '#portal' || hash === '#cliente' || hash === '#aliados' || path === '/clientes' || path === '/aliados') {
      window.history.replaceState(null, '', window.location.pathname.replace(/\/(admin|clientes|aliados|locutores|periodistas|redaccion)$/, '') || window.location.pathname);
    }
  };

  const handleCloseStaffPortal = () => {
    setStaffPortalOpen(false);
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();
    if (hash === '#locutores' || hash === '#staff' || hash === '#comercial' || hash === '#locutor' || path === '/locutores') {
      window.history.replaceState(null, '', window.location.pathname.replace(/\/(admin|clientes|aliados|locutores|periodistas|redaccion)$/, '') || window.location.pathname);
    }
  };

  const handleCloseJournalistPortal = () => {
    setJournalistPortalOpen(false);
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();
    if (hash === '#periodistas' || hash === '#redaccion' || hash === '#prensa-portal' || hash === '#periodista' || path === '/periodistas' || path === '/redaccion') {
      window.history.replaceState(null, '', window.location.pathname.replace(/\/(admin|clientes|aliados|locutores|periodistas|redaccion)$/, '') || window.location.pathname);
    }
  };

  const handleCloseSmartTv = () => {
    setSmartTvOpen(false);
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();
    if (hash === '#tv' || hash === '#smart-tv' || hash === '#smarttv' || path === '/tv') {
      window.history.replaceState(null, '', window.location.pathname.replace(/\/(admin|clientes|aliados|locutores|periodistas|redaccion)$/, '') || window.location.pathname);
    }
  };

  // VISTA DEDICADA E INDEPENDIENTE: App Smart TV (10-foot UI para Televisores)
  if (smartTvOpen) {
    return (
      <ThemeProvider>
        <Suspense fallback={<TabLoadingFallback />}>
          <SmartTvPage onExit={handleCloseSmartTv} />
        </Suspense>
      </ThemeProvider>
    );
  }

  // VISTA DEDICADA E INDEPENDIENTE: Si estamos en el Sistema Administrativo,
  // se presenta como página completa autónoma (sin reproductor ni web pública debajo)
  if (adminOpen) {
    return (
      <ThemeProvider>
        <ErrorBoundary fallbackTitle="Ha ocurrido un inconveniente al cargar el Sistema Administrativo">
          <div className="min-h-screen relative flex flex-col font-sans selection:bg-[#00DD9E] selection:text-[#001E4D] overflow-x-hidden transition-colors duration-300">
            {/* Fondo Animado Oficial (Aros Conic-Gradient) en el Sistema Interno */}
            <AnimatedBackground />

            <div className="relative z-10 flex flex-col flex-1">
              <Suspense fallback={<TabLoadingFallback />}>
                <AdminPage 
                  onClose={handleCloseAdmin}
                  onBackToWeb={handleCloseAdmin} 
                />
              </Suspense>
            </div>
          </div>
        </ErrorBoundary>
      </ThemeProvider>
    );
  }

  // VISTA DEDICADA E INDEPENDIENTE: Portal para Aliados Comerciales (Clientes)
  // Se presenta en página independiente sin superposición sobre la web pública
  if (clientPortalOpen) {
    return (
      <ThemeProvider>
        <ErrorBoundary fallbackTitle="Ha ocurrido un inconveniente al cargar el Portal de Clientes y Aliados">
          <div className="min-h-screen relative flex flex-col font-sans selection:bg-[#00DD9E] selection:text-[#001E4D] overflow-x-hidden transition-colors duration-300">
            <AnimatedBackground />
            <div className="relative z-10 flex flex-col flex-1">
              <Suspense fallback={<TabLoadingFallback />}>
                <ClientPortalModal 
                  isOpen={true} 
                  isStandalonePage={true}
                  onClose={handleCloseClientPortal} 
                />
              </Suspense>
            </div>
          </div>
        </ErrorBoundary>
      </ThemeProvider>
    );
  }

  // VISTA DEDICADA E INDEPENDIENTE: Portal para Locutores & Equipo Comercial
  // Se presenta en página independiente sin superposición sobre la web pública
  if (staffPortalOpen) {
    return (
      <ThemeProvider>
        <ErrorBoundary fallbackTitle="Ha ocurrido un inconveniente al cargar el Portal de Locutores y Ventas">
          <div className="min-h-screen relative flex flex-col font-sans selection:bg-[#00DD9E] selection:text-[#001E4D] overflow-x-hidden transition-colors duration-300">
            <AnimatedBackground />
            <div className="relative z-10 flex flex-col flex-1">
              <Suspense fallback={<TabLoadingFallback />}>
                <StaffPortalModal 
                  isOpen={true} 
                  isStandalonePage={true}
                  onClose={handleCloseStaffPortal} 
                />
              </Suspense>
            </div>
          </div>
        </ErrorBoundary>
      </ThemeProvider>
    );
  }

  // VISTA DEDICADA E INDEPENDIENTE: Portal para Periodistas & Redacción
  // Se presenta en página independiente sin superposición sobre la web pública
  if (journalistPortalOpen) {
    return (
      <ThemeProvider>
        <ErrorBoundary fallbackTitle="Ha ocurrido un inconveniente al cargar el Portal de Periodistas y Redacción">
          <div className="min-h-screen relative flex flex-col font-sans selection:bg-[#00DD9E] selection:text-[#001E4D] overflow-x-hidden transition-colors duration-300">
            <AnimatedBackground />
            <div className="relative z-10 flex flex-col flex-1">
              <Suspense fallback={<TabLoadingFallback />}>
                <JournalistPortalModal 
                  isOpen={true} 
                  isStandalonePage={true}
                  onClose={handleCloseJournalistPortal} 
                />
              </Suspense>
            </div>
          </div>
        </ErrorBoundary>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen relative flex flex-col font-sans selection:bg-[#00DD9E] selection:text-[#001E4D] pb-28 overflow-x-hidden transition-colors duration-300">
        
        {/* Fondo Hipnotizante Sutil con Transición de Tema Apple */}
        <AnimatedBackground />

        {/* Capa de Contenido Principal */}
        <div className="relative z-10 flex flex-col flex-1">
          
          {/* Menú Superior con Logo Oficial Vectorial y Selector de Tema */}
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Contenido Central */}
          <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
            
            {/* Pestaña INICIO (Estructura Limpia y Ágil según Requerimientos) */}
            {activeTab === 'live' && (
              <div className="anim-tab-enter space-y-3 sm:space-y-3.5 lg:space-y-3.5 pt-5 sm:pt-6 lg:pt-7">
                {/* 1. Espacio Publicitario Horizontal */}
                <AdCarousel variant="header" />

                {/* 2. Banner Climático Mínimo por Ubicación */}
                <WeatherBanner />

                {/* 3. Carrusel con las 6 Últimas Noticias Destacadas */}
                <NewsCarousel />

                {/* 4. Carrusel Continuo de Patrocinantes y Aliados Comerciales */}
                <SponsorsCarousel setActiveTab={setActiveTab} />

                {/* 4.5. Banner Oficial de Tasas BCV (Dólar, Euro y Calculadora Rápida) antes de las Últimas Noticias */}
                <HomeBcvBanner />

                {/* 5. Últimas 9 Noticias de la Emisora (neblina105fm.com) */}
                <NewsSection 
                  isHome={true} 
                  limit={9} 
                  onSeeAllNews={() => {
                    setActiveTab('news');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />

                {/* 6. Banner de Denuncia Ciudadana (Ubicado estratégicamente debajo de Noticias) */}
                <div className="cv-auto">
                  <CitizenReportBanner />
                </div>

                {/* 7. Canal y Grupos Oficiales de WhatsApp */}
                <div className="cv-auto">
                  <WhatsAppCommunitySection />
                </div>

                {/* 8. Acceso Rápido al Ranking & Lo Más Sonado (Con Carátula HD, Título y Artista) */}
                <div className="cv-auto">
                  <HomeRankingBanner 
                    onOpenRanking={() => { 
                      setActiveTab('ranking'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} 
                  />
                </div>

                {/* 9. Shorts de YouTube de @neblina105fm */}
                <div className="cv-auto">
                  <YouTubeShortsSection />
                </div>
              </div>
            )}

            {/* Pestañas Secundarias con Carga Bajo Demanda (Suspense) */}
            <Suspense fallback={<TabLoadingFallback />}>
              {/* Pestaña NOTICIAS (Independiente) */}
              {activeTab === 'news' && (
                <div className="anim-tab-enter pt-4 cv-auto">
                  <NewsSection />
                </div>
              )}

              {/* Pestaña RANKING (Independiente) */}
              {activeTab === 'ranking' && (
                <div className="anim-tab-enter pt-4 cv-auto">
                  <RankingSection />
                </div>
              )}

              {/* Pestaña EVENTOS Y CARTELERA (Inspirada en Caturem) */}
              {activeTab === 'events' && (
                <div className="anim-tab-enter pt-4 cv-auto">
                  <EventsSection />
                </div>
              )}

              {/* Pestaña SERVICIO PÚBLICO & AYUDAS (Comunitaria) */}
              {activeTab === 'public_service' && (
                <div className="anim-tab-enter pt-4 cv-auto">
                  <PublicServiceSection />
                </div>
              )}

              {/* Pestaña ALIADOS COMERCIALES (Directorio Inspirado en Caturem) */}
              {activeTab === 'sponsors' && (
                <div className="anim-tab-enter pt-4 cv-auto">
                  <SponsorsDirectorySection />
                </div>
              )}

              {/* Pestaña PROGRAMACIÓN (Independiente) */}
              {activeTab === 'schedule' && (
                <div className="anim-tab-enter pt-4 cv-auto">
                  <ScheduleSection />
                </div>
              )}

              {/* Pestaña NUESTROS TALENTOS (Locutores & Staff) */}
              {activeTab === 'talents' && (
                <div className="anim-tab-enter pt-4 cv-auto">
                  <TalentsSection />
                </div>
              )}

              {/* Pestaña PODCASTS (Independiente) */}
              {activeTab === 'podcasts' && (
                <div className="anim-tab-enter pt-4 cv-auto">
                  <PodcastsSection />
                </div>
              )}

              {/* Pestaña CONTACTO (Independiente con Comunidad WhatsApp) */}
              {activeTab === 'contact' && (
                <div className="anim-tab-enter pt-4 space-y-6 cv-auto">
                  <WhatsAppCommunitySection />
                  <ContactSection />
                </div>
              )}
            </Suspense>

          </main>

          {/* Modal Historial de Canciones ("Ya Sonó") con Carga Bajo Demanda */}
          {historyModalOpen && (
            <Suspense fallback={null}>
              <SongHistoryModal 
                isOpen={historyModalOpen} 
                onClose={() => setHistoryModalOpen(false)} 
              />
            </Suspense>
          )}

          {/* Banner Sutil de Privacidad con Aceptación Directa (3 Segundos) */}
          <PrivacyConsentModal />

          {/* Ventana Emergente Universal de Instalación (Android, iOS, Smart TV, PC) */}
          <UniversalInstallModal />

          {/* Reproductor Unificado estilo Apple / Mix Radio al ras del pie de página */}
          <MixStylePlayer onOpenHistory={() => setHistoryModalOpen(true)} />

          {/* Pie de página Limpio con Enlaces, Redes Sociales y Acceso Administrativo Seguro */}
          <Footer setActiveTab={setActiveTab} onOpenAdmin={() => setAdminOpen(true)} />

        </div>
      </div>
    </ThemeProvider>
  );
}
