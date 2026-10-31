const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleSection.jsx', 'utf8');

const duplicateSnippet = `        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedShow(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-white dark:bg-[#001438] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >`;

if (content.includes(duplicateSnippet)) {
  content = content.replace(duplicateSnippet, '');
  fs.writeFileSync('src/components/ScheduleSection.jsx', content, 'utf8');
  console.log('Duplicate modal div successfully removed!');
} else {
  console.error('duplicateSnippet not found');
}
