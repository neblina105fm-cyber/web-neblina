const fs = require('fs');

console.log('--- INTEGRANDO AdminAiRepostTab Y EDICIÓN DE CATEGORÍAS EN AdminModal ---');

const file = 'src/components/admin/AdminModal.jsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Importar AdminAiRepostTab con lazy
c = c.replace(
  "const AdminJournalistsTab = lazy(() => import('./AdminJournalistsTab'));",
  "const AdminJournalistsTab = lazy(() => import('./AdminJournalistsTab'));\nconst AdminAiRepostTab = lazy(() => import('./AdminAiRepostTab'));"
);

// 2. Importar updateCategory
c = c.replace(
  "addCategory, \n  deleteCategory,",
  "addCategory, \n  updateCategory, \n  deleteCategory,"
);

// 3. Importar Sparkles si no está
if (!c.includes('Sparkles,')) {
  c = c.replace('Tag,', 'Tag,\n  Sparkles,');
}

// 4. Agregar estado para edición de categoría
const categoryEditState = `
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
`;

c = c.replace(
  "const [newCategoryName, setNewCategoryName] = useState('');",
  "const [newCategoryName, setNewCategoryName] = useState('');" + categoryEditState
);

// 5. Agregar handler handleUpdateCategory
const updateCategoryHandler = `
  const handleStartEditCategory = (cat) => {
    setEditingCategoryId(cat.id || cat.name);
    setEditingCategoryName(cat.name);
  };

  const handleSaveEditCategory = (cat) => {
    if (!editingCategoryName.trim()) return;
    const oldName = cat.name;
    const updated = updateCategory(cat.id || oldName, editingCategoryName.trim());
    if (updated) {
      // Actualizar notas que tenían esta categoría
      const all = getAllNews().map(item => {
        if (item.category === oldName) {
          return { ...item, category: updated.name };
        }
        return item;
      });
      saveAllNews(all);
      setNewsList(all);
      setCategoriesList(getAllCategories());
      setEditingCategoryId(null);
      setEditingCategoryName('');
      triggerToast(\`Categoría renombrada a "\${updated.name}" exitosamente\`);
    }
  };
`;

c = c.replace(
  'const handleAddCategory = (e) => {',
  updateCategoryHandler + '\n  const handleAddCategory = (e) => {'
);

// 6. Actualizar renderizado de cada categoría para permitir editar
const oldCategoryPill = `<div 
                            key={cat.id || cat.name}
                            className="flex items-center space-x-2 pl-3 pr-2 py-1.5 rounded-xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm text-xs font-semibold text-slate-800 dark:text-slate-200"
                          >
                            <span>{cat.name}</span>
                            <span className="text-[11px] px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-bold">
                              {cat.count || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                              title={\`Eliminar categoría "\${cat.name}"\`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>`;

const newCategoryPill = `<div 
                            key={cat.id || cat.name}
                            className="flex items-center space-x-2 pl-3 pr-2 py-1.5 rounded-xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm text-xs font-semibold text-slate-800 dark:text-slate-200"
                          >
                            {editingCategoryId === (cat.id || cat.name) ? (
                              <div className="flex items-center space-x-1">
                                <input
                                  type="text"
                                  value={editingCategoryName}
                                  onChange={(e) => setEditingCategoryName(e.target.value)}
                                  className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-black/40 border border-purple-500 text-slate-900 dark:text-white"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditCategory(cat)}
                                  className="p-1 text-emerald-500 hover:text-emerald-400 cursor-pointer"
                                  title="Guardar nombre"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCategoryId(null)}
                                  className="p-1 text-slate-400 hover:text-slate-300 cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span>{cat.name}</span>
                                <span className="text-[11px] px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-bold">
                                  {cat.count || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditCategory(cat)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition cursor-pointer"
                                  title={\`Renombrar categoría "\${cat.name}"\`}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                                  title={\`Eliminar categoría "\${cat.name}"\`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>`;

c = c.replace(oldCategoryPill, newCategoryPill);

// 7. Agregar el nuevo módulo en adminModules
c = c.replace(
  "{ id: 'news', label: 'Noticias & Sala de Prensa', emoji: 'newspaper', icon: Newspaper, count: newsList.filter(n => !n.trashed).length },",
  "{ id: 'ai_repost', label: 'Reposteo de Prensa con IA', emoji: 'sparkles', icon: Sparkles, statusPill: 'Nuevo' },\n    { id: 'news', label: 'Noticias & Sala de Prensa', emoji: 'newspaper', icon: Newspaper, count: newsList.filter(n => !n.trashed).length },"
);

// 8. Renderizar el componente AdminAiRepostTab cuando activeTab === 'ai_repost'
const repostTabRender = `
              {/* ============================================================== */}
              {/* TAB REPOSTEO DE NOTAS DE PRENSA CON IA                         */}
              {/* ============================================================== */}
              {activeTab === 'ai_repost' && (
                <AdminAiRepostTab 
                  onShowToast={triggerToast}
                  onNewsPublished={() => {
                    setNewsList(getAllNews());
                    setCategoriesList(getAllCategories());
                  }}
                />
              )}
`;

c = c.replace(
  "{activeTab === 'news' && (",
  repostTabRender + "\n              {activeTab === 'news' && ("
);

fs.writeFileSync(file, c, 'utf8');
console.log('✓ AdminModal actualizado con pestaña de Reposteo IA y edición de categorías.');
