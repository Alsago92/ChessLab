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

export const CURRENT_VERSION = '1.2.0';

export const VERSION_HISTORY: VersionInfo[] = [
  {
    version: '1.2.0',
    date: '2026-07-24',
    title: {
      en: 'ChessLab Rebrand, Online Refinements & Move Visualizers',
      es: 'Reinvención ChessLab, Ajustes Online e Indicadores de Movimiento',
    },
    type: 'minor',
    isCurrent: true,
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
