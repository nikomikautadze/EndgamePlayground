import { Square, Color, PieceType } from './boardposition.ts'

export interface Move {
  playerColor: Color;
  from: Square;
  to: Square;

  san: string;
  uci: string;
  piece: PieceType;
  captured?: PieceType;
  promotion?: PieceType;

  isCheck?: boolean;
  isCheckmate?: boolean;
  isDraw?: boolean;

  flags: {
    isCapture: boolean;
    isEnPassant: boolean;
    isCastle: boolean;
    isPromotion: boolean;
  };
  timestamp: number;
}

export interface PlayedMove {
  playerBy: Color;
  timestamp: number;
  timeSpentMs?: number;
  evaluationAfterMove?: number;
}