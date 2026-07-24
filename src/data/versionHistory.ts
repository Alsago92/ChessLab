export interface VersionChange {
  category: 'feature' | 'fix' | 'improvement' | 'ui';
  icon: string;
  title: { en: string; es: string };
  description: { en: string; es: string };
}

export interface VersionInfo {
  version: string;
  date: string;
  title: { en: string; es: string };
  type: 'major' | 'minor' | 'patch';
  isCurrent?: boolean;
  changes: VersionChange[];
}

export const CURRENT_VERSION = '1.3.0';

export const VERSION_HISTORY: VersionInfo[] = [
  {
    version: '1.3.0',
    date: '2026-07-24',
    title: {
      en: 'Complete Analysis Board Module with Opening Explorer & FEN/PGN Loader',
      es: 'Módulo Completo de Tablero de Análisis con Explorador de Aperturas y Carga FEN/PGN',
    },
    type: 'minor',
    isCurrent: true,
    changes: [
      {
        category: 'feature',
        icon: 'psychology',
        title: { en: 'Dedicated Analysis Toolbar', es: 'Barra de Herramientas de Análisis' },
        description: {
          en: 'Added instant control panel for engine evaluation toggle, position reset, board clear, board flip, and 1-click FEN/PGN clipboard export.',
          es: 'Barra de control directo para conmutar evaluación del motor, reiniciar posición, limpiar tablero, girar tablero y copiar FEN/PGN con un clic.',
        },
      },
      {
        category: 'feature',
        icon: 'upload_file',
        title: { en: 'FEN / PGN Position & Game Loader Modal', es: 'Modal de Carga de Posiciones FEN y Partidas PGN' },
        description: {
          en: 'Import any custom FEN string or paste complete PGN notation. Includes preset library with classic openings, endgames (Lucena/Philidor) and tactics.',
          es: 'Importa cualquier posición FEN o pega partidas PGN completas. Incluye librería preestablecida con aperturas clásicas, finales y tácticas.',
        },
      },
      {
        category: 'feature',
        icon: 'menu_book',
        title: { en: 'Interactive Master Opening Explorer', es: 'Explorador Interactivo de Aperturas de Maestros' },
        description: {
          en: 'Real-time opening detection with ECO codes, master win/draw ratios, and interactive candidate moves that play directly on the board when clicked.',
          es: 'Detección de aperturas en tiempo real con códigos ECO, estadísticas de victoria de Grandes Maestros y jugadas sugeridas ejecutables en el tablero.',
        },
      },
    ],
  },
  {
    version: '1.2.2',
    date: '2026-07-24',
    title: {
      en: 'Refined Online Move Square Highlights',
      es: 'Indicadores de Movimiento de Casillas en Línea Optimizados',
    },
    type: 'patch',
    isCurrent: false,
    changes: [
      {
        category: 'improvement',
        icon: 'grid_view',
        title: { en: 'Streamlined Online Move Indicators', es: 'Indicadores de Movimiento Online Limpios' },
        description: {
          en: 'Removed board trajectory arrow overlay and preserved clean, high-contrast origin and destination square highlights for online opponent moves.',
          es: 'Se eliminó la flecha de trayectoria en el tablero para mantener únicamente los destacados de casillas de origen y destino en jugadas en línea.',
        },
      },
    ],
  },
  {
    version: '1.2.1',
    date: '2026-07-24',
    title: {
      en: 'Local Pass & Play Fixes & Exclusive Online Move Indicators',
      es: 'Corrección de Pasar y Jugar Local e Indicadores Exclusivos Online',
    },
    type: 'patch',
    isCurrent: false,
    changes: [
      {
        category: 'fix',
        icon: 'groups',
        title: { en: 'Local Pass & Play Module Fix', es: 'Corrección del Módulo Pasar y Jugar (Local PvP)' },
        description: {
          en: 'Resolved turn selection and move constraints in Pass & Play mode so two local players can make moves seamlessly without interference from background network sessions.',
          es: 'Se corrigió la selección de piezas y restricciones de turno en Pasar y Jugar para que ambos jugadores locales jueguen fluidamente sin interferencia de conexiones en segundo plano.',
        },
      },
      {
        category: 'improvement',
        icon: 'alt_route',
        title: { en: 'Exclusive Move Indicators for Online Matches', es: 'Indicadores de Movimiento Exclusivos para Partidas Online' },
        description: {
          en: 'Configured last-move square highlights and vector trajectory lines on the board to display exclusively during Online Arena matches.',
          es: 'Se configuraron las líneas de trayectoria y destacados de último movimiento para mostrarse únicamente durante partidas de la Arena Online.',
        },
      },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-07-24',
    title: {
      en: 'ChessLab Rebrand, Online Refinements & Move Visualizers',
      es: 'Reinvención ChessLab, Ajustes Online e Indicadores de Movimiento',
    },
    type: 'minor',
    isCurrent: false,
    changes: [
      {
        category: 'ui',
        icon: 'sell',
        title: { en: 'Rebranding to ChessLab', es: 'Cambio de Nombre a ChessLab' },
        description: {
          en: 'Updated application identity and dashboard branding to ChessLab across the entire platform.',
          es: 'Se actualizó la identidad de la aplicación y la marca del panel a ChessLab en toda la plataforma.',
        },
      },
      {
        category: 'feature',
        icon: 'alt_route',
        title: { en: 'Visual Last Move Highlights & Directional Arrow', es: 'Destacado de Último Movimiento y Flecha de Dirección' },
        description: {
          en: 'Added glowing origin square highlights, destination pulse markers, and an animated vector arrow indicating the last played move.',
          es: 'Se añadieron resaltados resplandecientes en la casilla de origen, pulsos de destino y una flecha vectorial animada que indica el último movimiento.',
        },
      },
      {
        category: 'improvement',
        icon: 'sports_esports',
        title: { en: 'Online Arena Toolbar Clean-up', es: 'Limpieza de Barra en Arena Online' },
        description: {
          en: 'Automatically hid Undo and Redo controls during Online Arena and Private Lobby matches to uphold fair play.',
          es: 'Se ocultaron automáticamente las opciones de Deshacer y Rehacer durante partidas en línea para garantizar un juego justo.',
        },
      },
      {
        category: 'feature',
        icon: 'history',
        title: { en: 'Integrated Version Control & Changelog System', es: 'Sistema de Control de Versiones y Historial' },
        description: {
          en: 'Added a dedicated Version Control modal accessible directly from the header version badge to review recent release notes.',
          es: 'Se agregó un modal de Control de Versiones accesible directamente desde la insignia en el encabezado.',
        },
      },
      {
        category: 'fix',
        icon: 'extension',
        title: { en: 'Tactical Puzzles Dataset Verification', es: 'Verificación del Dataset de Puzzles Tácticos' },
        description: {
          en: 'Fully validated legal move sequences and FEN setups for all 8 guided tactical training modules.',
          es: 'Se validaron al 100% las secuencias de movimientos legales y posiciones FEN para los 8 módulos de entrenamiento táctico.',
        },
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-07-20',
    title: {
      en: 'Guided Tactical Puzzles & Web Audio Synthesis',
      es: 'Puzzles Tácticos Guiados y Sintetizador Web Audio',
    },
    type: 'minor',
    changes: [
      {
        category: 'feature',
        icon: 'extension',
        title: { en: 'Guided Tactical Puzzles Module', es: 'Módulo de Puzzles Tácticos Guiados' },
        description: {
          en: 'Introduced themed puzzle drills with progressive hints, target square highlights, and tactical explanations.',
          es: 'Se introdujeron ejercicios de puzzles temáticos con pistas progresivas, resaltados de casillas y explicaciones tácticas.',
        },
      },
      {
        category: 'improvement',
        icon: 'volume_up',
        title: { en: 'Web Audio Sound Engine', es: 'Motor de Audio Web Personalizado' },
        description: {
          en: 'Implemented dynamic Web Audio API synthesizer for crisp move, capture, check, and checkmate sound effects.',
          es: 'Se implementó un sintetizador Web Audio API para efectos de sonido realistas de jugadas, capturas, jaques y mates.',
        },
      },
      {
        category: 'ui',
        icon: 'translate',
        title: { en: 'Full Spanish & English Localization', es: 'Localización Completa en Español e Inglés' },
        description: {
          en: 'Added full bilingual support across all interface views, setting controls, and stats modules.',
          es: 'Soporte bilingüe completo en todas las vistas de la interfaz, ajustes y módulos de estadísticas.',
        },
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-07-15',
    title: {
      en: 'ChessLab Core Engine & Live Multiplayer Launch',
      es: 'Lanzamiento del Motor Central y Multijugador en Vivo',
    },
    type: 'major',
    changes: [
      {
        category: 'feature',
        icon: 'sports_esports',
        title: { en: 'Live Arena & Private Room Matchmaking', es: 'Arena en Vivo y Emparejamiento por Salas Privadas' },
        description: {
          en: 'Integrated WebSocket server infrastructure for real-time online multiplayer games with custom code invites.',
          es: 'Se integró infraestructura WebSocket para partidas multijugador online en tiempo real con códigos de invitación.',
        },
      },
      {
        category: 'feature',
        icon: 'smart_toy',
        title: { en: 'Stockfish AI Engine Opponent', es: 'Rival Inteligencia Artificial Stockfish' },
        description: {
          en: 'Single-player practice against AI engine with 4 adjustable difficulty tiers (Beginner to Master).',
          es: 'Práctica individual contra IA con 4 niveles ajustables de dificultad (Principiante a Maestro).',
        },
      },
      {
        category: 'ui',
        icon: 'palette',
        title: { en: 'Material Design 3 Dashboard', es: 'Panel Material Design 3' },
        description: {
          en: 'Responsive interface with Dark & Light theme switching, piece skin selectors, and board color customization.',
          es: 'Interfaz responsiva con cambio de temas Claro y Oscuro, selector de piezas y personalización de tableros.',
        },
      },
    ],
  },
];
