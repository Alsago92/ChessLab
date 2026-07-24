import React from 'react';
import { getTranslation } from '../utils/translations';

interface BottomToolbarProps {
  onNewGame: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onOfferDraw: () => void;
  onResign: () => void;
  onFlipBoard: () => void;
  onSettings: () => void;
  onShowGuide: () => void;
  canUndo: boolean;
  canRedo: boolean;
  gameActive: boolean;
  gameMode?: string;
  language: string;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  onNewGame,
  onUndo,
  onRedo,
  onOfferDraw,
  onResign,
  onFlipBoard,
  onSettings,
  onShowGuide,
  canUndo,
  canRedo,
  gameActive,
  gameMode,
  language,
}) => {
  return (
    <div id="game-controls-toolbar" className="bg-neutral-900 border border-neutral-800/60 rounded-2xl p-4 shadow-lg flex flex-wrap justify-center sm:justify-between items-center gap-3">
      {/* Undo/Redo & Flip Actions */}
      <div className="flex gap-2">
        {gameMode !== 'online' && (
          <>
            <button
              id="toolbar-btn-undo"
              onClick={onUndo}
              disabled={!canUndo}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition duration-150 border ${
                canUndo
                  ? 'bg-neutral-800 text-neutral-100 border-neutral-700/50 hover:bg-neutral-700 active:bg-neutral-600'
                  : 'bg-neutral-950/20 text-neutral-600 border-neutral-900 cursor-not-allowed'
              }`}
              title={getTranslation(language, 'undoMove')}
            >
              <span className="material-symbols-outlined text-sm">undo</span>
              <span>{getTranslation(language, 'undo')}</span>
            </button>

            <button
              id="toolbar-btn-redo"
              onClick={onRedo}
              disabled={!canRedo}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition duration-150 border ${
                canRedo
                  ? 'bg-neutral-800 text-neutral-100 border-neutral-700/50 hover:bg-neutral-700 active:bg-neutral-600'
                  : 'bg-neutral-950/20 text-neutral-600 border-neutral-900 cursor-not-allowed'
              }`}
              title={getTranslation(language, 'redoMove')}
            >
              <span className="material-symbols-outlined text-sm">redo</span>
              <span>{getTranslation(language, 'redo')}</span>
            </button>
          </>
        )}

        <button
          id="toolbar-btn-flip"
          onClick={onFlipBoard}
          className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-700/50 text-neutral-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition duration-150"
          title={getTranslation(language, 'flipPerspective')}
        >
          <span className="material-symbols-outlined text-sm">flip_camera_android</span>
          <span>{getTranslation(language, 'flip')}</span>
        </button>
      </div>

      {/* Game status action buttons */}
      <div className="flex gap-2">
        {gameActive && (
          <>
            <button
              id="toolbar-btn-draw"
              onClick={onOfferDraw}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-700/50 text-neutral-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition duration-150"
            >
              <span className="material-symbols-outlined text-sm text-yellow-500">handshake</span>
              <span>{getTranslation(language, 'draw')}</span>
            </button>
            <button
              id="toolbar-btn-resign"
              onClick={onResign}
              className="px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 active:bg-red-600/30 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition duration-150"
            >
              <span className="material-symbols-outlined text-sm text-red-500">flag</span>
              <span>{getTranslation(language, 'resign')}</span>
            </button>
          </>
        )}

        <button
          id="toolbar-btn-guide"
          onClick={onShowGuide}
          className="px-4 py-2.5 bg-emerald-600/15 hover:bg-emerald-600/25 active:bg-emerald-600/35 border border-emerald-500/20 text-emerald-400 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition duration-150 cursor-pointer"
          title={language === 'es' ? 'Guía de Piezas' : 'Piece Guide'}
        >
          <span className="material-symbols-outlined text-sm">school</span>
          <span>{language === 'es' ? 'Guía de Piezas' : 'Piece Guide'}</span>
        </button>

        <button
          id="toolbar-btn-settings"
          onClick={onSettings}
          className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-700/50 text-neutral-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition duration-150"
          title={getTranslation(language, 'matchSettings')}
        >
          <span className="material-symbols-outlined text-sm">settings</span>
          <span>{getTranslation(language, 'settings')}</span>
        </button>

        {!(gameMode === 'online' && gameActive) && (
          <button
            id="toolbar-btn-new-game"
            onClick={onNewGame}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition duration-150 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span>{getTranslation(language, 'newMatch')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
