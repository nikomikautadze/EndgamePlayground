  import { IGameRepository, GameRecord } from '../domain/interfaces/iGameRepository.ts';

  export class LichessRepository implements IGameRepository {
    private cachedGames: string[] | null = null;
    private async loadDatabase() {
      if (this.cachedGames) return;

      const response = await fetch('/data/lichess_db_broadcast_2026-10.pgn');
      if (!response.ok) throw new Error(response.statusText);

      const multiPgnData = await response.text();
      this.cachedGames = multiPgnData
        .split(/(?=\[Event ")/)
        .map((g) => g.trim())
        .filter((g) => g.length > 0);
    }

    private parseGameRecord(pgn: string, index: number): GameRecord {
      const whiteMatch = pgn.match(/\[White "(.*?)"\]/);
      const blackMatch = pgn.match(/\[Black "(.*?)"\]/);
      const whiteEloMatch = pgn.match(/\[WhiteElo "(.*?)"\]/);
      const blackEloMatch = pgn.match(/\[BlackElo "(.*?)"\]/);
      const dateMatch = pgn.match(/\[Date "(.*?)"\]/);

      return {
        id: `game-${index}`,
        white: whiteMatch ? whiteMatch[1] : 'Unknown',
        black: blackMatch ? blackMatch[1] : 'Unknown',
        whiteElo: whiteEloMatch ? whiteEloMatch[1] : 'N/A',
        blackElo: blackEloMatch ? blackEloMatch[1] : 'N/A',
        date: dateMatch ? dateMatch[1] : 'Unknown Date',
        pgn: pgn,
      };
    }

    async searchGames(
      query: string,
    ): Promise<GameRecord[]> {
      await this.loadDatabase();

      if (!this.cachedGames) return [];

      const lowerQuery = query.toLowerCase();

      const matchingPgns = this.cachedGames
        .filter((pgn) => pgn.toLowerCase().includes(lowerQuery))

      return matchingPgns.map((pgn, index) => this.parseGameRecord(pgn, index));
    }

    async getRandomGame(): Promise<GameRecord> {
      await this.loadDatabase();

      if (!this.cachedGames) throw new Error('Database not loaded');

      const randomIndex = Math.floor(Math.random() * this.cachedGames.length);
      const randomPgn = this.cachedGames[randomIndex];

      return this.parseGameRecord(randomPgn, randomIndex);
    }
  }

  export const lichessRepo = new LichessRepository();