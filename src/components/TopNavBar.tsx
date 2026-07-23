import React from 'react';
import { AppScreen } from '../types';
import { getTranslation } from '../utils/translations';

interface TopNavBarProps {
  currentScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  connectionStatus: 'online' | 'offline' | 'connecting';
  isDarkMode: boolean;
  toggleTheme: () => void;
  userAvatar: string;
  language: string;
  wsActiveGameId?: string | null;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentScreen,
  setScreen,
  connectionStatus,
  isDarkMode,
  toggleTheme,
  userAvatar,
  language,
  wsActiveGameId,
}) => {
  const [copiedSession, setCopiedSession] = React.useState(false);

  const handleCopySession = () => {
    if (wsActiveGameId) {
      navigator.clipboard.writeText(wsActiveGameId);
      setCopiedSession(true);
      setTimeout(() => setCopiedSession(false), 2000);
    }
  };
  return (
    <header 
      id="top-nav-bar" 
      className={`header-container sticky top-0 z-50 border-b backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between select-none transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-neutral-900 border-neutral-800/60' 
          : 'bg-white/95 border-neutral-200/80 shadow-sm'
      }`}
    >
      
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-2.5">
        <button 
          id="nav-logo-btn"
          onClick={() => setScreen('modes')}
          className="flex items-center gap-2.5 hover:opacity-95 transition active:scale-95 group cursor-pointer"
        >
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-300">
            <span className="material-symbols-outlined text-white text-xl font-bold">star</span>
          </div>
          <div className="text-left">
            <h1 className={`header-title text-sm font-bold tracking-tight leading-tight transition-colors duration-300 ${
              isDarkMode ? 'text-neutral-100' : 'text-neutral-850'
            }`}>
              Material Chess
            </h1>
            <p className={`text-[10px] font-medium transition-colors duration-300 ${
              isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              {getTranslation(language, 'dashboard')} v10.0
            </p>
          </div>
        </button>
      </div>

      {/* Screen navigation tabs */}
      <nav className={`hidden md:flex items-center gap-1.5 p-1 rounded-xl border transition-colors duration-300 ${
        isDarkMode ? 'bg-neutral-950/40 border-neutral-800/60' : 'bg-neutral-100/80 border-neutral-200/80'
      }`}>
        {[
          { id: 'modes', label: getTranslation(language, 'playLobby'), icon: 'sports_esports' },
          { id: 'puzzles', label: language === 'es' ? 'Puzzles Tácticos' : 'Tactical Puzzles', icon: 'extension' },
          { id: 'game', label: getTranslation(language, 'chessboard'), icon: 'grid_view' },
          { id: 'profile', label: getTranslation(language, 'myStats'), icon: 'person' },
          { id: 'settings', label: getTranslation(language, 'settings'), icon: 'settings' },
        ].map((tab) => {
          const isActive = currentScreen === tab.id;
          return (
            <button
              id={`nav-tab-select-${tab.id}`}
              key={tab.id}
              onClick={() => setScreen(tab.id as AppScreen)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                isActive
                  ? isDarkMode
                    ? 'bg-neutral-800 text-blue-400 font-bold border border-neutral-700/50 shadow-sm'
                    : 'bg-white text-blue-600 font-bold border border-neutral-200/80 shadow-sm'
                  : isDarkMode
                    ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
              }`}
            >
              <span className="material-symbols-outlined text-base leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Status, Theme and Profile controls */}
      <div className="flex items-center gap-3">
        
        {/* Active Session ID Badge */}
        {wsActiveGameId && (
          <button
            id="nav-session-id-badge"
            onClick={handleCopySession}
            className={`flex items-center gap-1.5 px-3 py-1 border rounded-full transition-all duration-200 cursor-pointer ${
              isDarkMode
                ? 'bg-blue-950/40 border-blue-800/60 text-blue-300 hover:bg-blue-900/40'
                : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}
            title={language === 'es' ? 'Haz clic para copiar el número de sesión' : 'Click to copy session number'}
          >
            <span className="material-symbols-outlined text-xs">key</span>
            <span className="text-[10px] font-mono font-bold tracking-wider">
              {language === 'es' ? 'Sesión' : 'Session'}: #{wsActiveGameId}
            </span>
            <span className="material-symbols-outlined text-xs opacity-70">
              {copiedSession ? 'check' : 'content_copy'}
            </span>
          </button>
        )}

        {/* Connection Status Badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 border rounded-full transition-colors duration-300 ${
          isDarkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            connectionStatus === 'online' 
              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' 
              : connectionStatus === 'offline' 
              ? 'bg-rose-500' 
              : 'bg-amber-500 animate-bounce'
          }`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
            isDarkMode ? 'text-neutral-300' : 'text-neutral-600'
          }`}>
            {connectionStatus === 'online' ? getTranslation(language, 'liveArena') : connectionStatus}
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          id="theme-toggler"
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-all duration-150 cursor-pointer ${
            isDarkMode 
              ? 'bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border-neutral-700/40 text-neutral-200 hover:text-white' 
              : 'bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border-neutral-200 text-neutral-600 hover:text-neutral-900'
          }`}
          title={isDarkMode ? getTranslation(language, 'switchLight') : getTranslation(language, 'switchDark')}
        >
          <span className="material-symbols-outlined text-lg block">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* User Profile avatar navigation button */}
        <button
          id="nav-profile-avatar-btn"
          onClick={() => setScreen('profile')}
          className={`flex items-center gap-2 p-1.5 rounded-xl transition border cursor-pointer ${
            currentScreen === 'profile' 
              ? isDarkMode
                ? 'bg-neutral-800 text-blue-400 ring-2 ring-blue-500/50 border-neutral-700' 
                : 'bg-white text-blue-600 ring-2 ring-blue-500/30 border-neutral-200 shadow-sm'
              : isDarkMode
                ? 'hover:bg-neutral-800 text-neutral-300 border-transparent hover:text-neutral-100'
                : 'hover:bg-neutral-100 text-neutral-700 border-transparent hover:text-neutral-900'
          }`}
          title={getTranslation(language, 'myChessProfile')}
        >
          <img 
            referrerPolicy="no-referrer"
            src={userAvatar} 
            alt="My Avatar" 
            className={`w-7 h-7 rounded-full border transition-colors duration-300 ${
              isDarkMode ? 'bg-neutral-850 border-neutral-700' : 'bg-neutral-100 border-neutral-250'
            }`}
          />
          <span className="hidden sm:inline text-xs font-semibold pr-1">{getTranslation(language, 'myStats')}</span>
        </button>

      </div>
    </header>
  );
};
