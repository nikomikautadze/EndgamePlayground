import { useState } from 'react';
import { lichessRepo } from '../../infrastructure/lichessRepository.ts';

interface Props {
  onStart: (difficulty: number, initialFen: string) => void;
}

export function LichessRandomSetup({ onStart }: Props) {
  const [difficulty, setDifficulty] = useState<number>(15);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const game = await lichessRepo.getRandomGame();
      const randomEndgameFen = '8/8/8/4k3/8/4K3/8/8 w - - 0 1';

      onStart(difficulty, randomEndgameFen);
    } catch (error) {
      console.error("Failed to start random game", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#2a2a2a',
        padding: '30px',
        borderRadius: '8px',
        textAlign: 'center',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Surprise Me</h2>
      <p style={{ color: '#aaa', marginBottom: '30px' }}>
        We will fetch a random Grandmaster game and drop you right into the
        endgame.
      </p>

      <div
        style={{
          marginBottom: '30px',
          textAlign: 'left',
          maxWidth: '300px',
          margin: '0 auto 30px auto',
        }}
      >
        <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>
          Stockfish Level:
        </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
          }}
        >
          <option value={0}>Level 0 (Easiest)</option>
          <option value={5}>Level 5 (Easy)</option>
          <option value={10}>Level 10 (Medium)</option>
          <option value={15}>Level 15 (Hard)</option>
          <option value={20}>Level 20 (Max)</option>
        </select>
      </div>

      <button
        onClick={handleStart}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: isLoading ? '#444' : '#779556',
          color: isLoading ? '#888' : 'white',
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? 'Fetching Game...' : 'Start Practice'}
      </button>
    </div>
  );

}