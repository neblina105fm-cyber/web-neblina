const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminBannersTab.jsx', 'utf8');

// Replace from line 421 up to line 549 with conditional rendering:
const targetGridStart = '{/* Pestañas de la guía: Especificaciones vs Zona Segura */}';
const targetGridEnd = '        </div>\n      </div>\n\n      {/* ============================================================== */}';
const targetGridAltEnd = '        </div>\r\n      </div>\r\n\r\n      {/* ============================================================== */}';

const gStart = code.indexOf(targetGridStart);
let gEnd = code.indexOf(targetGridEnd);
if (gEnd === -1) gEnd = code.indexOf(targetGridAltEnd);

if (gStart !== -1 && gEnd !== -1) {
  const innerSpecs = code.substring(gStart, gEnd + '        </div>'.length);
  const conditionalSpecs = `{isSpecsExpanded && (
        <div className="space-y-4 pt-2 border-t border-slate-200/80 dark:border-white/10 animate-fadeIn">
          ${innerSpecs}
        </div>
      )}
      </div>

      {/* ============================================================== */}`;
  
  code = code.substring(0, gStart) + conditionalSpecs + code.substring(gEnd + targetGridEnd.length);
  console.log('Successfully made specifications collapsible');
  fs.writeFileSync('src/components/admin/AdminBannersTab.jsx', code, 'utf8');
} else {
  console.log('Could not match gStart or gEnd:', gStart, gEnd);
}
