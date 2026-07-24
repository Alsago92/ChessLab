import React, { useState } from 'react';
import { ChessSettings } from '../types';
import { PieceSvg } from './PieceSvg';
import { getTranslation } from '../utils/translations';

interface ChessBoardProps {
  board: any[][]; // 8x8 representation of squares or null
  turn: 'w' | 'b';
  selectedSquare: string | null;
  possibleMoves: string[];
  lastMove: { from: string; to: string } | null;
  checkSquare: string | null;
  isFlipped: boolean;
  settings: ChessSettings;
  onSquareSelect: (square: string) => void;
  onMove: (from: string, to: string, promotion?: string) => void;
  gameStatus: 'active' | 'checkmate' | 'stalemate' | 'draw' | 'resigned' | 'timeout';
  winner: 'white' | 'black' | 'draw' | null;
  reason: string;
  onRematch: () => void;
  onReturnHome: () => void;
  language: string;
  gameMode?: string;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  turn,
  selectedSquare,
  possibleMoves,
  lastMove,
  checkSquare,
  isFlipped,
  settings,
  onSquareSelect,
  onMove,
  gameStatus,
  winner,
  reason,
  onRematch,
  onReturnHome,
  language,
  gameMode,
}) => {
  const [promotingMove, setPromotingMove] = useState<{ from: string; to: string } | null>(null);

  // Rows and Cols definitions based on flipping
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const displayFiles = isFlipped ? [...files].reverse() : files;
  const displayRanks = isFlipped ? ranks : [...ranks].reverse();

  // Helper to check if a square requires promotion
  const isPromotionMove = (from: string, to: string): boolean => {
    // Check if the piece at 'from' is a pawn
    const fromCol = files.indexOf(from[0]);
    const fromRow = ranks.indexOf(from[1]);
    const piece = board[7 - fromRow][fromCol];

    if (!piece || piece.type.toLowerCase() !== 'p') return false;

    // Moving to the 8th rank for white or 1st rank for black
    const toRank = to[1];
    return (piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1');
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, square: string) => {
    // If not our turn or empty square, cancel
    const colIdx = files.indexOf(square[0]);
    const rowIdx = ranks.indexOf(square[1]);
    const piece = board[7 - rowIdx][colIdx];
    
    if (!piece || piece.color !== turn || gameStatus !== 'active') {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData('text/plain', square);
    onSquareSelect(square); // Trigger selection state
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSquare: string) => {
    e.preventDefault();
    const sourceSquare = e.dataTransfer.getData('text/plain');

    if (sourceSquare && sourceSquare !== targetSquare) {
      if (possibleMoves.includes(targetSquare)) {
        if (isPromotionMove(sourceSquare, targetSquare)) {
          setPromotingMove({ from: sourceSquare, to: targetSquare });
        } else {
          onMove(sourceSquare, targetSquare);
        }
      }
    }
  };

  // Tap/Click handler
  const handleSquareClick = (square: string) => {
    if (gameStatus !== 'active') return;

    if (selectedSquare && possibleMoves.includes(square)) {
      // Execute move
      if (isPromotionMove(selectedSquare, square)) {
        setPromotingMove({ from: selectedSquare, to: square });
      } else {
        onMove(selectedSquare, square);
      }
    } else {
      onSquareSelect(square);
    }
  };

  const handlePromotionSelect = (pieceCode: string) => {
    if (promotingMove) {
      onMove(promotingMove.from, promotingMove.to, pieceCode);
      setPromotingMove(null);
    }
  };

  // Get square color class based on coordinates and theme
  const getSquareColor = (fileIdx: number, rankIdx: number): string => {
    const isLight = (fileIdx + rankIdx) % 2 === 0;

    switch (settings.boardTheme) {
      case 'wood':
        return isLight ? 'bg-[#f0d9b5] text-[#b58863]' : 'bg-[#b58863] text-[#f0d9b5]';
      case 'emerald':
        return isLight ? 'bg-[#ececd7] text-[#739552]' : 'bg-[#739552] text-[#ececd7]';
      case 'dark':
        return isLight ? 'bg-[#3a3f4d] text-[#1c1f26]' : 'bg-[#1c1f26] text-[#3a3f4d]';
      case 'classic':
      default:
        return isLight ? 'bg-[#f0f1f0] text-[#5c6e7a]' : 'bg-[#5c6e7a] text-[#f0f1f0]';
    }
  };

  return (
    <div id="chess_board_container" className="relative aspect-square w-full max-w-[620px] mx-auto select-none rounded-xl overflow-hidden shadow-2xl border border-neutral-800/40 bg-neutral-900 animate-fade-in">
      {/* 8x8 Chessboard grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {displayRanks.map((rank, rankIdx) => {
          // board matrix is 0-7 from Rank 8 to Rank 1
          const originalRankIdx = ranks.indexOf(rank);
          const boardRowIdx = 7 - originalRankIdx;

          return displayFiles.map((file, fileIdx) => {
            const originalFileIdx = files.indexOf(file);
            const squareName = `${file}${rank}`;
            const piece = board[boardRowIdx][originalFileIdx];
            const isOnlineGame = gameMode === 'online';
            const isSquareSelected = selectedSquare === squareName;
            const isPossibleMove = possibleMoves.includes(squareName);
            const isLastMoveFrom = isOnlineGame && lastMove && lastMove.from === squareName;
            const isLastMoveTo = isOnlineGame && lastMove && lastMove.to === squareName;
            const isCheckSquare = checkSquare === squareName;

            // Compute background color of the square
            const squareBaseColor = getSquareColor(originalFileIdx, originalRankIdx);

            return (
              <div
                id={`square-${squareName}`}
                key={squareName}
                className={`relative flex items-center justify-center cursor-pointer transition-all duration-150 ${squareBaseColor}`}
                onClick={() => handleSquareClick(squareName)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, squareName)}
              >
                {/* Last Move Origin Square Highlight */}
                {isLastMoveFrom && (
                  <div className="absolute inset-0 bg-amber-400/35 border-2 border-dashed border-amber-500/80 pointer-events-none flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/90 shadow-sm" />
                  </div>
                )}

                {/* Last Move Destination Square Highlight */}
                {isLastMoveTo && (
                  <div className="absolute inset-0 bg-amber-400/50 ring-2 ring-amber-400 ring-inset pointer-events-none">
                    <div className="absolute inset-0 border-2 border-amber-300 animate-ping opacity-60" />
                  </div>
                )}

                {/* Selected Square Highlight */}
                {isSquareSelected && (
                  <div className="absolute inset-0 bg-sky-500/30 ring-4 ring-sky-500/50 pointer-events-none" />
                )}

                {/* Check Highlight (red pulsing glow) */}
                {isCheckSquare && (
                  <div className="absolute inset-0 bg-rose-600/40 animate-pulse pointer-events-none ring-4 ring-rose-600 ring-inset" />
                )}

                {/* Chess Piece with Drag & Drop */}
                {piece && (
                  <div
                    id={`piece-${piece.color}${piece.type}`}
                    draggable={gameStatus === 'active'}
                    onDragStart={(e) => handleDragStart(e, squareName)}
                    className="w-[85%] h-[85%] flex items-center justify-center transition-transform active:scale-105 duration-200 z-10 select-none cursor-grab active:cursor-grabbing"
                  >
                    <PieceSvg type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Legal Move Indicators */}
                {isPossibleMove && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    {piece ? (
                      // Captured Indicator (Ring around square)
                      <div className="legal-move-ring border-emerald-500/60" />
                    ) : (
                      // Dot indicator
                      <div className="legal-move-dot bg-emerald-500/60" />
                    )}
                  </div>
                )}

                {/* Chess Coordinates Labels (Rank coordinates on leftmost files, file coordinates on bottom ranks) */}
                {settings.coordinateLabels && (
                  <>
                    {/* Rank label (1-8) - rendered on the first file visible */}
                    {fileIdx === 0 && (
                      <span className="absolute top-1 left-1.5 text-[10px] font-bold opacity-80 pointer-events-none">
                        {rank}
                      </span>
                    )}
                    {/* File label (A-H) - rendered on the bottom-most rank visible */}
                    {rankIdx === 7 && (
                      <span className="absolute bottom-1 right-1.5 text-[10px] font-bold opacity-80 pointer-events-none uppercase">
                        {file}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          });
        })}
      </div>

      {/* SVG Directional Arrow Overlay for Last Move (Online games only) */}
      {gameMode === 'online' && lastMove && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
          <defs>
            <marker
              id="last-move-arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#f59e0b" />
            </marker>
          </defs>
          {(() => {
            const fromFileIdx = displayFiles.indexOf(lastMove.from[0]);
            const fromRankIdx = displayRanks.indexOf(lastMove.from[1]);
            const toFileIdx = displayFiles.indexOf(lastMove.to[0]);
            const toRankIdx = displayRanks.indexOf(lastMove.to[1]);

            if (fromFileIdx === -1 || fromRankIdx === -1 || toFileIdx === -1 || toRankIdx === -1) return null;

            const x1 = (fromFileIdx + 0.5) * 12.5;
            const y1 = (fromRankIdx + 0.5) * 12.5;
            const x2 = (toFileIdx + 0.5) * 12.5;
            const y2 = (toRankIdx + 0.5) * 12.5;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) return null;

            const offset = 3.5;
            const endX = x2 - (dx / dist) * offset;
            const endY = y2 - (dy / dist) * offset;
            const startX = x1 + (dx / dist) * (offset * 0.5);
            const startY = y1 + (dy / dist) * (offset * 0.5);

            return (
              <g>
                {/* Glow underlay line */}
                <line
                  x1={`${startX}%`}
                  y1={`${startY}%`}
                  x2={`${endX}%`}
                  y2={`${endY}%`}
                  stroke="#fbbf24"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.35"
                />
                {/* Crisp directional line with arrowhead */}
                <line
                  x1={`${startX}%`}
                  y1={`${startY}%`}
                  x2={`${endX}%`}
                  y2={`${endY}%`}
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="6,3"
                  markerEnd="url(#last-move-arrowhead)"
                  opacity="0.95"
                />
              </g>
            );
          })()}
        </svg>
      )}

      {/* Promotion Dialog (MD3 modal overlay) */}
      {promotingMove && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-[90%] shadow-2xl text-center">
            <h3 className="text-lg font-medium text-neutral-100 mb-1">{getTranslation(language, 'pawnPromotion')}</h3>
            <p className="text-xs text-neutral-400 mb-4">{getTranslation(language, 'choosePromoPiece')}</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { type: 'q', name: getTranslation(language, 'queen') },
                { type: 'r', name: getTranslation(language, 'rook') },
                { type: 'b', name: getTranslation(language, 'bishop') },
                { type: 'n', name: getTranslation(language, 'knight') },
              ].map((promo) => (
                <button
                  id={`promo-select-${promo.type}`}
                  key={promo.type}
                  onClick={() => handlePromotionSelect(promo.type)}
                  className="flex flex-col items-center justify-center p-3 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl transition duration-150 group border border-neutral-700/50 cursor-pointer"
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-110 transition duration-150">
                    <PieceSvg type={promo.type} color={turn} />
                  </div>
                  <span className="text-[10px] font-medium text-neutral-300">{promo.name}</span>
                </button>
              ))}
            </div>
            <button
              id="cancel-promotion"
              onClick={() => setPromotingMove(null)}
              className="mt-5 w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium transition cursor-pointer"
            >
              {getTranslation(language, 'cancel')}
            </button>
          </div>
        </div>
      )}

      {/* End Game Overlay Dialog (If not active) */}
      {gameStatus !== 'active' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-40 animate-fade-in p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center scale-95 animate-scale-up">
            {/* Victory Badge */}
            <div className="mx-auto w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-4 text-emerald-500">
              <span className="material-symbols-outlined text-4xl">
                {winner === 'draw' ? 'handshake' : 'workspace_premium'}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-neutral-100 mb-1">
              {winner === 'draw'
                ? getTranslation(language, 'drawGame')
                : winner === 'white'
                ? getTranslation(language, 'whiteWinsTitle')
                : winner === 'black'
                ? getTranslation(language, 'blackWinsTitle')
                : getTranslation(language, 'gameOverTitle')}
            </h2>
            <p className="text-sm text-neutral-400 capitalize mb-6">{reason}</p>

            <div className="flex flex-col gap-2.5">
              <button
                id="endgame-rematch"
                onClick={onRematch}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">replay</span>
                {getTranslation(language, 'playAgain')}
              </button>
              
              <button
                id="endgame-home"
                onClick={onReturnHome}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">home</span>
                {getTranslation(language, 'returnToLobby')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
