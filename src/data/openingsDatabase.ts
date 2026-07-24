export interface OpeningData {
  eco: string;
  name: { en: string; es: string };
  movesPgn: string;
  fen: string;
  desc: { en: string; es: string };
  stats: { whiteWins: number; drawRatio: number; blackWins: number; totalGames: number };
  popularContinuations: {
    san: string;
    whiteWins: number;
    drawRatio: number;
    blackWins: number;
    gamesCount: number;
  }[];
}

export interface PresetPosition {
  id: string;
  category: 'opening' | 'endgame' | 'middleGame';
  title: { en: string; es: string };
  eco?: string;
  fen: string;
  desc: { en: string; es: string };
}

export const PRESET_POSITIONS: PresetPosition[] = [
  {
    id: 'start',
    category: 'opening',
    title: { en: 'Standard Starting Position', es: 'Posición Inicial Estándar' },
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    desc: {
      en: 'The standard 32-piece starting setup for classic chess.',
      es: 'La posición inicial estándar de 32 piezas para ajedrez clásico.',
    },
  },
  {
    id: 'ruy_lopez',
    category: 'opening',
    title: { en: 'Ruy Lopez (Spanish Opening)', es: 'Ruy López (Apertura Española)' },
    eco: 'C60',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/1B2P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4',
    desc: {
      en: '1.e4 e5 2.Nf3 Nc6 3.Bb5 - One of the oldest and most deeply analyzed openings.',
      es: '1.e4 e5 2.Nf3 Nc6 3.Bb5 - Una de las aperturas más antiguas y estudiadas.',
    },
  },
  {
    id: 'sicilian_najdorf',
    category: 'opening',
    title: { en: 'Sicilian Defense (Najdorf)', es: 'Defensa Siciliana (Najdorf)' },
    eco: 'B90',
    fen: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    desc: {
      en: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 - Sharp, aggressive counter-attack.',
      es: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 - Contraataque agudo e impulsivo.',
    },
  },
  {
    id: 'queens_gambit',
    category: 'opening',
    title: { en: "Queen's Gambit Declined", es: 'Gambito de Dama Rehusado' },
    eco: 'D30',
    fen: 'rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4',
    desc: {
      en: '1.d4 d5 2.c4 e6 3.Nc3 Nf6 - Solid positional fight for central control.',
      es: '1.d4 d5 2.c4 e6 3.Nc3 Nf6 - Lucha posicional sólida por el centro.',
    },
  },
  {
    id: 'italian_game',
    category: 'opening',
    title: { en: 'Italian Game (Giuoco Piano)', es: 'Apertura Italiana (Giuoco Piano)' },
    eco: 'C50',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5',
    desc: {
      en: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 - Classic development targeting f7 vulnerability.',
      es: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 - Desarrollo clásico enfocado en f7.',
    },
  },
  {
    id: 'kings_indian',
    category: 'opening',
    title: { en: "King's Indian Defense", es: 'Defensa India de Rey' },
    eco: 'E60',
    fen: 'rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 6',
    desc: {
      en: 'Hypermodern defense giving White the center for dynamic kingside attacks.',
      es: 'Defensa hipermoderna cediendo el centro para contraataques dinámicos en el flanco de rey.',
    },
  },
  {
    id: 'lucena_endgame',
    category: 'endgame',
    title: { en: 'Lucena Position (Rook Endgame)', es: 'Posición de Lucena (Final de Torres)' },
    fen: '1R6/8/8/4k3/8/8/1p1K4/r7 w - - 0 1',
    desc: {
      en: 'Fundamental rook endgame technique for converting a pawn advantage.',
      es: 'Técnica fundamental de final de torres para convertir un peón de ventaja.',
    },
  },
  {
    id: 'philidor_endgame',
    category: 'endgame',
    title: { en: 'Philidor Position (Rook Defense)', es: 'Posición de Philidor (Defensa de Torres)' },
    fen: '1R6/8/3k4/8/8/8/1p1K4/r7 b - - 0 1',
    desc: {
      en: 'Standard defensive setup to draw rook and pawn endgames.',
      es: 'Configuración defensiva estándar para tablas en finales de torre y peón.',
    },
  },
  {
    id: 'tactical_middle',
    category: 'middleGame',
    title: { en: 'Middle Game Tactical Attack', es: 'Ataque Táctico de Medio Juego' },
    fen: 'r1b2rk1/pp1p1ppp/2n1pn2/2p5/2PP4/2N1PN2/PP2BPPP/R2Q1RK1 w - - 0 1',
    desc: {
      en: 'Rich middle game board state with open files and piece tension.',
      es: 'Posición rica de medio juego con columnas abiertas y tensión de piezas.',
    },
  },
];

// Explorer DB for candidate moves from popular positions
export const OPENINGS_DATABASE: Record<string, OpeningData> = {
  'e4': {
    eco: 'B00',
    name: { en: "King's Pawn Game", es: 'Juego del Peón de Rey' },
    movesPgn: '1. e4',
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    desc: { en: 'Most aggressive and popular first move.', es: 'Primer movimiento más popular y agresivo.' },
    stats: { whiteWins: 38.2, drawRatio: 33.1, blackWins: 28.7, totalGames: 1250000 },
    popularContinuations: [
      { san: 'c5', whiteWins: 37.5, drawRatio: 32.0, blackWins: 30.5, gamesCount: 480000 },
      { san: 'e5', whiteWins: 39.1, drawRatio: 34.2, blackWins: 26.7, gamesCount: 390000 },
      { san: 'e6', whiteWins: 38.0, drawRatio: 33.5, blackWins: 28.5, gamesCount: 160000 },
      { san: 'c6', whiteWins: 36.8, drawRatio: 35.1, blackWins: 28.1, gamesCount: 120000 },
    ],
  },
  'e4 e5': {
    eco: 'C20',
    name: { en: 'Open Game', es: 'Juego Abierto' },
    movesPgn: '1. e4 e5',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
    desc: { en: 'Classical symmetrical opening focusing on central development.', es: 'Apertura simétrica clásica enfocada en el desarrollo central.' },
    stats: { whiteWins: 39.5, drawRatio: 34.0, blackWins: 26.5, totalGames: 420000 },
    popularContinuations: [
      { san: 'Nf3', whiteWins: 41.2, drawRatio: 33.8, blackWins: 25.0, gamesCount: 310000 },
      { san: 'Bc4', whiteWins: 38.5, drawRatio: 32.5, blackWins: 29.0, gamesCount: 45000 },
      { san: 'f4', whiteWins: 37.0, drawRatio: 28.0, blackWins: 35.0, gamesCount: 22000 },
    ],
  },
  'e4 c5': {
    eco: 'B20',
    name: { en: 'Sicilian Defense', es: 'Defensa Siciliana' },
    movesPgn: '1. e4 c5',
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
    desc: { en: 'Asymmetrical defense creating sharp dynamic counterplay.', es: 'Defensa asimétrica que genera un juego táctico y dinámico.' },
    stats: { whiteWins: 37.5, drawRatio: 32.0, blackWins: 30.5, totalGames: 480000 },
    popularContinuations: [
      { san: 'Nf3', whiteWins: 38.5, drawRatio: 32.8, blackWins: 28.7, gamesCount: 360000 },
      { san: 'Nc3', whiteWins: 36.2, drawRatio: 31.5, blackWins: 32.3, gamesCount: 52000 },
      { san: 'c3', whiteWins: 35.8, drawRatio: 33.0, blackWins: 31.2, gamesCount: 38000 },
    ],
  },
  'd4': {
    eco: 'A40',
    name: { en: "Queen's Pawn Game", es: 'Juego del Peón de Dama' },
    movesPgn: '1. d4',
    fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1',
    desc: { en: 'Solid, strategic opening favoring long-term positional maneuvering.', es: 'Apertura sólida y estratégica ideal para maniobras posicionales.' },
    stats: { whiteWins: 38.8, drawRatio: 36.5, blackWins: 24.7, totalGames: 980000 },
    popularContinuations: [
      { san: 'Nf6', whiteWins: 37.8, drawRatio: 37.2, blackWins: 25.0, gamesCount: 450000 },
      { san: 'd5', whiteWins: 39.5, drawRatio: 36.0, blackWins: 24.5, gamesCount: 380000 },
      { san: 'e6', whiteWins: 38.1, drawRatio: 35.5, blackWins: 26.4, gamesCount: 85000 },
    ],
  },
  'd4 d5 c4': {
    eco: 'D06',
    name: { en: "Queen's Gambit", es: 'Gambito de Dama' },
    movesPgn: '1. d4 d5 2. c4',
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
    desc: { en: 'White offers a flank pawn for central dominance.', es: 'El blanco ofrece un peón lateral para dominar el centro.' },
    stats: { whiteWins: 41.0, drawRatio: 35.5, blackWins: 23.5, totalGames: 340000 },
    popularContinuations: [
      { san: 'e6', whiteWins: 40.2, drawRatio: 37.0, blackWins: 22.8, gamesCount: 180000 },
      { san: 'c6', whiteWins: 39.5, drawRatio: 36.2, blackWins: 24.3, gamesCount: 92000 },
      { san: 'dxc4', whiteWins: 42.5, drawRatio: 32.0, blackWins: 25.5, gamesCount: 45000 },
    ],
  },
};
