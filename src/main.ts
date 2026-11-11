import { Chess } from 'chess.js';

const viewerGame = new Chess();
viewerGame.loadPgn("1. e4 e5, ...");

function getFenAtMove(pgnString: string, moveIndex: number) {
  const tempGame = new Chess();
  tempGame.loadPgn(pgnString);
  const history = tempGame.history();

  const targetGame = new Chess();
  for (let i = 0; i <= moveIndex; i++) {
    targetGame.move(history[i]);
  }
  return targetGame.fen();
}

const startFen = getFenAtMove(viewerGame.pgn(), 5);
const activeMatch = new Chess(startFen);