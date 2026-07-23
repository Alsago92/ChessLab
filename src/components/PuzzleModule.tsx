import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'motion/react';
import { ChessSettings } from '../types';
import { PieceSvg } from './PieceSvg';
import { REAL_PUZZLES, PUZZLE_THEMES, Puzzle } from '../data/puzzlesData';
import { getTranslation } from '../utils/translations';
import { getCookie, setCookie } from '../utils/cookies';

interface PuzzleModuleProps {
  settings: ChessSettings;
  language: string;
  onReturnToModes: () => void;
  onUpdateUserStats?: (newRating: number, solvedCount: number) => void;
}

export const PuzzleModule: React.FC<PuzzleModuleProps> = ({
  settings,
  language,
  onReturnToModes,
  onUpdateUserStats,
}) => {
  // Persistence state for user puzzle performance
  const [userPuzzleRating, setUserPuzzleRating] = useState<number>(() => {
    const saved = getCookie<number>('chess_puzzle_rating');
    return saved ? Number(saved) : 1350;
  });

  const [solvedPuzzleIds, setSolvedPuzzleIds] = useState<string[]>(() => {
    const saved = getCookie<string[]>('chess_solved_puzzles');
    return saved || [];
  });

  const [currentStreak, setCurrentStreak] = useState<number>(() => {
    const saved = getCookie<number>('chess_puzzle_streak');
    return saved ? Number(saved) : 0;
  });

  // Category & Filter state
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Active Puzzle state
  const [filteredPuzzles, setFilteredPuzzles] = useState<Puzzle[]>(REAL_PUZZLES);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const activePuzzle: Puzzle = filteredPuzzles[currentPuzzleIndex] || REAL_PUZZLES[0];

  // Chess Game instance for current puzzle
  const chessRef = useRef<Chess>(new Chess());
  const [board, setBoard] = useState<any[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [moveStepIndex, setMoveStepIndex] = useState<number>(0);

  // Status & Guidance state
  const [puzzleState, setPuzzleState] = useState<'playing' | 'success' | 'failed' | 'showing_solution'>('playing');
  const [hintLevel, setHintLevel] = useState<number>(0); // 0: none, 1: key squares, 2: text clue, 3: solution
  const [highlightSquares, setHighlightSquares] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [earnedElo, setEarnedElo] = useState<number>(0);
  const [showConceptGuide, setShowConceptGuide] = useState<boolean>(true);

  // Filter puzzles when theme or difficulty changes
  useEffect(() => {
    let list = REAL_PUZZLES;
    if (selectedTheme !== 'all') {
      list = list.filter((p) => p.theme === selectedTheme);
    }
    if (selectedDifficulty !== 'all') {
      list = list.filter((p) => p.difficulty === selectedDifficulty);
    }
    if (list.length === 0) {
      list = REAL_PUZZLES;
    }
    setFilteredPuzzles(list);
    setCurrentPuzzleIndex(0);
  }, [selectedTheme, selectedDifficulty]);

  // Load active puzzle into chess instance
  const loadPuzzle = (puzzle: Puzzle) => {
    if (!puzzle) return;
    const chess = new Chess(puzzle.fen);
    chessRef.current = chess;
    setBoard(chess.board());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setMoveStepIndex(0);
    setPuzzleState('playing');
    setHintLevel(0);
    setHighlightSquares([]);
    setFeedbackMessage(null);
    setEarnedElo(0);
  };

  useEffect(() => {
    loadPuzzle(activePuzzle);
  }, [activePuzzle]);

  // Board square selection & move logic
  const handleSquareClick = (square: string) => {
    if (puzzleState !== 'playing') return;

    const chess = chessRef.current;
    const turn = chess.turn();

    // Ensure it's the player's turn according to puzzle sideToMove
    if (turn !== activePuzzle.sideToMove) return;

    if (selectedSquare === null) {
      const piece = chess.get(square as any);
      if (piece && piece.color === turn) {
        setSelectedSquare(square);
        const moves = chess.moves({ square: square as any, verbose: true });
        setPossibleMoves(moves.map((m) => m.to));
      }
    } else {
      // If clicking same square, deselect
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // If clicking another friendly piece, reselect
      const pieceOnTarget = chess.get(square as any);
      if (pieceOnTarget && pieceOnTarget.color === turn) {
        setSelectedSquare(square);
        const moves = chess.moves({ square: square as any, verbose: true });
        setPossibleMoves(moves.map((m) => m.to));
        return;
      }

      // Attempt move
      executePlayerMove(selectedSquare, square);
    }
  };

  const executePlayerMove = (from: string, to: string) => {
    const chess = chessRef.current;
    const expectedPlayerMove = activePuzzle.moves[moveStepIndex];

    if (!expectedPlayerMove) return;

    // Check if move matches expected solution
    const isCorrectFromTo = from === expectedPlayerMove.from && to === expectedPlayerMove.to;

    // Attempt legal move in chess.js
    try {
      const moveResult = chess.move({ from, to, promotion: expectedPlayerMove.promotion || 'q' });
      if (!moveResult) {
        // Illegal move according to chess rules
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      setBoard(chess.board());
      setLastMove({ from, to });
      setSelectedSquare(null);
      setPossibleMoves([]);

      if (isCorrectFromTo) {
        // Correct Move!
        const nextStepIndex = moveStepIndex + 1;

        if (nextStepIndex >= activePuzzle.moves.length) {
          // Puzzle Solved Successfully!
          handlePuzzleSuccess();
        } else {
          // Multi-step puzzle: play opponent response after short delay
          setMoveStepIndex(nextStepIndex);
          setFeedbackMessage({
            type: 'success',
            text: language === 'es' ? '¡Excelente jugada! Sigue así...' : 'Great move! Keep going...',
          });

          setTimeout(() => {
            const opponentMove = activePuzzle.opponentResponses?.[moveStepIndex];
            if (opponentMove) {
              chess.move({ from: opponentMove.from, to: opponentMove.to, promotion: opponentMove.promotion || 'q' });
              setBoard(chess.board());
              setLastMove({ from: opponentMove.from, to: opponentMove.to });
            }
          }, 600);
        }
      } else {
        // Incorrect Move!
        setFeedbackMessage({
          type: 'error',
          text: language === 'es' ? 'Jugada incorrecta. ¡Inténtalo de nuevo!' : 'Incorrect move. Try again!',
        });

        // Reset position after brief delay so player can retry
        setTimeout(() => {
          chess.undo();
          setBoard(chess.board());
          setLastMove(null);
        }, 900);
      }
    } catch (e) {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  // Handle puzzle success rewards
  const handlePuzzleSuccess = () => {
    setPuzzleState('success');
    
    // Calculate ELO gain based on hints used (base 20 - 5 per hint)
    const eloGain = Math.max(8, 22 - hintLevel * 5);
    setEarnedElo(eloGain);

    const newRating = userPuzzleRating + eloGain;
    const newStreak = currentStreak + 1;
    const updatedSolved = solvedPuzzleIds.includes(activePuzzle.id)
      ? solvedPuzzleIds
      : [...solvedPuzzleIds, activePuzzle.id];

    setUserPuzzleRating(newRating);
    setCurrentStreak(newStreak);
    setSolvedPuzzleIds(updatedSolved);

    // Save to cookies
    setCookie('chess_puzzle_rating', newRating);
    setCookie('chess_puzzle_streak', newStreak);
    setCookie('chess_solved_puzzles', updatedSolved);

    if (onUpdateUserStats) {
      onUpdateUserStats(newRating, updatedSolved.length);
    }

    setFeedbackMessage({
      type: 'success',
      text: language === 'es' ? `¡Puzzle completado! +${eloGain} ELO` : `Puzzle solved! +${eloGain} ELO`,
    });
  };

  // Hint handling
  const handleRequestHint = () => {
    if (hintLevel === 0) {
      setHintLevel(1);
      if (activePuzzle.hints.targetSquares) {
        setHighlightSquares(activePuzzle.hints.targetSquares);
      }
    } else if (hintLevel === 1) {
      setHintLevel(2);
    } else {
      setHintLevel(3);
      setPuzzleState('showing_solution');
      setHighlightSquares(activePuzzle.hints.targetSquares || []);
    }
  };

  // Reset current puzzle
  const handleRetry = () => {
    loadPuzzle(activePuzzle);
  };

  // Move to next puzzle
  const handleNextPuzzle = () => {
    const nextIndex = (currentPuzzleIndex + 1) % filteredPuzzles.length;
    setCurrentPuzzleIndex(nextIndex);
  };

  // Board themes definition
  const boardThemes = {
    emerald: { light: 'bg-[#eeeed2]', dark: 'bg-[#769656]', textLight: 'text-[#769656]', textDark: 'text-[#eeeed2]' },
    wood: { light: 'bg-[#f0d9b5]', dark: 'bg-[#b58863]', textLight: 'text-[#b58863]', textDark: 'text-[#f0d9b5]' },
    classic: { light: 'bg-[#e2e8f0]', dark: 'bg-[#64748b]', textLight: 'text-[#64748b]', textDark: 'text-[#e2e8f0]' },
    dark: { light: 'bg-[#334155]', dark: 'bg-[#0f172a]', textLight: 'text-[#0f172a]', textDark: 'text-[#334155]' },
  };

  const activeBoardTheme = boardThemes[settings.boardTheme] || boardThemes.emerald;
  const isFlipped = activePuzzle.sideToMove === 'b';

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const displayFiles = isFlipped ? [...files].reverse() : files;
  const displayRanks = isFlipped ? ranks : [...ranks].reverse();

  // Active Theme Concept Info
  const activeThemeMeta = PUZZLE_THEMES.find((t) => t.id === activePuzzle.theme);

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none pb-12">
      {/* Top Header & Stats Dashboard */}
      <div className={`p-5 rounded-2xl border transition-colors duration-300 shadow-md flex flex-wrap items-center justify-between gap-4 ${
        settings.isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToModes}
            className="p-2 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 rounded-xl transition cursor-pointer flex items-center justify-center"
            title={language === 'es' ? 'Volver a Modos' : 'Return to Modes'}
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-2xl">extension</span>
              <h2 className="text-xl font-black tracking-tight">
                {language === 'es' ? 'Puzzles Tácticos Guiados' : 'Guided Tactical Puzzles'}
              </h2>
            </div>
            <p className="text-xs text-neutral-400 font-medium">
              {language === 'es'
                ? 'Resuelve posiciones de Grandes Maestros y domina los patrones del ajedrez.'
                : 'Solve real grandmaster positions and master essential tactical patterns.'}
            </p>
          </div>
        </div>

        {/* User Tactical ELO & Streak Badges */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-xl">bolt</span>
            <div>
              <p className="text-[10px] uppercase font-bold text-neutral-400">Tactical Rating</p>
              <p className="text-base font-black text-amber-400 leading-tight">{userPuzzleRating} ELO</p>
            </div>
          </div>

          <div className="px-4 py-2 bg-gradient-to-r from-rose-500/10 to-red-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5">
            <span className="material-symbols-outlined text-rose-400 text-xl">local_fire_department</span>
            <div>
              <p className="text-[10px] uppercase font-bold text-neutral-400">{language === 'es' ? 'Racha' : 'Streak'}</p>
              <p className="text-base font-black text-rose-400 leading-tight">{currentStreak} 🔥</p>
            </div>
          </div>

          <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-400 text-xl">task_alt</span>
            <div>
              <p className="text-[10px] uppercase font-bold text-neutral-400">{language === 'es' ? 'Resueltos' : 'Solved'}</p>
              <p className="text-base font-black text-blue-400 leading-tight">{solvedPuzzleIds.length} / {REAL_PUZZLES.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Filter Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PUZZLE_THEMES.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : settings.isDarkMode
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <span className="material-symbols-outlined text-base leading-none">{theme.icon}</span>
              <span>{language === 'es' ? theme.name.es : theme.name.en}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid Layout: Left Chessboard | Right Coach Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Board Column (Col: 7) */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-4">
          {/* Side to Move Alert Banner */}
          <div className={`w-full max-w-lg p-3 rounded-xl border flex items-center justify-between font-bold text-xs shadow-sm transition ${
            activePuzzle.sideToMove === 'w'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-slate-700/30 border-slate-600/40 text-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full border ${activePuzzle.sideToMove === 'w' ? 'bg-white border-neutral-400' : 'bg-neutral-900 border-neutral-600'}`} />
              <span>
                {activePuzzle.sideToMove === 'w'
                  ? (language === 'es' ? 'Mueven Blancas y ganan ventaja' : 'White to Move and win')
                  : (language === 'es' ? 'Mueven Negras y ganan ventaja' : 'Black to Move and win')}
              </span>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-semibold uppercase tracking-wider">
              {activePuzzle.difficulty} ({activePuzzle.rating})
            </span>
          </div>

          {/* Interactive Chess Board Container */}
          <div className={`relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden border-4 transition-all duration-300 shadow-2xl ${
            puzzleState === 'success'
              ? 'border-emerald-500 shadow-emerald-500/20'
              : puzzleState === 'failed'
              ? 'border-rose-500 shadow-rose-500/20'
              : settings.isDarkMode
              ? 'border-neutral-800'
              : 'border-neutral-300'
          }`}>
            <div className="w-full h-full grid grid-cols-8 grid-rows-8">
              {displayRanks.map((rank, rowIndex) =>
                displayFiles.map((file, colIndex) => {
                  const square = `${file}${rank}`;
                  const fileIdx = files.indexOf(file);
                  const rankIdx = ranks.indexOf(rank);

                  // Extract piece from 8x8 board representation
                  const piece = board[7 - rankIdx] ? board[7 - rankIdx][fileIdx] : null;

                  const isDarkSquare = (fileIdx + rankIdx) % 2 === 0;
                  const isSelected = selectedSquare === square;
                  const isPossibleMove = possibleMoves.includes(square);
                  const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
                  const isHighlightedTarget = highlightSquares.includes(square);

                  return (
                    <div
                      key={square}
                      onClick={() => handleSquareClick(square)}
                      className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 select-none ${
                        isDarkSquare ? activeBoardTheme.dark : activeBoardTheme.light
                      }`}
                    >
                      {/* Highlight last move */}
                      {isLastMoveSquare && (
                        <div className="absolute inset-0 bg-yellow-400/35 pointer-events-none" />
                      )}

                      {/* Highlight selected square */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/40 ring-2 ring-blue-400 pointer-events-none" />
                      )}

                      {/* Highlight target squares for Hint 1 */}
                      {isHighlightedTarget && (
                        <div className="absolute inset-0 bg-cyan-400/30 ring-2 ring-cyan-300 animate-pulse pointer-events-none" />
                      )}

                      {/* Render Piece SVG */}
                      {piece && (
                        <div className="relative z-10 w-4/5 h-4/5 transition-transform duration-150 active:scale-90">
                          <PieceSvg
                            type={piece.type}
                            color={piece.color}
                            pieceTheme={settings.pieceTheme}
                          />
                        </div>
                      )}

                      {/* Legal Move Indicators */}
                      {isPossibleMove && (
                        <div
                          className={`absolute z-20 rounded-full ${
                            piece ? 'inset-0 border-4 border-emerald-400/80' : 'w-3.5 h-3.5 bg-emerald-500/80'
                          }`}
                        />
                      )}

                      {/* Rank & File Coordinate Labels */}
                      {settings.coordinateLabels && (
                        <>
                          {colIndex === 0 && (
                            <span
                              className={`absolute top-0.5 left-1 text-[10px] font-bold pointer-events-none ${
                                isDarkSquare ? activeBoardTheme.textDark : activeBoardTheme.textLight
                              }`}
                            >
                              {rank}
                            </span>
                          )}
                          {rowIndex === 7 && (
                            <span
                              className={`absolute bottom-0.5 right-1 text-[10px] font-bold pointer-events-none ${
                                isDarkSquare ? activeBoardTheme.textDark : activeBoardTheme.textLight
                              }`}
                            >
                              {file}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Feedback & Toast Messages */}
          <AnimatePresence mode="wait">
            {feedbackMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`w-full max-w-lg p-3 rounded-xl border text-xs font-bold flex items-center justify-between shadow-lg ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : feedbackMessage.type === 'error'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    {feedbackMessage.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  <span>{feedbackMessage.text}</span>
                </div>
                {puzzleState === 'success' && (
                  <button
                    onClick={handleNextPuzzle}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {language === 'es' ? 'Siguiente Puzzle →' : 'Next Puzzle →'}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Guided Tactical Coach Dashboard (Col: 5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Puzzle Info Card */}
          <div className={`p-5 rounded-2xl border transition-colors duration-300 shadow-md space-y-4 ${
            settings.isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                    {language === 'es' ? activePuzzle.themeName.es : activePuzzle.themeName.en}
                  </span>
                  <span className="text-xs font-bold text-neutral-400">#{activePuzzle.id}</span>
                </div>
                <h3 className="text-lg font-black mt-1">
                  {language === 'es' ? activePuzzle.title.es : activePuzzle.title.en}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-amber-400">{activePuzzle.rating} ELO</span>
              </div>
            </div>

            {/* Objective Banner */}
            <div className="p-3.5 bg-neutral-800/60 border border-neutral-700/60 rounded-xl text-xs font-semibold text-neutral-200 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-amber-400 text-lg">flag</span>
              <span>{language === 'es' ? activePuzzle.objective.es : activePuzzle.objective.en}</span>
            </div>

            {/* Guided Concept Explainer Box */}
            {activeThemeMeta && (
              <div className="border border-blue-500/30 bg-blue-500/5 rounded-xl p-3.5 space-y-1.5">
                <button
                  onClick={() => setShowConceptGuide(!showConceptGuide)}
                  className="w-full flex items-center justify-between text-xs font-bold text-blue-400 hover:text-blue-300 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">school</span>
                    <span>
                      {language === 'es'
                        ? `Aprende el Patrón: ${activeThemeMeta.name.es}`
                        : `Pattern Concept: ${activeThemeMeta.name.en}`}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-sm">
                    {showConceptGuide ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {showConceptGuide && (
                  <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                    {language === 'es' ? activeThemeMeta.description.es : activeThemeMeta.description.en}
                  </p>
                )}
              </div>
            )}

            {/* Hint System & Assistance Controls */}
            <div className="space-y-2.5 pt-2">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                {language === 'es' ? 'Asistencia Guiada' : 'Guided Assistance'}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleRequestHint}
                  disabled={hintLevel >= 3 || puzzleState === 'success'}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                    hintLevel > 0
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">lightbulb</span>
                  <span>
                    {hintLevel === 0
                      ? (language === 'es' ? 'Pista 1: Casillas' : 'Hint 1: Squares')
                      : hintLevel === 1
                      ? (language === 'es' ? 'Pista 2: Clave' : 'Hint 2: Clue')
                      : (language === 'es' ? 'Ver Solución' : 'Show Solution')}
                  </span>
                </button>

                <button
                  onClick={handleRetry}
                  className="px-3 py-2.5 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">restart_alt</span>
                  <span>{language === 'es' ? 'Reiniciar' : 'Reset'}</span>
                </button>
              </div>

              {/* Display Text Hints */}
              {hintLevel >= 2 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                    <span>{language === 'es' ? 'Pista Táctica:' : 'Tactical Clue:'}</span>
                  </p>
                  <p>{language === 'es' ? activePuzzle.hints.hint2.es : activePuzzle.hints.hint2.en}</p>
                </div>
              )}

              {/* Display Solution Text */}
              {hintLevel >= 3 && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">auto_stories</span>
                    <span>{language === 'es' ? 'Solución Oficial:' : 'Official Solution:'}</span>
                  </p>
                  <p>{language === 'es' ? activePuzzle.hints.solutionText.es : activePuzzle.hints.solutionText.en}</p>
                </div>
              )}
            </div>

            {/* Explanation Breakdown after solving or showing solution */}
            {(puzzleState === 'success' || hintLevel >= 3) && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                <p className="font-black text-emerald-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">psychology</span>
                  <span>{language === 'es' ? 'Análisis de la Táctica:' : 'Tactical Analysis:'}</span>
                </p>
                <p className="text-neutral-200 leading-relaxed">
                  {language === 'es' ? activePuzzle.explanation.es : activePuzzle.explanation.en}
                </p>
              </div>
            )}
          </div>

          {/* Next / Navigation Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                const prevIndex = (currentPuzzleIndex - 1 + filteredPuzzles.length) % filteredPuzzles.length;
                setCurrentPuzzleIndex(prevIndex);
              }}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>{language === 'es' ? 'Anterior' : 'Previous'}</span>
            </button>

            <button
              onClick={handleNextPuzzle}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <span>{language === 'es' ? 'Siguiente Puzzle' : 'Next Puzzle'}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
