import { Chess } from 'chess.js';

export interface ParsedPgnGame {
  white: string;
  black: string;
  event: string;
  site: string;
  date: string;
  round: string;
  result: string;
  whiteElo: string;
  blackElo: string;
  eco: string;
  pgn: string;
  gameIndex: number;
}

/**
 * Parses a PGN string which may contain 1 or thousands of games.
 * Normalizes line endings and extracts game headers.
 */
export function parsePgnGames(pgnText: string): ParsedPgnGame[] {
  const cleanText = pgnText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!cleanText) return [];

  // Check if headers exist
  const hasHeaders = /\[(?:Event|Site|Date|Round|White|Black|Result|ECO|FEN)\s+\"/i.test(cleanText);
  if (!hasHeaders) {
    // Pure moves string without standard headers
    return [
      {
        white: 'White',
        black: 'Black',
        event: 'Custom PGN',
        site: '',
        date: '????.??.??',
        round: '-',
        result: '*',
        whiteElo: '',
        blackElo: '',
        eco: '',
        pgn: cleanText,
        gameIndex: 1,
      },
    ];
  }

  // Split by [Event header or first header block
  const rawBlocks = cleanText.split(/\n+(?=\[Event\s+\")/gi);
  
  const games: ParsedPgnGame[] = [];
  let index = 1;

  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Header extraction
    const headers: Record<string, string> = {};
    const headerRegex = /\[(\w+)\s+\"(.*?)\"\]/g;
    let match: RegExpExecArray | null;
    while ((match = headerRegex.exec(trimmed)) !== null) {
      headers[match[1]] = match[2];
    }

    games.push({
      white: headers.White || 'White',
      black: headers.Black || 'Black',
      event: headers.Event || 'Chess Game',
      site: headers.Site || '',
      date: headers.Date || '????.??.??',
      round: headers.Round || '',
      result: headers.Result || '*',
      whiteElo: headers.WhiteElo || '',
      blackElo: headers.BlackElo || '',
      eco: headers.ECO || '',
      pgn: trimmed,
      gameIndex: index++,
    });
  }

  return games;
}

/**
 * Robustly attempts to load PGN into chess.js with sanitization fallback
 */
export function safelyLoadPgn(chess: Chess, pgnText: string): boolean {
  try {
    chess.loadPgn(pgnText);
    return true;
  } catch (err) {
    // Fallback: strip comments, variations and NAGs
    try {
      const sanitized = pgnText
        .replace(/\{[^}]*\}/g, '')  // remove comments { ... }
        .replace(/\([^)]*\)/g, '')  // remove variations ( ... )
        .replace(/\$\d+/g, '')      // remove NAGs $1, $2
        .replace(/\[.*?\]/g, '')    // remove header lines
        .replace(/\r\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      chess.reset();
      chess.loadPgn(sanitized);
      return true;
    } catch (err2) {
      console.error('Safely load PGN failed:', err2);
      return false;
    }
  }
}
