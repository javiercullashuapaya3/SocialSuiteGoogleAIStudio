import React from 'react';
import { SyncLogEntry, SyncResult } from '../types';
import { X, Terminal, CheckCircle2, AlertTriangle, AlertCircle, Info, Trash2 } from 'lucide-react';

interface SyncLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SyncLogEntry[];
  lastResult: SyncResult | null;
  onClearLogs: () => void;
}

export const SyncLogsModal: React.FC<SyncLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  lastResult,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  const getLogIcon = (level: SyncLogEntry['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
      case 'warn':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0B0F19] w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-800 text-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#1E293B]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#21B6EA]/15 border border-[#21B6EA]/30 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[#21B6EA]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">Registro de Actividad</h3>
              <span className="text-xs text-slate-400">Actualizaciones en tiempo real</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearLogs}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Limpiar registro"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Summary Card if available */}
        {lastResult && (
          <div className="p-4 bg-[#1E293B]/45 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Posts analizados</span>
              <span className="text-lg font-extrabold text-white font-mono tabular-nums">{lastResult.posts_count}</span>
              <div className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
                +{lastResult.posts_created} nuev. / {lastResult.posts_updated} act.
              </div>
            </div>

            <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Comentarios</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono tabular-nums">{lastResult.comments_count}</span>
              <div className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
                +{lastResult.comments_created} nuevos / {lastResult.comments_updated} act.
              </div>
            </div>

            <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Modo de sync</span>
              <span className="text-lg font-extrabold text-[#21B6EA]">Inteligente</span>
              <div className="text-[10px] text-slate-400 mt-0.5">Solo cambios recientes</div>
            </div>

            <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Estado</span>
              <span className="text-lg font-extrabold text-emerald-400">Completado</span>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">Sincronización al día</div>
            </div>
          </div>
        )}

        {/* Terminal logs list */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 font-mono text-xs max-h-[55vh] bg-[#0B0F19]">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="font-sans font-semibold text-slate-300">No hay registros de sincronización aún.</p>
              <p className="text-[11px] text-slate-500 mt-1 font-sans">
                Haz clic en &ldquo;Sincronizar Meta con IA&rdquo; en la barra superior para actualizar las publicaciones.
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2.5 py-1.5 px-2.5 rounded-lg hover:bg-[#1E293B]/60 transition-colors"
              >
                {getLogIcon(log.level)}
                <span className="text-[10px] text-slate-500 shrink-0 mt-0.5 tabular-nums">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`leading-relaxed break-all ${
                    log.level === 'error'
                      ? 'text-rose-400 font-medium'
                      : log.level === 'success'
                      ? 'text-emerald-300'
                      : log.level === 'warn'
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#1E293B]/60 text-slate-400 text-xs flex items-center justify-between">
          <span>Sincronización optimizada e inteligente</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#1E293B] hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
