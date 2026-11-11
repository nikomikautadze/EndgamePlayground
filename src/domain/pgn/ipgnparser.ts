import { GamePgn} from '../types/gamePgn.ts';

export interface IPgnParser {
  parse(rawText: string): GamePgn;
}