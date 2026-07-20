import React from 'react';

interface PieceSvgProps {
  type: string; // 'p', 'n', 'b', 'r', 'q', 'k'
  color: 'w' | 'b'; // 'w' for white, 'b' for black
  className?: string;
}

/**
 * Beautiful, standard vector SVG definitions for chess pieces.
 * These are extremely clean, scalable, and professional, mimicking standard modern tournament pieces.
 */
export const PieceSvg: React.FC<PieceSvgProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';
  const fill = isWhite ? '#FFFFFF' : '#2A2D34';
  const stroke = isWhite ? '#2A2D34' : '#FFFFFF';
  const strokeWidth = '1.5';

  switch (type.toLowerCase()) {
    case 'p': // Pawn
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-.83.63-1.41 1.62-1.41 2.75 0 1.93 1.57 3.5 3.5 3.5h4c1.93 0 3.5-1.57 3.5-3.5 0-1.13-.58-2.12-1.41-2.75 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M12 36h21v3H12zm3.5 3.5h14v1.5h-14z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'r': // Rook
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M9 39h27v3H9zm3-3h21v3H12zm3-21v18h15V15H15z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 12v3h4v-3h3v3h7v-3h3v3h4v-3h3v-3H12z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 21.5h17M14 27h17"
            fill="none"
            stroke={stroke}
            strokeWidth="1.2"
          />
        </svg>
      );

    case 'n': // Knight
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M 22,10 C 22,10 19,11 16,15 C 13,19 13,23 13,23 C 13,23 14.5,22 16.5,21.5 C 18.5,21 21.5,21 21.5,21 C 21.5,21 18,24 12,25 C 12,25 9,28 12,32.5 C 15,37 20,38 24,38 C 28,38 31,37 33,34 C 35,31 35,22 33,18 C 31,14 26,10 22,10 z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 12,32.5 C 12,32.5 15,31 18,31 C 21,31 23,32.5 23,32.5 M 14,28.5 C 14,28.5 16,27 18.5,27.5"
            fill="none"
            stroke={stroke}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="27" cy="18" r="2" fill={stroke} />
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M9 36h27v3H9zm3-3h21v3H12zm10.5-24c-2.5 0-4.5 2-4.5 4.5 0 1.5.5 3 2 4.5 1.5 1.5 2.5 3.5 2.5 5.5v2.5h4V25c0-2 1-4 2.5-5.5 1.5-1.5 2-3 2-4.5 0-2.5-2-4.5-4.5-4.5z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <circle cx="22.5" cy="8" r="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <path
            d="M17.5 18h10M22.5 13.5v9"
            fill="none"
            stroke={stroke}
            strokeWidth="1.2"
          />
        </svg>
      );

    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M9 37h27v3H9zm3-3h21v3H12zm.5-18.5L18 31h9l5.5-15.5L28 26l-5.5-15-5.5 15z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9.5" cy="15.5" r="2" fill={fill} stroke={stroke} />
          <circle cx="18" cy="12.5" r="2" fill={fill} stroke={stroke} />
          <circle cx="22.5" cy="10.5" r="2" fill={fill} stroke={stroke} />
          <circle cx="27" cy="12.5" r="2" fill={fill} stroke={stroke} />
          <circle cx="35.5" cy="15.5" r="2" fill={fill} stroke={stroke} />
        </svg>
      );

    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M9 37h27v3H9zm3-3h21v3H12zm10.5-25c-3 0-5.5 2.5-5.5 5.5 0 2 1.5 4.5 3 6.5L14 29h17l-3-6.5c1.5-2 3-4.5 3-6.5 0-3-2.5-5.5-5.5-5.5z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22.5 5v5M20 7.5h5"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16 20.5h13M18 24.5h9"
            fill="none"
            stroke={stroke}
            strokeWidth="1.2"
          />
        </svg>
      );

    default:
      return null;
  }
};
