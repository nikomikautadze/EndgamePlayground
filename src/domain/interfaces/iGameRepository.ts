
export interface GameFilterOptions {
  player?: string;
  opening?: string;
  tournament?: string;

}

export interface GameRecord {
  id: string;
  white: string;
  black: string;
  whiteElo?: string;
  blackElo?: string;
  date: string;
  pgn: string;
}

export interface IGameRepository {
  searchGames(query: string, filters?: GameFilterOptions): Promise<GameRecord[]>;
  getRandomGame(): Promise<GameRecord>;
}