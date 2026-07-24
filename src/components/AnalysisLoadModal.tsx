import React, { useState } from 'react';
import { PRESET_POSITIONS, PresetPosition } from '../data/openingsDatabase';

interface AnalysisLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadFen: (fen: string) => boolean;
  onLoadPgn: (pgn: string) => boolean;
  currentFen: string;
  currentPgn: string;
  language: string;
  isDarkMode: boolean;
}

export const AnalysisLoadModal: React.FC<AnalysisLoadModalProps> = ({
  isOpen,
  onClose,
  onLoadFen,
  onLoadPgn,
  currentFen,
  currentPgn,
  language,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'fen' | 'pgn'>('preset');
  const [fenInput, setFenInput] = useState<string>(currentFen || '');
  const [pgnInput, setPgnInput] = useState<string>(currentPgn || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'fen' | 'pgn' | null>(null);

  if (!isOpen) return null;

  const isEs = language === 'es';

  const handleApplyFen = () => {
    setErrorMessage(null);
    if (!fenInput.trim()) {
      setErrorMessage(isEs ? 'Por favor ingresa una notación FEN válida.' : 'Please enter a valid FEN string.');
      return;
    }
    const success = onLoadFen(fenInput.trim());
    if (success) {
      onClose();
    } else {
      setErrorMessage(isEs ? 'Posición FEN inválida. Verifica la estructura.' : 'Invalid FEN string structure.');
    }
  };

  const handleApplyPgn = () => {
    setErrorMessage(null);
    if (!pgnInput.trim()) {
      setErrorMessage(isEs ? 'Por favor ingresa una partida en formato PGN.' : 'Please enter a PGN game text.');
      return;
    }
    const success = onLoadPgn(pgnInput.trim());
    if (success) {
      onClose();
    } else {
      setErrorMessage(isEs ? 'Registro PGN no válido o sintaxis incorrecta.' : 'Invalid PGN content or syntax error.');
    }
  };

  const handleSelectPreset = (preset: PresetPosition) => {
    setErrorMessage(null);
    const success = onLoadFen(preset.fen);
    if (success) {
      onClose();
    } else {
      setErrorMessage(isEs ? 'Error al cargar la posición preestablecida.' : 'Failed to load preset position.');
    }
  };

  const handleCopyClipboard = (text: string, type: 'fen' | 'pgn') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div
      id="analysis-load-modal-overlay"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        id="analysis-load-modal-card"
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] ${
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
              <span className="material-symbols-outlined text-2xl">psychology</span>
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {isEs ? 'Cargar Posición o Partida' : 'Load Position or Game'}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {isEs
                  ? 'Configura el tablero de análisis importando FEN, PGN o seleccionando ejemplos'
                  : 'Configure analysis board by importing FEN, PGN or selecting preset lines'}
              </p>
            </div>
          </div>

          <button
            id="analysis-modal-close-btn"
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDarkMode
                ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
                : 'hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Tabs */}
        <div
          className={`px-6 py-3 border-b flex items-center gap-2 overflow-x-auto ${
            isDarkMode ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-100/60 border-neutral-200'
          }`}
        >
          <button
            id="analysis-tab-presets"
            onClick={() => { setActiveTab('preset'); setErrorMessage(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition cursor-pointer ${
              activeTab === 'preset'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : isDarkMode
                ? 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <span className="material-symbols-outlined text-sm">grid_view</span>
            <span>{isEs ? 'Librería Preestablecida' : 'Preset Library'}</span>
          </button>

          <button
            id="analysis-tab-fen"
            onClick={() => { setActiveTab('fen'); setErrorMessage(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition cursor-pointer ${
              activeTab === 'fen'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : isDarkMode
                ? 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <span className="material-symbols-outlined text-sm">code</span>
            <span>{isEs ? 'Importar FEN' : 'Import FEN'}</span>
          </button>

          <button
            id="analysis-tab-pgn"
            onClick={() => { setActiveTab('pgn'); setErrorMessage(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition cursor-pointer ${
              activeTab === 'pgn'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : isDarkMode
                ? 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <span className="material-symbols-outlined text-sm">description</span>
            <span>{isEs ? 'Importar PGN' : 'Import PGN'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: PRESETS */}
          {activeTab === 'preset' && (
            <div className="space-y-4">
              <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {isEs
                  ? 'Selecciona una posición destacada de aperturas o finales clásicos para cargar instantáneamente:'
                  : 'Select a highlighted opening or endgame setup to load instantly into the board:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_POSITIONS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition cursor-pointer group ${
                      isDarkMode
                        ? 'bg-neutral-950/60 border-neutral-800/80 hover:border-blue-500/80 hover:bg-blue-950/20'
                        : 'bg-neutral-50 border-neutral-200 hover:border-blue-400 hover:bg-blue-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold group-hover:text-blue-400 transition-colors">
                          {isEs ? preset.title.es : preset.title.en}
                        </span>
                        {preset.eco && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
                            {preset.eco}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] leading-relaxed line-clamp-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {isEs ? preset.desc.es : preset.desc.en}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono opacity-80 pt-1 border-t border-neutral-800/40">
                      <span className="uppercase text-neutral-400">{preset.category}</span>
                      <span className="text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        {isEs ? 'Cargar' : 'Load'} &rarr;
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FEN */}
          {activeTab === 'fen' && (
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  {isEs ? 'Notación FEN (Forsyth-Edwards Notation):' : 'FEN Notation (Forsyth-Edwards Notation):'}
                </span>
                <input
                  type="text"
                  value={fenInput}
                  onChange={(e) => setFenInput(e.target.value)}
                  placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                  className={`w-full px-4 py-2.5 rounded-xl font-mono text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    isDarkMode
                      ? 'bg-neutral-950 border-neutral-800 text-neutral-100 placeholder-neutral-600'
                      : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'
                  }`}
                />
              </label>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleCopyClipboard(currentFen, 'fen')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                    isDarkMode
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  <span>
                    {copiedType === 'fen'
                      ? (isEs ? '¡Copiado FEN!' : 'FEN Copied!')
                      : (isEs ? 'Copiar FEN Actual' : 'Copy Current FEN')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyFen}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer shadow-md shadow-blue-600/20"
                >
                  {isEs ? 'Aplicar Posición FEN' : 'Apply FEN Position'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PGN */}
          {activeTab === 'pgn' && (
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  {isEs ? 'Texto o Notación de la Partida PGN:' : 'PGN Game Text or Notation:'}
                </span>
                <textarea
                  rows={6}
                  value={pgnInput}
                  onChange={(e) => setPgnInput(e.target.value)}
                  placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7..."
                  className={`w-full p-4 rounded-xl font-mono text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    isDarkMode
                      ? 'bg-neutral-950 border-neutral-800 text-neutral-100 placeholder-neutral-600'
                      : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'
                  }`}
                />
              </label>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleCopyClipboard(currentPgn, 'pgn')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                    isDarkMode
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  <span>
                    {copiedType === 'pgn'
                      ? (isEs ? '¡Copiado PGN!' : 'PGN Copied!')
                      : (isEs ? 'Copiar PGN Actual' : 'Copy Current PGN')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyPgn}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer shadow-md shadow-blue-600/20"
                >
                  {isEs ? 'Cargar Partida PGN' : 'Load PGN Game'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between ${
            isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className={`text-[11px] font-mono ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            ChessLab &bull; {isEs ? 'Análisis de Tablero' : 'Board Analysis'}
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              isDarkMode
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-300'
            }`}
          >
            {isEs ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
