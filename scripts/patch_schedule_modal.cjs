const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleSection.jsx', 'utf8');

// Asegurar import de createPortal si no está
if (!content.includes('createPortal')) {
  content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';");
}

// Bloque de modal
const modalStart = `{selectedShow && (`;
const modalEnd = `      )}
    </section>`;

const modalReplacement = `{selectedShow && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 dark:bg-black/60 backdrop-blur-xl animate-fadeIn select-none"
          onClick={() => setSelectedShow(null)}
        >
          <div 
            className="relative w-full max-w-xl max-h-[88vh] bg-white/95 dark:bg-[#001438]/95 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl overflow-hidden animate-scaleUp flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >`;

content = content.replace(modalStart, modalReplacement);

// Reemplazar el cierre del modal para cerrar createPortal
content = content.replace(
  `          </div>
        </div>
      )}
    </section>`,
  `          </div>
        </div>,
        document.body
      )}
    </section>`
);

fs.writeFileSync('src/components/ScheduleSection.jsx', content, 'utf8');
console.log('ScheduleSection modal updated with createPortal and aeroglass centering!');
