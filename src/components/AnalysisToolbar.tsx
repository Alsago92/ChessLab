import React, { useState } from 'react';

interface AnalysisToolbarProps {
  onOpenLoadModal: () => void;
  isEngineActive: boolean;
  onToggleEngine: () => void;
  evalScore: number;
  isEngineThinking: boolean;
  onFlipBoard: () => void;
  onResetBoard: () => void;
  onClearBoard: () => void;
  currentFen: string;
  currentPgn: string;
  language: string;
  isDarkMode: boolean;
}

export const AnalysisToolbar: React.FC<AnalysisToolbarProps> = ({
  onOpenLoadModal,
  isEngineActive,
  onToggleEngine,
  evalScore,
  isEngineThinking,
  onFlipBoard,
  onResetBoard,
  onClearBoard,
  currentFen,
  currentPgn,
  language,
  isDarkMode,
}) => {
  const [copiedType, setCopiedType] = useState<'fen' | 'pgn' | null>(null);

  const isEs = language === 'es';

  const handleCopy = (text: string, type: 'fen' | 'pgn') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div
      id="analysis-board-toolbar"
      className={`w-full p-3.5 rounded-2xl border shadow-lg flex flex-wrap items-center justify-between gap-3 transition-colors ${
        isDarkMode
          ? 'bg-neutral-900/90 border-neutral-800 text-neutral-100'
          : 'bg-white/90 border-neutral-200 text-neutral-900'
      }`}
    >
      {/* Left: Mode Title & Load Modal Trigger */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner shrink-0">
          <span className="material-symbols-outlined text-xl">psychology</span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold tracking-tight uppercase">
              {isEs ? 'Tablero de Análisis' : 'Analysis Board'}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-600/20 text-purple-400 border border-purple-500/30">
              {isEs ? 'Modo Libre' : 'Sandbox Mode'}
            </span>
          </div>
          <p className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {isEs
              ? 'Analiza jugadas, prueba variantes y evalúa posiciones libremente'
              : 'Analyze moves, test variations and evaluate positions freely'}
          </p>
        </div>
      </div>

      {/* Middle: Engine Toggle & Eval Score Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-colors ${
            isEngineActive
              ? isDarkMode
                ? 'bg-blue-950/40 border-blue-800/60 text-blue-300'
                : 'bg-blue-50 border-blue-200 text-blue-800'
              : isDarkMode
              ? 'bg-neutral-950 border-neutral-800 text-neutral-500'
              : 'bg-neutral-100 border-neutral-300 text-neutral-500'
          }`}
        >
          <button
            id="analysis-engine-toggle-btn"
            onClick={onToggleEngine}
            className="flex items-center gap-2 cursor-pointer select-none"
            title={isEs ? 'Activar/Desactivar Evaluación Stockfish' : 'Toggle Stockfish Engine Evaluation'}
          >
            <div
              className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                isEngineActive ? 'bg-blue-600' : 'bg-neutral-600'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white transition-transform ${
                  isEngineActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-xs font-bold font-mono">Stockfish</span>
          </button>

          {isEngineActive && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-700/50 font-mono text-xs font-bold">
              {isEngineThinking ? (
                <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className={evalScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {evalScore > 0 ? `+${evalScore.toFixed(1)}` : evalScore.toFixed(1)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Load Position/Game button */}
        <button
          id="analysis-load-position-btn"
          onClick={onOpenLoadModal}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-base">upload_file</span>
          <span>{isEs ? 'Cargar FEN / PGN' : 'Load FEN / PGN'}</span>
        </button>
      </div>

      {/* Right: Board Utilities (Flip, Reset, Clear, Copy) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          id="analysis-flip-board-btn"
          onClick={onFlipBoard}
          className={`p-2 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
            isDarkMode
              ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300'
              : 'bg-neutral-100 border-neutral-300 hover:bg-neutral-200 text-neutral-700'
          }`}
          title={isEs ? 'Girar Tablero' : 'Flip Board'}
        >
          <span className="material-symbols-outlined text-sm">published_with_changes</span>
        </button>

        <button
          id="analysis-reset-board-btn"
          onClick={onResetBoard}
          className={`p-2 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
            isDarkMode
              ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300'
              : 'bg-neutral-100 border-neutral-300 hover:bg-neutral-200 text-neutral-700'
          }`}
          title={isEs ? 'Reiniciar Posición Inicial' : 'Reset Starting Position'}
        >
          <span className="material-symbols-outlined text-sm">restart_alt</span>
        </button>

        <button
          id="analysis-clear-board-btn"
          onClick={onClearBoard}
          className={`p-2 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
            isDarkMode
              ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300'
              : 'bg-neutral-100 border-neutral-300 hover:bg-neutral-200 text-neutral-700'
          }`}
          title={isEs ? 'Limpiar Tablero' : 'Clear Board'}
        >
          <span className="material-symbols-outlined text-sm">delete_sweep</span>
        </button>

        <button
          id="analysis-copy-fen-btn"
          onClick={() => handleCopy(currentFen, 'fen')}
          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-semibold transition cursor-pointer flex items-center gap-1 ${
            copiedType === 'fen'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : isDarkMode
              ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300'
              : 'bg-neutral-100 border-neutral-300 hover:bg-neutral-200 text-neutral-700'
          }`}
          title={isEs ? 'Copiar FEN al portapapeles' : 'Copy FEN to clipboard'}
        >
          <span className="material-symbols-outlined text-xs">content_copy</span>
          <span>{copiedType === 'fen' ? (isEs ? '¡Copiado!' : 'Copied!') : 'FEN'}</span>
        </button>
      </div>
    </div>
  );
};
