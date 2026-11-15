import { MoveNotation } from '../types/boardPosition.ts';
//import { GamePgn } from '../types/gamePgn.ts';

export interface EngineEvaluation {
  score: number;
  mate: number | null;
  bestMove: MoveNotation | undefined;
}

export interface IChessEngine {
  init(): void;
  evaluatePosition(fen: string, depth?: number): void;
  stop(): void;
  onEvaluationReady(callback: (evalData: EngineEvaluation) => void): void;
}