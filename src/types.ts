/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BoardTheme = 'classic' | 'wood' | 'emerald' | 'dark';
export type PieceTheme = 'modern' | 'realistic' | 'neo' | 'glass';
export type GameMode = 'local' | 'computer' | 'online' | 'puzzle' | 'analysis' | 'pgn' | 'tournament' | 'training';
export type AppScreen = 'modes' | 'game' | 'lobby' | 'profile' | 'settings' | 'puzzles';
export type TimeControl = 'bullet' | 'blitz' | 'rapid' | 'classical' | 'custom';

export interface Player {
  name: string;
  rating: number;
  avatar: string;
  isComputer?: boolean;
}

export interface MoveHistoryItem {
  san: string;
  from: string;
  to: string;
  piece: string;
  color: 'w' | 'b';
  fenAfter: string;
  timeRemaining?: string;
  moveNumber: number;
}

export interface CapturedPieces {
  w: string[]; // white pieces captured (by black)
  b: string[]; // black pieces captured (by white)
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlockedAt?: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  currentRating: number;
  highestRating: number;
  winPercentage: number;
  favoriteOpening: string;
  achievements: Achievement[];
}

export interface LobbyOpponent {
  id: string;
  name: string;
  rating: number;
  timeControl: string;
  ping: number;
  avatar: string;
}

export interface Puzzle {
  id: string;
  title: string;
  rating: number;
  fen: string;
  solution: string[];
  description: string;
  playedCount: number;
}

export interface ChessSettings {
  boardTheme: BoardTheme;
  pieceTheme: PieceTheme;
  animationSpeed: 'fast' | 'normal' | 'slow';
  soundEffects: boolean;
  showLegalMoves: boolean;
  highlightLastMove: boolean;
  autoQueenPromotion: boolean;
  coordinateLabels: boolean;
  isDarkMode: boolean;
  language: string;
}

export interface EngineAnalysis {
  evalScore: number; // positive for white, negative for black (e.g. +1.4)
  isMateIn?: number; // moves to mate
  bestContinuation: string[]; // PGN/SAN moves
  moveAccuracy: 'book' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  suggestedMoves: string[];
  threats: string[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}
