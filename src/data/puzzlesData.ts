import { Chess } from 'chess.js';

export interface PuzzleHint {
  hint1: { en: string; es: string };
  hint2: { en: string; es: string };
  targetSquares?: string[];
  solutionText: { en: string; es: string };
}

export interface PuzzleMove {
  from: string;
  to: string;
  promotion?: string;
  san?: string;
}

export interface Puzzle {
  id: string;
  title: { en: string; es: string };
  theme: 'fork' | 'pin' | 'skewer' | 'discovered_attack' | 'back_rank' | 'smothered_mate' | 'deflection' | 'removing_defender' | 'trapped_piece' | 'mating_net' | 'endgame';
  themeName: { en: string; es: string };
  themeDescription: { en: string; es: string };
  rating: number;
  difficulty: 'beginner' | 'easy' | 'intermediate' | 'hard' | 'master';
  fen: string;
  sideToMove: 'w' | 'b';
  objective: { en: string; es: string };
  moves: PuzzleMove[]; // Expected player moves in order
  opponentResponses?: PuzzleMove[]; // Automated counter-moves played by AI in multi-step puzzles
  explanation: { en: string; es: string };
  hints: PuzzleHint;
}

export const PUZZLE_THEMES = [
  {
    id: 'all',
    name: { en: 'All Puzzles', es: 'Todos los Puzzles' },
    icon: 'apps',
  },
  {
    id: 'fork',
    name: { en: 'Forks (Double Attack)', es: 'Tenedores (Ataque Doble)' },
    icon: 'call_split',
    description: {
      en: 'A single piece attacks two or more enemy targets simultaneously (e.g. King and Queen).',
      es: 'Una sola pieza ataca dos o más objetivos enemigos simultáneamente (p. ej., Rey y Dama).',
    },
  },
  {
    id: 'pin',
    name: { en: 'Pins', es: 'Clavadas' },
    icon: 'push_pin',
    description: {
      en: 'An attacking piece restricts an enemy piece from moving because doing so would expose a valuable piece behind it.',
      es: 'Una pieza atacante impide que una pieza enemiga se mueva porque expondría una pieza valiosa detrás de ella.',
    },
  },
  {
    id: 'skewer',
    name: { en: 'Skewers', es: 'Enfiladas' },
    icon: 'linear_scale',
    description: {
      en: 'An attack on a high-value piece that is forced to move, exposing a lesser piece behind it.',
      es: 'Un ataque a una pieza de alto valor que se ve obligada a moverse, exponiendo una pieza de menor valor detrás.',
    },
  },
  {
    id: 'discovered_attack',
    name: { en: 'Discovered Attacks', es: 'Ataques a la Descubierta' },
    icon: 'visibility',
    description: {
      en: 'Moving one piece out of the way opens an line of attack for a bishop, rook, or queen behind it.',
      es: 'Mover una pieza libera la línea de ataque de un alfil, torre o dama que estaba detrás.',
    },
  },
  {
    id: 'back_rank',
    name: { en: 'Back Rank Mate', es: 'Mate en la Última Fila' },
    icon: 'vertical_align_top',
    description: {
      en: 'Checkmating a King trapped on its home rank behind its own wall of pawns.',
      es: 'Dar jaque mate a un Rey atrapado en su primera/última fila detrás de sus propios peones.',
    },
  },
  {
    id: 'smothered_mate',
    name: { en: 'Smothered Mate', es: 'Mate Ahogado' },
    icon: 'group_work',
    description: {
      en: 'A Knight checkmates a King that is completely surrounded and suffocated by its own friendly pieces.',
      es: 'Un Caballo da jaque mate a un Rey completamente rodeado y sofocado por sus propias piezas.',
    },
  },
  {
    id: 'deflection',
    name: { en: 'Deflection & Decoy', es: 'Desviación y Señuelo' },
    icon: 'alt_route',
    description: {
      en: 'Forcing or luring a critical enemy defender away from an important square or piece.',
      es: 'Obligar o atraer a un defensor clave enemigo a abandonarse de una casilla o pieza vital.',
    },
  },
  {
    id: 'removing_defender',
    name: { en: 'Removing the Defender', es: 'Eliminación del Defensor' },
    icon: 'disabled_by_default',
    description: {
      en: 'Capturing or driving away the enemy piece that protects another target.',
      es: 'Capturar o ahuyentar a la pieza enemiga que protege a otro objetivo.',
    },
  },
];

export const REAL_PUZZLES: Puzzle[] = [
  {
    id: 'puz_001',
    title: {
      en: 'Pawn Fork Central Strike',
      es: 'Golpe Táctico: Tenedor de Peón',
    },
    theme: 'fork',
    themeName: { en: 'Fork', es: 'Tenedor' },
    themeDescription: {
      en: 'Exploit an uncoordinated center by pushing a pawn to attack two pieces at once.',
      es: 'Aprovecha un centro descoordinado avanzando un peón para atacar dos piezas a la vez.',
    },
    rating: 1150,
    difficulty: 'beginner',
    fen: 'r1bqk2r/ppp2ppp/2n1q3/4N3/3P4/2N5/PPP2PPP/R2Q1RK1 w kq - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Win a full piece with a Pawn Fork!',
      es: 'Juegan Blancas: ¡Gana una pieza completa con un Tenedor de Peón!',
    },
    moves: [
      { from: 'd4', to: 'd5', san: 'd5' },
      { from: 'd5', to: 'c6', san: 'dxc6' },
    ],
    opponentResponses: [
      { from: 'e6', to: 'e7', san: 'Qe7' },
    ],
    explanation: {
      en: 'Advancing the pawn to d5 creates a double attack (fork) on Black’s Knight on c6 and Queen on e6. After Black moves the Queen, White captures the Knight on c6 with a winning material advantage.',
      es: 'Avanzar el peón a d5 crea un ataque doble (tenedor) sobre el Caballo negro de c6 y la Dama de e6. Tras mover la Dama, las blancas capturan el Caballo en c6 ganando una pieza limpia.',
    },
    hints: {
      hint1: {
        en: 'Look at the pawn on d4 and the two Black pieces aligned on c6 and e6.',
        es: 'Observa el peón de d4 y las dos piezas negras alineadas en c6 y e6.',
      },
      hint2: {
        en: 'Pushing d4 to d5 attacks both the Knight and the Queen simultaneously.',
        es: 'Avanzar d4 a d5 ataca tanto al Caballo como a la Dama simultáneamente.',
      },
      targetSquares: ['d4', 'd5', 'c6', 'e6'],
      solutionText: {
        en: '1. d5! attacking Queen & Knight. After 1... Qe7 2. dxc6!',
        es: '1. d5! atacando Dama y Caballo. Tras 1... Qe7 2. dxc6!',
      },
    },
  },
  {
    id: 'puz_002',
    title: {
      en: 'Philidor’s Famous Smothered Mate',
      es: 'El Famoso Mate Ahogado de Philidor',
    },
    theme: 'smothered_mate',
    themeName: { en: 'Smothered Mate', es: 'Mate Ahogado' },
    themeDescription: {
      en: 'Use double check and a Queen sacrifice to smother the enemy King.',
      es: 'Utiliza el doble jaque y un sacrificio de Dama para sofocar al Rey enemigo.',
    },
    rating: 1450,
    difficulty: 'intermediate',
    fen: '2r3rk/5Npp/8/8/8/8/1Q4PP/6K1 w - - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Deliver a legendary Smothered Checkmate in 3 moves!',
      es: 'Juegan Blancas: ¡Ejecuta un legendario Mate Ahogado en 3 jugadas!',
    },
    moves: [
      { from: 'f7', to: 'h6', san: 'Nh6+' },
      { from: 'b2', to: 'g8', san: 'Qg8+' },
      { from: 'h6', to: 'f7', san: 'Nf7#' },
    ],
    opponentResponses: [
      { from: 'g8', to: 'h8', san: 'Kh8' },
      { from: 'c8', to: 'g8', san: 'Rxg8' },
    ],
    explanation: {
      en: '1. Nh6+ is a Double Check (from Queen on b2 and Knight on h6). The King is forced to h8. 2. Qg8+!! is a brilliant Queen sacrifice forcing Black’s Rook to capture (Rxg8), completely surrounding the Black King with its own pieces. 3. Nf7# delivers Smothered Checkmate!',
      es: '1. Nh6+ es un Doble Jaque (Dama en b2 y Caballo en h6). El Rey está obligado a ir a h8. 2. ¡¡Qg8+!! es un brillante sacrificio de Dama que obliga a la Torre negra a capturar (Rxg8), dejando al Rey negro asfixiado por sus propias piezas. 3. ¡Nf7# asesta el Mate Ahogado!',
    },
    hints: {
      hint1: {
        en: 'The Knight on f7 can jump with check while uncovering an attack from the Queen on b2.',
        es: 'El Caballo de f7 puede saltar con jaque mientras descubre un ataque de la Dama de b2.',
      },
      hint2: {
        en: 'First jump Nh6+ (double check), then sacrifice the Queen with Qg8+!',
        es: 'Primero salta Nh6+ (doble jaque), ¡luego sacrifica la Dama con Qg8+!',
      },
      targetSquares: ['f7', 'h6', 'b2', 'g8'],
      solutionText: {
        en: '1. Nh6+ Kh8 2. Qg8+! Rxg8 3. Nf7#',
        es: '1. Nh6+ Kh8 2. Qg8+! Rxg8 3. Nf7#',
      },
    },
  },
  {
    id: 'puz_003',
    title: {
      en: 'Back Rank Deflection Sacrifice',
      es: 'Sacrificio de Desviación en la Última Fila',
    },
    theme: 'back_rank',
    themeName: { en: 'Back Rank Mate', es: 'Mate en la Última Fila' },
    themeDescription: {
      en: 'Deflect the key defender to land checkmate on the back rank.',
      es: 'Desvía al defensor clave para dar jaque mate en la última fila.',
    },
    rating: 1300,
    difficulty: 'easy',
    fen: '3r2k1/1p3ppp/8/8/8/1Q6/5PPP/3R2K1 w - - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Force checkmate on the back rank!',
      es: 'Juegan Blancas: ¡Fuerza el mate en la última fila!',
    },
    moves: [
      { from: 'b3', to: 'd8', san: 'Qxd8+' },
      { from: 'd1', to: 'd8', san: 'Rxd8#' },
    ],
    opponentResponses: [
      { from: 'd8', to: 'd8', san: 'Rxd8' },
    ],
    explanation: {
      en: '1. Qxd8+! sacrifices the Queen to overload Black’s Rook on d8. After 1... Rxd8, White plays 2. Rxd8# delivering Back Rank Checkmate because Black’s King has no escape squares.',
      es: '1. ¡Qxd8+! sacrifica la Dama para sobrecargar la Torre negra de d8. Tras 1... Rxd8, las blancas juegan 2. Rxd8# dando Mate en la Última Fila porque el Rey negro no tiene casillas de escape.',
    },
    hints: {
      hint1: {
        en: 'Look at the d8 square defended by Black’s Rook and attacked by White’s Queen and Rook.',
        es: 'Mira la casilla d8 defendida por la Torre negra y atacada por la Dama y Torre blancas.',
      },
      hint2: {
        en: 'Sacrifice your Queen on d8 to clear the file for your Rook to checkmate.',
        es: 'Sacrifíca tu Dama en d8 para despejar la columna y que tu Torre dé mate.',
      },
      targetSquares: ['b3', 'd1', 'd8'],
      solutionText: {
        en: '1. Qxd8+! Rxd8 2. Rxd8#',
        es: '1. Qxd8+! Rxd8 2. Rxd8#',
      },
    },
  },
  {
    id: 'puz_004',
    title: {
      en: 'Discovered Check Queen Trap',
      es: 'Ataque a la Descubierta: Captura de Dama',
    },
    theme: 'discovered_attack',
    themeName: { en: 'Discovered Attack', es: 'Ataque a la Descubierta' },
    themeDescription: {
      en: 'Move a checking piece to uncover a fatal attack on the opponent’s Queen.',
      es: 'Mueve una pieza con jaque para destapar un ataque fatal contra la Dama rival.',
    },
    rating: 1380,
    difficulty: 'intermediate',
    fen: 'r1b1k2r/pppp1ppp/2n2q2/8/1b2N3/2P5/PP2PPPP/R1BQKB1R w KQkq - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Win Black’s Queen with a Knight jump!',
      es: 'Juegan Blancas: ¡Gana la Dama negra con un salto de Caballo!',
    },
    moves: [
      { from: 'e4', to: 'f6', san: 'Nxf6+' },
    ],
    explanation: {
      en: 'White plays 1. Nxf6+ with check! Because it is a check, Black is forced to respond to the King threat (e.g. gxf6), leaving Black’s Queen already captured for +9 material advantage.',
      es: 'Las blancas juegan 1. Nxf6+ ¡con jaque! Al ser jaque, las negras están obligadas a responder a la amenaza al Rey (p. ej. gxf6), dejando la Dama negra capturada con +9 de ventaja material.',
    },
    hints: {
      hint1: {
        en: 'The White Knight on e4 is lined up with Black’s Queen on f6 and King on e8.',
        es: 'El Caballo blanco de e4 está alineado con la Dama negra de f6 y el Rey de e8.',
      },
      hint2: {
        en: 'Capture Black’s Queen directly with check on f6!',
        es: '¡Captura la Dama negra directamente con jaque en f6!',
      },
      targetSquares: ['e4', 'f6'],
      solutionText: {
        en: '1. Nxf6+! capturing the Queen with check.',
        es: '1. Nxf6+! capturando la Dama con jaque.',
      },
    },
  },
  {
    id: 'puz_005',
    title: {
      en: 'Rook Skewer on King & Queen',
      es: 'Enfilada de Torre sobre Rey y Dama',
    },
    theme: 'skewer',
    themeName: { en: 'Skewer', es: 'Enfilada' },
    themeDescription: {
      en: 'Check the enemy King along an open rank or file to win the Queen behind it.',
      es: 'Da jaque al Rey enemigo en una fila o columna abierta para ganar la Dama que está detrás.',
    },
    rating: 1220,
    difficulty: 'beginner',
    fen: '4k3/8/8/8/3q4/8/8/1R2K3 w - - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Skewer Black’s King and win the undefended Queen!',
      es: 'Juegan Blancas: ¡Aplica una enfilada al Rey negro y gana la Dama!',
    },
    moves: [
      { from: 'b1', to: 'e1', san: 'Re1+' },
      { from: 'e1', to: 'e4', san: 'Rxe4' },
    ],
    opponentResponses: [
      { from: 'e8', to: 'f7', san: 'Kf7' },
    ],
    explanation: {
      en: '1. Re1+ checks Black’s King along the e-file. Because the Queen on d4 is behind the King, when the King moves away (e.g. 1... Kf7), White plays 2. Rxe4 capturing the Queen!',
      es: '1. Re1+ da jaque al Rey negro en la columna e. Como la Dama de d4 está detrás del Rey, cuando el Rey se desplaza (p. ej. 1... Kf7), las blancas juegan 2. Rxe4 capturando la Dama.',
    },
    hints: {
      hint1: {
        en: 'Look at the open e-file containing both Black’s King on e8 and Queen on d4.',
        es: 'Mira la columna e abierta que contiene tanto al Rey negro en e8 como a la Dama en d4.',
      },
      hint2: {
        en: 'Move your Rook from b1 to e1 to check the King along the file.',
        es: 'Mueve tu Torre de b1 a e1 para dar jaque al Rey a lo largo de la columna.',
      },
      targetSquares: ['b1', 'e1', 'e8', 'd4'],
      solutionText: {
        en: '1. Re1+ Kf7 2. Rxe4!',
        es: '1. Re1+ Kf7 2. Rxe4!',
      },
    },
  },
  {
    id: 'puz_006',
    title: {
      en: 'Removing the Knight Guard',
      es: 'Eliminación del Caballo Defensor',
    },
    theme: 'removing_defender',
    themeName: { en: 'Removing Defender', es: 'Eliminar al Defensor' },
    themeDescription: {
      en: 'Eliminate the key defensive piece to win a hanging tactical prize.',
      es: 'Elimina la pieza defensora clave para conquistar un objetivo táctico indefenso.',
    },
    rating: 1420,
    difficulty: 'intermediate',
    fen: 'r1b1k2r/pppp1ppp/8/2b5/3nP3/2N1B3/PPP2PPP/R3KB1R w KQkq - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Eliminate Black’s Knight and trade favorably!',
      es: 'Juegan Blancas: ¡Elimina el Caballo negro y gana material!',
    },
    moves: [
      { from: 'e3', to: 'd4', san: 'Bxd4' },
      { from: 'f1', to: 'd4', san: 'Bxd4' },
    ],
    opponentResponses: [
      { from: 'c5', to: 'd4', san: 'Bxd4' },
    ],
    explanation: {
      en: 'Black’s Knight on d4 threatens a dangerous fork on c2. White plays 1. Bxd4! capturing the active Knight. After 1... Bxd4, White follows up with 2. Qxd4 or 2. Bd3 neutralizing Black’s initiative.',
      es: 'El Caballo negro de d4 amenaza un peligroso tenedor en c2. Las blancas juegan 1. Bxd4! capturando el activo Caballo. Tras 1... Bxd4, las blancas neutralizan por completo la iniciativa negra.',
    },
    hints: {
      hint1: {
        en: 'The Black Knight on d4 is threatening a fork on c2.',
        es: 'El Caballo negro de d4 amenaza un tenedor en c2.',
      },
      hint2: {
        en: 'Use your dark-squared Bishop on e3 to capture the Knight on d4.',
        es: 'Usa tu Alfil de e3 para capturar el Caballo en d4.',
      },
      targetSquares: ['e3', 'd4'],
      solutionText: {
        en: '1. Bxd4! Bxd4 2. Qxd4!',
        es: '1. Bxd4! Bxd4 2. Qxd4!',
      },
    },
  },
  {
    id: 'puz_007',
    title: {
      en: 'Royal Knight Fork on King & Rook',
      es: 'Tenedor Real de Caballo sobre Rey y Torre',
    },
    theme: 'fork',
    themeName: { en: 'Knight Fork', es: 'Tenedor de Caballo' },
    themeDescription: {
      en: 'Fork the King and Rook on c7 to win an exchange.',
      es: 'Aplica un tenedor al Rey y la Torre en c7 para ganar calidad.',
    },
    rating: 1280,
    difficulty: 'easy',
    fen: 'r1b1k2r/pp1p1ppp/2n5/2p1N3/4P3/2N5/PPP2PPP/R3KB1R w KQkq - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Attack c7 to fork King & Rook!',
      es: 'Juegan Blancas: ¡Ataca c7 para aplicar un tenedor a Rey y Torre!',
    },
    moves: [
      { from: 'e5', to: 'c6', san: 'Nxc6' },
    ],
    explanation: {
      en: 'White plays 1. Nxc6! winning Black’s Knight on c6 or forcing 1... dxc6, giving White total central pawn control and dismantling Black’s pawn structure.',
      es: 'Las blancas juegan 1. Nxc6! ganando el Caballo negro de c6 o forzando 1... dxc6, otorgando a las blancas el control total del centro y desmantelando la estructura negra.',
    },
    hints: {
      hint1: {
        en: 'White’s Knight on e5 is actively eyeing Black’s defender on c6.',
        es: 'El Caballo blanco en e5 contempla activamente al defensor negro en c6.',
      },
      hint2: {
        en: 'Capture the Knight on c6 directly with your Knight.',
        es: 'Captura el Caballo en c6 directamente con tu Caballo.',
      },
      targetSquares: ['e5', 'c6'],
      solutionText: {
        en: '1. Nxc6! dxc6',
        es: '1. Nxc6! dxc6',
      },
    },
  },
  {
    id: 'puz_008',
    title: {
      en: 'Absolute Pin on the d-File',
      es: 'Clavada Absoluta en la Columna D',
    },
    theme: 'pin',
    themeName: { en: 'Pin', es: 'Clavada' },
    themeDescription: {
      en: 'Pin an enemy piece against its King to win material.',
      es: 'Clava una pieza enemiga contra su Rey para ganar material.',
    },
    rating: 1350,
    difficulty: 'intermediate',
    fen: 'r2qk2r/ppp1bppp/2n5/3pP3/3P4/2PB1N2/PP3PPP/R1BQ1RK1 w kq - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Exploit central space and build overwhelming pressure!',
      es: 'Juegan Blancas: ¡Aprovecha el espacio central y presiona el flanco de Rey!',
    },
    moves: [
      { from: 'c3', to: 'h7', san: 'Bxh7+' },
    ],
    explanation: {
      en: 'White plays 1. Bxh7+! executing a classical Greek Gift style bishop sacrifice or pawn capture gaining decisive kingside attacking momentum.',
      es: 'Las blancas ejecutan un regalo griego tradicional capturando peón con 1. Bxh7+! abriendo brecha en el enroque negro.',
    },
    hints: {
      hint1: {
        en: 'Check the h7 pawn protected only by the King.',
        es: 'Revisa el peón de h7 protegido únicamente por el Rey.',
      },
      hint2: {
        en: 'Strike on h7 with your light-squared Bishop!',
        es: '¡Golpea en h7 con tu Alfil de casillas claras!',
      },
      targetSquares: ['d3', 'h7'],
      solutionText: {
        en: '1. Bxh7+! Kxh7',
        es: '1. Bxh7+! Kxh7',
      },
    },
  },
];
