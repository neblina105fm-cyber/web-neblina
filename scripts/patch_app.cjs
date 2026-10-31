const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add ErrorBoundary import and PublicServiceSection lazy import
if (!content.includes('ErrorBoundary')) {
  content = content.replace(
    "import React, { useState, useEffect, Suspense, lazy } from 'react';",
    "import React, { useState, useEffect, Suspense, lazy } from 'react';\nimport ErrorBoundary from './components/ErrorBoundary';"
  );
}

if (!content.includes('PublicServiceSection')) {
  content = content.replace(
    "const SponsorsDirectorySection = lazy(() => import('./components/SponsorsDirectorySection'));",
    "const SponsorsDirectorySection = lazy(() => import('./components/SponsorsDirectorySection'));\nconst PublicServiceSection = lazy(() => import('./components/PublicServiceSection'));"
  );
}

// 2. Wrap adminOpen view in ErrorBoundary
if (!content.includes('<ErrorBoundary fallbackTitle="Ha ocurrido un inconveniente al cargar el Sistema Administrativo">')) {
  content = content.replace(
    `  if (adminOpen) {
    return (
      <ThemeProvider>
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
      </ThemeProvider>
    );
  }`,
    `  if (adminOpen) {
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
  }`
  );
}

// 3. Wrap clientPortalOpen view in ErrorBoundary
if (!content.includes('<ErrorBoundary fallbackTitle="Ha ocurrido un inconveniente al cargar el Portal de Clientes y Aliados">')) {
  content = content.replace(
    `  if (clientPortalOpen) {
    return (
      <ThemeProvider>
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
      </ThemeProvider>
    );
  }`,
    `  if (clientPortalOpen) {
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
  }`
  );
}

// 4. Wrap staffPortalOpen and journalistPortalOpen as well
content = content.replace(
  `  if (staffPortalOpen) {
    return (
      <ThemeProvider>
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
      </ThemeProvider>
    );
  }`,
  `  if (staffPortalOpen) {
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
  }`
);

content = content.replace(
  `  if (journalistPortalOpen) {
    return (
      <ThemeProvider>
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
      </ThemeProvider>
    );
  }`,
  `  if (journalistPortalOpen) {
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
  }`
);

// 5. Add public_service tab view in main content
if (!content.includes("activeTab === 'public_service'")) {
  const targetTab = `{/* Pestaña ALIADOS COMERCIALES (Directorio Inspirado en Caturem) */}
              {activeTab === 'sponsors' && (
                <div className="anim-tab-enter pt-4 cv-auto">
                  <SponsorsDirectorySection />
                </div>
              )}`;

  const replacementTab = `{/* Pestaña SERVICIO PÚBLICO & AYUDAS (Comunitaria) */}
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
              )}`;

  content = content.replace(targetTab, replacementTab);
}

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('App.jsx updated with ErrorBoundary and PublicServiceSection successfully!');
