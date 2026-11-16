import { useState, useMemo } from 'react';
import { PlayableBoard } from '../playable-board/playableBoard.tsx';
import { Chess } from 'chess.js';
import { LichessRandomSetup } from './setupRandom.tsx';
import { LichessSearchSetup } from './setupSearch.tsx';

type SetupMode = 'menu' | 'local' | 'lichess-search' | 'lichess-random';
type LocalInputMode = 'fen' | 'pgn';

export function SetupWidget() {
  const [mode, setMode] = useState<SetupMode>('menu');
  const [isGameStarted, setIsGameStarted] = useState(false);

  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [difficulty, setDifficulty] = useState<number>(15);

  const [localInputType, setLocalInputType] = useState<LocalInputMode>('fen');
  const [initialFen, setInitialFen] = useState(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  );

  const [fenInput, setFenInput] = useState('');
  const [fenError, setFenError] = useState('');

  const [pgnInput, setPgnInput] = useState('');
  const [pgnError, setPgnError] = useState('');
  const [pgnMoves, setPgnMoves] = useState<string[]>([]);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number>(0);

  const backgroundChess = useMemo(() => new Chess(), []);

  const handleFenChange = (fen: string) => {
    setFenInput(fen);
    try {
      const testGame = new Chess(fen);
      setInitialFen(testGame.fen());
      setFenError('');
    } catch (e) {
      setFenError('invalid FEN');
    }
  };

  const handlePgnChange = (pgn: string) => {
    setPgnInput(pgn);
    try {
      backgroundChess.reset();
      backgroundChess.loadPgn(pgn);

      const history = backgroundChess.history();
      setPgnMoves(history);
      setSelectedMoveIndex(history.length);
      setInitialFen(backgroundChess.fen());
      setPgnError('');
    } catch (e) {
      setPgnError('invalid Pgn');
      setPgnMoves([]);
    }
  };

  const handleSliderChange = (index: number) => {
    setSelectedMoveIndex(index);
    backgroundChess.reset();

    for (let i = 0; i < index; ++i) {
      backgroundChess.move(pgnMoves[i]);
    }
    setInitialFen(backgroundChess.fen());
  };

  const isStartDisabled =
    (mode === 'local' && localInputType === 'fen' && fenError !== '') ||
    (mode === 'local' && localInputType === 'pgn' && pgnError !== '') ||
    (mode === 'local' && localInputType === 'pgn' && pgnMoves.length === 0);

  if (isGameStarted) {
    return (
      <PlayableBoard
        initialFen={initialFen}
        playerColor={playerColor}
        difficulty={difficulty}
      />
    );
  }

  // --- RENDER 2: MENÚ PRINCIPAL ---
  if (mode === 'menu') {
    return (
      <div
        style={{
          maxWidth: '500px',
          margin: '100px auto',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginBottom: '40px' }}>Choose Practice Mode</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button onClick={() => setMode('local')} style={menuButtonStyle}>
            1. Load PGN / FEN
          </button>
          <button
            onClick={() => setMode('lichess-search')}
            style={menuButtonStyle}
          >
            2. Search Game (Lichess DB)
          </button>
          <button
            onClick={() => setMode('lichess-random')}
            style={menuButtonStyle}
          >
            3. Random Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '50px auto',
        padding: '20px',
        color: 'white',
      }}
    >
      <button
        onClick={() => setMode('menu')}
        style={{
          background: 'none',
          border: 'none',
          color: '#aaa',
          cursor: 'pointer',
          padding: 0,
          marginBottom: '20px',
          textDecoration: 'underline',
        }}
      >
        &larr; Back to Menu
      </button>

      {/* mode === 'local' would render <LocalSetup onStart={startPractice} /> */}

      {mode === 'lichess-search' && (
        <LichessSearchSetup
          onGameSelected={(pgn) => {
            console.log('Game selected, PGN ready for endgame extractor:', pgn);
            // Here you will route this PGN into your Endgame Slider UI
          }}
        />
      )}

      {mode === 'lichess-random' && (
        <LichessRandomSetup
          onStart={(level, fen) => startPractice(level, fen, 'w')}
        />
      )}
    </div>
  );
}

const menuButtonStyle = {
  padding: '20px',
  fontSize: '1.2rem',
  backgroundColor: '#2a2a2a',
  color: 'white',
  border: '1px solid #444',
  borderRadius: '8px',
  cursor: 'pointer',
};
