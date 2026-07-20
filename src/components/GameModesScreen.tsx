import React, { useState } from 'react';
import { GameMode, LobbyOpponent } from '../types';
import { getTranslation } from '../utils/translations';
import { BoneyardSkeleton } from './BoneyardSkeleton';

interface GameModesScreenProps {
  onSelectMode: (mode: GameMode, difficultyLevel?: number) => void;
  onlineLobby: LobbyOpponent[];
  onPlayLobbyOpponent: (opponent: LobbyOpponent) => void;
  selectedDifficulty: number;
  setSelectedDifficulty: (level: number) => void;
  language: string;
}

const DIFFICULTIES = [
  { level: 1, nameEn: 'Beginner', nameEs: 'Principiante', elo: 800, color: 'text-emerald-400 bg-emerald-500/10' },
  { level: 2, nameEn: 'Easy', nameEs: 'Fácil', elo: 1200, color: 'text-sky-400 bg-sky-500/10' },
  { level: 3, nameEn: 'Medium', nameEs: 'Medio', elo: 1500, color: 'text-amber-400 bg-amber-500/10' },
  { level: 4, nameEn: 'Hard', nameEs: 'Difícil', elo: 1800, color: 'text-orange-400 bg-orange-500/10' },
  { level: 5, nameEn: 'Expert', nameEs: 'Experto', elo: 2200, color: 'text-rose-400 bg-rose-500/10' },
  { level: 6, nameEn: 'Master', nameEs: 'Maestro', elo: 2600, color: 'text-fuchsia-400 bg-fuchsia-500/10' },
];

export const GameModesScreen: React.FC<GameModesScreenProps> = ({
  onSelectMode,
  onlineLobby,
  onPlayLobbyOpponent,
  selectedDifficulty,
  setSelectedDifficulty,
  language,
}) => {
  const [lobbySearch, setLobbySearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 850);
  };

  const activeDiff = DIFFICULTIES[selectedDifficulty - 1];
  const activeDiffName = language === 'es' ? activeDiff.nameEs : activeDiff.nameEn;

  const modes = [
    {
      id: 'local' as GameMode,
      title: language === 'es' ? 'PvP Local (Pasar y Jugar)' : 'Local Pass & Play',
      desc: language === 'es' ? 'Juega con un amigo en el mismo dispositivo en tiempo real. Experiencia clásica.' : 'Play with a friend on the same device in real-time. Classic over-the-board experience.',
      icon: 'groups',
      badge: 'PvP',
    },
    {
      id: 'computer' as GameMode,
      title: language === 'es' ? 'vs Computadora IA' : 'vs Computer AI',
      desc: language === 'es' ? 'Pon a prueba tus habilidades contra nuestro bot de ajedrez con IA y dificultades personalizadas.' : 'Test your skills against our neural-network powered chess bot with custom difficulties.',
      icon: 'smart_toy',
      badge: language === 'es' ? 'Práctica' : 'Practice',
    },
    {
      id: 'online' as GameMode,
      title: language === 'es' ? 'Arena en Línea' : 'Online Arena',
      desc: language === 'es' ? 'Empareja con jugadores de todo el mundo en controles de tiempo Bullet, Blitz o Rapid.' : 'Match with players globally in Bullet, Blitz, or Rapid time controls. Rated leaderboards.',
      icon: 'language',
      badge: language === 'es' ? 'Competitivo' : 'Competitive',
    },
    {
      id: 'puzzle' as GameMode,
      title: language === 'es' ? 'Puzzles Tácticos' : 'Tactical Puzzles',
      desc: language === 'es' ? 'Resuelve puzzles de Grandes Maestros para mejorar tu visión táctica. Actualización instantánea.' : 'Solve grandmaster puzzles to boost your tactical vision. Instant rating updates.',
      icon: 'extension',
      badge: 'Puzzles',
    },
    {
      id: 'analysis' as GameMode,
      title: language === 'es' ? 'Tablero de Análisis' : 'Analysis Board',
      desc: language === 'es' ? 'Carga posiciones, analiza partidas, estudia aperturas y activa la evaluación del motor.' : 'Load custom positions, review games, study opening lines, and turn on engine evaluation.',
      icon: 'psychology',
      badge: language === 'es' ? 'Entrenador' : 'Coach',
    },
    {
      id: 'pgn' as GameMode,
      title: language === 'es' ? 'Importar PGN / FEN' : 'Import PGN / FEN',
      desc: language === 'es' ? 'Sube registros de partidas estándar o posiciones FEN para analizar torneos históricos.' : 'Upload standard game records or FEN positions to analyze historic tournament games.',
      icon: 'upload_file',
      badge: language === 'es' ? 'Archivos' : 'Files',
    },
    {
      id: 'tournament' as GameMode,
      title: language === 'es' ? 'Torneos' : 'Tournaments',
      desc: language === 'es' ? 'Únete a torneos estilo Arena o Suizo programados cada hora y gana trofeos personalizados.' : 'Join scheduled hourly Arena or Swiss style tournaments. Win custom trophies.',
      icon: 'emoji_events',
      badge: language === 'es' ? 'Eventos' : 'Events',
    },
    {
      id: 'training' as GameMode,
      title: language === 'es' ? 'Entrenador y Práctica' : 'Coach & Training',
      desc: language === 'es' ? 'Ejercicios interactivos para finales, entrenamiento de coordenadas y estructuras de apertura.' : 'Interactive chess drills for endgames, coordinate training, and structural openings.',
      icon: 'school',
      badge: language === 'es' ? 'Academia' : 'Academy',
    },
  ];

  const filteredLobby = onlineLobby.filter((opponent) =>
    opponent.name.toLowerCase().includes(lobbySearch.toLowerCase())
  );

  return (
    <div id="game-lobby-screen" className="max-w-6xl mx-auto px-4 py-8 space-y-12 animate-fade-in select-none">
      
      {/* Lobby Hero section */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl font-extrabold text-neutral-100 tracking-tight sm:text-4xl">
          {getTranslation(language, 'chooseArena')}
        </h2>
        <p className="text-sm text-neutral-400">
          {getTranslation(language, 'arenaSubtitle')}
        </p>
      </div>

      {/* Main Grid: Game Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {modes.map((mode) => (
          <div
            id={`mode-card-${mode.id}`}
            key={mode.id}
            onClick={() => onSelectMode(mode.id, mode.id === 'computer' ? selectedDifficulty : undefined)}
            className="group relative bg-neutral-900 border border-neutral-800/60 hover:border-blue-500/50 rounded-2xl p-6 shadow-md hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Card Header icon & Badge */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-neutral-800 group-hover:bg-blue-600 rounded-xl flex items-center justify-center transition duration-200 shadow-inner">
                  <span className="material-symbols-outlined text-neutral-300 group-hover:text-white text-2xl transition duration-150">
                    {mode.icon}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {mode.badge}
                </span>
              </div>

              {/* Card Title & Desc */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-neutral-100 group-hover:text-blue-400 transition duration-150">
                  {mode.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                  {mode.desc}
                </p>
              </div>
            </div>

            {/* Bottom actions indication */}
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-neutral-500 group-hover:text-blue-400 transition duration-150 self-end">
              <span>{getTranslation(language, 'challengeNow')}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column split: Computer Difficulty (Left) & Live Online Lobby (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Computer Difficulty configuration (Col: 5) */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800/60 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-2xl">smart_toy</span>
              <h3 className="text-lg font-bold text-neutral-100">{getTranslation(language, 'aiCalibration')}</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {getTranslation(language, 'aiCalibrationDesc')}
            </p>
          </div>

          {/* ELO Display Card */}
          <div className="p-4 bg-neutral-950/40 border border-neutral-800/60 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{getTranslation(language, 'activeChoice')}</span>
              <h4 className="text-base font-bold text-neutral-100 mt-0.5">{activeDiffName}</h4>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${activeDiff.color}`}>
              ELO {activeDiff.elo}
            </div>
          </div>

          {/* Slider input */}
          <div className="space-y-2">
            <input
              id="ai-difficulty-slider"
              type="range"
              min="1"
              max="6"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(parseInt(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] font-bold text-neutral-500">
              <span>{getTranslation(language, 'beginner')}</span>
              <span>{getTranslation(language, 'medium')}</span>
              <span>{getTranslation(language, 'master')}</span>
            </div>
          </div>

          <button
            id="start-ai-match-btn"
            onClick={() => onSelectMode('computer', selectedDifficulty)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
          >
            <span className="material-symbols-outlined text-sm">play_circle</span>
            {language === 'es' ? `Iniciar Batalla (Nivel ${selectedDifficulty})` : `Start Battle (Level ${selectedDifficulty})`}
          </button>
        </div>

        {/* Live Lobby (Col: 7) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800/60 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-2xl">language</span>
              <h3 className="text-lg font-bold text-neutral-100">{getTranslation(language, 'liveArenaLobby')}</h3>
              <button
                id="lobby-refresh-btn"
                onClick={triggerRefresh}
                disabled={isRefreshing}
                className="w-7 h-7 bg-neutral-850 hover:bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition border border-neutral-800 cursor-pointer"
                title={language === 'es' ? 'Refrescar lobby' : 'Refresh lobby'}
              >
                <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>sync</span>
              </button>
            </div>
            {/* Search Input */}
            <div className="relative">
              <input
                id="lobby-search-input"
                type="text"
                value={lobbySearch}
                onChange={(e) => setLobbySearch(e.target.value)}
                placeholder={getTranslation(language, 'searchPlayers')}
                className="bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 w-full sm:w-48 transition"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-neutral-500 text-sm">search</span>
            </div>
          </div>

          {/* Lobby Table container */}
          <div className="overflow-x-auto overflow-y-auto max-h-[220px] min-h-[220px] border border-neutral-800/40 rounded-xl bg-neutral-950/20 flex flex-col">
            {isRefreshing ? (
              <div className="p-4 flex-grow flex flex-col justify-center">
                <BoneyardSkeleton loading={true} variant="list" count={3} />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-neutral-500 border-b border-neutral-800/60 text-xs">
                    <th className="py-2.5 px-4 font-semibold">{getTranslation(language, 'opponent')}</th>
                    <th className="py-2.5 px-4 font-semibold">{getTranslation(language, 'rating')}</th>
                    <th className="py-2.5 px-4 font-semibold">{getTranslation(language, 'timeControl')}</th>
                    <th className="py-2.5 px-4 font-semibold">{getTranslation(language, 'ping')}</th>
                    <th className="py-2.5 px-4 font-semibold text-right">{getTranslation(language, 'action')}</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {filteredLobby.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-500 italic">
                        {getTranslation(language, 'noChallenges')}
                      </td>
                    </tr>
                  ) : (
                    filteredLobby.map((opponent) => (
                      <tr key={opponent.id} className="border-b border-neutral-800/20 hover:bg-neutral-800/10">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <img 
                              referrerPolicy="no-referrer"
                              src={opponent.avatar} 
                              alt={opponent.name}
                              className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700"
                            />
                            <span className="font-semibold text-neutral-200">{opponent.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-neutral-400">
                          {opponent.rating}
                        </td>
                        <td className="py-3 px-4 text-neutral-300 font-medium">
                          {opponent.timeControl}
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-emerald-500 font-semibold">
                          {opponent.ping}ms
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            id={`play-opponent-${opponent.id}`}
                            onClick={() => onPlayLobbyOpponent(opponent)}
                            className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold transition uppercase tracking-wider cursor-pointer"
                          >
                            {getTranslation(language, 'play')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold text-neutral-500 border-t border-neutral-800/40 pt-3">
            <span>{onlineLobby.length} {getTranslation(language, 'challengesOnline')}</span>
            <span className={`${isRefreshing ? 'text-blue-400 animate-pulse' : 'text-neutral-500'}`}>
              {isRefreshing ? getTranslation(language, 'refreshing') : (language === 'es' ? 'Sincronizado' : 'Synced')}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

