import React from 'react';
import { Trash2, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

/**
 * SectionTrashToggle
 * Barra de control de Papelera Seccional estilo Apple para módulos administrativos.
 * Permite alternar entre los elementos activos y la papelera temporal, con opción
 * de vaciado masivo permanente.
 */
export default function SectionTrashToggle({
  isTrashView,
  onToggleView,
  activeCount = 0,
  trashCount = 0,
  onEmptyTrash,
  activeLabel = 'Publicados',
  trashLabel = 'Papelera'
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100/80 dark:bg-black/30 border border-slate-200 dark:border-white/10">
      {/* Botones de Selección Activos vs Papelera */}
      <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-white/5 border border-slate-300/60 dark:border-white/5 space-x-1">
        <button
          type="button"
          onClick={() => onToggleView(false)}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            !isTrashView
              ? 'bg-white dark:bg-[#00DD9E] text-slate-900 dark:text-[#001E4D] shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{activeLabel}</span>
          <span className={`text-[11px] px-1.5 py-0.2 rounded-lg font-black ${
            !isTrashView
              ? 'bg-slate-100 dark:bg-[#001E4D]/20 text-slate-800 dark:text-[#001E4D]'
              : 'bg-slate-300 dark:bg-white/10 text-slate-700 dark:text-slate-300'
          }`}>
            {activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onToggleView(true)}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            isTrashView
              ? 'bg-rose-500 text-white shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-rose-500'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{trashLabel}</span>
          <span className={`text-[11px] px-1.5 py-0.2 rounded-lg font-black ${
            isTrashView
              ? 'bg-white/20 text-white'
              : trashCount > 0
              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold'
              : 'bg-slate-300 dark:bg-white/10 text-slate-700 dark:text-slate-300'
          }`}>
            {trashCount}
          </span>
        </button>
      </div>

      {/* Acciones de Papelera cuando está activa */}
      {isTrashView && (
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Los elementos en papelera pueden ser restaurados o eliminados definitivamente.
          </span>
          {trashCount > 0 && onEmptyTrash && (
            <button
              type="button"
              onClick={onEmptyTrash}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white text-xs font-bold border border-rose-500/25 transition cursor-pointer"
              title="Eliminar permanentemente todos los elementos de esta papelera"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar Papelera</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
