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
    fen: 'r2qk2r/ppp2ppp/2n1b3/8/3PP3/2N5/PPP2PPP/R2QKBNR w KQkq - 0 1',
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
      { from: 'e6', to: 'd7', san: 'Bd7' },
    ],
    explanation: {
      en: 'Advancing the pawn from d4 to d5 creates a fork on Black’s Knight on c6 and Bishop on e6. After Black retreats the Bishop to d7, White captures the Knight on c6 with dxc6 winning a knight!',
      es: 'Avanzar el peón de d4 a d5 crea un tenedor doble sobre el Caballo negro de c6 y el Alfil de e6. Tras replegar el Alfil a d7, las blancas capturan el Caballo en c6 con dxc6 ganando una pieza limpia.',
    },
    hints: {
      hint1: {
        en: 'Look at the pawn on d4 and the two Black pieces aligned on c6 and e6.',
        es: 'Observa el peón de d4 y las dos piezas negras en c6 y e6.',
      },
      hint2: {
        en: 'Pushing d4 to d5 attacks both the Knight and the Bishop simultaneously.',
        es: 'Avanzar d4 a d5 ataca tanto al Caballo como al Alfil simultáneamente.',
      },
      targetSquares: ['d4', 'd5', 'c6', 'e6'],
      solutionText: {
        en: '1. d5! attacking Bishop & Knight. After 1... Bd7 2. dxc6!',
        es: '1. d5! atacando Alfil y Caballo. Tras 1... Bd7 2. dxc6!',
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
    fen: '5r1k/6pp/8/4N3/2Q5/8/6PP/6K1 w - - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Deliver a legendary Smothered Checkmate!',
      es: 'Juegan Blancas: ¡Ejecuta un legendario Mate Ahogado!',
    },
    moves: [
      { from: 'e5', to: 'f7', san: 'Nf7+' },
      { from: 'f7', to: 'h6', san: 'Nh6+' },
      { from: 'c4', to: 'g8', san: 'Qg8+' },
      { from: 'h6', to: 'f7', san: 'Nf7#' },
    ],
    opponentResponses: [
      { from: 'h8', to: 'g8', san: 'Kg8' },
      { from: 'g8', to: 'h8', san: 'Kh8' },
      { from: 'f8', to: 'g8', san: 'Rxg8' },
    ],
    explanation: {
      en: '1. Nf7+ Kg8 2. Nh6+! is a Double Check from Queen and Knight forcing 2... Kh8. 3. Qg8+!! is a brilliant Queen sacrifice forcing 3... Rxg8, smothering the Black King. 4. Nf7# delivers Smothered Checkmate!',
      es: '1. Nf7+ Kg8 2. Nh6+! es un Doble Jaque de Dama y Caballo forzando 2... Kh8. 3. ¡¡Qg8+!! es un brillante sacrificio de Dama forzando 3... Rxg8, asfixiando al Rey negro. ¡4. Nf7# asesta el Mate Ahogado!',
    },
    hints: {
      hint1: {
        en: 'Jump with the Knight to f7 with check, forcing the King to move.',
        es: 'Salta con el Caballo a f7 dando jaque para obligar al Rey a moverse.',
      },
      hint2: {
        en: 'Deliver double check with Nh6+, then sacrifice the Queen on g8!',
        es: 'Asesta jaque doble con Nh6+, ¡luego sacrifica la Dama en g8!',
      },
      targetSquares: ['e5', 'f7', 'h6', 'c4', 'g8'],
      solutionText: {
        en: '1. Nf7+ Kg8 2. Nh6+ Kh8 3. Qg8+! Rxg8 4. Nf7#',
        es: '1. Nf7+ Kg8 2. Nh6+ Kh8 3. Qg8+! Rxg8 4. Nf7#',
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
    fen: '3r2k1/1p3ppp/1q6/8/8/3Q4/5PPP/3R2K1 w - - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Force checkmate on the back rank!',
      es: 'Juegan Blancas: ¡Fuerza el mate en la última fila!',
    },
    moves: [
      { from: 'd3', to: 'd8', san: 'Qxd8+' },
      { from: 'd1', to: 'd8', san: 'Rxd8#' },
    ],
    opponentResponses: [
      { from: 'b6', to: 'd8', san: 'Qxd8' },
    ],
    explanation: {
      en: '1. Qxd8+! sacrifices the Queen to force Black’s Queen off the b6 diagonal to d8. After 1... Qxd8, White plays 2. Rxd8# delivering Back Rank Checkmate because Black’s King has no luft (escape square).',
      es: '1. ¡Qxd8+! sacrifica la Dama para obligar a la Dama negra a ir a d8. Tras 1... Qxd8, las blancas juegan 2. Rxd8# dando Mate en la Última Fila porque el Rey negro no tiene casilla de escape.',
    },
    hints: {
      hint1: {
        en: 'Look at the d8 square defended by Black’s Rook and attacked by White’s Queen and Rook.',
        es: 'Mira la casilla d8 defendida por la Torre negra y atacada por la Dama y Torre blancas.',
      },
      hint2: {
        en: 'Sacrifice your Queen on d8 to force checkmate with your Rook on the next move.',
        es: 'Sacrifíca tu Dama en d8 para forzar jaque mate con tu Torre en la siguiente jugada.',
      },
      targetSquares: ['d3', 'd1', 'd8'],
      solutionText: {
        en: '1. Qxd8+! Qxd8 2. Rxd8#',
        es: '1. Qxd8+! Qxd8 2. Rxd8#',
      },
    },
  },
  {
    id: 'puz_004',
    title: {
      en: 'Rook Pin & Skewer',
      es: 'Clavada y Enfilada de Torre',
    },
    theme: 'skewer',
    themeName: { en: 'Skewer', es: 'Enfilada' },
    themeDescription: {
      en: 'Pin an exposed Queen against her King along an open file to capture her.',
      es: 'Clava a una Dama expuesta contra su Rey en una columna abierta para capturarla.',
    },
    rating: 1220,
    difficulty: 'beginner',
    fen: '8/4k3/8/8/8/8/4q3/R5K1 w - - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Pin Black’s Queen and capture her!',
      es: 'Juegan Blancas: ¡Clava a la Dama negra y captúrala!',
    },
    moves: [
      { from: 'a1', to: 'e1', san: 'Re1' },
      { from: 'e1', to: 'e2', san: 'Rxe2' },
    ],
    opponentResponses: [
      { from: 'e7', to: 'd6', san: 'Kd6' },
    ],
    explanation: {
      en: '1. Re1! pins Black’s Queen on e2 to the King on e7. Black’s Queen cannot move off the e-file. When Black moves the King away with 1... Kd6, White plays 2. Rxe2 winning Black’s Queen!',
      es: '1. ¡Re1! clava la Dama negra de e2 contra el Rey de e7. La Dama no puede abandonar la columna e. Tras mover el Rey a 1... Kd6, las blancas juegan 2. Rxe2 ganando la Dama.',
    },
    hints: {
      hint1: {
        en: 'Look at the open e-file containing both Black’s King on e7 and Queen on e2.',
        es: 'Observa la columna e abierta que contiene tanto al Rey negro en e7 como a la Dama en e2.',
      },
      hint2: {
        en: 'Move your Rook from a1 to e1 to pin the Queen directly to the King.',
        es: 'Mueve tu Torre de a1 a e1 para clavar la Dama directamente contra el Rey.',
      },
      targetSquares: ['a1', 'e1', 'e7', 'e2'],
      solutionText: {
        en: '1. Re1! Kd6 2. Rxe2!',
        es: '1. Re1! Kd6 2. Rxe2!',
      },
    },
  },
  {
    id: 'puz_005',
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
    fen: 'r1b1k2r/pppp1ppp/8/2b5/3nP3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Eliminate Black’s Knight and win material!',
      es: 'Juegan Blancas: ¡Elimina el Caballo negro y gana material!',
    },
    moves: [
      { from: 'e3', to: 'd4', san: 'Bxd4' },
      { from: 'd1', to: 'd4', san: 'Qxd4' },
    ],
    opponentResponses: [
      { from: 'c5', to: 'd4', san: 'Bxd4' },
    ],
    explanation: {
      en: 'Black’s Knight on d4 threatens c2. White plays 1. Bxd4! capturing the Knight. After 1... Bxd4, White plays 2. Qxd4 capturing Black’s Bishop and winning a net piece with decisive material advantage.',
      es: 'El Caballo negro de d4 amenaza c2. Las blancas juegan 1. Bxd4! capturando el Caballo. Tras 1... Bxd4, las blancas juegan 2. Qxd4 capturando el Alfil y ganando una pieza con ventaja decisiva.',
    },
    hints: {
      hint1: {
        en: 'The Black Knight on d4 is protected by the Bishop on c5.',
        es: 'El Caballo negro de d4 está protegido por el Alfil de c5.',
      },
      hint2: {
        en: 'Capture the Knight on d4 with your Bishop, then recapture on d4 with your Queen.',
        es: 'Captura el Caballo en d4 con tu Alfil, y luego recaptura en d4 con tu Dama.',
      },
      targetSquares: ['e3', 'd4', 'd1'],
      solutionText: {
        en: '1. Bxd4! Bxd4 2. Qxd4!',
        es: '1. Bxd4! Bxd4 2. Qxd4!',
      },
    },
  },
  {
    id: 'puz_006',
    title: {
      en: 'Royal Knight Fork on c7',
      es: 'Tenedor Real de Caballo en c7',
    },
    theme: 'fork',
    themeName: { en: 'Knight Fork', es: 'Tenedor de Caballo' },
    themeDescription: {
      en: 'Fork the King, Queen, and Rook on c7 to win decisive material.',
      es: 'Aplica un tenedor al Rey, Dama y Torre en c7 para ganar material decisivo.',
    },
    rating: 1280,
    difficulty: 'easy',
    fen: 'r3k2r/ppp2ppp/2n1q3/3N4/3P4/2P5/PP3PPP/R2Q1RK1 w kq - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Strike c7 to fork King & Queen!',
      es: 'Juegan Blancas: ¡Golpea en c7 para aplicar un tenedor al Rey y Dama!',
    },
    moves: [
      { from: 'd5', to: 'c7', san: 'Nxc7+' },
      { from: 'c7', to: 'a8', san: 'Nxa8' },
    ],
    opponentResponses: [
      { from: 'e8', to: 'd7', san: 'Kd7' },
    ],
    explanation: {
      en: '1. Nxc7+! checks Black’s King on e8 while simultaneously attacking Black’s Queen on e6 and Rook on a8! After 1... Kd7, White captures 2. Nxa8 winning Black’s Rook cleanly.',
      es: '¡1. Nxc7+! da jaque al Rey negro en e8 mientras ataca simultáneamente a la Dama negra en e6 y a la Torre en a8. Tras 1... Kd7, las blancas capturan 2. Nxa8 ganando la Torre limpia.',
    },
    hints: {
      hint1: {
        en: 'Look at the c7 square targeted by White’s Knight on d5.',
        es: 'Mira la casilla c7 amenazada por el Caballo blanco de d5.',
      },
      hint2: {
        en: 'Jump with your Knight to c7 with check to fork King, Queen, and Rook.',
        es: 'Salta con tu Caballo a c7 con jaque para dar un tenedor a Rey, Dama y Torre.',
      },
      targetSquares: ['d5', 'c7', 'e8', 'e6', 'a8'],
      solutionText: {
        en: '1. Nxc7+! Kd7 2. Nxa8!',
        es: '1. Nxc7+! Kd7 2. Nxa8!',
      },
    },
  },
  {
    id: 'puz_007',
    title: {
      en: 'Discovered Attack Capture',
      es: 'Captura por Ataque a la Descubierta',
    },
    theme: 'discovered_attack',
    themeName: { en: 'Discovered Attack', es: 'Ataque a la Descubierta' },
    themeDescription: {
      en: 'Uncover a direct line of attack to win an active enemy piece.',
      es: 'Abre una línea de ataque directa para capturar una pieza enemiga activa.',
    },
    rating: 1380,
    difficulty: 'intermediate',
    fen: 'r1bqk2r/pppp1ppp/2n5/4p3/1b2n3/2N2N2/PPPPQPPP/R1B1KB1R w KQkq - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Win Black’s undefended Knight on e4!',
      es: 'Juegan Blancas: ¡Gana el Caballo negro indefenso en e4!',
    },
    moves: [
      { from: 'c3', to: 'e4', san: 'Nxe4' },
    ],
    explanation: {
      en: 'White plays 1. Nxe4! capturing Black’s central Knight on e4. Black’s e5 pawn cannot retake effectively because White’s Queen on e2 controls the e-file with superior central position.',
      es: 'Las blancas juegan 1. Nxe4! capturando el Caballo central negro en e4. El peón de e5 no puede recapturar eficazmente porque la Dama blanca en e2 domina la columna e.',
    },
    hints: {
      hint1: {
        en: 'Look at Black’s Knight on e4 attacked by White’s Knight on c3.',
        es: 'Observa el Caballo negro de e4 atacado por el Caballo blanco de c3.',
      },
      hint2: {
        en: 'Capture the Knight on e4 directly with your Knight.',
        es: 'Captura el Caballo en e4 directamente con tu Caballo.',
      },
      targetSquares: ['c3', 'e4'],
      solutionText: {
        en: '1. Nxe4! winning a clean Knight.',
        es: '1. Nxe4! ganando un Caballo limpio.',
      },
    },
  },
  {
    id: 'puz_008',
    title: {
      en: 'Central Pin Strike',
      es: 'Ataque con Clavada Central',
    },
    theme: 'pin',
    themeName: { en: 'Pin', es: 'Clavada' },
    themeDescription: {
      en: 'Pounce on a pinned Knight to win central pawns and material.',
      es: 'Lánzate sobre un Caballo clavado para ganar peones centrales y material.',
    },
    rating: 1350,
    difficulty: 'intermediate',
    fen: 'r1bqk2r/ppp2ppp/2n5/1B1pp3/4P3/3P1N2/PPP2PPP/R2QK2R w KQkq - 0 1',
    sideToMove: 'w',
    objective: {
      en: 'White to move: Break Black’s center using the pin on c6!',
      es: 'Juegan Blancas: ¡Rompe el centro negro aprovechando la clavada en c6!',
    },
    moves: [
      { from: 'e4', to: 'd5', san: 'exd5' },
    ],
    explanation: {
      en: 'White plays 1. exd5! exploiting the pin on Black’s c6 Knight created by White’s Bishop on b5. Because the c6 Knight is pinned to the e8 King, Black cannot recapture with 1... Nxd5, winning a key central pawn for White.',
      es: 'Las blancas juegan 1. exd5! aprovechando la clavada del Caballo de c6 provocada por el Alfil en b5. Al estar clavado contra el Rey de e8, las negras no pueden recapturar 1... Nxd5, otorgando un peón clave a las blancas.',
    },
    hints: {
      hint1: {
        en: 'The Black Knight on c6 is pinned to the King by White’s Bishop on b5.',
        es: 'El Caballo negro de c6 está clavado al Rey por el Alfil blanco en b5.',
      },
      hint2: {
        en: 'Capture the pawn on d5 with your e4 pawn.',
        es: 'Captura el peón en d5 con tu peón de e4.',
      },
      targetSquares: ['b5', 'c6', 'e4', 'd5'],
      solutionText: {
        en: '1. exd5! exploiting the pin on c6.',
        es: '1. exd5! aprovechando la clavada en c6.',
      },
    },
  },
];
