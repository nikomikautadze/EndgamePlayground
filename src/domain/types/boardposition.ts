export type Color = 'w' | 'b';


export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'


export interface MoveNotation {
  from: string;
  to: string;
  san: string;
  captured?: PieceType;
  promotion?: PieceType;
}


export interface MaterialScore {
  white: number;
  black: number;
  difference: number;
  KnightDifference: number;
  BishopDifference: number;
  QueenDifference: number;
  RookDifference: number;
  PawnDifference: number;
}

export interface BoardPosition {
  fen: string;

  ply: number;

  moveNumber: number;

  turn: Color;
  lastMove: MoveNotation;

  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;

  material: MaterialScore;
  minorAndMajorPieceCount: number;
}