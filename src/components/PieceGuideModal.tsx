import React, { useState } from 'react';
import { PieceSvg } from './PieceSvg';

interface PieceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  isDarkMode: boolean;
}

interface PieceDetails {
  type: string;
  nameEn: string;
  nameEs: string;
  valueEn: string;
  valueEs: string;
  movesEn: string;
  movesEs: string;
  tipEn: string;
  tipEs: string;
}

const piecesData: PieceDetails[] = [
  {
    type: 'k',
    nameEn: 'King',
    nameEs: 'Rey',
    valueEn: 'Infinite (Game Target)',
    valueEs: 'Infinito (Objetivo del juego)',
    movesEn: 'Moves one square in any direction (vertically, horizontally, or diagonally). It can never step into a square that is under attack (check). The King also participates in the special "Castling" move.',
    movesEs: 'Se mueve una casilla en cualquier dirección (vertical, horizontal o diagonal). Nunca puede situarse en una casilla bajo ataque (jaque). El Rey también participa en la jugada especial de "Enroque".',
    tipEn: 'Keep your King safe! Castling early is one of the best ways to protect your King and activate your Rooks.',
    tipEs: '¡Mantén a tu Rey seguro! El enroque temprano es una de las mejores formas de resguardar al Rey y poner tus Torres en juego.'
  },
  {
    type: 'q',
    nameEn: 'Queen',
    nameEs: 'Dama / Reina',
    valueEn: '9 Points',
    valueEs: '9 Puntos',
    movesEn: 'Moves any number of vacant squares in any straight direction: vertically, horizontally, or diagonally. It combines the movement powers of the Rook and the Bishop.',
    movesEs: 'Se mueve cualquier número de casillas vacías en cualquier dirección recta: vertical, horizontal o diagonal. Combina la potencia de movimiento de la Torre y el Alfil.',
    tipEn: 'The Queen is your most powerful piece. Avoid bringing her out too early, as she can become an easy target for enemy minor pieces.',
    tipEs: 'La Dama es tu pieza más poderosa. Evita sacarla demasiado pronto al combate, ya que puede ser atacada y perseguida por piezas enemigas de menor valor.'
  },
  {
    type: 'r',
    nameEn: 'Rook',
    nameEs: 'Torre',
    valueEn: '5 Points',
    valueEs: '5 Puntos',
    movesEn: 'Moves any number of vacant squares vertically or horizontally. It is also key in executing the "Castling" maneuver with the King.',
    movesEs: 'Se mueve cualquier número de casillas vacías de forma vertical u horizontal. También es una pieza fundamental para realizar el "Enroque" junto al Rey.',
    tipEn: 'Rooks thrive on open columns (files with no pawns). Try to double your Rooks on the same file for devastating pressure.',
    tipEs: 'Las Torres brillan en columnas abiertas (sin peones). Intenta "doblar" dos Torres en la misma columna para ejercer una presión letal.'
  },
  {
    type: 'b',
    nameEn: 'Bishop',
    nameEs: 'Alfil',
    valueEn: '3 Points',
    valueEs: '3 Puntos',
    movesEn: 'Moves any number of vacant squares diagonally. Each Bishop stays on its starting square color (light or dark) for the entire game.',
    movesEs: 'Se mueve cualquier número de casillas vacías en dirección diagonal. Cada Alfil permanece en casillas de su color inicial (claras u oscuras) durante toda la partida.',
    tipEn: 'Bishops are long-range pieces. A "Bishop pair" is highly valuable in open board situations where they can sweep diagonals.',
    tipEs: 'Los Alfiles son piezas de largo alcance. La "pareja de Alfiles" es muy cotizada en posiciones abiertas donde pueden dominar las diagonales.'
  },
  {
    type: 'n',
    nameEn: 'Knight',
    nameEs: 'Caballo',
    valueEn: '3 Points',
    valueEs: '3 Puntos',
    movesEn: 'Moves in an "L-shape": two squares in one direction, then one square perpendicular. It is the only piece on the board that can jump over other pieces.',
    movesEs: 'Se mueve en forma de "L": dos casillas en una dirección y luego una casilla en perpendicular. Es la única pieza del tablero que puede saltar sobre otras piezas.',
    tipEn: 'Knights excel in closed, crowded positions with lots of pawns because of their jumping ability. Place them in the center of the board.',
    tipEs: 'Los Caballos sobresalen en posiciones cerradas y congestionadas de peones gracias a su habilidad para saltar. Colócalos en el centro del tablero.'
  },
  {
    type: 'p',
    nameEn: 'Pawn',
    nameEs: 'Peón',
    valueEn: '1 Point',
    valueEs: '1 Punto',
    movesEn: 'Moves forward one square. On its first move, it can advance two squares. Captures diagonally forward. Pawns are also eligible for the special "En Passant" capture and promotion.',
    movesEs: 'Se mueve hacia adelante una casilla. En su primera jugada, puede avanzar dos casillas. Captura únicamente en diagonal hacia adelante. Puede realizar la captura especial "Al Paso" y promocionar.',
    tipEn: 'Pawns can never move backward. When a pawn reaches the opposite end of the board, it must promote to a Queen, Rook, Bishop, or Knight!',
    tipEs: 'Los peones nunca pueden retroceder. ¡Cuando un peón llega al final del tablero enemigo, se promociona obligatoriamente a Dama, Torre, Alfil o Caballo!'
  }
];

export const PieceGuideModal: React.FC<PieceGuideModalProps> = ({
  isOpen,
  onClose,
  language,
  isDarkMode
}) => {
  const [selectedType, setSelectedType] = useState<string>('k');
  const isEs = language === 'es';

  if (!isOpen) return null;

  const activePiece = piecesData.find(p => p.type === selectedType) || piecesData[0];

  return (
    <div 
      id="piece-guide-modal-overlay" 
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="piece-guide-modal-card" 
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border transition-colors duration-300 overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh] scale-95 animate-scale-up ${
          isDarkMode 
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100' 
            : 'bg-white border-neutral-200 text-neutral-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar: Piece Selection Grid/List */}
        <div 
          className={`w-full md:w-56 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible md:overflow-y-auto border-b md:border-b-0 md:border-r shrink-0 ${
            isDarkMode ? 'border-neutral-800 bg-neutral-950/25' : 'border-neutral-200 bg-neutral-50'
          }`}
        >
          <div className="hidden md:block mb-4 px-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {isEs ? 'Piezas de Ajedrez' : 'Chess Pieces'}
            </h3>
            <p className="text-[10px] text-neutral-400 mt-1">
              {isEs ? 'Selecciona para ver detalles' : 'Select a piece for details'}
            </p>
          </div>

          <div className="flex md:flex-col gap-2 w-full">
            {piecesData.map((piece) => {
              const isSelected = selectedType === piece.type;
              return (
                <button
                  id={`guide-tab-${piece.type}`}
                  key={piece.type}
                  onClick={() => setSelectedType(piece.type)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 shrink-0 cursor-pointer ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200/50'
                      : isDarkMode
                      ? 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                      : 'hover:bg-neutral-200/50 text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-black/10 rounded-lg">
                    <PieceSvg type={piece.type} color={isSelected && isDarkMode ? 'w' : 'b'} className="w-6 h-6" />
                  </div>
                  <span className="font-semibold">{isEs ? piece.nameEs : piece.nameEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Section: Interactive Detailed Information */}
        <div className="flex-grow p-6 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-6">
            {/* Title, Category and Relative Value */}
            <div className="flex items-start justify-between border-b pb-4 border-neutral-800/20">
              <div>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                  {isEs ? 'MECÁNICAS OFICIALES FIDE' : 'FIDE OFFICIAL MECHANICS'}
                </span>
                <h2 className="text-2xl font-black tracking-tight mt-0.5">
                  {isEs ? activePiece.nameEs : activePiece.nameEn}
                </h2>
              </div>
              <div className={`px-3 py-1.5 rounded-full border text-xs font-bold tracking-tight ${
                isDarkMode 
                  ? 'bg-neutral-800/80 border-neutral-700/50 text-amber-400' 
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {isEs ? 'Valor: ' : 'Value: '}
                <span className="font-mono">{isEs ? activePiece.valueEs : activePiece.valueEn}</span>
              </div>
            </div>

            {/* Side-by-side Visual Representation (White and Black Pieces) */}
            <div className={`p-4 rounded-xl flex items-center justify-around border ${
              isDarkMode ? 'bg-neutral-950/30 border-neutral-800/60' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <div className="text-center space-y-1.5">
                <div className={`w-16 h-16 mx-auto p-1.5 rounded-xl border flex items-center justify-center transition shadow ${
                  isDarkMode ? 'bg-neutral-800/50 border-neutral-700/60' : 'bg-white border-neutral-200'
                }`}>
                  <PieceSvg type={activePiece.type} color="w" className="w-12 h-12" />
                </div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {isEs ? 'Bando Blanco' : 'White Side'}
                </p>
              </div>

              <div className="text-neutral-400/30 font-black text-xl">VS</div>

              <div className="text-center space-y-1.5">
                <div className={`w-16 h-16 mx-auto p-1.5 rounded-xl border flex items-center justify-center transition shadow ${
                  isDarkMode ? 'bg-neutral-800/50 border-neutral-700/60' : 'bg-white border-neutral-200'
                }`}>
                  <PieceSvg type={activePiece.type} color="b" className="w-12 h-12" />
                </div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {isEs ? 'Bando Negro' : 'Black Side'}
                </p>
              </div>
            </div>

            {/* Movement Description */}
            <div className="space-y-1.5">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {isEs ? '¿Cómo se mueve?' : 'How does it move?'}
              </h4>
              <p className="text-sm leading-relaxed text-neutral-300 md:text-neutral-600 dark:md:text-neutral-300">
                {isEs ? activePiece.movesEs : activePiece.movesEn}
              </p>
            </div>

            {/* Master tip for beginners */}
            <div className={`p-4 rounded-xl border-l-4 flex gap-3 ${
              isDarkMode 
                ? 'bg-emerald-950/15 border-emerald-500/80 text-neutral-300' 
                : 'bg-emerald-50/50 border-emerald-500 text-neutral-800'
            }`}>
              <span className="material-symbols-outlined text-emerald-500 shrink-0 mt-0.5">lightbulb</span>
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-emerald-500 uppercase tracking-wide">
                  {isEs ? 'Consejo de Entrenador' : 'Coach Pro-Tip'}
                </h5>
                <p className="text-xs leading-relaxed">
                  {isEs ? activePiece.tipEs : activePiece.tipEn}
                </p>
              </div>
            </div>
          </div>

          {/* Close Action Footer */}
          <div className="mt-8 pt-4 border-t border-neutral-800/10 flex justify-end">
            <button
              id="close-guide-modal-btn"
              onClick={onClose}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition duration-150 shadow-md active:scale-95 cursor-pointer"
            >
              {isEs ? 'Entendido, ¡a jugar!' : 'Got it, let\'s play!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
