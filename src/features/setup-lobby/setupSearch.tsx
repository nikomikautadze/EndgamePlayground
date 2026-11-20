import { useEffect, useState } from 'react';
import { lichessRepo } from '../../infrastructure/lichessRepository.ts';
import { GameRecord } from '../../domain/interfaces/iGameRepository.ts';

interface Props {
  onGameSelected: (game: GameRecord) => void;
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
    <div style={searchContainerStyle}>
      <h3 style={titleStyle}>Database</h3>

      <div style={searchControlsStyle}>
        <input
          type="text"
          placeholder="Search player, ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchInputStyle} // ASIGNADO
        />
        <button
          onClick={() => handleSearch(searchQuery)}
          style={searchButtonStyle}
        >
          Search
        </button>

        <select disabled style={selectStyle}>
          <option>Opening (Soon)</option>
        </select>
      </div>

      <div style={listContainerStyle}>
        {isLoading ? (
          <p style={{ color: '#888', textAlign: 'center' }}>Loading games...</p>
        ) : (
          games.map((game) => (
            <div
              key={game.id}
              onClick={() => onGameSelected(game)}
              style={listItemStyle}
              onMouseOver={(e) =>
                (e.currentTarget.style.borderColor = '#6366f1')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.borderColor = '#1f1f1f')
              }
            >
              <div>
                <strong style={{ color: '#fff', fontWeight: 500 }}>
                  {game.white}
                </strong>
                <span style={{ color: '#888', margin: '0 8px' }}>vs</span>
                <strong style={{ color: '#fff', fontWeight: 500 }}>
                  {game.black}
                </strong>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                {game.date}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


const searchContainerStyle = {
  backgroundColor: '#0a0a0a',
  padding: '30px',
  borderRadius: '16px',
  border: '1px solid #1f1f1f',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
  width: '100%',
  boxSizing: 'border-box' as const,
};

const titleStyle = {
  marginTop: 0,
  marginBottom: '24px',
  fontWeight: 600,
  fontSize: '1.4rem',
  color: '#ffffff',
};

const searchControlsStyle = {
  display: 'flex',
  gap: '12px',
  marginBottom: '24px',
  flexWrap: 'wrap' as const,
};

const searchInputStyle = {
  flex: 2,
  minWidth: '200px',
  padding: '12px 16px',
  backgroundColor: '#000000',
  color: '#ffffff',
  border: '1px solid #222222',
  borderRadius: '10px',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const selectStyle = {
  ...searchInputStyle,
  flex: 1,
  minWidth: '140px',
  cursor: 'pointer',
  appearance: 'none' as const,
};

const searchButtonStyle = {
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.95rem',
  boxShadow: '0 8px 20px -6px rgba(168, 85, 247, 0.5)',
};

const listContainerStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
  maxHeight: '400px',
  overflowY: 'auto' as const,
  paddingRight: '4px',
};

const listItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  backgroundColor: '#111111',
  border: '1px solid #1f1f1f',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};
