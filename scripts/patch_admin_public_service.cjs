const fs = require('fs');

let content = fs.readFileSync('src/components/admin/AdminModal.jsx', 'utf8');

// 1. Add lazy import for AdminPublicServiceTab and getAllPublicServices
if (!content.includes('AdminPublicServiceTab')) {
  content = content.replace(
    "const AdminAiRepostTab = lazy(() => import('./AdminAiRepostTab'));",
    "const AdminAiRepostTab = lazy(() => import('./AdminAiRepostTab'));\nconst AdminPublicServiceTab = lazy(() => import('./AdminPublicServiceTab'));"
  );
  content = content.replace(
    "import { getAllClients } from '../../services/radioClientsService';",
    "import { getAllPublicServices } from '../../services/publicServiceData';\nimport { getAllClients } from '../../services/radioClientsService';"
  );
}

// 2. Add HeartHandshake import
if (!content.includes('HeartHandshake,')) {
  content = content.replace('Handshake,', 'Handshake,\n  HeartHandshake,');
}

// 3. Add publicServicesCount & register in adminModules
if (!content.includes("id: 'public_service'")) {
  content = content.replace(
    "const journalistsCount = getAllJournalists().length;",
    "const journalistsCount = getAllJournalists().length;\n  const publicServicesCount = getAllPublicServices().filter(it => it.status !== 'trashed').length;"
  );
  
  content = content.replace(
    "{ id: 'sponsors', label: 'Aliados Comerciales', emoji: 'store', icon: Store, count: sponsorsList.filter(s => !s.trashed).length },",
    "{ id: 'sponsors', label: 'Aliados Comerciales', emoji: 'store', icon: Store, count: sponsorsList.filter(s => !s.trashed).length },\n    { id: 'public_service', label: 'Servicio Público & Ayudas', emoji: 'hands_folded', icon: HeartHandshake, count: publicServicesCount },"
  );
}

// 4. Render tab component
if (!content.includes("activeTab === 'public_service'")) {
  const target = "{activeTab === 'sponsors' && (";
  const replacement = `{\/* ============================================================== *\/}
              {\/* TAB SERVICIO PÚBLICO & AYUDAS                                 *\/}
              {\/* ============================================================== *\/}
              {activeTab === 'public_service' && (
                <AdminPublicServiceTab onShowToast={triggerToast} />
              )}

              {activeTab === 'sponsors' && (`;
  content = content.replace(target, replacement);
}

fs.writeFileSync('src/components/admin/AdminModal.jsx', content, 'utf8');
console.log('AdminModal updated successfully!');
