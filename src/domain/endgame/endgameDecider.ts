import { Chess } from 'chess.js'

export class EndgameDecider {

  static extractFromPgn(pgn: string): string | null {
    const game = new Chess();
    game.loadPgn(pgn);

    const history = game.history();
    const replayGame = new Chess();
    const rand = Math.floor(Math.random() * 3);
    for (const move of history) {
      replayGame.move(move);

      if (this.isEndgame(replayGame.fen(), rand)) {
        return replayGame.fen();
      }
    }
    return null;
  }

    private static isEndgame(fen: string, rand: number): boolean {
      //random
      const boardStr = fen.split(' ')[0];
      if (rand === 0) return this.propertyMaterialThreshold(boardStr); // 13 points of non-pawn material
      if (rand === 1) return this.propertyUniquePiece(boardStr); // Dvoretsky
      if (rand === 2) return this.propertySolvedPosition(boardStr); // 7 or less total pieces
      //if (rand === 3) return propertyNoQueens(fen);
      return false;
    }

    private static propertyMaterialThreshold(fen: string): boolean {
      let materialWhite = 0;
      let materialBlack = 0;
      for (let i = 0; i < fen.length; ++i) {
        if (fen[i] === 'r') materialWhite += 5;
        else if (fen[i] === 'n' || fen[i] === 'b') materialWhite += 3;
        else if (fen[i] === 'q') materialWhite += 9;
        else if (fen[i] === 'R') materialBlack += 5;
        else if (fen[i] === 'N' || fen[i] === 'B') materialBlack += 3;
        else if (fen[i] === 'Q') materialBlack += 9;
      }

      return materialBlack < 14 && materialWhite < 14
    }

    private static propertyUniquePiece(fen: string): boolean {
      let pieceCountWhite = 0;
      let pieceCountBlack = 0;
      for (let i = 0; i < fen.length; ++i) {
        if (pieceCountBlack>1 && pieceCountWhite > 1) return false
        if (fen[i] === 'r' || fen[i] === 'n' || fen[i] === 'b' || fen[i] === 'q') pieceCountWhite += 1;
        else if (fen[i] === 'R' || fen[i] === 'N' || fen[i] === 'B' || fen[i] === 'Q') pieceCountBlack += 1;
      }
      return pieceCountBlack <= 1 && pieceCountWhite <= 1
    }

    private static propertySolvedPosition(fen: string): boolean {
      let pieceCount = 0;
      for (let i = 0; i < fen.length; ++i) {
        if (/[a-zA-Z]/.test(fen[i])) ++pieceCount;
      }
      return pieceCount <= 7
    }
}