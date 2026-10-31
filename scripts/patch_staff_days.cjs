const fs = require('fs');

let content = fs.readFileSync('src/components/staff/StaffPortalModal.jsx', 'utf8');

// 1. Replace header
content = content.replace(
  '<span>Programación Diaria Asignada por el Sistema Administrativo</span>',
  '<span>Programación Diaria Asignada: {currentStaff.programName || \'Mi Programa\'}</span>'
);

// 2. Replace lines 2237-2239 with day mapping helper
const targetDaysLogic = `            {activeTab === 'notas' && (() => {
              const staffAssignedDays = Array.isArray(currentStaff.assignedDays) && currentStaff.assignedDays.length > 0
                ? currentStaff.assignedDays
                : ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];`;

const replacementDaysLogic = `            {activeTab === 'notas' && (() => {
              const ALL_DAYS_WEEK = [
                { id: 1, name: 'Lunes', short: 'Lun' },
                { id: 2, name: 'Martes', short: 'Mar' },
                { id: 3, name: 'Miércoles', short: 'Mié' },
                { id: 4, name: 'Jueves', short: 'Jue' },
                { id: 5, name: 'Viernes', short: 'Vie' },
                { id: 6, name: 'Sábado', short: 'Sáb' },
                { id: 7, name: 'Domingo', short: 'Dom' }
              ];

              const rawDays = Array.isArray(currentStaff.assignedDays) ? currentStaff.assignedDays : [1, 2, 3, 4, 5];
              const staffAssignedDayNames = rawDays.map(d => {
                if (typeof d === 'number') {
                  const found = ALL_DAYS_WEEK.find(item => item.id === d);
                  return found ? found.name : String(d);
                }
                return String(d);
              });
              const staffAssignedDayIds = rawDays.map(d => {
                if (typeof d === 'number') return d;
                const found = ALL_DAYS_WEEK.find(item => item.name.toLowerCase() === String(d).toLowerCase() || item.short.toLowerCase() === String(d).toLowerCase());
                return found ? found.id : null;
              }).filter(Boolean);

              const staffAssignedDays = staffAssignedDayNames;`;

content = content.replace(targetDaysLogic, replacementDaysLogic);

// 3. Replace the day buttons selector
const targetButtons = `{staffAssignedDays.map(day => {
                        const countForDay = notes.filter(n => !n.trashed && n.dayOfWeek === day).length;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setSelectedProgramDay(day)}
                            className={\`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border flex items-center space-x-1.5 \${
                              selectedProgramDay === day
                                ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] border-[#00DD9E] shadow-xs'
                                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100'
                            }\`}
                          >
                            <span>{day}</span>
                            <span className="px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/15 text-[11px]">{countForDay}</span>
                          </button>
                        );
                      })}`;

const replacementButtons = `{ALL_DAYS_WEEK.map(dayObj => {
                        const isAssigned = staffAssignedDayNames.includes(dayObj.name) || staffAssignedDayIds.includes(dayObj.id);
                        const countForDay = notes.filter(n => {
                          if (n.trashed) return false;
                          if (typeof n.dayOfWeek === 'number') return n.dayOfWeek === dayObj.id;
                          return String(n.dayOfWeek).toLowerCase() === dayObj.name.toLowerCase() || String(n.dayOfWeek).toLowerCase() === dayObj.short.toLowerCase();
                        }).length;

                        return (
                          <button
                            key={dayObj.id}
                            type="button"
                            onClick={() => setSelectedProgramDay(dayObj.name)}
                            title={isAssigned ? \`Día asignado a \${currentStaff.programName}\` : 'Día sin transmisión programada'}
                            className={\`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border flex items-center space-x-1.5 \${
                              selectedProgramDay === dayObj.name
                                ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] border-[#00DD9E] shadow-md ring-2 ring-[#00DD9E]/40'
                                : isAssigned
                                ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-[#00DD9E] border-emerald-500/40 hover:bg-emerald-500/25'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/5 hover:bg-slate-200/60'
                            }\`}
                          >
                            <span>{dayObj.name}</span>
                            {countForDay > 0 && (
                              <span className="px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/15 text-[11px] font-mono">{countForDay}</span>
                            )}
                            {isAssigned && selectedProgramDay !== dayObj.name && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            )}
                          </button>
                        );
                      })}`;

content = content.replace(targetButtons, replacementButtons);

// 4. Also update the note filtering to handle day id (number) or name (string)
const targetFilter = `if (selectedProgramDay !== 'Todos' && n.dayOfWeek !== selectedProgramDay) return false;`;
const replacementFilter = `if (selectedProgramDay !== 'Todos') {
                  const selectedObj = ALL_DAYS_WEEK.find(d => d.name === selectedProgramDay);
                  const isMatching = typeof n.dayOfWeek === 'number'
                    ? (selectedObj && n.dayOfWeek === selectedObj.id)
                    : (String(n.dayOfWeek).toLowerCase() === selectedProgramDay.toLowerCase());
                  if (!isMatching) return false;
                }`;

content = content.replace(targetFilter, replacementFilter);

fs.writeFileSync('src/components/staff/StaffPortalModal.jsx', content, 'utf8');
console.log('StaffPortalModal updated successfully!');
