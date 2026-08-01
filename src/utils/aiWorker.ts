import { Chess } from 'chess.js';
import { getBestEngineMove } from './chessEngine';

export interface WorkerInput {
  fen: string;
  level: number;
}

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { fen, level } = e.data;
  try {
    const chess = new Chess(fen);
    const result = getBestEngineMove(chess, level);
    self.postMessage({ success: true, result });
  } catch (err: any) {
    self.postMessage({ success: false, error: err?.message || 'Worker error' });
  }
};
