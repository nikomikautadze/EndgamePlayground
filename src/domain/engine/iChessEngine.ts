import { MoveNotation } from '../types/boardPosition.ts';
import { GamePgn } from '../types/gamePgn.ts';

export interface EngineEvaluation {
  score: number;
  forcedMate?: number;
  bestMove: MoveNotation;
}

export interface IChessEngine {
  init(): void;
  evaluatePosition(fen: string, depth?: number): void;
  stop(): void;
  onEvaluationReady(callback: (evalData: EngineEvaluation) => void): void;
}