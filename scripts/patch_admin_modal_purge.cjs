const fs = require('fs');

console.log('--- AGREGANDO BOTÓN DE LIMPIEZA TOTAL EN ADMIN MODAL ---');

const file = 'src/components/admin/AdminModal.jsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Importar los saveAll faltantes
c = c.replace(
  "resetDefaultNewsComments\n} from '../../services/newsCommentsService';",
  "resetDefaultNewsComments,\n  saveAllNewsComments\n} from '../../services/newsCommentsService';"
);

c = c.replace(
  "import { \n  getAllEvents,",
  "import { saveAllClients } from '../../services/radioClientsService';\nimport { saveAllInvoices, saveAllClientUsers, saveAllClientAssets, saveAllRequests, saveAllInternalMessages, saveAllClientNotifications } from '../../services/clientPortalService';\nimport { saveAllStaffUsers, saveAllStaffTasks, saveAllStaffInterviews, saveAllStaffNotes, saveAllStaffMessages } from '../../services/staffPortalService';\nimport { saveAllUnifiedContacts } from '../../services/unifiedContactsService';\nimport { \n  getAllEvents,"
);

// 2. Agregar función handleTotalSystemPurge
const purgeHandler = `
  // ==========================================
  // LIMPIEZA TOTAL DEL SISTEMA (PURGA DE DATOS FICTICIOS)
  // ==========================================
  const handleTotalSystemPurge = () => {
    const confirmation = window.prompt(
      '⚠️ ATENCIÓN: Esta acción eliminará permanentemente todos los clientes ficticios, facturas, comentarios de prueba, denuncias de prueba, locutores y contactos de prueba, dejando el sistema en blanco y limpio para producción.\\n\\nPara confirmar, escribe exactamente: LIMPIAR'
    );

    if (confirmation === 'LIMPIAR') {
      // 1. Clientes comerciales y facturación
      saveAllClients([]);
      saveAllInvoices([]);
      saveAllClientUsers([]);
      saveAllClientAssets([]);
      saveAllRequests([]);
      saveAllInternalMessages([]);
      saveAllClientNotifications([]);

      // 2. Comentarios de noticias
      saveAllNewsComments([]);
      setCommentsList([]);

      // 3. Denuncias y Directorio de ciudadanos
      saveAllReports([]);
      setReportsList([]);
      saveAllCitizens([]);
      setCitizensList([]);
      saveAllUnifiedContacts([]);

      // 4. Locutores y Staff
      saveAllTalents([]);
      setTalentsList([]);
      saveAllStaffUsers([]);
      saveAllStaffTasks([]);
      saveAllStaffInterviews([]);
      saveAllStaffNotes([]);
      saveAllStaffMessages([]);

      reloadAllData();
      triggerToast('¡Limpieza total completada! Sistema 100% limpio y listo para operar.');
    }
  };
`;

c = c.replace(
  'const handleExportFullStationBackup = () => {',
  purgeHandler + '\n  const handleExportFullStationBackup = () => {'
);

// 3. Agregar tarjeta en la vista de herramientas (activeTab === 'tools')
const purgeCard = `
                  {/* LIMPIEZA TOTAL Y PUESTA A CERO DEL SISTEMA */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <Trash2 className="w-5 h-5 text-rose-500" />
                      <h4 className="font-display font-black text-base text-rose-600 dark:text-rose-400">
                        Limpieza Total del Sistema (Puesta a Cero para Producción)
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Elimina de forma irreversible todos los <strong>clientes ficticios</strong>, <strong>facturas</strong>, <strong>comentarios de prueba</strong>, <strong>denuncias ciudadanas de prueba</strong>, <strong>locutores de prueba</strong> y <strong>contactos</strong>, dejando los módulos limpios para el inicio oficial de operaciones. Las noticias reales de WordPress y las credenciales de administración se conservan intactas.
                    </p>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleTotalSystemPurge}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition shadow cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Ejecutar Limpieza Total del Sistema</span>
                      </button>
                    </div>
                  </div>
`;

c = c.replace(
  '{/* CENTRO DE RESPALDO Y RESTAURACIÓN INTEGRAL */}',
  purgeCard + '\n                  {/* CENTRO DE RESPALDO Y RESTAURACIÓN INTEGRAL */}'
);

fs.writeFileSync(file, c, 'utf8');
console.log('✓ AdminModal actualizado con limpieza total del sistema.');
