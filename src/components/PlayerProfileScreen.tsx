import React, { useState } from 'react';
import { PlayerStats } from '../types';
import { getTranslation } from '../utils/translations';

interface PlayerProfileScreenProps {
  stats: PlayerStats;
  userName: string;
  userAvatar: string;
  onUpdateProfile?: (name: string, avatar: string) => void;
  language: string;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120',
];

export const PlayerProfileScreen: React.FC<PlayerProfileScreenProps> = ({
  stats,
  userName,
  userAvatar,
  onUpdateProfile,
  language,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editAvatar, setEditAvatar] = useState(userAvatar);

  const handleSave = () => {
    if (editName.trim() && onUpdateProfile) {
      onUpdateProfile(editName.trim(), editAvatar);
    }
    setIsEditing(false);
  };

  // Simple coordinates for a beautiful rating progress curve SVG
  // Showing rating progress from 1420 up to 1550!
  const ratingHistory = [1420, 1435, 1415, 1440, 1465, 1450, 1485, 1510, 1500, stats.currentRating];
  
  // Calculate SVG line path points
  const svgWidth = 500;
  const svgHeight = 120;
  const minRating = 1400;
  const maxRating = Math.max(1580, stats.currentRating + 30);
  const range = maxRating - minRating;

  const points = ratingHistory.map((val, idx) => {
    const x = (idx / (ratingHistory.length - 1)) * svgWidth;
    const y = svgHeight - ((val - minRating) / range) * svgHeight;
    return `${x},${y}`;
  }).join(' ');

  // Localize achievements
  const getLocalizedAchievement = (id: string, field: 'title' | 'desc') => {
    const achievementsMap: Record<string, { title: { en: string; es: string }; desc: { en: string; es: string } }> = {
      '1': {
        title: { en: 'First Victory', es: 'Primera Victoria' },
        desc: { en: 'First steps on the grandmaster path.', es: 'Primeros pasos en el camino de gran maestro.' }
      },
      '2': {
        title: { en: 'Tactical Genius', es: 'Genio Táctico' },
        desc: { en: 'Solved 10 tactical puzzles in Arena lobby.', es: 'Resolviste 10 puzzles tácticos en el lobby.' }
      },
      '3': {
        title: { en: 'Deep Thinker', es: 'Pensador Profundo' },
        desc: { en: 'Review 3 full matches on engine analyzer.', es: 'Analizaste 3 partidas completas en el motor.' }
      },
      '4': {
        title: { en: 'Speed Demon', es: 'Demonio de la Velocidad' },
        desc: { en: 'Win a blitz match with less than 5 seconds left.', es: 'Ganaste un blitz con menos de 5 segundos restantes.' }
      }
    };
    const ach = achievementsMap[id];
    if (!ach) return field === 'title' ? id : '';
    return language === 'es' ? ach[field].es : ach[field].en;
  };

  return (
    <div id="player-profile-screen" className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in select-none">
      
      {/* Profile Header Block */}
      <div className="bg-neutral-900 border border-neutral-800/60 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center gap-6">
        <img 
          referrerPolicy="no-referrer"
          src={isEditing ? editAvatar : userAvatar} 
          alt={userName}
          className="w-24 h-24 rounded-2xl border-2 border-blue-500 bg-neutral-800 shadow-xl object-cover"
        />
        
        {isEditing ? (
          <div className="text-left space-y-4 flex-grow w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  {getTranslation(language, 'username')}
                </label>
                <input
                  id="edit-profile-name-input"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={language === 'es' ? 'Ingresa el nombre' : 'Enter name'}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-neutral-200 focus:outline-none focus:border-blue-500 w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block font-medium">
                  {getTranslation(language, 'selectAvatarPreset')}
                </label>
                <div className="flex gap-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      id={`preset-avatar-btn-${idx}`}
                      onClick={() => setEditAvatar(url)}
                      className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition ${
                        editAvatar === url ? 'border-blue-500 scale-105' : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img referrerPolicy="no-referrer" src={url} alt="Preset avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                id="save-profile-btn"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {getTranslation(language, 'saveProfile')}
              </button>
              <button
                id="cancel-profile-btn"
                onClick={() => {
                  setEditName(userName);
                  setEditAvatar(userAvatar);
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {getTranslation(language, 'cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center md:text-left space-y-1 flex-grow w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-neutral-100">{userName}</h2>
                <p className="text-xs text-neutral-400 font-medium">{getTranslation(language, 'memberSince')}</p>
              </div>
              
              <div className="flex items-center gap-3 self-center sm:self-auto">
                <button
                  id="edit-profile-trigger-btn"
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-700/50 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  {getTranslation(language, 'editProfile')}
                </button>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/15">
                  {getTranslation(language, 'verifiedScholar')}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 pt-3 border-t border-neutral-800/40">
              <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase">{getTranslation(language, 'currentRating')}</span>
                <p className="text-lg font-mono font-black text-blue-400">{stats.currentRating}</p>
              </div>
              <div className="border-l border-neutral-800 pl-4">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">{getTranslation(language, 'peakRating')}</span>
                <p className="text-lg font-mono font-black text-neutral-300">{stats.highestRating}</p>
              </div>
              <div className="border-l border-neutral-800 pl-4">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">{getTranslation(language, 'globalRank')}</span>
                <p className="text-lg font-mono font-black text-neutral-300">#12,854</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Stats Cards & Rating History Graph */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Core Stats Overview (Col: 5) */}
        <div className="md:col-span-5 bg-neutral-900 border border-neutral-800/60 rounded-2xl p-5 shadow-md space-y-5">
          <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-500 text-lg">analytics</span>
            {getTranslation(language, 'careerOverview')}
          </h3>

          {/* Stats Bento Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-neutral-950/40 border border-neutral-800/40 rounded-xl">
              <span className="text-[10px] font-bold text-neutral-500 uppercase">{getTranslation(language, 'gamesPlayed')}</span>
              <p className="text-2xl font-mono font-black text-neutral-100 mt-1">{stats.gamesPlayed}</p>
            </div>
            <div className="p-4 bg-neutral-950/40 border border-neutral-800/40 rounded-xl">
              <span className="text-[10px] font-bold text-neutral-500 uppercase">{getTranslation(language, 'winRate')}</span>
              <p className="text-2xl font-mono font-black text-emerald-400 mt-1">{stats.winPercentage}%</p>
            </div>
          </div>

          {/* Wins/Losses/Draws Ratio Distribution Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-neutral-400">
              <span className="text-emerald-400">{getTranslation(language, 'statWins')} ({stats.wins})</span>
              <span className="text-neutral-300">{getTranslation(language, 'statDraws')} ({stats.draws})</span>
              <span className="text-rose-400">{getTranslation(language, 'statLosses')} ({stats.losses})</span>
            </div>
            <div className="w-full h-3.5 bg-neutral-950 rounded-lg overflow-hidden flex">
              {/* Wins segment */}
              <div 
                className="bg-emerald-500 h-full transition-all" 
                style={{ width: `${(stats.wins / stats.gamesPlayed) * 100}%` }}
                title={`Wins: ${stats.wins}`}
              />
              {/* Draws segment */}
              <div 
                className="bg-neutral-600 h-full transition-all" 
                style={{ width: `${(stats.draws / stats.gamesPlayed) * 100}%` }}
                title={`Draws: ${stats.draws}`}
              />
              {/* Losses segment */}
              <div 
                className="bg-rose-500 h-full transition-all" 
                style={{ width: `${(stats.losses / stats.gamesPlayed) * 100}%` }}
                title={`Losses: ${stats.losses}`}
              />
            </div>
          </div>

          {/* Opening Pref Card */}
          <div className="p-4 bg-neutral-950/30 border border-neutral-800/40 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">{getTranslation(language, 'favOpening')}</span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">menu_book</span>
              <span className="text-sm font-bold text-neutral-200">{stats.favoriteOpening}</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {language === 'es' ? `Porcentaje de victorias: 58.4% usando esta configuración.` : `Winning ratio: 58.4% using this setup.`}
            </p>
          </div>
        </div>

        {/* ELO Progress Curve Graph (Col: 7) */}
        <div className="md:col-span-7 bg-neutral-900 border border-neutral-800/60 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-500 text-lg">show_chart</span>
              {getTranslation(language, 'ratingProgressCurve')}
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-500/10">
              Trend +130pts
            </span>
          </div>

          {/* SVG Graph Drawing */}
          <div className="relative w-full h-36 bg-neutral-950/30 border border-neutral-850 rounded-xl p-3 flex items-end">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              {/* Grid lines */}
              <line x1="0" y1="0" x2={svgWidth} y2="0" stroke="rgba(128,128,128,0.1)" strokeDasharray="3,3" />
              <line x1="0" y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} stroke="rgba(128,128,128,0.1)" strokeDasharray="3,3" />
              <line x1="0" y1={svgHeight} x2={svgWidth} y2={svgHeight} stroke="rgba(128,128,128,0.1)" strokeDasharray="3,3" />
              
              {/* Rating History Line Plot */}
              <polyline
                fill="none"
                stroke="url(#grad)"
                strokeWidth="3.5"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Gradient below line */}
              <path
                d={`M0,${svgHeight} L${points} L${svgWidth},${svgHeight} Z`}
                fill="url(#area-grad)"
              />

              {/* Glowing circles on nodes */}
              {ratingHistory.map((val, idx) => {
                const x = (idx / (ratingHistory.length - 1)) * svgWidth;
                const y = svgHeight - ((val - minRating) / range) * svgHeight;
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="5" fill="#3b82f6" stroke="#111318" strokeWidth="2" className="cursor-pointer hover:scale-125 transition" />
                  </g>
                );
              })}

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-between font-mono text-[9px] text-neutral-500 uppercase mt-4">
            <span>{language === 'es' ? 'Partida 1' : 'Match 1'}</span>
            <span>{language === 'es' ? 'Partida 5' : 'Match 5'}</span>
            <span>{language === 'es' ? 'Partida 10 (Última)' : 'Match 10 (Latest)'}</span>
          </div>
        </div>

      </div>

      {/* Achievements Bento Row */}
      <div className="bg-neutral-900 border border-neutral-800/60 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-blue-500 text-lg">military_tech</span>
          {getTranslation(language, 'achievements')} ({stats.achievements.filter(a => a.unlockedAt).length}/{stats.achievements.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {stats.achievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;
            const localizedTitle = getLocalizedAchievement(ach.id, 'title');
            const localizedDesc = getLocalizedAchievement(ach.id, 'desc');
            return (
              <div 
                id={`achievement-card-${ach.id}`}
                key={ach.id} 
                className={`p-4 border rounded-xl flex items-start gap-3 transition-all duration-200 ${
                  isUnlocked 
                    ? 'bg-neutral-950/40 border-neutral-800' 
                    : 'bg-neutral-950/10 border-neutral-850 opacity-40'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isUnlocked 
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                    : 'bg-neutral-800 text-neutral-600 border-neutral-700/30'
                }`}>
                  <span className="material-symbols-outlined text-xl">{ach.icon}</span>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-neutral-200">{localizedTitle}</h4>
                  <p className="text-[11px] text-neutral-400 leading-snug">{localizedDesc}</p>
                  {isUnlocked && (
                    <span className="text-[9px] text-emerald-400 font-bold block mt-1.5 uppercase">
                      {getTranslation(language, 'unlocked')} {ach.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

