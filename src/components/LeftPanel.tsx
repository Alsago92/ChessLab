import React from 'react';
import { Player, GameMode } from '../types';
import { getTranslation } from '../utils/translations';

interface LeftPanelProps {
  gameMode: GameMode;
  whitePlayer: Player;
  blackPlayer: Player;
  turn: 'w' | 'b';
  moveNumber: number;
  openingName: string;
  whiteTime: number; // in seconds
  blackTime: number; // in seconds
  gameStatus: string;
  language: string;
  wsActiveGameId?: string | null;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  gameMode,
  whitePlayer,
  blackPlayer,
  turn,
  moveNumber,
  openingName,
  whiteTime,
  blackTime,
  gameStatus,
  language,
  wsActiveGameId,
}) => {
  // Format seconds to mm:ss or mm:ss.t if under 10 seconds
  const formatTime = (timeInSeconds: number): string => {
    if (timeInSeconds <= 0) return '00:00';
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = Math.floor(timeInSeconds % 60);

    if (timeInSeconds < 10) {
      // Under 10s: show tenths of seconds
      const tenths = Math.floor((timeInSeconds % 1) * 10);
      return `00:0${secs}.${tenths}`;
    }

    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    
    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const getModeLabel = (mode: GameMode): string => {
    switch (mode) {
      case 'local': return 'PvP Local';
      case 'computer': return 'vs IA';
      case 'online': return 'Arena Online';
      case 'puzzle': return 'Puzzles';
      case 'analysis': return 'Análisis';
      case 'pgn': return 'PGN';
      case 'tournament': return 'Torneo';
      case 'training': return 'Entrenamiento';
      default: return 'Ajedrez';
    }
  };

  const modeLabel = language === 'es' ? getModeLabel(gameMode) : (
    gameMode === 'local' ? 'Local PvP' :
    gameMode === 'computer' ? 'vs Computer' :
    gameMode === 'online' ? 'Online Arena' :
    gameMode === 'puzzle' ? 'Tactical Puzzle' :
    gameMode === 'analysis' ? 'Analysis Board' :
    gameMode === 'pgn' ? 'PGN Review' :
    gameMode === 'tournament' ? 'Tournament' :
    'Coach Training'
  );

  return (
    <div id="left-game-info-panel" className="bg-neutral-900 border border-neutral-800/60 rounded-2xl p-5 flex flex-col justify-between h-full shadow-lg">
      
      {/* Header Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {modeLabel}
            </span>
            {wsActiveGameId && (
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full" title="ID de Sesión">
                #{wsActiveGameId}
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">hourglass_empty</span>
            {getTranslation(language, 'move')} {moveNumber}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-tight mb-1">{getTranslation(language, 'opening')}</h3>
        <p className="text-sm font-medium text-neutral-100 truncate max-w-full" title={openingName || getTranslation(language, 'standardOpening')}>
          {openingName || getTranslation(language, 'searchingTheory')}
        </p>
      </div>

      {/* Players list & Timers (Modern MD3 card layout) */}
      <div className="flex flex-col gap-4 flex-grow justify-center">
        
        {/* Black Player Card */}
        <div 
          id="player-card-black"
          className={`p-4 rounded-xl border transition-all duration-300 ${
            turn === 'b' && gameStatus === 'active'
              ? 'bg-neutral-800/80 border-blue-500 shadow-md ring-1 ring-blue-500/20' 
              : 'bg-neutral-950/40 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  referrerPolicy="no-referrer"
                  src={blackPlayer.avatar} 
                  alt={blackPlayer.name}
                  className="w-10 h-10 rounded-full border border-neutral-700 bg-neutral-800"
                />
                {turn === 'b' && gameStatus === 'active' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border-2 border-neutral-900 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-neutral-100 flex items-center gap-1.5">
                  {blackPlayer.name}
                  {blackPlayer.isComputer && (
                    <span className="text-[9px] font-bold bg-neutral-700 text-neutral-300 px-1.5 py-0.2 rounded uppercase">
                      CPU
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400 font-mono">{getTranslation(language, 'rating')}: {blackPlayer.rating}</div>
              </div>
            </div>

            {/* Black Timer */}
            <div 
              id="timer-black"
              className={`font-mono text-xl font-bold px-3 py-1.5 rounded-lg border tracking-tight ${
                turn === 'b' && gameStatus === 'active'
                  ? blackTime < 20 
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                    : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              {formatTime(blackTime)}
            </div>
          </div>
        </div>

        {/* Turn Indicator Banner */}
        <div className="flex items-center justify-center py-2 px-4 rounded-lg bg-neutral-950/20 border border-neutral-800/40">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${turn === 'w' ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-neutral-700'}`} />
            <span className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">
              {gameStatus !== 'active' ? getTranslation(language, 'gameOver') : turn === 'w' ? getTranslation(language, 'whitesTurn') : getTranslation(language, 'blacksTurn')}
            </span>
            <div className={`w-2.5 h-2.5 rounded-full ${turn === 'b' ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-neutral-700'}`} />
          </div>
        </div>

        {/* White Player Card */}
        <div 
          id="player-card-white"
          className={`p-4 rounded-xl border transition-all duration-300 ${
            turn === 'w' && gameStatus === 'active'
              ? 'bg-neutral-800/80 border-blue-500 shadow-md ring-1 ring-blue-500/20' 
              : 'bg-neutral-950/40 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  referrerPolicy="no-referrer"
                  src={whitePlayer.avatar} 
                  alt={whitePlayer.name}
                  className="w-10 h-10 rounded-full border border-neutral-700 bg-neutral-800"
                />
                {turn === 'w' && gameStatus === 'active' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border-2 border-neutral-900 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-neutral-100 flex items-center gap-1.5">
                  {whitePlayer.name}
                  {whitePlayer.isComputer && (
                    <span className="text-[9px] font-bold bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded uppercase">
                      CPU
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400 font-mono">{getTranslation(language, 'rating')}: {whitePlayer.rating}</div>
              </div>
            </div>

            {/* White Timer */}
            <div 
              id="timer-white"
              className={`font-mono text-xl font-bold px-3 py-1.5 rounded-lg border tracking-tight ${
                turn === 'w' && gameStatus === 'active'
                  ? whiteTime < 20 
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                    : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              {formatTime(whiteTime)}
            </div>
          </div>
        </div>

      </div>

      {/* Footer Theory Bar */}
      <div className="mt-6 pt-4 border-t border-neutral-800/40 flex items-center gap-2">
        <span className="material-symbols-outlined text-emerald-500 text-lg">verified_user</span>
        <span className="text-[11px] text-neutral-400 leading-snug">
          {getTranslation(language, 'syncDatabase')}
        </span>
      </div>

    </div>
  );
};
