/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { getCookie, setCookie } from './utils/cookies';
import {
  BoardTheme,
  PieceTheme,
  GameMode,
  AppScreen,
  Player,
  MoveHistoryItem,
  CapturedPieces,
  PlayerStats,
  LobbyOpponent,
  ChessSettings,
  EngineAnalysis,
  ChatMessage,
} from './types';
import { TopNavBar } from './components/TopNavBar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { ChessBoard } from './components/ChessBoard';
import { BottomToolbar } from './components/BottomToolbar';
import { GameModesScreen } from './components/GameModesScreen';
import { PlayerProfileScreen } from './components/PlayerProfileScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { PieceGuideModal } from './components/PieceGuideModal';

// Custom lightweight sound synthesiser using Web Audio API
const playChessSound = (type: 'move' | 'capture' | 'check' | 'gameover', allowed: boolean) => {
  if (!allowed || typeof window === 'undefined' || !window.AudioContext) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'move') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'capture') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'check') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.setValueAtTime(280, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'gameover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(190, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    console.warn('Web Audio Context not ready/supported:', e);
  }
};

// Standard static mini-dictionary for Opening Names explorer
const getOpeningNameFromPGN = (pgn: string): string => {
  const norm = pgn.toLowerCase().trim();
  if (norm.startsWith('e4 c5')) return 'Sicilian Defense';
  if (norm.startsWith('e4 e5 nf3 nc6 bb5')) return 'Ruy Lopez Opening';
  if (norm.startsWith('d4 d5 c4')) return "Queen's Gambit";
  if (norm.startsWith('e4 e6')) return 'French Defense';
  if (norm.startsWith('e4 e5 nf3 nc6 bc4')) return 'Italian Game';
  if (norm.startsWith('e4 c6')) return 'Caro-Kann Defense';
  if (norm.startsWith('d4 nf6 c4 g6')) return "King's Indian Defense";
  if (norm.startsWith('nf3 d5')) return 'Réti Opening';
  if (norm.startsWith('e4 d5')) return 'Scandinavian Defense';
  if (norm.startsWith('d4 nf6 c4 e6 nf3 d5')) return 'Queen\'s Gambit Declined';
  if (norm.startsWith('e4 d6 d4 nf6 nc3 g6')) return 'Pirc Defense';
  if (norm.startsWith('e4 e5 nf3 nf6')) return "Petrov's Defense";
  if (norm.startsWith('e4 e5 nf3 nc6 d4')) return 'Scotch Game';
  if (norm.startsWith('e4 g6 d4 bg7')) return 'Modern Defense';
  if (norm.startsWith('d4 d5')) return 'Closed Game';
  if (norm.startsWith('e4 e5')) return 'Open Game';
  if (norm.startsWith('d4')) return 'Queen\'s Pawn Opening';
  if (norm.startsWith('e4')) return 'King\'s Pawn Opening';
  if (norm.startsWith('c4')) return 'English Opening';
  if (norm.startsWith('f4')) return 'Bird\'s Opening';
  return 'Standard Theory';
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('modes');
  const [previousScreen, setPreviousScreen] = useState<AppScreen>('modes');

  const changeScreen = (newScreen: AppScreen) => {
    if (currentScreen !== 'settings') {
      setPreviousScreen(currentScreen);
    }
    setCurrentScreen(newScreen);
  };

  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('online');

  // Loaders for chess game
  const chessRef = useRef<Chess>(new Chess());
  const [board, setBoard] = useState<any[][]>(chessRef.current.board());
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [checkSquare, setCheckSquare] = useState<string | null>(null);

  // Undo/Redo stacks for chess movements
  const [historyStack, setHistoryStack] = useState<MoveHistoryItem[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]); // holds undo'd FEN entries

  // Game configuration
  const [gameMode, setGameMode] = useState<GameMode>('local');
  
  // Real-time WebSocket matchmaking state definitions
  const wsRef = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'waiting' | 'connected'>('disconnected');
  const [wsError, setWsError] = useState<string | null>(null);
  const [wsActiveGameId, setWsActiveGameId] = useState<string | null>(null);
  const [onlinePlayerColor, setOnlinePlayerColor] = useState<'w' | 'b' | null>(null);
  const [wsOpponentNickname, setWsOpponentNickname] = useState<string>('');
  const [inGameDrawOffered, setInGameDrawOffered] = useState<boolean>(false);
  const [inGameRematchOffered, setInGameRematchOffered] = useState<boolean>(false);

  const [gameStatus, setGameStatus] = useState<'active' | 'checkmate' | 'stalemate' | 'draw' | 'resigned' | 'timeout'>('active');
  const [winner, setWinner] = useState<'white' | 'black' | 'draw' | null>(null);
  const [endReason, setEndReason] = useState<string>('');
  const [openingName, setOpeningName] = useState<string>('Standard Theory');

  // Timers
  const [whiteTime, setWhiteTime] = useState<number>(600); // 10 minutes rapid by default
  const [blackTime, setBlackTime] = useState<number>(600);
  const [activeTurn, setActiveTurn] = useState<'w' | 'b'>('w');

  // Flips
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Current Reviewed Move Index in moveHistory list (-1 for real-time live position)
  const [activeMoveIndex, setActiveMoveIndex] = useState<number>(-1);

  // Engine Status
  const [isEngineThinking, setIsEngineThinking] = useState<boolean>(false);

  // Guide Modal
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<ChessSettings>(() => {
    const saved = getCookie<ChessSettings>('chess_settings');
    return saved || {
      boardTheme: 'emerald',
      pieceTheme: 'modern',
      animationSpeed: 'normal',
      soundEffects: true,
      showLegalMoves: true,
      highlightLastMove: true,
      autoQueenPromotion: false,
      coordinateLabels: true,
      isDarkMode: true,
      language: 'en',
    };
  });

  // Player configurations
  const [userProfile, setUserProfile] = useState<{ name: string; avatar: string }>(() => {
    const saved = getCookie<{ name: string; avatar: string }>('chess_user_profile');
    return saved || {
      name: 'Alsago',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    };
  });

  // Simulated Player stats
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    const saved = getCookie<PlayerStats>('chess_player_stats');
    return saved || {
      gamesPlayed: 148,
      wins: 82,
      losses: 48,
      draws: 18,
      currentRating: 1550,
      highestRating: 1580,
      winPercentage: 55,
      favoriteOpening: 'Sicilian Defense',
      achievements: [
        { id: 'first_win', title: 'First Blood', desc: 'Defeated your first online opponent.', icon: 'swords', unlockedAt: '12 Apr 2026' },
        { id: 'tactician', title: 'Tactical Genius', desc: 'Solved 50 puzzles successfully.', icon: 'extension', unlockedAt: '18 May 2026' },
        { id: 'opening_master', title: 'Opening Bookworm', desc: 'Played 20 perfect opening lines.', icon: 'menu_book', unlockedAt: '03 Jul 2026' },
        { id: 'grandmaster', title: 'Giant Slayer', desc: 'Defeated a Master level AI bot.', icon: 'workspace_premium' },
      ],
    };
  });

  // Elevated AI Difficulty state (1-6)
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(() => {
    const saved = getCookie<number>('chess_ai_difficulty');
    return saved !== null ? Number(saved) : 3;
  });

  const [whitePlayer, setWhitePlayer] = useState<Player>(() => {
    const savedStats = getCookie<PlayerStats>('chess_player_stats');
    const savedProfile = getCookie<{ name: string; avatar: string }>('chess_user_profile');
    return {
      name: savedProfile?.name || 'Alsago',
      rating: savedStats?.currentRating || 1550,
      avatar: savedProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    };
  });

  const [blackPlayer, setBlackPlayer] = useState<Player>({
    name: 'Guest Player',
    rating: 1520,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
  });

  // Simulated live lobby opponents
  const [onlineLobby, setOnlineLobby] = useState<LobbyOpponent[]>([
    { id: 'lobby1', name: 'GrandmasterBot_99', rating: 2450, timeControl: '3+2 Blitz', ping: 14, avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100' },
    { id: 'lobby2', name: 'Nakamura_Fanboy', rating: 1780, timeControl: '1+0 Bullet', ping: 42, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' },
    { id: 'lobby3', name: 'Eleni_Chess', rating: 1620, timeControl: '5+3 Blitz', ping: 28, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
    { id: 'lobby4', name: 'RookAndRoll', rating: 1410, timeControl: '10+0 Rapid', ping: 56, avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100' },
  ]);

  // Engine analysis simulation
  const [engineAnalysis, setEngineAnalysis] = useState<EngineAnalysis>({
    evalScore: 0.0,
    bestContinuation: [],
    moveAccuracy: 'good',
    suggestedMoves: [],
    threats: [],
  });

  // Chat/Coach Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'welcome', sender: 'Coach AI', text: 'Welcome to the Chess Academy! I am your AI grandmaster coach. Move any piece and I will evaluate your tactics in real-time.', timestamp: '19:20' },
  ]);

  // Game Loop interval for timers
  useEffect(() => {
    let timer: any;
    if (gameStatus === 'active' && activeMoveIndex === -1) {
      timer = setInterval(() => {
        if (activeTurn === 'w') {
          setWhiteTime((prev) => {
            if (prev <= 1) {
              handleTimeout('black');
              return 0;
            }
            return prev - 1;
          });
        } else {
          setBlackTime((prev) => {
            if (prev <= 1) {
              handleTimeout('white');
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStatus, activeTurn, activeMoveIndex]);

  // Periodic network latency fluctuation for realism
  useEffect(() => {
    const pingTimer = setInterval(() => {
      setOnlineLobby((prev) =>
        prev.map((opponent) => ({
          ...opponent,
          ping: Math.max(8, Math.min(120, opponent.ping + Math.floor(Math.random() * 9) - 4)),
        }))
      );
    }, 4000);
    return () => clearInterval(pingTimer);
  }, []);

  // Synchronize state changes to cookies for persistence and update document element class
  useEffect(() => {
    setCookie('chess_settings', settings);
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [settings]);

  // Dynamic welcome message translation when language changes
  useEffect(() => {
    setChatMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === 'welcome') {
          return {
            ...msg,
            text: settings.language === 'es'
              ? '¡Bienvenido a la Academia de Ajedrez! Soy tu entrenador de IA y gran maestro. Mueve cualquier pieza y evaluaré tus tácticas en tiempo real.'
              : 'Welcome to the Chess Academy! I am your AI grandmaster coach. Move any piece and I will evaluate your tactics in real-time.',
          };
        }
        return msg;
      })
    );
  }, [settings.language]);

  useEffect(() => {
    setCookie('chess_user_profile', userProfile);
    // Keep whitePlayer's profile in sync
    setWhitePlayer((p) => ({ ...p, name: userProfile.name, avatar: userProfile.avatar }));
  }, [userProfile]);

  useEffect(() => {
    setCookie('chess_player_stats', playerStats);
  }, [playerStats]);

  useEffect(() => {
    setCookie('chess_ai_difficulty', selectedDifficulty);
  }, [selectedDifficulty]);

  // Record game results inside player stats and synchronize with cookies
  const recordGameResult = (result: 'win' | 'loss' | 'draw') => {
    if (gameMode === 'local') return; // Local PvP matches don't affect main player career stats

    setPlayerStats((prev) => {
      const wins = prev.wins + (result === 'win' ? 1 : 0);
      const losses = prev.losses + (result === 'loss' ? 1 : 0);
      const draws = prev.draws + (result === 'draw' ? 1 : 0);
      const gamesPlayed = prev.gamesPlayed + 1;
      
      // Calculate rating change based on result
      let ratingChange = 0;
      if (result === 'win') {
        ratingChange = 12 + Math.floor(Math.random() * 6); // +12 to +17
      } else if (result === 'loss') {
        ratingChange = -8 - Math.floor(Math.random() * 5); // -8 to -12
      } else {
        ratingChange = Math.random() > 0.5 ? 2 : -1; // minor draw adjust
      }

      const currentRating = Math.max(100, prev.currentRating + ratingChange);
      const highestRating = Math.max(prev.highestRating, currentRating);
      const winPercentage = Math.round((wins / gamesPlayed) * 100);

      // Keep whitePlayer's rating updated as well
      setWhitePlayer((p) => ({ ...p, rating: currentRating }));

      return {
        ...prev,
        gamesPlayed,
        wins,
        losses,
        draws,
        currentRating,
        highestRating,
        winPercentage,
      };
    });
  };

  const handleTimeout = (victor: 'white' | 'black') => {
    setGameStatus('timeout');
    setWinner(victor);
    setEndReason(settings.language === 'es' ? 'Derrota por tiempo (reloj agotado)' : 'Loss on time (clock expired)');
    playChessSound('gameover', settings.soundEffects);
    
    const winnerColor = victor === 'white' 
      ? (settings.language === 'es' ? 'las Blancas' : 'White') 
      : (settings.language === 'es' ? 'las Negras' : 'Black');
    
    addCoachMessage(settings.language === 'es' 
      ? `¡Fin de la partida! El tiempo se ha agotado. Ganan ${winnerColor}.` 
      : `Game over! ${victor === 'white' ? 'White' : 'Black'} won on time.`);
    recordGameResult(victor === 'white' ? 'win' : 'loss');
  };

  const addCoachMessage = (text: string, isSystem: boolean = false) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setChatMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: isSystem ? 'System' : 'Coach AI',
        text,
        timestamp: timeStr,
        isSystem,
      },
    ]);
  };

  // Safe chess engine state updates helper
  const updateEngineState = () => {
    const chess = chessRef.current;
    setBoard(chess.board());
    setTurn(chess.turn());
    
    // Check state details
    setCheckSquare(chess.inCheck() ? findKingSquare(chess.turn()) : null);

    // Compute game over details
    if (chess.isGameOver()) {
      let status: 'checkmate' | 'stalemate' | 'draw' = 'draw';
      let reason = 'Game Drawn';
      let gameWinner: 'white' | 'black' | 'draw' | null = null;

      if (chess.isCheckmate()) {
        status = 'checkmate';
        gameWinner = chess.turn() === 'w' ? 'black' : 'white';
        const winnerColor = gameWinner === 'white' 
          ? (settings.language === 'es' ? 'Blancas' : 'White') 
          : (settings.language === 'es' ? 'Negras' : 'Black');

        reason = settings.language === 'es' 
          ? `Jaque mate. ¡Victoria para las ${winnerColor}!` 
          : `Checkmate. Victory for ${gameWinner}!`;

        addCoachMessage(settings.language === 'es' 
          ? `¡Jaque mate! Estrategia magnífica. Ganador: ${winnerColor}.` 
          : `Checkmate! Magnificent strategy. Winner: ${gameWinner === 'white' ? 'White' : 'Black'}.`);
        recordGameResult(gameWinner === 'white' ? 'win' : 'loss');
      } else if (chess.isStalemate()) {
        status = 'stalemate';
        reason = settings.language === 'es' 
          ? 'Tablas por ahogado (el rey no está en jaque pero no tiene jugadas legales)' 
          : 'Draw by stalemate (the king is not in check but has no legal moves)';
        gameWinner = 'draw';
        addCoachMessage(settings.language === 'es' 
          ? '¡Tablas por ahogado! Recuerda: si tu oponente no tiene movimientos legales y su rey NO está en jaque, las reglas oficiales de la FIDE determinan tablas (empate) por ahogado, no una victoria. ¡Para ganar debes dar jaque mate!' 
          : 'Draw by stalemate! Remember: if your opponent has no legal moves left and their king is NOT in check, official FIDE chess rules determine it as a draw (stalemate), not a win. To win, you must deliver checkmate!');
        recordGameResult('draw');
      } else if (chess.isDraw()) {
        status = 'draw';
        reason = settings.language === 'es' 
          ? 'Tablas por acuerdo o material insuficiente' 
          : 'Draw by agreement or insufficient material';
        gameWinner = 'draw';
        addCoachMessage(settings.language === 'es' 
          ? 'La partida terminó en tablas.' 
          : 'Game ended in a draw.');
        recordGameResult('draw');
      }

      setGameStatus(status);
      setWinner(gameWinner);
      setEndReason(reason);
      playChessSound('gameover', settings.soundEffects);
    }
  };

  const findKingSquare = (color: 'w' | 'b'): string | null => {
    const boardMatrix = chessRef.current.board();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardMatrix[r][c];
        if (piece && piece.type === 'k' && piece.color === color) {
          const rank = 8 - r;
          const file = files[c];
          return `${file}${rank}`;
        }
      }
    }
    return null;
  };

  // Heuristic-based computer engine move logic
  // Selects best move based on: checks, captures, center development
  const triggerComputerMove = () => {
    if (gameStatus !== 'active') return;
    setIsEngineThinking(true);

    setTimeout(() => {
      const chess = chessRef.current;
      const moves = chess.moves({ verbose: true });

      if (moves.length === 0) {
        setIsEngineThinking(false);
        return;
      }

      // 1. Evaluate possible moves
      const evaluatedMoves = moves.map((move) => {
        let score = 0;

        // Capture priority
        if (move.captured) {
          const captureWeights: Record<string, number> = { p: 10, n: 30, b: 30, r: 50, q: 90 };
          score += (captureWeights[move.captured] || 10) * 10;
        }

        // Check incentive
        if (move.san.includes('+')) {
          score += 45;
        }

        // Center control (d4, d5, e4, e5 coordinates incentive)
        const centerFiles = ['d', 'e'];
        const centerRanks = ['4', '5'];
        if (centerFiles.includes(move.to[0]) && centerRanks.includes(move.to[1])) {
          score += 15;
        }

        // Promotion incentive
        if (move.promotion) {
          score += 80;
        }

        return { move, score };
      });

      // Sort by score and introduce occasional small random variability (based on difficulty!)
      evaluatedMoves.sort((a, b) => b.score - a.score);

      // Computer bot selection range based on ELO
      // Level 1: Random. Level 3: Medium. Level 6: Master (always best).
      let selectedIdx = 0;
      const difficultyLevel = blackPlayer.rating > 2000 ? 6 : blackPlayer.rating > 1400 ? 3 : 1;

      if (difficultyLevel === 1) {
        selectedIdx = Math.floor(Math.random() * moves.length);
      } else if (difficultyLevel === 3) {
        // Choose from top 3
        const range = Math.min(3, evaluatedMoves.length);
        selectedIdx = Math.floor(Math.random() * range);
      } else {
        selectedIdx = 0; // Absolute best
      }

      const bestChoice = evaluatedMoves[selectedIdx]?.move || moves[Math.floor(Math.random() * moves.length)];

      if (bestChoice) {
        // Execute move
        const moveRes = chess.move({
          from: bestChoice.from,
          to: bestChoice.to,
          promotion: bestChoice.promotion || 'q', // default queen promotion for AI
        });

        // Play haptic click
        playChessSound(bestChoice.captured ? 'capture' : 'move', settings.soundEffects);

        // Update history details
        const san = moveRes.san;
        const historyItem: MoveHistoryItem = {
          san,
          from: bestChoice.from,
          to: bestChoice.to,
          piece: bestChoice.piece,
          color: 'b',
          fenAfter: chess.fen(),
          moveNumber: Math.floor(historyStack.length / 2) + 1,
        };

        setHistoryStack((prev) => [...prev, historyItem]);
        setLastMove({ from: bestChoice.from, to: bestChoice.to });
        setRedoStack([]); // clear redo on new moves
        setActiveTurn('w');

        // Check if computer put user in check
        if (chess.inCheck()) {
          playChessSound('check', settings.soundEffects);
          addCoachMessage(settings.language === 'es' 
            ? '¡Ten cuidado! El ordenador ha puesto a tu rey en jaque.' 
            : 'Be careful! The computer has put your king in check!');
        }

        // Coach comments
        if (bestChoice.captured) {
          addCoachMessage(settings.language === 'es' 
            ? `¡El ordenador ha capturado tu ${bestChoice.captured.toUpperCase()}! Busca contraataques defensivos.` 
            : `The computer captured your ${bestChoice.captured.toUpperCase()}! Look for defensive counters.`);
        } else if (san.includes('#')) {
          addCoachMessage(settings.language === 'es' 
            ? 'Jaque mate. ¡Más suerte la próxima vez!' 
            : 'Checkmate. Better luck next time!');
        }

        updateEngineState();
        simulateEngineAnalysis(chess.fen(), 'b');
      }

      setIsEngineThinking(false);
    }, 700 + Math.random() * 500); // realistic think timer
  };

  // Run AI movement automatically when turn changes to Black and Game Mode is VS Computer
  useEffect(() => {
    if (gameMode === 'computer' && activeTurn === 'b' && gameStatus === 'active') {
      triggerComputerMove();
    }
  }, [activeTurn, gameMode, gameStatus]);

  // Helper to simulate Engine evaluation values
  const simulateEngineAnalysis = (fen: string, playerColor: 'w' | 'b') => {
    setIsEngineThinking(true);
    setTimeout(() => {
      // Calculate material balance
      let wScore = 0;
      let bScore = 0;
      const weights: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
      
      const currentBoard = chessRef.current.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = currentBoard[r][c];
          if (piece) {
            if (piece.color === 'w') wScore += weights[piece.type] || 0;
            else bScore += weights[piece.type] || 0;
          }
        }
      }

      const balance = wScore - bScore;
      // Inject slight random decimal for authenticity
      const score = balance + (Math.random() * 0.8 - 0.4);

      // Suggestions lines
      const moves = chessRef.current.moves();
      const bestLine = moves.slice(0, 3);

      const accuracies: EngineAnalysis['moveAccuracy'][] = ['best', 'excellent', 'good', 'book'];
      const accuracy = accuracies[Math.floor(Math.random() * accuracies.length)];

      setEngineAnalysis({
        evalScore: score,
        bestContinuation: bestLine,
        moveAccuracy: accuracy,
        suggestedMoves: bestLine.slice(0, 2),
        threats: ['f7 attack', 'backrank weakness'],
      });

      setIsEngineThinking(false);
    }, 400);
  };

  // Square select and legal move queries
  const handleSquareSelect = (square: string) => {
    if (gameStatus !== 'active') return;

    // Check who is the current player in live match or reviewed match
    if (activeMoveIndex !== -1) return; // disable during historic reviews

    const chess = chessRef.current;
    const piece = chess.get(square as any);

    // If online WebSocket mode, enforce piece color selection based on assigned color
    if (wsStatus === 'connected' && piece && piece.color !== onlinePlayerColor) {
      return;
    }

    if (piece && piece.color === turn) {
      setSelectedSquare(square);
      // Query moves
      const moves = chess.moves({ square: square as any, verbose: true });
      setPossibleMoves(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  // Execute actual user chess move
  const handleMove = (from: string, to: string, promotion: string = 'q') => {
    const chess = chessRef.current;

    // Enforce real-time turn constraint if connected online
    if (wsStatus === 'connected' && turn !== onlinePlayerColor) {
      addCoachMessage(settings.language === 'es'
        ? 'No es tu turno. Espera al oponente.'
        : 'It is not your turn. Wait for the opponent.');
      return;
    }

    try {
      const piece = chess.get(from as any);
      const isCapture = !!chess.get(to as any);

      // Execute in engine
      const moveResult = chess.move({
        from: from as any,
        to: to as any,
        promotion,
      });

      // Reset selection highlights
      setSelectedSquare(null);
      setPossibleMoves([]);

      // Propagate move via WebSocket if connected
      if (wsStatus === 'connected' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'make-move',
          gameId: wsActiveGameId,
          move: { from, to, promotion },
          fen: chess.fen(),
        }));
      }

      // Play matching haptic sounds
      playChessSound(isCapture ? 'capture' : 'move', settings.soundEffects);

      const san = moveResult.san;
      const moveCount = Math.floor(historyStack.length / 2) + 1;

      // Update PGN lookup history
      const historyItem: MoveHistoryItem = {
        san,
        from,
        to,
        piece: piece?.type || 'p',
        color: turn,
        fenAfter: chess.fen(),
        moveNumber: moveCount,
      };

      const updatedHistory = [...historyStack, historyItem];
      setHistoryStack(updatedHistory);
      setLastMove({ from, to });
      setRedoStack([]); // reset redos on new active moves

      // Parse opening theory name on first 6 moves
      if (updatedHistory.length <= 12) {
        const pgnString = updatedHistory.map((m) => m.san).join(' ');
        const matchedOpening = getOpeningNameFromPGN(pgnString);
        setOpeningName(matchedOpening);
      }

      // Checkmate/Check sounds
      if (chess.inCheck()) {
        playChessSound('check', settings.soundEffects);
        addCoachMessage(settings.language === 'es' 
          ? '¡Jaque! Hermoso ataque al rey enemigo.' 
          : 'Check! Beautiful attack on the enemy king.');
      } else if (isCapture) {
        addCoachMessage(settings.language === 'es' 
          ? `¡Captura! Capturaste su ${moveResult.captured?.toUpperCase()}. Gran ventaja.` 
          : `Capture! You captured their ${moveResult.captured?.toUpperCase()}. Great advantage.`);
      }

      // Swap clock turns
      setActiveTurn(turn === 'w' ? 'b' : 'w');

      updateEngineState();
      simulateEngineAnalysis(chess.fen(), turn);

    } catch (e) {
      console.error('Invalid move attempted:', e);
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  // Undo move
  const handleUndo = () => {
    const chess = chessRef.current;
    if (historyStack.length === 0) return;

    // Pop the last move
    const undoedMove = chess.undo();
    if (undoedMove) {
      setRedoStack((prev) => [...prev, undoedMove]);
      
      const newHistory = historyStack.slice(0, -1);
      setHistoryStack(newHistory);

      // Reset highlights
      setSelectedSquare(null);
      setPossibleMoves([]);
      if (newHistory.length > 0) {
        const last = newHistory[newHistory.length - 1];
        setLastMove({ from: last.from, to: last.to });
        setOpeningName(getOpeningNameFromPGN(newHistory.map((h) => h.san).join(' ')));
      } else {
        setLastMove(null);
        setOpeningName('Standard Theory');
      }

      setActiveTurn(chess.turn());
      updateEngineState();
    }
  };

  // Redo move
  const handleRedo = () => {
    const chess = chessRef.current;
    if (redoStack.length === 0) return;

    const redoing = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));

    try {
      const result = chess.move(redoing);
      if (result) {
        const historyItem: MoveHistoryItem = {
          san: result.san,
          from: result.from,
          to: result.to,
          piece: result.piece,
          color: result.color,
          fenAfter: chess.fen(),
          moveNumber: Math.floor(historyStack.length / 2) + 1,
        };

        const updatedHistory = [...historyStack, historyItem];
        setHistoryStack(updatedHistory);
        setLastMove({ from: result.from, to: result.to });
        setOpeningName(getOpeningNameFromPGN(updatedHistory.map((h) => h.san).join(' ')));

        setActiveTurn(chess.turn());
        updateEngineState();
      }
    } catch (e) {
      console.error('Failed to redo move:', e);
    }
  };

  // Resign match
  const handleResign = () => {
    if (gameStatus !== 'active') return;

    if (wsStatus === 'connected' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'resign' }));
    }

    setGameStatus('resigned');
    // Who is the resigning player?
    const resigningColor = wsStatus === 'connected' ? onlinePlayerColor : turn;
    const resignWinner = resigningColor === 'w' ? 'black' : 'white';
    setWinner(resignWinner);
    
    const playerColor = resigningColor === 'w' 
      ? (settings.language === 'es' ? 'Las Blancas' : 'White') 
      : (settings.language === 'es' ? 'Las Negras' : 'Black');
    
    const plainEnglishColor = resigningColor === 'w' ? 'White' : 'Black';

    setEndReason(settings.language === 'es' 
      ? `${playerColor} se han rendido.` 
      : `${plainEnglishColor} resigned from the match.`);
    playChessSound('gameover', settings.soundEffects);
    
    addCoachMessage(settings.language === 'es' 
      ? `Partida finalizada. Se rinden ${playerColor.toLowerCase()}.` 
      : `Match ended. ${plainEnglishColor} resigned.`);
    recordGameResult('loss');
  };

  // Draw offer
  const handleOfferDraw = () => {
    if (gameStatus !== 'active') return;

    if (wsStatus === 'connected') {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'offer-draw' }));
        addCoachMessage(settings.language === 'es'
          ? 'Has ofrecido tablas al oponente. Esperando respuesta...'
          : 'You offered a draw to your opponent. Waiting for response...');
      }
      return;
    }

    setGameStatus('draw');
    setWinner('draw');
    setEndReason(settings.language === 'es' ? 'Tablas por mutuo acuerdo' : 'Draw by mutual agreement');
    playChessSound('gameover', settings.soundEffects);
    addCoachMessage(settings.language === 'es' ? 'Partida de tablas por mutuo acuerdo.' : 'Game drawn by mutual agreement.');
    recordGameResult('draw');
  };

  // Historical Game Reviewer
  const handleReviewMove = (index: number) => {
    if (index === -1) {
      // Resume live active position FEN
      setActiveMoveIndex(-1);
      const chess = chessRef.current;
      setBoard(chess.board());
      setTurn(chess.turn());
    } else if (index === -2) {
      // Review starting board position FEN
      setActiveMoveIndex(-2);
      const startingChess = new Chess();
      setBoard(startingChess.board());
      setTurn('w');
    } else {
      // Review specific historical index FEN
      setActiveMoveIndex(index);
      const reviewedMove = historyStack[index];
      if (reviewedMove) {
        const reviewChess = new Chess(reviewedMove.fenAfter);
        setBoard(reviewChess.board());
        setTurn(reviewChess.turn());
      }
    }
  };

  // Real-time WebSocket match handler
  const handleWebSocketAction = (action: {
    type: 'create' | 'join' | 'cancel';
    nickname: string;
    gameId?: string;
    preferredColor?: 'w' | 'b' | 'random';
  }) => {
    // If cancel action
    if (action.type === 'cancel') {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsStatus('disconnected');
      setWsError(null);
      setWsActiveGameId(null);
      setOnlinePlayerColor(null);
      return;
    }

    try {
      // Connect WS
      setWsStatus('connecting');
      setWsError(null);

      if (wsRef.current) {
        wsRef.current.close();
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        if (action.type === 'create') {
          socket.send(JSON.stringify({
            type: 'create-game',
            nickname: action.nickname,
            preferredColor: action.preferredColor,
          }));
        } else if (action.type === 'join') {
          socket.send(JSON.stringify({
            type: 'join-game',
            gameId: action.gameId,
            nickname: action.nickname,
          }));
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'game-created':
              setWsStatus('waiting');
              setWsActiveGameId(data.gameId);
              setOnlinePlayerColor(data.playerColor);
              setIsFlipped(data.playerColor === 'b');
              break;

            case 'game-joined': {
              setWsStatus('connected');
              setWsActiveGameId(data.gameId);
              setOnlinePlayerColor(data.playerColor);
              setIsFlipped(data.playerColor === 'b');
              
              // Set up initial board
              const chess = new Chess(data.fen);
              chessRef.current = chess;
              setBoard(chess.board());
              setTurn(chess.turn());
              setSelectedSquare(null);
              setPossibleMoves([]);
              setLastMove(null);
              setCheckSquare(null);
              setHistoryStack([]);
              setRedoStack([]);
              setActiveMoveIndex(-1);
              setOpeningName('Standard Theory');
              setWhiteTime(600);
              setBlackTime(600);
              setActiveTurn('w');
              setGameStatus('active');
              setWinner(null);
              setEndReason('');
              setGameMode('online'); // Reuse online screen

              // Update players info
              const localIsWhite = data.playerColor === 'w';
              setWhitePlayer({
                name: localIsWhite ? userProfile.name : (data.whiteNickname || 'White Player'),
                rating: localIsWhite ? playerStats.currentRating : 1500,
                avatar: localIsWhite ? userProfile.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
              });
              setBlackPlayer({
                name: !localIsWhite ? userProfile.name : (data.blackNickname || 'Black Player'),
                rating: !localIsWhite ? playerStats.currentRating : 1500,
                avatar: !localIsWhite ? userProfile.avatar : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120',
              });

              addCoachMessage(settings.language === 'es'
                ? `Te has unido a la partida ${data.gameId}. ¡Suerte!`
                : `Joined match ${data.gameId}. Good luck!`);
              
              changeScreen('game');
              break;
            }

            case 'opponent-joined': {
              setWsStatus('connected');
              
              // Set up initial board
              const chess = new Chess();
              chessRef.current = chess;
              setBoard(chess.board());
              setTurn('w');
              setSelectedSquare(null);
              setPossibleMoves([]);
              setLastMove(null);
              setCheckSquare(null);
              setHistoryStack([]);
              setRedoStack([]);
              setActiveMoveIndex(-1);
              setOpeningName('Standard Theory');
              setWhiteTime(600);
              setBlackTime(600);
              setActiveTurn('w');
              setGameStatus('active');
              setWinner(null);
              setEndReason('');
              setGameMode('online');

              // Update players info
              const hostIsWhite = onlinePlayerColor === 'w';
              setWhitePlayer({
                name: hostIsWhite ? userProfile.name : (data.whiteNickname || data.opponentNickname || 'Opponent'),
                rating: hostIsWhite ? playerStats.currentRating : 1500,
                avatar: hostIsWhite ? userProfile.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
              });
              setBlackPlayer({
                name: !hostIsWhite ? userProfile.name : (data.blackNickname || data.opponentNickname || 'Opponent'),
                rating: !hostIsWhite ? playerStats.currentRating : 1500,
                avatar: !hostIsWhite ? userProfile.avatar : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120',
              });

              addCoachMessage(settings.language === 'es'
                ? `¡El oponente ${data.opponentNickname} se ha unido! Comienza la partida.`
                : `Opponent ${data.opponentNickname} joined! Match begins.`);

              changeScreen('game');
              break;
            }

            case 'opponent-moved': {
              const chess = chessRef.current;
              const result = chess.move(data.move);
              if (result) {
                // Play sounds
                const isCapture = result.captured;
                playChessSound(isCapture ? 'capture' : 'move', settings.soundEffects);

                const historyItem: MoveHistoryItem = {
                  san: result.san,
                  from: result.from,
                  to: result.to,
                  piece: result.piece,
                  color: result.color,
                  fenAfter: chess.fen(),
                  moveNumber: Math.floor(historyStack.length / 2) + 1,
                };

                setHistoryStack((prev) => [...prev, historyItem]);
                setLastMove({ from: result.from, to: result.to });
                setRedoStack([]);
                
                // Swap clock turns
                setActiveTurn(chess.turn());
                updateEngineState();

                // Check alerts
                if (chess.inCheck()) {
                  playChessSound('check', settings.soundEffects);
                }
              }
              break;
            }

            case 'opponent-resigned': {
              setGameStatus('resigned');
              const localIsWhite = onlinePlayerColor === 'w';
              setWinner(localIsWhite ? 'white' : 'black');
              setEndReason(settings.language === 'es'
                ? 'El oponente se ha rendido. ¡Has ganado!'
                : 'The opponent resigned. You win!');
              playChessSound('gameover', settings.soundEffects);
              recordGameResult('win');
              break;
            }

            case 'draw-offered':
              setInGameDrawOffered(true);
              addCoachMessage(settings.language === 'es'
                ? 'El oponente ofrece tablas (empate).'
                : 'Opponent offered a draw.');
              break;

            case 'draw-responded':
              if (data.accepted) {
                setGameStatus('draw');
                setWinner('draw');
                setEndReason(settings.language === 'es'
                  ? 'Tablas por acuerdo mutuo.'
                  : 'Game drawn by mutual agreement.');
                playChessSound('gameover', settings.soundEffects);
                recordGameResult('draw');
              } else {
                setInGameDrawOffered(false);
                addCoachMessage(settings.language === 'es'
                  ? 'Oferta de tablas rechazada.'
                  : 'Draw offer declined.');
              }
              break;

            case 'rematch-offered':
              setInGameRematchOffered(true);
              addCoachMessage(settings.language === 'es'
                ? 'El oponente propone revancha.'
                : 'Opponent offered a rematch.');
              break;

            case 'rematch-responded':
              if (data.accepted) {
                // Reset board
                const chess = new Chess();
                chessRef.current = chess;
                setBoard(chess.board());
                setTurn('w');
                setSelectedSquare(null);
                setPossibleMoves([]);
                setLastMove(null);
                setCheckSquare(null);
                setHistoryStack([]);
                setRedoStack([]);
                setActiveMoveIndex(-1);
                setOpeningName('Standard Theory');
                setWhiteTime(600);
                setBlackTime(600);
                setActiveTurn('w');
                setGameStatus('active');
                setWinner(null);
                setEndReason('');
                setInGameRematchOffered(false);
                addCoachMessage(settings.language === 'es'
                  ? 'Revancha iniciada.'
                  : 'Rematch started.');
              } else {
                setInGameRematchOffered(false);
                addCoachMessage(settings.language === 'es'
                  ? 'Propuesta de revancha rechazada.'
                  : 'Rematch offer declined.');
              }
              break;

            case 'chat-message': {
              const chatMsg: ChatMessage = {
                id: `chat-${Date.now()}-${Math.random()}`,
                sender: data.nickname || 'Guest',
                text: data.text || '',
                timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
              };
              setChatMessages((prev) => [...prev, chatMsg]);
              break;
            }

            case 'opponent-disconnected':
              addCoachMessage(settings.language === 'es'
                ? 'El oponente se desconectó.'
                : 'Opponent disconnected.');
              setGameStatus('resigned');
              setWinner(onlinePlayerColor === 'w' ? 'white' : 'black');
              setEndReason(settings.language === 'es'
                ? 'Victoria por abandono (desconexión).'
                : 'Victory by abandonment (disconnection).');
              break;

            case 'error':
              setWsError(data.message || 'Error desconocido.');
              setWsStatus('disconnected');
              break;
          }
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket Error:', err);
        setWsError(settings.language === 'es'
          ? 'Error al conectar con el servidor.'
          : 'Failed to connect to matchmaker server.');
        setWsStatus('disconnected');
      };

      socket.onclose = () => {
        setWsStatus('disconnected');
      };

    } catch (err) {
      console.error('Error starting WebSocket connection:', err);
      setWsError(settings.language === 'es'
        ? 'Error al inicializar conexión.'
        : 'Failed to initialize connection.');
      setWsStatus('disconnected');
    }
  };

  // Board Flip persistence
  const handleFlipBoard = () => {
    setIsFlipped(!isFlipped);
  };

  // Launch fresh chess match
  const startNewGame = (mode: GameMode = 'local', difficultyLevel?: number) => {
    const chess = new Chess();
    chessRef.current = chess;
    
    setBoard(chess.board());
    setTurn('w');
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setCheckSquare(null);
    setHistoryStack([]);
    setRedoStack([]);
    setActiveMoveIndex(-1);
    setOpeningName('Standard Theory');

    // Timers based on modes
    setWhiteTime(600); // 10 minutes rapid
    setBlackTime(600);
    setActiveTurn('w');
    setGameStatus('active');
    setWinner(null);
    setEndReason('');
    setGameMode(mode);

    // Profile updates based on selection
    if (mode === 'computer') {
      const selectedDiff = difficultyLevel || 3;
      const activeDiffObj = DIFFICULTIES[selectedDiff - 1] || DIFFICULTIES[2];
      
      setWhitePlayer({
        name: userProfile.name,
        rating: playerStats.currentRating,
        avatar: userProfile.avatar,
      });

      const localizedBotName = activeDiffObj.name === 'Beginner' ? (settings.language === 'es' ? 'Principiante' : 'Beginner')
                            : activeDiffObj.name === 'Easy' ? (settings.language === 'es' ? 'Fácil' : 'Easy')
                            : activeDiffObj.name === 'Medium' ? (settings.language === 'es' ? 'Medio' : 'Medium')
                            : activeDiffObj.name === 'Hard' ? (settings.language === 'es' ? 'Difícil' : 'Hard')
                            : activeDiffObj.name === 'Expert' ? (settings.language === 'es' ? 'Experto' : 'Expert')
                            : (settings.language === 'es' ? 'Maestro' : 'Master');

      setBlackPlayer({
        name: `${localizedBotName} Engine`,
        rating: activeDiffObj.elo,
        avatar: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&q=80&w=120',
        isComputer: true,
      });

      addCoachMessage(settings.language === 'es'
        ? `Nueva partida iniciada contra el Bot de IA Nivel ${selectedDiff} (${localizedBotName} - ELO ${activeDiffObj.elo}). ¡Buena suerte!`
        : `New match started vs Computer Bot Level ${selectedDiff} (${activeDiffObj.name} - ELO ${activeDiffObj.elo}). Good luck!`);
    } else if (mode === 'local') {
      setWhitePlayer({
        name: userProfile.name,
        rating: playerStats.currentRating,
        avatar: userProfile.avatar,
      });
      setBlackPlayer({
        name: settings.language === 'es' ? 'Oponente Local' : 'Local Opponent',
        rating: 1500,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      });
      addCoachMessage(settings.language === 'es'
        ? 'Partida Pass & Play iniciada localmente. ¡Invita a un amigo!'
        : 'New Pass & Play match started locally. Grab a friend!');
    }

    changeScreen('game');
  };

  const handlePlayLobbyOpponent = (opponent: LobbyOpponent) => {
    const chess = new Chess();
    chessRef.current = chess;
    
    setBoard(chess.board());
    setTurn('w');
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setCheckSquare(null);
    setHistoryStack([]);
    setRedoStack([]);
    setActiveMoveIndex(-1);
    setOpeningName('Standard Theory');

    // Timer details based on lobby selection
    let seconds = 600;
    if (opponent.timeControl.includes('1+0')) seconds = 60;
    else if (opponent.timeControl.includes('3+2')) seconds = 180;
    else if (opponent.timeControl.includes('5+3')) seconds = 300;

    setWhiteTime(seconds);
    setBlackTime(seconds);
    setActiveTurn('w');
    setGameStatus('active');
    setWinner(null);
    setEndReason('');
    setGameMode('online');

    setWhitePlayer({
      name: userProfile.name,
      rating: playerStats.currentRating,
      avatar: userProfile.avatar,
    });

    setBlackPlayer({
      name: opponent.name,
      rating: opponent.rating,
      avatar: opponent.avatar,
    });

    addCoachMessage(settings.language === 'es'
      ? `Conectado exitosamente con ${opponent.name} en Partida Clasificatoria. Control de tiempo: ${opponent.timeControl}. ¡La partida comienza ahora!`
      : `Successfully connected to ${opponent.name} in Rated Match. Time control: ${opponent.timeControl}. Match starts now!`);
    changeScreen('game');
  };

  const DIFFICULTIES = [
    { level: 1, name: 'Beginner', elo: 800 },
    { level: 2, name: 'Easy', elo: 1200 },
    { level: 3, name: 'Medium', elo: 1500 },
    { level: 4, name: 'Hard', elo: 1800 },
    { level: 5, name: 'Expert', elo: 2200 },
    { level: 6, name: 'Master', elo: 2600 },
  ];

  // Compute captured pieces lists & material advantages mathematically
  const getCapturedPieces = (): { captured: CapturedPieces; advantage: number } => {
    // White pieces are captured by black
    // Black pieces are captured by white
    const standardSet = {
      w: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'n', 'n', 'b', 'b', 'r', 'r', 'q'],
      b: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'n', 'n', 'b', 'b', 'r', 'r', 'q'],
    };

    const currentCounts = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    };

    const currentBoard = board;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.type !== 'k') {
          const col = piece.color as 'w' | 'b';
          const type = piece.type as 'p' | 'n' | 'b' | 'r' | 'q';
          if (currentCounts[col]) {
            currentCounts[col][type]++;
          }
        }
      }
    }

    const capturedW: string[] = [];
    const capturedB: string[] = [];

    // Check White pieces missing (captured by Black)
    ['p', 'n', 'b', 'r', 'q'].forEach((type) => {
      const max = type === 'p' ? 8 : type === 'q' ? 1 : 2;
      const count = currentCounts.w[type as 'p' | 'n' | 'b' | 'r' | 'q'];
      const missing = max - count;
      for (let i = 0; i < missing; i++) {
        capturedW.push(type);
      }
    });

    // Check Black pieces missing (captured by White)
    ['p', 'n', 'b', 'r', 'q'].forEach((type) => {
      const max = type === 'p' ? 8 : type === 'q' ? 1 : 2;
      const count = currentCounts.b[type as 'p' | 'n' | 'b' | 'r' | 'q'];
      const missing = max - count;
      for (let i = 0; i < missing; i++) {
        capturedB.push(type);
      }
    });

    // Advantage calculations
    const weights: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    const scoreB = capturedB.reduce((acc, curr) => acc + (weights[curr] || 0), 0); // pieces white captured from black
    const scoreW = capturedW.reduce((acc, curr) => acc + (weights[curr] || 0), 0); // pieces black captured from white
    const advantage = scoreB - scoreW; // positive: white up, negative: black up

    return {
      captured: {
        w: capturedW, // captured white pieces
        b: capturedB, // captured black pieces
      },
      advantage,
    };
  };

  const { captured, advantage } = getCapturedPieces();

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      settings.isDarkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900'
    }`}>
      
      {/* Universal Top Nav */}
      <TopNavBar
        currentScreen={currentScreen}
        setScreen={changeScreen}
        connectionStatus={connectionStatus}
        isDarkMode={settings.isDarkMode}
        toggleTheme={() => setSettings({ ...settings, isDarkMode: !settings.isDarkMode })}
        userAvatar={userProfile.avatar}
        language={settings.language}
      />

      {/* Main Body Layout */}
      <main className="flex-grow p-4 sm:p-6 overflow-hidden">
        
        {/* SCREEN 1: LOBBY & GAME MODES SELECTION */}
        {currentScreen === 'modes' && (
          <GameModesScreen
            onSelectMode={(mode, difficulty) => startNewGame(mode, difficulty)}
            onlineLobby={onlineLobby}
            onPlayLobbyOpponent={handlePlayLobbyOpponent}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            language={settings.language}
            onWebSocketAction={handleWebSocketAction}
            wsStatus={wsStatus}
            wsError={wsError}
            wsActiveGameId={wsActiveGameId}
            userNickname={userProfile.name}
          />
        )}

        {/* SCREEN 2: ACTIVE CHESS GAME DASHBOARD */}
        {currentScreen === 'game' && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Panel: Players info & timers (Col: 3) */}
            <div className="lg:col-span-3">
              <LeftPanel
                gameMode={gameMode}
                whitePlayer={whitePlayer}
                blackPlayer={blackPlayer}
                turn={turn}
                moveNumber={historyStack.length > 0 ? historyStack[historyStack.length - 1].moveNumber : 1}
                openingName={openingName}
                whiteTime={whiteTime}
                blackTime={blackTime}
                gameStatus={gameStatus}
                language={settings.language}
              />
            </div>

            {/* Chessboard & Controls Toolbar Center (Col: 6) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <ChessBoard
                board={board}
                turn={turn}
                selectedSquare={selectedSquare}
                possibleMoves={possibleMoves}
                lastMove={lastMove}
                checkSquare={checkSquare}
                isFlipped={isFlipped}
                settings={settings}
                onSquareSelect={handleSquareSelect}
                onMove={handleMove}
                gameStatus={gameStatus}
                winner={winner}
                reason={endReason}
                onRematch={() => startNewGame(gameMode)}
                onReturnHome={() => changeScreen('modes')}
                language={settings.language}
              />

              <BottomToolbar
                onNewGame={() => startNewGame('local')}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onOfferDraw={handleOfferDraw}
                onResign={handleResign}
                onFlipBoard={handleFlipBoard}
                onSettings={() => changeScreen('settings')}
                onShowGuide={() => setShowGuideModal(true)}
                canUndo={historyStack.length > 0}
                canRedo={redoStack.length > 0}
                gameActive={gameStatus === 'active'}
                language={settings.language}
              />
            </div>

            {/* Right Panel: Notation, Captured, Analysis, Chat tabs (Col: 3) */}
            <div className="lg:col-span-3">
              <RightPanel
                moveHistory={historyStack}
                capturedPieces={captured}
                materialAdvantage={advantage}
                activeMoveIndex={activeMoveIndex}
                onReviewMove={handleReviewMove}
                engineAnalysis={engineAnalysis}
                chatMessages={chatMessages}
                onSendMessage={(text) => {
                  const timestamp = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                  setChatMessages((prev) => [
                    ...prev,
                    { id: Math.random().toString(), sender: userProfile.name, text, timestamp },
                  ]);

                  if (wsStatus === 'connected' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                      type: 'chat-message',
                      gameId: wsActiveGameId,
                      text,
                      nickname: userProfile.name,
                    }));
                  } else {
                    // Coach AI responds with smart comment matching text
                    setTimeout(() => {
                      const ltext = text.toLowerCase();
                      const isEs = settings.language === 'es';
                      let response = isEs 
                        ? "Estoy monitoreando las estructuras del tablero. ¡Sigue desarrollando tus piezas hacia el centro!" 
                        : "I'm monitoring the board structures. Keep developing your pieces towards the center!";
                      
                      if (ltext.includes('best') || ltext.includes('mejor') || ltext.includes('suggestion') || ltext.includes('sugerencia') || ltext.includes('move') || ltext.includes('jugada')) {
                        const targetSq = engineAnalysis.bestContinuation[0] || (isEs ? 'casillas centrales' : 'center squares');
                        response = isEs 
                          ? `Mi análisis recomienda mirar la casilla objetivo ${targetSq} para optimizar la estructura de peones.` 
                          : `My analysis recommends looking at target ${targetSq} to optimize pawn structures.`;
                      } else if (ltext.includes('opening') || ltext.includes('apertura')) {
                        response = isEs 
                          ? `Estamos jugando la apertura ${openingName}. Estudia sus trampas clásicas para mantenerte adelante.` 
                          : `We are playing the ${openingName}. Study its classical traps to stay ahead.`;
                      } else if (ltext.includes('capture') || ltext.includes('captura') || ltext.includes('advantage') || ltext.includes('ventaja')) {
                        if (advantage > 0) {
                          response = isEs 
                            ? "Tienes un dominio material sólido. Simulando intercambios para simplificar el final." 
                            : "You have solid material dominance. Simulating trade-downs to simplify endgame.";
                        } else {
                          response = isEs 
                            ? "El material está bastante igualado. Prioriza la posición táctica sobre los intercambios." 
                            : "Material is fairly equal. Prioritize tactical position over trades.";
                        }
                      }
                      addCoachMessage(response);
                    }, 1000);
                  }
                }}
                isEngineThinking={isEngineThinking}
                language={settings.language}
              />
            </div>

          </div>
        )}

        {/* SCREEN 3: USER PROFILE STATS & GRAPHS */}
        {currentScreen === 'profile' && (
          <PlayerProfileScreen
            stats={playerStats}
            userName={userProfile.name}
            userAvatar={userProfile.avatar}
            onUpdateProfile={(name, avatar) => setUserProfile({ name, avatar })}
            language={settings.language}
          />
        )}

        {/* SCREEN 4: SETTINGS CONFIGURATION */}
        {currentScreen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onChangeSettings={(newSet) => setSettings({ ...settings, ...newSet })}
            onClose={() => setCurrentScreen(previousScreen)}
          />
        )}

      </main>

      {/* Piece Guide Educational Modal Overlay */}
      <PieceGuideModal 
        isOpen={showGuideModal} 
        onClose={() => setShowGuideModal(false)} 
        language={settings.language} 
        isDarkMode={settings.isDarkMode} 
      />
    </div>
  );
}
