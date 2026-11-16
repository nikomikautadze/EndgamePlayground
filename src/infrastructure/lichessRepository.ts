import { IGameRepository, GameFilterOptions, GameRecord } from '../domain/interfaces/iGameRepository.ts';

export class LichessRepository implements IGameRepository {
  async searchGames(query: string, filters?: GameFilterOptions): Promise<GameRecord[]> {
    return [
      {
        id: '1',
        white: 'MagnusCarlsen',
        black: 'Hikaru',
        date: '2026-01-01',
        pgn: '1. e4 e5...',
      },
    ];
  }

  async getRandomGame(): Promise<GameRecord> {
    return {id: 'rand1', white: 'GM', black: 'IM', date: '2023-11-01', pgn: '1. e4 c5...',};

  }
}

export const lichessRepo = new LichessRepository();