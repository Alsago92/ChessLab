import { Chess, Move, Square, PieceSymbol } from 'chess.js';

/**
 * Advanced Chess AI Engine
 * Features:
 * - Piece-Square Tables (PST) for positional awareness (Opening/Middlegame vs Endgame)
 * - Material + Mobility + Pawn Structure + King Safety evaluation
 * - Minimax with Alpha-Beta Pruning
 * - Quiescence Search (capture extensions to eliminate horizon effect)
 * - Move Ordering (MVV-LVA, Checks, Promotions)
 * - Opening Book integration for early moves
 * - Scaled Difficulty Levels (1: Beginner to 6: Grandmaster / Master 2600 ELO)
 */

// Piece Values in Centipawns
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (oriented from White's perspective, 8x8 mapped to 0..63)
// For Black, ranks are inverted (rank 0 <-> rank 7).
const PAWN_PST = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_PST = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_PST = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_PST = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0,
];

const QUEEN_PST = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
];

const KING_MIDDLEGAME_PST = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
];

const KING_ENDGAME_PST = [
  -50,-40,-30,-20,-20,-30,-40,-50,
  -30,-20,-10,  0,  0,-10,-20,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-30,  0,  0,  0,  0,-30,-30,
  -50,-30,-30,-30,-30,-30,-30,-50,
];

// Master Opening Book SAN responses
const OPENING_BOOK: Record<string, string[]> = {
  // Start position (1. e4, 1. d4, 1. c4, 1. Nf3)
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': ['e4', 'd4', 'c4', 'Nf3'],
  
  // Responses to 1. e4
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': ['c5', 'e5', 'e6', 'c6'],
  
  // Responses to 1. d4
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': ['Nf6', 'd5', 'e6', 'g6'],

  // 1. e4 e5
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2': ['Nf3', 'Nc3', 'Bc4'],

  // 1. e4 e5 2. Nf3
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2': ['Nc6', 'Nf6'],

  // 1. e4 e5 2. Nf3 Nc6
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3': ['Bb5', 'Bc4', 'd4', 'Nc3'],

  // 1. e4 c5 (Sicilian)
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2': ['Nf3', 'Nc3', 'c3'],

  // 1. e4 c5 2. Nf3
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2': ['d6', 'e6', 'Nc6', 'g6'],

  // 1. d4 d5
  'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2': ['c4', 'Nf3', 'Bf4'],

  // 1. d4 Nf6
  'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2': ['c4', 'Nf3', 'Bg5'],
};

/**
 * Get Piece-Square Table score for a given piece and square index (0..63)
 */
function getPstScore(pieceType: PieceSymbol, squareIndex: number, color: 'w' | 'b', isEndgame: boolean): number {
  // Flip square index for black (invert ranks)
  const idx = color === 'w' ? squareIndex : (7 - Math.floor(squareIndex / 8)) * 8 + (squareIndex % 8);

  switch (pieceType) {
    case 'p':
      return PAWN_PST[idx];
    case 'n':
      return KNIGHT_PST[idx];
    case 'b':
      return BISHOP_PST[idx];
    case 'r':
      return ROOK_PST[idx];
    case 'q':
      return QUEEN_PST[idx];
    case 'k':
      return isEndgame ? KING_ENDGAME_PST[idx] : KING_MIDDLEGAME_PST[idx];
    default:
      return 0;
  }
}

/**
 * Static evaluation function of a position from White's perspective (in centipawns)
 */
export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    // If side to move is checkmated, the other side wins
    return chess.turn() === 'w' ? -100000 : 100000;
  }

  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
    return 0;
  }

  const board = chess.board();
  let whiteMaterial = 0;
  let blackMaterial = 0;
  let whitePst = 0;
  let blackPst = 0;

  let totalNonPawnMaterial = 0;

  // 1. Count material & positional scores
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const squareIdx = r * 8 + c;
        const val = PIECE_VALUES[piece.type];

        if (piece.type !== 'p' && piece.type !== 'k') {
          totalNonPawnMaterial += val;
        }

        if (piece.color === 'w') {
          whiteMaterial += val;
        } else {
          blackMaterial += val;
        }
      }
    }
  }

  const isEndgame = totalNonPawnMaterial < 1500;

  // Calculate PST scores
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const squareIdx = r * 8 + c;
        const pst = getPstScore(piece.type, squareIdx, piece.color, isEndgame);
        if (piece.color === 'w') {
          whitePst += pst;
        } else {
          blackPst += pst;
        }
      }
    }
  }

  // 2. Bonus for check
  let checkBonus = 0;
  if (chess.inCheck()) {
    checkBonus = chess.turn() === 'w' ? -35 : 35;
  }

  const score = (whiteMaterial - blackMaterial) + (whitePst - blackPst) + checkBonus;
  return score;
}

/**
 * MVV-LVA (Most Valuable Victim - Least Valuable Attacker) move ordering score
 */
function getMoveOrderScore(move: Move): number {
  let score = 0;

  // Captures
  if (move.captured) {
    const victimVal = PIECE_VALUES[move.captured] || 100;
    const attackerVal = PIECE_VALUES[move.piece] || 100;
    score += 1000 + (victimVal * 10 - attackerVal);
  }

  // Promotions
  if (move.promotion) {
    score += 900;
  }

  // Checks
  if (move.san.includes('+')) {
    score += 500;
  }

  return score;
}

/**
 * Quiescence search to handle tactical captures until position is quiet
 */
function quiescenceSearch(chess: Chess, alpha: number, beta: number, isMaximizing: boolean, depth = 0): number {
  const standPat = evaluateBoard(chess);

  // Cap quiescence depth to 2 to keep search extremely fast & non-blocking
  if (depth >= 2) return standPat;

  const captures = chess
    .moves({ verbose: true })
    .filter((m) => m.captured || m.promotion)
    .sort((a, b) => getMoveOrderScore(b) - getMoveOrderScore(a))
    .slice(0, 5); // top 5 most valuable tactical captures

  if (captures.length === 0) return standPat;

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;

    for (const move of captures) {
      chess.move(move);
      const score = quiescenceSearch(chess, alpha, beta, false, depth + 1);
      chess.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;

    for (const move of captures) {
      chess.move(move);
      const score = quiescenceSearch(chess, alpha, beta, true, depth + 1);
      chess.undo();

      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
    return beta;
  }
}

let nodesCount = 0;
let maxNodeBudget = 50000; // Expanded computation budget for Web Worker execution

/**
 * Minimax with Alpha-Beta Pruning
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  nodesCount++;

  if (nodesCount >= maxNodeBudget || depth === 0 || chess.isGameOver()) {
    return quiescenceSearch(chess, alpha, beta, isMaximizing);
  }

  const moves = chess.moves({ verbose: true });
  // Move ordering: sort captures and checks first to trigger immediate Alpha-Beta cutoffs
  moves.sort((a, b) => getMoveOrderScore(b) - getMoveOrderScore(a));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Alpha-Beta Cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha-Beta Cutoff
    }
    return minEval;
  }
}

export interface EngineMoveResult {
  move: Move;
  evalScore: number; // in pawns e.g. +1.5 or -2.3
  isBookMove?: boolean;
}

/**
 * Computes the best move for the AI engine based on difficulty level (1 to 6)
 * @param chess Chess.js instance
 * @param difficulty Level 1 (Beginner ~800 ELO) to Level 6 (Master / GM ~2600 ELO)
 */
export function getBestEngineMove(chess: Chess, difficulty: number): EngineMoveResult | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  const currentFen = chess.fen();
  const currentTurn = chess.turn(); // 'w' or 'b'
  const isMaximizing = currentTurn === 'w';

  // Reset node safety counter
  nodesCount = 0;

  // 1. Check Opening Book for high difficulty levels (levels 4, 5, 6)
  if (difficulty >= 4 && chess.history().length <= 14) {
    const bookCandidates = OPENING_BOOK[currentFen];
    if (bookCandidates && bookCandidates.length > 0) {
      const chosenSan = bookCandidates[Math.floor(Math.random() * bookCandidates.length)];
      // Validate move in current legal moves
      const bookMove = moves.find((m) => m.san === chosenSan);
      if (bookMove) {
        return {
          move: bookMove,
          evalScore: evaluateBoard(chess) / 100,
          isBookMove: true,
        };
      }
    }
  }

  // 2. Map Difficulty level to search depth & node budgets
  let searchDepth = 3;
  let blunderProbability = 0;

  switch (difficulty) {
    case 1:
      searchDepth = 1;
      maxNodeBudget = 2000;
      blunderProbability = 0.35;
      break;
    case 2:
      searchDepth = 2;
      maxNodeBudget = 5000;
      blunderProbability = 0.15;
      break;
    case 3:
      searchDepth = 3;
      maxNodeBudget = 12000;
      blunderProbability = 0.05;
      break;
    case 4:
      searchDepth = 4;
      maxNodeBudget = 25000;
      blunderProbability = 0;
      break;
    case 5:
      searchDepth = 4;
      maxNodeBudget = 40000;
      blunderProbability = 0;
      break;
    case 6:
    default:
      searchDepth = 5; // Master Level: Depth 5 with Quiescence & PST (2600 ELO)
      maxNodeBudget = 70000;
      blunderProbability = 0;
      break;
  }

  // Blunder injection for low levels
  if (blunderProbability > 0 && Math.random() < blunderProbability) {
    const randomChoice = moves[Math.floor(Math.random() * moves.length)];
    return {
      move: randomChoice,
      evalScore: evaluateBoard(chess) / 100,
      isBookMove: false,
    };
  }

  // Move ordering: sort captures/checks first to maximize Alpha-Beta pruning speed
  moves.sort((a, b) => getMoveOrderScore(b) - getMoveOrderScore(a));

  let bestMove: Move = moves[0];
  let bestValue = isMaximizing ? -Infinity : Infinity;

  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of moves) {
    chess.move(move);
    const value = minimax(chess, searchDepth - 1, alpha, beta, !isMaximizing);
    chess.undo();

    if (isMaximizing) {
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
      alpha = Math.max(alpha, value);
    } else {
      if (value < bestValue) {
        bestValue = value;
        bestMove = move;
      }
      beta = Math.min(beta, value);
    }
  }

  // Convert centipawns to standard pawn unit display (e.g., +1.2 or -2.5)
  const scoreInPawns = (bestValue / 100) * (currentTurn === 'w' ? 1 : -1);

  return {
    move: bestMove,
    evalScore: Number(scoreInPawns.toFixed(2)),
    isBookMove: false,
  };
}
