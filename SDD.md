# Software Design Document (SDD) - Material Chess

**Project Name:** Material Chess  
**Version:** 1.0.0  
**Date:** July 2026  
**Status:** Active Production  
**Target Environment:** Cloud Run Container (Node.js + Express + WebSocket + React 19)

---

## 1. System Overview & Objectives

**Material Chess** is a modern, high-performance, responsive web application and real-time dashboard designed for interactive chess gameplay, multi-mode match management, AI analysis, local practice, and real-time online multiplayer matchmaking.

### 1.1 Core Objectives
- **Multi-Mode Gameplay:** Support local 2-player mode, AI Bot with configurable difficulty levels, Online Matchmaking Arena, and Private Room Lobbies with custom match codes (`#ID`).
- **Real-Time Multiplayer Engine:** Provide instantaneous move synchronization and game state management over WebSockets (`ws`).
- **Engine Analysis & Move Validation:** Real-time move legality enforcement powered by `chess.js`, with move history tracking, FEN string exports, PGN imports, and captured piece (Boneyard) calculations.
- **Material Design 3 Aesthetics:** Sophisticated dark and light theme palette, fluid transitions using `motion`, customizable piece/board themes, and accessible typography.
- **Persistent Profile & Stats:** Comprehensive statistics tracking win/loss ratios, rating history, achievements, and player preferences stored in browser cookies/local storage.

---

## 2. Architecture Overview

Material Chess utilizes a hybrid full-stack architecture combining a reactive single-page front-end application with a lightweight Express HTTP server and a custom WebSocket matchmaking server running in a single Node.js runtime container.

```
+-------------------------------------------------------------------------+
|                               BROWSER CLIENT                            |
|  +-------------------------------------------------------------------+  |
|  |                            React 19 SPA                           |  |
|  |  [TopNavBar] [LeftPanel] [ChessBoard] [RightPanel] [GameModesScreen]|  |
|  +-------------------------------------------------------------------+  |
|            |                                             ^              |
|            | REST / Static Assets                        | WebSockets   |
|            v                                             v (ws / wss)   |
+------------|---------------------------------------------|--------------+
             |                                             |
+------------|---------------------------------------------|--------------+
|            v                   SERVER                    v              |
|  +-------------------------------------------------------------------+  |
|  |                           Express.js                              |  |
|  |  - Serves compiled static bundle (dist/) in Production             |  |
|  |  - Vite Middleware in Development                             |  |
|  |  - Health & API endpoints (/api/health)                         |  |
|  +-------------------------------------------------------------------+  |
|  |                        WebSocket Server (ws)                      |  |
|  |  - Matchmaking Queue Engine                                       |  |
|  |  - Active Room Registry & Session Management                      |  |
|  |  - Real-time Move Broadcaster & Chat Relay                        |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 3. Technology Stack & Dependencies

### 3.1 Frontend
- **Framework:** React 19 (`react`, `react-dom`)
- **Build Tool:** Vite 6 (`vite`, `@vitejs/plugin-react`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss`)
- **Icons:** Lucide React (`lucide-react`) & Google Material Symbols
- **Animations:** Motion (`motion/react`)
- **Chess Logic:** `chess.js` v1.4.0

### 3.2 Backend
- **Runtime:** Node.js (ES Module / TypeScript)
- **Web Framework:** Express 4 (`express`)
- **WebSocket Library:** `ws` v8.21.1
- **TypeScript Execution & Bundling:** `tsx` (dev), `esbuild` (production bundling to CommonJS `dist/server.cjs`)
- **Environment Management:** `dotenv`

---

## 4. Frontend Architecture

The React front-end is organized into modular functional components, promoting separation of concerns and clear state flows.

### 4.1 Component Hierarchy
```
src/
├── App.tsx                    # Main App Controller & State Manager
├── main.tsx                   # Application Entry Point
├── index.css                  # Global Styles & Tailwind M3 Themes
├── types.ts                   # Core Data Models & TypeScript Interfaces
├── utils/
│   ├── cookies.ts             # Cookie & LocalStorage persistence helpers
│   ├── translations.ts        # Bilingual i18n Dictionary (ES / EN)
│   └── wsTypes.ts             # WebSocket Payload Schemas
└── components/
    ├── TopNavBar.tsx          # Navigation, Theme Toggle, Profile Badge, Session ID
    ├── LeftPanel.tsx          # Timer Clocks, Move Counter, Captured Pieces (Boneyard)
    ├── RightPanel.tsx         # Move History List, Live Chat, Game Controls (Resign/Draw)
    ├── ChessBoard.tsx         # Interactive Graphical Board & Move Indicators
    ├── GameModesScreen.tsx    # Mode Selector (Online Arena, Vs AI, Local, Private Room)
    ├── PlayerProfileScreen.tsx # Stats Summary, Win/Loss Rate, Achievements
    ├── SettingsScreen.tsx     # Custom Themes, Sound, Speed, Coordinates
    ├── BoneyardSkeleton.tsx   # Visual Captured Piece Tracker
    ├── PieceGuideModal.tsx    # Educational Piece Movement Modal
    ├── PieceSvg.tsx           # Vector Renderers for Chess Pieces
    └── PuzzleModule.tsx       # Interactive Guided Tactical Puzzles & Pattern Drills
└── data/
    └── puzzlesData.ts         # Verified Real-World Tactical Puzzles Dataset
```

### 4.2 State Management
The application manages state through React `useState` and `useRef` hooks at the root level (`App.tsx`):
- **Chess State:** `game` (`Chess` instance), `fen`, `history`, `turn`, `isCheck`, `isCheckmate`, `isDraw`, `capturedPieces`.
- **Game Modes:** `gameMode` (`'local' | 'computer' | 'online' | 'puzzle' | 'analysis' | 'pgn'`), `aiDifficulty` (1-5).
- **Time Controls:** `whiteTime`, `blackTime`, `activeClock`, `timerInterval`.
- **WebSocket State:** `wsStatus` (`'disconnected' | 'connecting' | 'queue' | 'waiting' | 'in-game'`), `wsActiveGameId`, `wsPlayerColor`, `chatMessages`.
- **User Settings & Profile:** `settings` (Board Theme, Piece Theme, Sound, Dark Mode, Language), `userProfile` (Rating, Wins, Losses, Draws).

---

## 5. Backend Architecture & WebSocket Service

The backend server (`server.ts`) operates an Express application and attaches a WebSocket server (`ws.Server`) sharing port `3000`.

### 5.1 In-Memory Data Structures
- **Matchmaking Queue (`matchmakingQueue`):** Array of connected clients waiting for a random match (`{ ws, nickname }`).
- **Game Registry (`games`):** Map storing active game sessions keyed by a unique 6-character alphanumeric `gameId`:
  ```typescript
  interface ServerGameSession {
    id: string;
    chess: Chess;
    white: { ws: WebSocket; nickname: string } | null;
    black: { ws: WebSocket; nickname: string } | null;
    isPrivate: boolean;
    history: string[];
    createdAt: number;
  }
  ```

### 5.2 Room Management & Isolation Rules
- **Automatic Matchmaking:** Sanitizes queue entries on join to prevent self-matching or orphan sockets.
- **Private Room Lobbies:** Generates a 6-character room code (e.g. `#A8F3K1`). Prevents room creator from joining their own room twice.
- **Mutual Exclusion & Cleanup:** If a player attempts to join the Online Arena while hosting an empty private lobby, a modal prompts them to abandon and clean up the private lobby first.

---

## 6. Real-time WebSocket Protocol Specification

All WebSocket communications are encoded as JSON objects.

### 6.1 Client to Server Messages

| Event Type | Payload Fields | Purpose |
| :--- | :--- | :--- |
| `join-matchmaking` | `{ type: 'join-matchmaking', nickname: string }` | Enters player into the global matchmaking queue. |
| `create-game` | `{ type: 'create-game', nickname: string, preferredColor?: 'w'\|'b'\|'random' }` | Creates a new private room and returns a game ID. |
| `join-game` | `{ type: 'join-game', gameId: string, nickname: string }` | Joins an existing private room with the given game ID. |
| `move` | `{ type: 'move', gameId: string, move: { from, to, promotion } }` | Transmits a move to the server for validation and broadcast. |
| `chat` | `{ type: 'chat', gameId: string, text: string }` | Relays a chat message to the opponent. |
| `resign` | `{ type: 'resign', gameId: string }` | Forfeits the game and notifies opponent. |
| `offer-draw` | `{ type: 'offer-draw', gameId: string }` | Proposes a draw to the opponent. |
| `accept-draw` | `{ type: 'accept-draw', gameId: string }` | Accepts a draw proposal and ends the match. |
| `cancel` | `{ type: 'cancel', nickname: string }` | Removes player from queue/waiting lobby. |

### 6.2 Server to Client Messages

| Event Type | Payload Fields | Purpose |
| :--- | :--- | :--- |
| `game-created` | `{ type: 'game-created', gameId: string, playerColor: 'w'\|'b' }` | Notifies lobby host of room creation. |
| `match-found` | `{ type: 'match-found', gameId: string, playerColor: 'w'\|'b', opponentNickname: string, fen: string }` | Signals game start and player color assignment. |
| `move-made` | `{ type: 'move-made', fen: string, move: MoveObject }` | Broadcasts validated move and updated board FEN. |
| `chat` | `{ type: 'chat', sender: string, text: string, timestamp: string }` | Delivers chat message to client. |
| `game-over` | `{ type: 'game-over', message: string, winner?: 'w'\|'b' }` | Informs players of match conclusion. |
| `error` | `{ type: 'error', message: string }` | Transmits error details to client. |

---

## 7. Game Engine & AI Logic

### 7.1 Game Engine Integrations
- **Move Generation & Validation:** Executed using `chess.js`. Legal moves are retrieved via `game.moves({ verbose: true })`.
- **Special Moves Support:** Handles Castling (`O-O`, `O-O-O`), En Passant, and Pawn Promotion (with auto-Queen or promotion modal).
- **Captured Piece Tracking:** Derived dynamically by comparing starting board piece counts against current FEN piece distribution.

### 7.2 AI Bot Mechanics
- **Minimax with Alpha-Beta Pruning:** Evaluates board positions based on piece values (Pawn: 1, Knight/Bishop: 3, Rook: 5, Queen: 9, King: 1000) and position tables.
- **Difficulty Scaling:**
  - *Level 1 (Beginner):* Random move selection.
  - *Level 2 (Easy):* Depth 1 greedy evaluations.
  - *Level 3 (Medium):* Depth 2 Minimax search.
  - *Level 4 (Hard):* Depth 3 Minimax with positional bonuses.
  - *Level 5 (Grandmaster):* Depth 4 Minimax with positional weights and material depth scoring.

---

## 8. Data Persistence & Internationalization

### 8.1 Cookie & Local Storage Schema
- `chess_settings`: JSON string holding UI themes, sound preferences, coordinate toggles, and dark mode preferences.
- `chess_profile`: Stores player name, rating, games played, wins, losses, draws, and unlocked achievements.

### 8.2 i18n Architecture
Translations are centralized in `src/utils/translations.ts` supporting **Spanish (`es`)** and **English (`en`)**:
```typescript
getTranslation(language: string, key: string): string
```

---

## 9. Non-Functional Requirements

### 9.1 Performance
- Sub-50ms WebSocket message latency for move broadcasts.
- Lightweight bundling (`esbuild`) with tree-shaken Lucide icons and minimal asset footprint.
- Smooth 60 FPS animations on drag-and-drop and board transitions via `motion`.

### 9.2 Security & Integrity
- All server-side WebSocket moves are re-validated against `chess.js` instance before updating game state.
- Input validation on room join and chat messages to mitigate XSS and injection.
- Isolated API proxying to prevent exposure of backend keys.

### 9.3 Responsive Layout
- Adaptive layout scaling seamlessly from mobile viewports (<640px) up to ultra-wide displays.
- Touch target sizes optimized for mobile devices (minimum 44px).

---

## 10. Build & Deployment Specification

### 10.1 Environments
- **Development:** Executes `tsx server.ts` with Vite middleware mounted in Express (`middlewareMode: true`).
- **Production:** `vite build` bundles client static files to `dist/`, then `esbuild` compiles `server.ts` into a CommonJS bundle at `dist/server.cjs`.

### 10.2 Commands
```json
{
  "dev": "tsx server.ts",
  "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
  "start": "node dist/server.cjs",
  "lint": "tsc --noEmit"
}
```

---

*Document generated automatically based on current project architecture.*
