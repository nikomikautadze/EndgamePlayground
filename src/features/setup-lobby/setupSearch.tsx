import { useEffect, useState } from 'react';
import { lichessRepo } from '../../infrastructure/lichessRepository.ts';
import { GameRecord } from '../../domain/interfaces/iGameRepository.ts';

interface Props {
  onGameSelected: (pgn: string) => void;
}

export function LichessSearchSetup({ onGameSelected }: Props) {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleSearch('');
  }, []);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    const results = await lichessRepo.searchGames(query);
    setGames(results);
    setIsLoading(false);
  };


  return (
    <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>Database Search</h3>

      {/* SCALABLE FILTER BAR */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search player, ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={inputStyle}
        />
        <button onClick={() => handleSearch(searchQuery)} style={buttonStyle}>Search</button>

        {/* Placeholders for future filters */}
        <select disabled style={inputStyle}><option>Opening (Soon)</option></select>
        <select disabled style={inputStyle}><option>Event (Soon)</option></select>
      </div>

      {/* GAME LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
        {isLoading ? <p>Loading games...</p> : games.map((game) => (
          <div
            key={game.id}
            onClick={() => onGameSelected(game.pgn)}
            style={{ padding: '15px', backgroundColor: '#333', borderRadius: '6px', cursor: 'pointer', border: '1px solid #444', display: 'flex', justifyContent: 'space-between' }}
          >
            <div>
              <strong style={{ color: '#fff' }}>{game.white}</strong> vs <strong style={{ color: '#fff' }}>{game.black}</strong>
            </div>
            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
              {game.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = { padding: '10px', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', flex: 1 };
const buttonStyle = { padding: '10px 20px', backgroundColor: '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };1
