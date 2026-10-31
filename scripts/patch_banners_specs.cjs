const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminBannersTab.jsx', 'utf8');

// 1. Add state isSpecsExpanded (collapsed by default or toggleable)
const oldStateAnchor = "const [copiedSpecs, setCopiedSpecs] = useState(false);";
const newStateAnchor = "const [copiedSpecs, setCopiedSpecs] = useState(false);\n  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);";

if (code.includes(oldStateAnchor) && !code.includes('isSpecsExpanded')) {
  code = code.replace(oldStateAnchor, newStateAnchor);
  console.log('1. Added isSpecsExpanded state in AdminBannersTab');
}

// 2. Add collapse / expand toggle button and conditional rendering to the specifications grid
const headerButtonAreaOld = `<div className="flex items-center space-x-2">
            <button
              onClick={handleCopySpecs}`;

const headerButtonAreaNew = `<div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
            >
              <span>{isSpecsExpanded ? '▲ Ocultar Medidas' : '▼ Ver Medidas Exactas'}</span>
            </button>
            <button
              onClick={handleCopySpecs}`;

if (code.includes(headerButtonAreaOld)) {
  code = code.replace(headerButtonAreaOld, headerButtonAreaNew);
  console.log('2. Added toggle button in specs header');
}

// Wrap the specs grid inside {isSpecsExpanded && ( ... )}
const specsGridStart = '{/* Pestañas de la guía: Especificaciones vs Zona Segura */}';
const specsGridEnd = '{/* Barra de Filtros y Búsqueda */}';

const sStart = code.indexOf(specsGridStart);
const sEnd = code.indexOf(specsGridEnd);

if (sStart !== -1 && sEnd !== -1) {
  const innerContent = code.substring(sStart, sEnd);
  const wrappedContent = `{isSpecsExpanded && (
        <div className="space-y-4 pt-2 border-t border-slate-200/80 dark:border-white/10 animate-fadeIn">
          ${innerContent}
        </div>
      )}

      `;
  code = code.substring(0, sStart) + wrappedContent + code.substring(sEnd);
  console.log('3. Wrapped specs grid with isSpecsExpanded toggle condition');
}

fs.writeFileSync('src/components/admin/AdminBannersTab.jsx', code, 'utf8');
console.log('AdminBannersTab.jsx updated successfully!');
