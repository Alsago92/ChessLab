# Release Notes - Material Chess v10.0

Welcome to **Material Chess v10.0**! This update introduces a stunning visual redesign under Material Design 3 principles, outstanding compatibility with the new **Light Mode**, and seamless navigation that optimizes both your touch and desktop experiences.

Here is a detailed breakdown of the new features, enhancements, and optimizations included in this release.

---

## 🎨 Full Light Mode Compatibility
We have completely redesigned the interface elements to ensure the experience is just as immersive, beautiful, and readable under daylight:
- **Adaptive Header**: The top bar (`TopNavBar`) now transitions smoothly between an elegant semi-transparent white (`bg-white/95`) with subtle borders and the classic dark Slate, featuring fluid 300ms color transitions.
- **Superior Contrast & Readability (`.header-container`)**:
  - Implemented advanced CSS logic to dynamically detect the active theme on the document root.
  - The header title ("Material Chess") intelligently adjusts its contrast to guarantee impeccable readability on any background.
- **Refined Navigation Bar**: Tabs and buttons for game modes, the chessboard, settings, and profile screens now adopt a soft, clean gray palette in light mode, highlighting the selected tab with fine shadows and high-fidelity blue typography.
- **Live Connection Badge**: The real-time status indicator ("Live Arena") aesthetically adapts to light mode with crisp, low-contrast borders.

---

## 🗺️ Smart & Fluid Navigation
A unified navigation controller has been structured to retain active screen histories:
- **Automated Return Flow**: The application now precisely remembers your preceding screen (`previousScreen`). Upon exiting secondary menus like **Settings**, you will immediately return to your exact prior context (whether it was an active chess match or the game lobby).
- **Simplified Controls**: We removed the redundant "Close" buttons from the top panels, leaving the **Back** button as the single clean, intuitive action. This reduces visual clutter and maximizes the active interactive area.

---

## ⚙️ Persistence & Synchronization
- **Theme Propagation on DOM**: The theme toggler now reactively synchronizes `.dark` and `.light` classes directly on the root `<html>` element, ensuring global CSS variables and Tailwind utilities respond instantaneously.
- **Local Persistence**: Your settings (language, visual theme, engine analysis level) are automatically saved to client-side cookies, keeping your preferences ready for your next session.

---

## 🛠️ Bug Fixes & Minor Adjustments
- Fixed border contrast and texture styling on the user profile avatar in light theme.
- Added explicit `cursor-pointer` states and micro-interactions (`active:scale-95`) to enhance cursor and touch feedback in desktop and mobile browsers.
- Cleaned and optimized the TypeScript project linter, ensuring 100% warning-free compilation builds.

---

*Thank you for playing on Material Chess! May your tactics be sharp and your victories absolute.*
