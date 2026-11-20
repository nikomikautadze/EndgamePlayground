import { useEffect, useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { stockfishAdapter } from '../../infrastructure/engine/stockfishAdapter.ts';
import { GameRecord } from '../../domain/interfaces/iGameRepository.ts';

interface PlayableBoardProps {
  initialFen: string;
  playerColor: 'w' | 'b';
  difficulty: number;
  gameInfo?: GameRecord;
}

export function PlayableBoard({
  initialFen,
  playerColor,
  difficulty,
  gameInfo,
}: PlayableBoardProps) {
  const [fen, setFen] = useState(initialFen);
  const game = useMemo(() => new Chess(initialFen), [initialFen]);
  const engine = useMemo(() => new stockfishAdapter(), []);

  useEffect(() => {
    engine.setDifficulty(difficulty);
  }, [engine, difficulty]);

  useEffect(() => {
    engine.init();
    engine.onEvaluationReady((evalData) => {
      if (evalData.bestMove && game.turn() !== playerColor) {
        try {
          game.move(evalData.bestMove);
          setFen(game.fen());
        } catch (e) {
          console.error('Invalid engine move:', evalData.bestMove);
        }
      }
    });

    return () => {
      engine.stop();
    };
  }, [engine, game, playerColor]);

  useEffect(() => {
    let calculatedDepth = 15;
    if (difficulty === 0) {
      calculatedDepth = 1;
    } else if (difficulty === 5) {
      calculatedDepth = 3;
    } else {
      calculatedDepth = Math.max(5, difficulty);
    }

    engine.evaluatePosition(fen, calculatedDepth);
  }, [engine, fen, playerColor, difficulty]);

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (!targetSquare) return false;
    if (game.turn() !== playerColor) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) return false;

      setFen(game.fen());
      return true;
    } catch (e) {
      return false;
    }
  }

  const handleReset = () => {
    game.load(initialFen);
    setFen(initialFen);
  };

  const isWhite = playerColor === 'w';
  const currentTurn = game.turn();

  const topPlayer = {
    name: isWhite
      ? gameInfo?.black || 'Stockfish'
      : gameInfo?.white || 'Stockfish',
    elo: isWhite ? gameInfo?.blackElo || 'N/A' : gameInfo?.whiteElo || 'N/A',
    isTurn: currentTurn === (isWhite ? 'b' : 'w'),
  };

  const bottomPlayer = {
    name: isWhite ? gameInfo?.white || 'You' : gameInfo?.black || 'You',
    elo: isWhite ? gameInfo?.whiteElo || 'N/A' : gameInfo?.blackElo || 'N/A',
    isTurn: currentTurn === playerColor,
  };

  const datePlayed = gameInfo?.date || 'Unknown Date';

  return (
    <div style={screenContainerStyle}>
      <div style={boardWrapperStyle}>
        <div style={topMetaBarStyle}>
          {gameInfo ? (
            <span style={dateBadgeStyle}>Played on · {datePlayed}</span>
          ) : (
            <span style={dateBadgeStyle}>Custom Endgame</span>
          )}

          <button onClick={handleReset} style={resetButtonStyle}>
            ↺ Reset Position
          </button>
        </div>

        <div
          style={{
            ...playerBarStyle,
            borderColor: topPlayer.isTurn ? '#3f3f46' : '#1f1f1f',
          }}
        >
          <div style={playerInfoGroupStyle}>
            <div style={opponentAvatarStyle}>
              {topPlayer.name.charAt(0).toUpperCase()}
            </div>
            <span style={playerNameStyle}>{topPlayer.name}</span>
            {topPlayer.isTurn && <span style={turnDotStyle} />}
          </div>
          <span style={eloBadgeStyle}>Elo · {topPlayer.elo}</span>
        </div>

        <div style={boardFrameStyle}>
          <Chessboard
            options={{
              position: fen,
              onPieceDrop,
              boardOrientation: isWhite ? 'white' : 'black',
              darkSquareStyle: { backgroundColor: '#b58863' },
              lightSquareStyle: { backgroundColor: '#f0d9b5' },
            }}
          />
        </div>

        <div
          style={{
            ...playerBarStyle,
            borderColor: bottomPlayer.isTurn ? '#6366f1' : '#1f1f1f',
          }}
        >
          <div style={playerInfoGroupStyle}>
            <div style={userAvatarStyle}>
              {bottomPlayer.name.charAt(0).toUpperCase()}
            </div>
            <span style={playerNameStyle}>{bottomPlayer.name}</span>
            {bottomPlayer.isTurn && (
              <span style={{ ...turnDotStyle, backgroundColor: '#a855f7' }} />
            )}
          </div>
          <span style={eloBadgeStyle}>Elo · {bottomPlayer.elo}</span>
        </div>
      </div>
    </div>
  );
}


const screenContainerStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'flex-start',
  minHeight: '100vh',
  width: '100vw',
  backgroundColor: '#000000',
  padding: '44px 24px 24px 24px',
  boxSizing: 'border-box' as const,
  fontFamily:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const boardWrapperStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
  width: '100%',
  maxWidth: '560px',
};

const topMetaBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2px',
};

const dateBadgeStyle = {
  fontSize: '0.8rem',
  color: '#71717a',
  letterSpacing: '0.02em',
};

const resetButtonStyle = {
  backgroundColor: '#0a0a0a',
  color: '#a1a1aa',
  border: '1px solid #1f1f1f',
  borderRadius: '8px',
  padding: '6px 12px',
  fontSize: '0.8rem',
  cursor: 'pointer',
  transition: 'border-color 0.2s, color 0.2s',
};

const boardFrameStyle = {
  borderRadius: '14px',
  overflow: 'hidden',
  border: '1px solid #1f1f1f',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
  width: '100%',
};

const playerBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#0a0a0a',
  border: '1px solid #1f1f1f',
  padding: '12px 16px',
  borderRadius: '12px',
  transition: 'border-color 0.25s ease',
};

const playerInfoGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const opponentAvatarStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  color: '#a1a1aa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.85rem',
  fontWeight: 600,
};

const userAvatarStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.85rem',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)',
};

const playerNameStyle = {
  color: '#f4f4f5',
  fontWeight: 500,
  fontSize: '0.95rem',
};

const turnDotStyle = {
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  backgroundColor: '#71717a',
};

const eloBadgeStyle = {
  backgroundColor: '#111111',
  border: '1px solid #222222',
  color: '#a1a1aa',
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '0.8rem',
  fontFamily: 'monospace',
};
