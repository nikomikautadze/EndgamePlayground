import { useState } from 'react';
import { lichessRepo } from '../../infrastructure/lichessRepository.ts';
import { EndgameDecider } from '../../domain/endgame/endgameDecider.ts';
import { GameRecord } from '../../domain/interfaces/iGameRepository.ts';

interface Props {
  onStart: (
    difficulty: number,
    initialFen: string,
    gameInfo: GameRecord,
  ) => void;
}

export function LichessRandomSetup({ onStart }: Props) {
  const [difficulty, setDifficulty] = useState<number>(15);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStart = async () => {
    setIsLoading(true);
    setErrorMsg('');
    let found = false;
    let attempts = 0;
    const maxAttempts = 1000;

    try {
      while (attempts < maxAttempts && !found) {
        attempts++;
        const game = await lichessRepo.getRandomGame();
        const endgameFen = EndgameDecider.extractFromPgn(game.pgn);

        if (endgameFen) {
          onStart(difficulty, endgameFen, game);
          found = true;
          return;
        }
      }
      if (!found) {
        setErrorMsg('No se encontró una partida válida');
      }
    } catch (error) {
      console.error('Failed to start random game', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={randomCardStyle}>
      <div style={randomIconContainerStyle}>♞</div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={titleStyle}>Random Mode</h2>
        <p style={subtitleStyle}>
          You will be dropped to a random endgame. Are you ready?
        </p>
      </div>

      <div style={selectContainerStyle}>
        <label style={labelStyle}>Stockfish Level:</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
          style={selectStyle}
        >
          <option value={0}>Level 1 </option>
          <option value={5}>Level 2 </option>
          <option value={10}>Level 3 </option>
          <option value={15}>Level 4 </option>
          <option value={20}>Level 5 </option>
        </select>
      </div>

      {errorMsg && (
        <p style={{ color: '#ff6b6b', margin: 0, fontSize: '0.9rem' }}>
          {errorMsg}
        </p>
      )}

      <button
        onClick={handleStart}
        disabled={isLoading}
        style={isLoading ? buttonDisabledStyle : buttonStyle}
      >
        {isLoading ? 'Fetching Game...' : 'Start Practice'}
      </button>
    </div>
  );
}

const randomCardStyle = {
  backgroundColor: '#0a0a0a',
  padding: '40px',
  borderRadius: '16px',
  border: '1px solid #1f1f1f',
  textAlign: 'center' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '24px',
  width: '100%',
  boxSizing: 'border-box' as const,
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
};

const randomIconContainerStyle = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'rgba(99, 102, 241, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#a855f7',
  fontSize: '28px',
};

const titleStyle = {
  marginTop: 0,
  marginBottom: '8px',
  color: '#ffffff',
  fontSize: '1.5rem',
  fontWeight: 600,
};

const subtitleStyle = {
  color: '#888888',
  margin: 0,
  fontSize: '0.95rem',
  lineHeight: '1.5',
  maxWidth: '280px',
};

const selectContainerStyle = {
  width: '100%',
  textAlign: 'left' as const,
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  color: '#a1a1aa',
  fontSize: '0.9rem',
  fontWeight: 500,
};

const selectStyle = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: '#000000',
  color: '#ffffff',
  border: '1px solid #222222',
  borderRadius: '10px',
  fontSize: '0.9rem',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none' as const,
};

const buttonStyle = {
  width: '100%',
  padding: '16px',
  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '1rem',
  boxShadow: '0 8px 20px -6px rgba(168, 85, 247, 0.5)',
  transition: 'transform 0.1s ease',
};

const buttonDisabledStyle = {
  ...buttonStyle,
  background: '#111111',
  color: '#666666',
  border: '1px solid #333333',
  cursor: 'not-allowed',
  boxShadow: 'none',
};
