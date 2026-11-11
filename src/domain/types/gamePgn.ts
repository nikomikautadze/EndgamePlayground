import { BoardPosition } from './boardposition.ts';
import { Move } from './move.ts';

//Metadata extracted from the PGN
export interface HeadersPGN{
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  whitePlayer: string;
  blackPlayer: string;
  result: string;
  whiteElo?: number;
  blackElo?: number;
  eco?: string;
  timeControl?: string;
  fen?: string;
}

//Represents a complete imported game from PGN
export interface GamePgn {
  //unique id to store the game
  id: string;

  headers: HeadersPGN;
  rawPGN: string;

  //list of all moves in the game
  moves: Move[];
  //list of all positions in the game
  positions: BoardPosition[];
  //index of positions[] where the endgame starts, null if there is no endgame
  endgameStartIndex: number | null;
}