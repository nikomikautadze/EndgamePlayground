import {GamePgn} from '../types/gamePgn.ts';

export function extractEndgameFen(game: GamePgn): string | null {
  if(game.endgameStartIndex == null) {
    return null;
  }
  const endgamePos = game.positions[game.endgameStartIndex];
  return endgamePos.fen;
}