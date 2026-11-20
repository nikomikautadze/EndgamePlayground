import { useState, useMemo } from 'react';
import { PlayableBoard } from '../playable-board/playableBoard.tsx';
import { Chess } from 'chess.js';
import { LichessRandomSetup } from './setupRandom.tsx';
import { LichessSearchSetup } from './setupSearch.tsx';
import { EndgameDecider } from '../../domain/endgame/endgameDecider.ts';
import { GameRecord } from '../../domain/interfaces/iGameRepository.ts';

type SetupMode = 'menu' | 'local' | 'lichess-search' | 'lichess-random';
type LocalInputMode = 'fen' | 'pgn';

export function SetupWidget() {
  const [mode, setMode] = useState<SetupMode>('menu');
  const [isGameStarted, setIsGameStarted] = useState(false);

  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [difficulty, setDifficulty] = useState<number>(15);

  const [gameInfo, setGameInfo] = useState<GameRecord | undefined>(undefined);

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
      setFenError('Invalid FEN format');
    }
  };

  const handlePgnChange = (pgn: string) => {
    setPgnInput(pgn);
    try {
      backgroundChess.reset();
      backgroundChess.loadPgn(pgn);

      const history = backgroundChess.history();
      setPgnMoves(history);

      const endgameFen = EndgameDecider.extractFromPgn(pgn);
      if (endgameFen) {
        const tempChess = new Chess();
        let foundIndex = history.length;

        for (let i = 0; i < history.length; i++) {
          tempChess.move(history[i]);
          if (tempChess.fen() === endgameFen) {
            foundIndex = i + 1;
            break;
          }
        }

        setSelectedMoveIndex(foundIndex);
        setInitialFen(endgameFen);
        setPgnError('');
      }
    } catch (e) {
      setPgnError('Invalid PGN sequence');
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

  const startPractice = (
    level: number,
    fen: string,
    color: 'w' | 'b',
    info?: GameRecord,
  ) => {
    setDifficulty(level);
    setInitialFen(fen);
    setPlayerColor(color);
    setGameInfo(info);
    setIsGameStarted(true);
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
        gameInfo={gameInfo}
      />
    );
  }
  if (mode === 'menu') {
    return (
      <div style={containerStyle}>
        <div
          style={{ ...cardStyle, border: 'none', background: 'transparent' }}
        >
          <h2 style={titleStyle}>Select mode</h2>
          <p style={subtitleStyle}>
            Start practicing your endgames
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '30px',
            }}
          >
            <button onClick={() => setMode('local')} style={menuButtonStyle}>
              <span>Load PGN / FEN</span>
              <span style={arrowStyle}>→</span>
            </button>
            <button
              onClick={() => setMode('lichess-search')}
              style={menuButtonStyle}
            >
              <span>Search Games</span>
              <span style={arrowStyle}>→</span>
            </button>
            <button
              onClick={() => setMode('lichess-random')}
              style={menuButtonStyle}
            >
              <span>Load Random Endgame</span>
              <span style={arrowStyle}>→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <button onClick={() => setMode('menu')} style={backButtonStyle}>
        ← Back
      </button>

      {mode === 'local' && (
        <div style={cardStyle}>
          <h3 style={titleStyle}>Position Setup</h3>

          <div style={tabContainerStyle}>
            <button
              onClick={() => setLocalInputType('fen')}
              style={
                localInputType === 'fen' ? activeTabStyle : inactiveTabStyle
              }
            >
              FEN
            </button>
            <button
              onClick={() => setLocalInputType('pgn')}
              style={
                localInputType === 'pgn' ? activeTabStyle : inactiveTabStyle
              }
            >
              PGN
            </button>
          </div>

          {localInputType === 'fen' ? (
            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                value={fenInput}
                onChange={(e) => handleFenChange(e.target.value)}
                placeholder="Paste FEN here..."
                style={inputStyle}
              />
              {fenError && <p style={errorStyle}>{fenError}</p>}
            </div>
          ) : (
            <div style={{ marginBottom: '24px' }}>
              <textarea
                value={pgnInput}
                onChange={(e) => handlePgnChange(e.target.value)}
                placeholder="Paste PGN text here..."
                style={{ ...inputStyle, height: '140px', resize: 'none' }}
              />
              {pgnError && <p style={errorStyle}>{pgnError}</p>}
              {pgnMoves.length > 0 && !pgnError && (
                <div style={{ marginTop: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={labelStyle}>Start at</span>
                    <span style={{ color: '#fff', fontSize: '0.85rem' }}>
                      {selectedMoveIndex === 0
                        ? 'Initial'
                        : pgnMoves[selectedMoveIndex - 1]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={pgnMoves.length}
                    value={selectedMoveIndex}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    style={sliderStyle}
                  />
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Level</label>
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
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Play as</label>
              <select
                value={playerColor}
                onChange={(e) => setPlayerColor(e.target.value as 'w' | 'b')}
                style={selectStyle}
              >
                <option value="w">White</option>
                <option value="b">Black</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => startPractice(difficulty, initialFen, playerColor)}
            disabled={isStartDisabled}
            style={
              isStartDisabled
                ? disabledStartButtonStyle
                : activeStartButtonStyle
            }
          >
            Start Session
          </button>
        </div>
      )}

      {mode === 'lichess-search' && (
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <LichessSearchSetup
            onGameSelected={(game) => {
              const endgameFen = EndgameDecider.extractFromPgn(game.pgn);
              if (endgameFen) {
                startPractice(15, endgameFen, 'w', game);
              } else {
                alert('No endgame found in this match!');
              }
            }}
          />
        </div>
      )}

      {mode === 'lichess-random' && (
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <LichessRandomSetup
            onStart={(level, fen, game) => startPractice(level, fen, 'w', game)}
          />
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  width: '100vw',
  backgroundColor: '#000000',
  color: '#ededed',
  fontFamily:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '20px',
  boxSizing: 'border-box' as const,
};

const cardStyle = {
  backgroundColor: '#0a0a0a',
  padding: '40px',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '440px',
  boxSizing: 'border-box' as const,
  border: '1px solid #1f1f1f', // Borde sutil
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
};

const titleStyle = {
  marginTop: 0,
  marginBottom: '8px',
  fontWeight: 600,
  fontSize: '1.5rem',
  color: '#ffffff',
  letterSpacing: '-0.02em',
};

const subtitleStyle = {
  margin: 0,
  fontSize: '0.9rem',
  color: '#888888',
  lineHeight: '1.5',
};

const menuButtonStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: '18px 24px',
  fontSize: '0.95rem',
  fontWeight: 500,
  backgroundColor: '#0a0a0a',
  color: '#ededed',
  border: '1px solid #1f1f1f',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, background-color 0.2s ease',
};

const arrowStyle = {
  color: '#555',
  fontSize: '1.1rem',
};

const backButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#888888',
  cursor: 'pointer',
  padding: 0,
  marginBottom: '30px',
  fontSize: '0.9rem',
  fontWeight: 500,
  transition: 'color 0.2s ease',
};

const tabContainerStyle = {
  display: 'flex',
  backgroundColor: '#111111',
  borderRadius: '8px',
  padding: '4px',
  marginBottom: '24px',
  border: '1px solid #1f1f1f',
};


const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  boxSizing: 'border-box' as const,
  backgroundColor: '#000000',
  color: '#ffffff',
  border: '1px solid #222222',
  borderRadius: '10px',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit',
};

const selectStyle = {
  ...inputStyle,
  padding: '12px 16px',
  cursor: 'pointer',
  appearance: 'none' as const,
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 500,
  color: '#888888',
  marginBottom: '8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const sliderStyle = {
  width: '100%',
  cursor: 'pointer',
  accentColor: '#ffffff',
};

const errorStyle = {
  color: '#ff453a',
  fontSize: '0.85rem',
  marginTop: '8px',
  marginBottom: 0,
  fontWeight: 500,
};

const disabledStartButtonStyle = {
  width: '100%',
  padding: '16px',
  backgroundColor: '#111111',
  color: '#444444',
  border: '1px solid #1f1f1f',
  borderRadius: '10px',
  cursor: 'not-allowed',
  fontWeight: 500,
  fontSize: '0.95rem',
};

const activeTabStyle = {
  flex: 1,
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  border: 'none',
  fontWeight: 600,
  backgroundColor: 'rgba(99, 102, 241, 0.15)',
  color: '#818cf8',
  fontSize: '0.85rem',
  transition: 'all 0.2s ease',
};

const inactiveTabStyle = {
  flex: 1,
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#666666',
  fontSize: '0.85rem',
  transition: 'all 0.2s ease',
};

const activeStartButtonStyle = {
  width: '100%',
  padding: '16px',
  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.95rem',
  boxShadow: '0 8px 20px -6px rgba(168, 85, 247, 0.5)',
  transition: 'transform 0.1s ease, filter 0.2s ease',
};
