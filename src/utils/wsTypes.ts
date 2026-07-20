// Helper module for clean WebSocket matchmaking
import { Chess } from 'chess.js';

export interface WSMessage {
  type: string;
  gameId?: string;
  playerColor?: 'w' | 'b';
  whiteNickname?: string;
  blackNickname?: string;
  opponentNickname?: string;
  fen?: string;
  move?: any;
  accepted?: boolean;
  text?: string;
  nickname?: string;
  message?: string;
}
