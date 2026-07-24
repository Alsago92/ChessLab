import React from 'react';
import { OPENINGS_DATABASE, OpeningData } from '../data/openingsDatabase';

interface OpeningExplorerProps {
  moveHistorySan: string[];
  currentFen: string;
  onMakeMove: (sanMove: string) => void;
  language: string;
  isDarkMode: boolean;
}

export const OpeningExplorer: React.FC<OpeningExplorerProps> = ({
  moveHistorySan,
  currentFen,
  onMakeMove,
  language,
  isDarkMode,
}) => {
  const isEs = language === 'es';

  // Derive sequence key like "e4 e5" or "d4"
  const historyKey = moveHistorySan.slice(0, 4).join(' ');
  const openingMatch: OpeningData | undefined =
    OPENINGS_DATABASE[historyKey] ||
    OPENINGS_DATABASE[moveHistorySan.slice(0, 2).join(' ')] ||
    OPENINGS_DATABASE[moveHistorySan[0]] ||
    OPENINGS_DATABASE['e4'];

  const stats = openingMatch.stats;

  return (
    <div
      id="opening-explorer-module"
      className={`p-4 rounded-2xl border space-y-3.5 ${
        isDarkMode
          ? 'bg-neutral-950/40 border-neutral-800/80 text-neutral-100'
          : 'bg-neutral-50/80 border-neutral-200 text-neutral-900'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500 text-lg">menu_book</span>
          <h4 className="text-xs font-bold uppercase tracking-wider">
            {isEs ? 'Explorador de Aperturas (Grandes Maestros)' : 'Opening Explorer (Master Database)'}
          </h4>
        </div>
        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          {openingMatch.eco}
        </span>
      </div>

      {/* Opening Name & Description */}
      <div>
        <h5 className="text-sm font-bold text-neutral-100">
          {isEs ? openingMatch.name.es : openingMatch.name.en}
        </h5>
        <p className={`text-[11px] mt-0.5 leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          {isEs ? openingMatch.desc.es : openingMatch.desc.en}
        </p>
      </div>

      {/* Overall Game Outcome Ratios Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono font-semibold">
          <span className="text-emerald-400">{isEs ? 'Blancas' : 'White'}: {stats.whiteWins}%</span>
          <span className="text-neutral-400">{isEs ? 'Tablas' : 'Draws'}: {stats.drawRatio}%</span>
          <span className="text-sky-400">{isEs ? 'Negras' : 'Black'}: {stats.blackWins}%</span>
        </div>

        {/* Visual Bar */}
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-neutral-800 shadow-inner">
          <div style={{ width: `${stats.whiteWins}%` }} className="bg-emerald-500 h-full" title={`White Wins: ${stats.whiteWins}%`} />
          <div style={{ width: `${stats.drawRatio}%` }} className="bg-neutral-400 h-full" title={`Draws: ${stats.drawRatio}%`} />
          <div style={{ width: `${stats.blackWins}%` }} className="bg-sky-500 h-full" title={`Black Wins: ${stats.blackWins}%`} />
        </div>
        <div className="text-[9px] text-right text-neutral-500 font-mono">
          {stats.totalGames.toLocaleString()} {isEs ? 'partidas analizadas' : 'games analyzed'}
        </div>
      </div>

      {/* Popular Candidate Moves */}
      <div className="space-y-2">
        <h6 className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {isEs ? 'Siguientes Movimientos Más Jugados:' : 'Top Master Candidate Moves:'}
        </h6>

        <div className="space-y-1.5">
          {openingMatch.popularContinuations.map((cont, idx) => (
            <button
              key={idx}
              onClick={() => onMakeMove(cont.san)}
              className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition cursor-pointer group ${
                isDarkMode
                  ? 'bg-neutral-900/80 border-neutral-800 hover:border-amber-500/60 hover:bg-amber-950/20'
                  : 'bg-white border-neutral-200 hover:border-amber-400 hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 bg-amber-500 text-black font-mono font-bold text-xs rounded-lg group-hover:scale-105 transition-transform">
                  {cont.san}
                </span>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {cont.gamesCount.toLocaleString()} {isEs ? 'partidas' : 'games'}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold">
                <span className="text-emerald-400">{cont.whiteWins}% W</span>
                <span className="text-neutral-400">{cont.drawRatio}% D</span>
                <span className="text-sky-400">{cont.blackWins}% B</span>
                <span className="material-symbols-outlined text-xs text-neutral-500 group-hover:text-amber-400 transition-colors ml-1">
                  play_arrow
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
