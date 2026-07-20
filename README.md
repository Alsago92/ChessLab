# Material Chess

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-v19.0-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-v6.2-646CFF?logo=vite)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwind--css-v4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

A premium, modern Material Design 3 Chess application dashboard with interactive gameplay, engine analysis, custom settings, and comprehensive statistics. Fully compatible with both immersive Dark Slate and elegant Light Mode environments, styled with fluid transitions and responsive layouts.

---

## ✨ Features

- **🎮 Rich Game Modes**: Support for local versus player, computer engine match, puzzle challenges, analysis sandbox, live lobby simulation, tournament play, and training routines.
- **🎨 Custom Chess Themes**: Customize your experience with multiple board styles (`Classic`, `Wood`, `Emerald`, `Dark`) and piece sets (`Modern`, `Realistic`, `Neo`, `Glass`).
- **🌓 Adaptive Theme Engine**: Smoothly transitions between high-contrast Dark Slate and clean Light Mode, utilizing CSS custom properties for instant styling propagation across the DOM.
- **🧠 Intelligent HUD & Engine HUD**: Live engine evaluations, suggestion feeds, blunder trackers, threat meters, and accurate move evaluation diagnostics.
- **🏆 User Profile & Statistics**: Track your games played, wins, losses, current rating over time, favorite openings, and unlock beautiful achievements.
- **⚙️ Deep Configuration Settings**: Toggle sound effects, auto-queen promotions, legal move indicators, coordinate label rendering, language localizations, and animation speeds.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strictly typed schemas for game state, engine, and profiles).
- **Build Tool**: [Vite 6](https://vite.dev/) (Optimized module resolution, high-speed development compilation).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Atomic class utilities, dynamic theme extension, responsive grid alignments).
- **Animations**: [Motion](https://motion.dev/) (Buttery smooth slide transitions, layout state morphing, and staggered lists).
- **Engine Logic**: Powered by [chess.js](https://github.com/jhlywa/chess.js) for robust FEN parsing, move validation, and game loop execution.
- **Icons**: SVG typography powered by [Material Symbols Outlined](https://fonts.google.com/icons) and [Lucide React](https://lucide.dev/).

---

## 🚀 Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) (v18+ recommended) and a package manager (e.g., `npm` or `bun`) installed.

### Installation

1. Install the workspace dependencies:
   ```bash
   npm install
   ```

2. Run the local development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

---

## 🏗️ Production Building & Deployment

Compile the applet down to production-ready static assets:

```bash
npm run build
```

This will run the Vite bundler and output static compiled files in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

To validate code styling and syntax check TypeScript declarations:
```bash
npm run lint
```

---

## 📁 Project Structure

```
├── .env.example        # Environment variable blueprint template
├── index.html          # Entry-point HTML template
├── metadata.json       # Platform-specific capability and configuration manifest
├── package.json        # Dependencies, package lock references, and script triggers
├── tsconfig.json       # TypeScript compiler parameters and modules paths
├── vite.config.ts      # Vite bundler definitions
├── RELEASE-NOTES.md    # Latest features, bug fixes, and versioning notes
└── src/
    ├── main.tsx        # React root entry point
    ├── App.tsx         # Primary application shell, layout routing, and state manager
    ├── index.css       # Tailwind stylesheet entry point with font bindings & custom variables
    ├── types.ts        # Global structured type interface and enum schemas
    ├── components/     # Modulized UI screens and modular layouts
    │   ├── TopNavBar.tsx            # Theme switcher, navigation tabs, connection indicators
    │   ├── ChessBoard.tsx           # Interactive canvas and drag/drop board engine
    │   ├── GameModesScreen.tsx      # Play mode choices, lobby simulator, and custom matching
    │   ├── PlayerProfileScreen.tsx  # Dynamic performance graphs, history charts, achievements
    │   └── SettingsScreen.tsx       # Customization and visual preference sliders
    └── utils/          # Auxiliary helper routines
```

---

## 📄 License

This project is licensed under the Apache License 2.0. See the `LICENSE` (or `types.ts` metadata comments) for more details.
