import React, { useState } from 'react';
import { VERSION_HISTORY, CURRENT_VERSION, VersionInfo } from '../data/versionHistory';

interface VersionControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  isDarkMode: boolean;
}

export const VersionControlModal: React.FC<VersionControlModalProps> = ({
  isOpen,
  onClose,
  language,
  isDarkMode,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string>(CURRENT_VERSION);

  if (!isOpen) return null;

  const isEs = language === 'es';
  const activeVersionData = VERSION_HISTORY.find((v) => v.version === selectedVersion) || VERSION_HISTORY[0];

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'feature':
        return {
          bg: isDarkMode ? 'bg-blue-950/60 text-blue-400 border-blue-800/60' : 'bg-blue-50 text-blue-700 border-blue-200',
          label: isEs ? 'Novedad' : 'Feature',
        };
      case 'improvement':
        return {
          bg: isDarkMode ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: isEs ? 'Mejora' : 'Improvement',
        };
      case 'ui':
        return {
          bg: isDarkMode ? 'bg-purple-950/60 text-purple-400 border-purple-800/60' : 'bg-purple-50 text-purple-700 border-purple-200',
          label: isEs ? 'Interfaz' : 'UI & Branding',
        };
      case 'fix':
        return {
          bg: isDarkMode ? 'bg-amber-950/60 text-amber-400 border-amber-800/60' : 'bg-amber-50 text-amber-700 border-amber-200',
          label: isEs ? 'Corrección' : 'Fix',
        };
      default:
        return {
          bg: isDarkMode ? 'bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-neutral-100 text-neutral-700 border-neutral-300',
          label: category,
        };
    }
  };

  return (
    <div
      id="version-control-modal-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        id="version-control-modal-card"
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all transform scale-100 ${
          isDarkMode
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-inner">
              <span className="material-symbols-outlined text-2xl">history</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  {isEs ? 'Control de Versiones y Cambios' : 'Version Control & Changelog'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-600 text-white shadow-sm">
                  v{CURRENT_VERSION}
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {isEs
                  ? 'Historial de actualizaciones desplegadas en ChessLab (Últimas 3 versiones)'
                  : 'Deployed version log and changelog for ChessLab (Last 3 versions)'}
              </p>
            </div>
          </div>

          <button
            id="version-modal-close-btn"
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDarkMode
                ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
                : 'hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900'
            }`}
            title={isEs ? 'Cerrar' : 'Close'}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Version Selector Tabs */}
        <div
          className={`px-6 py-3 border-b flex items-center gap-2 overflow-x-auto ${
            isDarkMode ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-100/60 border-neutral-200'
          }`}
        >
          <span className={`text-xs font-semibold uppercase tracking-wider mr-1 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {isEs ? 'Versiones:' : 'Versions:'}
          </span>
          {VERSION_HISTORY.map((v) => {
            const isSelected = v.version === selectedVersion;
            return (
              <button
                key={v.version}
                onClick={() => setSelectedVersion(v.version)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                    : isDarkMode
                    ? 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60 hover:bg-neutral-700'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <span>v{v.version}</span>
                {v.isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title={isEs ? 'Versión Desplegada Actual' : 'Currently Deployed Version'} />
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Content - Selected Version Logs */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Version Summary Header Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              activeVersionData.isCurrent
                ? isDarkMode
                  ? 'bg-blue-950/30 border-blue-800/50 text-blue-200'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
                : isDarkMode
                ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                : 'bg-neutral-50 border-neutral-200 text-neutral-800'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-mono">
                  ChessLab v{activeVersionData.version}
                </span>
                {activeVersionData.isCurrent && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isEs ? 'Desplegada Actual' : 'Currently Live'}
                  </span>
                )}
              </div>
              <h3 className="text-xs font-medium mt-1 opacity-90">
                {isEs ? activeVersionData.title.es : activeVersionData.title.en}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs opacity-75 font-mono">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              <span>{activeVersionData.date}</span>
            </div>
          </div>

          {/* List of Changes */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {isEs ? 'Cambios e Historial de Mejoras:' : 'Release Notes & Detailed Changes:'}
            </h4>

            <div className="space-y-2.5">
              {activeVersionData.changes.map((change, idx) => {
                const badge = getCategoryBadge(change.category);
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                      isDarkMode
                        ? 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                        : 'bg-neutral-50/80 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${badge.bg}`}
                    >
                      <span className="material-symbols-outlined text-base">{change.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold">
                          {isEs ? change.title.es : change.title.en}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-semibold border shrink-0 ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                        {isEs ? change.description.es : change.description.en}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between ${
            isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className={`text-[11px] font-mono ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            ChessLab Platform &bull; {isEs ? 'Control de Versiones' : 'Version Control'}
          </div>

          <button
            id="version-modal-ok-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white transition cursor-pointer shadow-md shadow-blue-600/20"
          >
            {isEs ? 'Entendido' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
