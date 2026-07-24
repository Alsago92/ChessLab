import React, { useState } from 'react';
import { ChessSettings, BoardTheme, PieceTheme } from '../types';
import { getTranslation } from '../utils/translations';
import { CURRENT_VERSION } from '../data/versionHistory';

interface SettingsScreenProps {
  settings: ChessSettings;
  onChangeSettings: (settings: ChessSettings) => void;
  onClose?: () => void;
  onOpenVersionControl?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onChangeSettings,
  onClose,
  onOpenVersionControl,
}) => {
  const [draft, setDraft] = useState<ChessSettings>(settings);
  const [showSavedSuccess, setShowSavedSuccess] = useState(false);

  const toggleBoolean = (key: keyof ChessSettings) => {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectBoardTheme = (theme: BoardTheme) => {
    setDraft((prev) => ({ ...prev, boardTheme: theme }));
  };

  const selectPieceTheme = (theme: PieceTheme) => {
    setDraft((prev) => ({ ...prev, pieceTheme: theme }));
  };

  const handleSave = () => {
    onChangeSettings(draft);
    setShowSavedSuccess(true);
    setTimeout(() => {
      setShowSavedSuccess(false);
    }, 4000);
  };

  const lang = draft.language || 'en';

  return (
    <div id="settings-panel-screen" className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-in select-none">
      
      {onClose && (
        <button
          id="settings-back-btn"
          onClick={onClose}
          className="group flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-neutral-200 transition cursor-pointer bg-neutral-900 hover:bg-neutral-850 px-3 py-2 rounded-xl border border-neutral-800/40 self-start"
        >
          <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-0.5">arrow_back</span>
          {getTranslation(lang, 'goBack')}
        </button>
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/60 pb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-neutral-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-3xl">settings</span>
            {getTranslation(lang, 'appPreferences')}
          </h2>
          <p className="text-xs text-neutral-400">{getTranslation(lang, 'appPreferencesDesc')}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            id="settings-save-top-btn"
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-500/15 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            {getTranslation(lang, 'saveSettings')}
          </button>
        </div>
      </div>

      {showSavedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3 animate-slide-in">
          <span className="material-symbols-outlined text-emerald-400 text-2xl shrink-0">check_circle</span>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-emerald-400">{getTranslation(lang, 'settingsSaved')}</h4>
            <p className="text-[11px] text-neutral-300">{getTranslation(lang, 'saveSuccessAlert')}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Visual Customization Card */}
        <div className="bg-neutral-900 border border-neutral-800/60 rounded-2xl p-5 shadow-md space-y-6">
          <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-800 pb-3">
            <span className="material-symbols-outlined text-blue-400 text-lg">palette</span>
            {getTranslation(lang, 'visualTheme')}
          </h3>

          {/* Board Theme Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide block">{getTranslation(lang, 'boardTexture')}</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'wood' as BoardTheme, name: getTranslation(lang, 'wood'), style: 'bg-amber-600 border-amber-800 text-amber-100' },
                { id: 'emerald' as BoardTheme, name: getTranslation(lang, 'emerald'), style: 'bg-emerald-600 border-emerald-800 text-emerald-100' },
                { id: 'dark' as BoardTheme, name: getTranslation(lang, 'darkThemeName'), style: 'bg-slate-700 border-slate-900 text-slate-100' },
                { id: 'classic' as BoardTheme, name: getTranslation(lang, 'classicThemeName'), style: 'bg-neutral-500 border-neutral-700 text-neutral-100' },
              ].map((theme) => (
                <button
                  id={`theme-btn-board-${theme.id}`}
                  key={theme.id}
                  onClick={() => selectBoardTheme(theme.id)}
                  className={`py-3 rounded-xl border-2 text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 ${theme.style} ${
                    draft.boardTheme === theme.id 
                      ? 'ring-4 ring-blue-500/40 border-white' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">grid_view</span>
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Piece Styles Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide block">{getTranslation(lang, 'pieceStyleset')}</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'modern' as PieceTheme, name: getTranslation(lang, 'tournamentNeo'), desc: getTranslation(lang, 'tournamentNeoDesc') },
                { id: 'realistic' as PieceTheme, name: getTranslation(lang, 'realisticVector'), desc: getTranslation(lang, 'realisticVectorDesc') },
              ].map((style) => (
                <button
                  id={`theme-btn-piece-${style.id}`}
                  key={style.id}
                  onClick={() => selectPieceTheme(style.id)}
                  className={`p-3.5 rounded-xl border-2 text-left transition ${
                    draft.pieceTheme === style.id
                      ? 'bg-blue-600/10 border-blue-500 text-neutral-100 font-bold'
                      : 'bg-neutral-950/20 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/10'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-100">{style.name}</div>
                  <div className="text-[10px] text-neutral-400 font-medium mt-0.5">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dark / Light Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-neutral-950/30 border border-neutral-800/60 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-neutral-200">{getTranslation(lang, 'darkTheme')}</span>
              <p className="text-[10px] text-neutral-400">{getTranslation(lang, 'darkThemeDesc')}</p>
            </div>
            
            <button
              id="settings-toggle-darkmode"
              onClick={() => toggleBoolean('isDarkMode')}
              className={`w-11 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                draft.isDarkMode ? 'bg-blue-600' : 'bg-neutral-800'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition duration-200 transform ${
                draft.isDarkMode ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

        </div>

        {/* Assists & Sound Panel Card */}
        <div className="bg-neutral-900 border border-neutral-800/60 rounded-2xl p-5 shadow-md space-y-5">
          <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-800 pb-3">
            <span className="material-symbols-outlined text-blue-400 text-lg">construction</span>
            {getTranslation(lang, 'assistsAudio')}
          </h3>

          {/* Boolean Settings List with nice Toggles */}
          <div className="space-y-4">
            {[
              { key: 'showLegalMoves' as keyof ChessSettings, label: getTranslation(lang, 'showLegalMoves'), desc: getTranslation(lang, 'showLegalMovesDesc') },
              { key: 'highlightLastMove' as keyof ChessSettings, label: getTranslation(lang, 'highlightLastMove'), desc: getTranslation(lang, 'highlightLastMoveDesc') },
              { key: 'coordinateLabels' as keyof ChessSettings, label: getTranslation(lang, 'coordinateLabels'), desc: getTranslation(lang, 'coordinateLabelsDesc') },
              { key: 'autoQueenPromotion' as keyof ChessSettings, label: getTranslation(lang, 'autoQueenPromotion'), desc: getTranslation(lang, 'autoQueenPromotionDesc') },
              { key: 'soundEffects' as keyof ChessSettings, label: getTranslation(lang, 'soundEffects'), desc: getTranslation(lang, 'soundEffectsDesc') },
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-neutral-200">{pref.label}</span>
                  <p className="text-[10px] text-neutral-400 leading-snug">{pref.desc}</p>
                </div>
                
                <button
                  id={`settings-toggle-${pref.key}`}
                  onClick={() => toggleBoolean(pref.key)}
                  className={`w-11 h-6 rounded-full p-0.5 transition duration-200 shrink-0 ${
                    draft[pref.key] ? 'bg-blue-600' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition duration-200 transform ${
                    draft[pref.key] ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>

          {/* Language / Translation preference */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">{getTranslation(lang, 'interfaceLanguage')}</label>
            <select
              id="settings-select-language"
              value={draft.language}
              onChange={(e) => setDraft(prev => ({ ...prev, language: e.target.value }))}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
            >
              <option value="en">English (US)</option>
              <option value="es">Español (ES)</option>
              <option value="fr">Français (FR) [Beta]</option>
              <option value="de">Deutsch (DE) [Beta]</option>
            </select>
          </div>

        </div>

      </div>

      {/* Explicit Save Bar & Version Info at bottom */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-neutral-900 border border-neutral-800/60 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 text-center sm:text-left leading-normal max-w-sm">
            {lang === 'es'
              ? 'Configuraciones persistidas en almacenamiento local.'
              : 'Settings persisted in local browser storage.'}
          </span>
          {onOpenVersionControl && (
            <button
              id="settings-version-control-btn"
              onClick={onOpenVersionControl}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-blue-400 border border-neutral-700/60 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-sm">history</span>
              <span>ChessLab v{CURRENT_VERSION}</span>
            </button>
          )}
        </div>
        <button
          id="settings-save-bottom-btn"
          onClick={handleSave}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-500/15 cursor-pointer w-full sm:w-auto justify-center"
        >
          <span className="material-symbols-outlined text-sm">save</span>
          {getTranslation(lang, 'saveSettings')}
        </button>
      </div>

    </div>
  );
};

