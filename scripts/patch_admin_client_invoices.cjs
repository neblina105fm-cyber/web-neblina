const fs = require('fs');

console.log('--- ACTUALIZANDO ADMIN CLIENT PORTAL MANAGER CON ELIMINACIÓN DE FACTURAS ---');

const file = 'src/components/admin/AdminClientPortalManager.jsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Importar deleteInvoice
c = c.replace(
  'markInvoicePaid,',
  'markInvoicePaid,\n  deleteInvoice,'
);

// 2. Importar Trash2 si no está
if (!c.includes('Trash2,')) {
  c = c.replace('Eye,', 'Eye,\n  Trash2,');
}

// 3. Agregar handleDeleteInvoice
const deleteHandler = `
  // Eliminar Factura definitivamente
  const handleDeleteInvoice = (inv) => {
    if (window.confirm(\`¿Eliminar definitivamente la factura \${inv.id} de \${inv.businessName}? Esta acción no se puede deshacer.\`)) {
      deleteInvoice(inv.id);
      refreshAll();
      if (onShowToast) onShowToast(\`Factura \${inv.id} eliminada permanentemente\`);
    }
  };
`;

c = c.replace(
  'const handleMarkInvoicePaid = (inv) => {',
  deleteHandler + '\n  const handleMarkInvoicePaid = (inv) => {'
);

// 4. Agregar botón de eliminar en la tabla
const oldActions = `<button
                            type="button"
                            onClick={() => setViewingReceipt(inv)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white transition cursor-pointer"
                            title="Ver e Imprimir Comprobante"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>`;

const newActions = `<button
                            type="button"
                            onClick={() => setViewingReceipt(inv)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white transition cursor-pointer"
                            title="Ver e Imprimir Comprobante"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteInvoice(inv)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition cursor-pointer"
                            title="Eliminar Factura Permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>`;

c = c.replace(oldActions, newActions);

fs.writeFileSync(file, c, 'utf8');
console.log('✓ AdminClientPortalManager actualizado con botón de eliminar factura.');
