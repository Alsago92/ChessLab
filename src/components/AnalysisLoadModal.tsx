import React, { useState, useMemo, useRef } from 'react';
import { PRESET_POSITIONS, PresetPosition } from '../data/openingsDatabase';
import { parsePgnGames, ParsedPgnGame } from '../utils/pgnParser';

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

  // Multi-game PGN states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGameIndex, setSelectedGameIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingSamplePgn, setIsLoadingSamplePgn] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEs = language === 'es';
  const GAMES_PER_PAGE = 25;

  const handleLoadSampleFile = async () => {
    try {
      setIsLoadingSamplePgn(true);
      setErrorMessage(null);
      const res = await fetch('/Abdusattorov.pgn');
      if (!res.ok) throw new Error('Could not fetch Abdusattorov.pgn');
      const text = await res.text();
      setPgnInput(text);
      setSelectedGameIndex(0);
      setCurrentPage(1);
      setSearchQuery('');
    } catch (e) {
      console.error('Failed to load sample PGN file:', e);
      setErrorMessage(isEs ? 'Error al cargar Abdusattorov.pgn' : 'Failed to load Abdusattorov.pgn');
    } finally {
      setIsLoadingSamplePgn(false);
    }
  };

  // Parse games from PGN input dynamically
  const parsedGames: ParsedPgnGame[] = useMemo(() => {
    if (!pgnInput.trim()) return [];
    return parsePgnGames(pgnInput);
  }, [pgnInput]);

  // Filter games based on search query
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return parsedGames;
    const q = searchQuery.toLowerCase();
    return parsedGames.filter(
      (g) =>
        g.white.toLowerCase().includes(q) ||
        g.black.toLowerCase().includes(q) ||
        g.event.toLowerCase().includes(q) ||
        g.date.includes(q) ||
        g.eco.toLowerCase().includes(q) ||
        g.result.includes(q)
    );
  }, [parsedGames, searchQuery]);

  // Paginated games list
  const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE) || 1;
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * GAMES_PER_PAGE;
    return filteredGames.slice(start, start + GAMES_PER_PAGE);
  }, [filteredGames, currentPage]);

  if (!isOpen) return null;

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

  const handleApplyPgn = (gamePgnOverride?: string) => {
    setErrorMessage(null);
    const textToLoad = gamePgnOverride || (parsedGames.length > 0 ? parsedGames[selectedGameIndex]?.pgn : pgnInput);

    if (!textToLoad || !textToLoad.trim()) {
      setErrorMessage(isEs ? 'Por favor ingresa o selecciona una partida PGN.' : 'Please enter or select a PGN game.');
      return;
    }
    const success = onLoadPgn(textToLoad.trim());
    if (success) {
      onClose();
    } else {
      setErrorMessage(isEs ? 'Error al cargar PGN. Verifica la estructura o sintaxis.' : 'Failed to load PGN. Check syntax.');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPgnInput(content);
        setSelectedGameIndex(0);
        setCurrentPage(1);
        setSearchQuery('');
        setErrorMessage(null);
      }
    };
    reader.readAsText(file);
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
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
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
                  ? 'Importa FEN, sube o pega archivos PGN (soporta bases de datos multi-partida)'
                  : 'Import FEN, upload or paste PGN files (supports multi-game databases)'}
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
          className={`px-6 py-3 border-b flex items-center justify-between gap-2 overflow-x-auto ${
            isDarkMode ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-100/60 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2">
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
              {parsedGames.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500 text-white">
                  {parsedGames.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'pgn' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSampleFile}
                disabled={isLoadingSamplePgn}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-blue-600/20"
              >
                <span className="material-symbols-outlined text-sm">
                  {isLoadingSamplePgn ? 'hourglass_top' : 'folder_open'}
                </span>
                <span>
                  {isLoadingSamplePgn
                    ? (isEs ? 'Cargando BD...' : 'Loading DB...')
                    : (isEs ? 'Cargar Abdusattorov.pgn' : 'Load Abdusattorov.pgn')}
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pgn,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <span className="material-symbols-outlined text-sm">upload_file</span>
                <span>{isEs ? 'Subir Archivo' : 'Upload File'}</span>
              </button>
            </div>
          )}
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

          {/* TAB 3: PGN (Soporta archivos masivos y múltiples partidas) */}
          {activeTab === 'pgn' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-semibold ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  {isEs ? 'Pegar o Cargar Texto PGN (1 o miles de partidas):' : 'Paste or Load PGN Text (1 or thousands of games):'}
                </label>
                {parsedGames.length > 0 && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {parsedGames.length === 1
                      ? (isEs ? '1 partida detectada' : '1 game detected')
                      : (isEs ? `${parsedGames.length.toLocaleString()} partidas encontradas` : `${parsedGames.length.toLocaleString()} games found`)}
                  </span>
                )}
              </div>

              <textarea
                rows={parsedGames.length > 1 ? 4 : 6}
                value={pgnInput}
                onChange={(e) => {
                  setPgnInput(e.target.value);
                  setSelectedGameIndex(0);
                  setCurrentPage(1);
                }}
                placeholder={isEs ? 'Pega tu partida o base de datos PGN aquí (ej: Abdusattorov.pgn)...' : 'Paste your game or PGN database here...'}
                className={`w-full p-4 rounded-xl font-mono text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  isDarkMode
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-100 placeholder-neutral-600'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'
                }`}
              />

              {/* SELECCIONADOR Y BUSCADOR DE PARTIDAS SI MULTI-GAME */}
              {parsedGames.length > 1 && (
                <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-neutral-950/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-400 text-lg">search</span>
                      <span className="text-xs font-bold">
                        {isEs ? 'Explorador de Base de Datos PGN' : 'PGN Database Explorer'}
                      </span>
                    </div>

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder={isEs ? 'Filtrar por Jugador, Torneo, Fecha o ECO...' : 'Filter by Player, Event, Date or ECO...'}
                      className={`px-3 py-1.5 rounded-xl font-sans text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 transition w-full sm:w-64 ${
                        isDarkMode
                          ? 'bg-neutral-900 border-neutral-700 text-neutral-200 placeholder-neutral-500'
                          : 'bg-white border-neutral-300 text-neutral-800 placeholder-neutral-400'
                      }`}
                    />
                  </div>

                  {/* TABLA O LISTA DE PARTIDAS */}
                  <div className="max-h-60 overflow-y-auto rounded-xl border border-neutral-800/60 divide-y divide-neutral-800/40">
                    {filteredGames.length === 0 ? (
                      <div className="p-4 text-center text-xs text-neutral-400">
                        {isEs ? 'No se encontraron partidas con ese filtro.' : 'No games match that search query.'}
                      </div>
                    ) : (
                      paginatedGames.map((game) => {
                        const isSelected = selectedGameIndex === game.gameIndex - 1;
                        return (
                          <div
                            key={game.gameIndex}
                            onClick={() => setSelectedGameIndex(game.gameIndex - 1)}
                            className={`p-2.5 px-3.5 flex items-center justify-between gap-3 text-xs transition cursor-pointer ${
                              isSelected
                                ? isDarkMode
                                  ? 'bg-blue-600/20 border-l-4 border-l-blue-500 text-blue-200 font-semibold'
                                  : 'bg-blue-50 border-l-4 border-l-blue-600 text-blue-900 font-semibold'
                                : isDarkMode
                                ? 'hover:bg-neutral-900/90 text-neutral-300'
                                : 'hover:bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-mono text-[11px] text-neutral-500 w-8 shrink-0">
                                #{game.gameIndex}
                              </span>
                              <div className="min-w-0">
                                <div className="truncate font-medium flex items-center gap-1.5">
                                  <span>{game.white}</span>
                                  <span className="text-neutral-500 text-[10px]">vs</span>
                                  <span>{game.black}</span>
                                </div>
                                <div className="text-[10px] text-neutral-400 truncate flex items-center gap-2">
                                  <span>{game.event}</span>
                                  {game.date && <span>&bull; {game.date}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {game.eco && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  {game.eco}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                game.result === '1-0'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                  : game.result === '0-1'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                  : 'bg-neutral-500/15 text-neutral-300 border border-neutral-500/20'
                              }`}>
                                {game.result}
                              </span>
                              {isSelected && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplyPgn(game.pgn);
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
                                >
                                  {isEs ? 'Cargar Esta' : 'Load Game'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* PAGINACIÓN */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-neutral-400 text-[11px]">
                        {isEs
                          ? `Mostrando ${filteredGames.length.toLocaleString()} partidas (Página ${currentPage} de ${totalPages})`
                          : `Showing ${filteredGames.length.toLocaleString()} games (Page ${currentPage} of ${totalPages})`}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className="px-2.5 py-1 rounded-lg border border-neutral-700 disabled:opacity-40 hover:bg-neutral-800 cursor-pointer"
                        >
                          &larr; {isEs ? 'Anterior' : 'Prev'}
                        </button>
                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className="px-2.5 py-1 rounded-lg border border-neutral-700 disabled:opacity-40 hover:bg-neutral-800 cursor-pointer"
                        >
                          {isEs ? 'Siguiente' : 'Next'} &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  onClick={() => handleApplyPgn()}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer shadow-md shadow-blue-600/20"
                >
                  {parsedGames.length > 1
                    ? (isEs ? `Cargar Partida #${(selectedGameIndex + 1).toLocaleString()}` : `Load Game #${(selectedGameIndex + 1).toLocaleString()}`)
                    : (isEs ? 'Cargar Partida PGN' : 'Load PGN Game')}
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
