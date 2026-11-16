import { JSX, useEffect, useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { stockfishAdapter } from '../../infrastructure/engine/stockfishAdapter.ts';


interface PlayableBoardProps {
  initialFen: string;
  playerColor: 'w' | 'b';
  difficulty: number;
}

export function PlayableBoard({ initialFen, playerColor, difficulty}: PlayableBoardProps) {
  const [fen, setFen] = useState(initialFen);
  const game = useMemo(() => new Chess(initialFen), [initialFen]);
  const engine = useMemo(() => new stockfishAdapter(), []);

  const [evaluation, setEvaluation] = useState<{
    score: number;
    mate: number | null;
  } | null>(null);

  useEffect(() => {
    engine.setDifficulty(difficulty);
  }, [engine, difficulty]);

  useEffect(() => {
    engine.init();
    engine.onEvaluationReady((evalData) => {
      setEvaluation({score: evalData.score, mate: evalData.mate});
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
    let moveTime: number | undefined = undefined;

    if (difficulty === 0) {
      calculatedDepth = 1;
      moveTime = 50;
    }
    else if (difficulty == 5) {
      calculatedDepth = 3;
      moveTime = 300;
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
        promotion: 'q', //!!!!!!
      });

      if (move === null) return false;

      setFen(game.fen());
      return true;
    } catch (e) {
      return false;
    }
  }

  let evalText = 'Analyzing...';
  if (evaluation) {
    const isWhiteTurn = game.turn() === 'w';
    if (evaluation.mate !== null) {
      const absoluteMate = isWhiteTurn ? evaluation.mate : -evaluation.mate;
      evalText =
        evaluation.mate > 0
          ? `M${absoluteMate}`
          : `-M${Math.abs(absoluteMate)}`;
    } else {
      const absoluteScore = isWhiteTurn ? evaluation.score : -evaluation.score;
      evalText =
        absoluteScore > 0
          ? `+${absoluteScore.toFixed(2)}`
          : absoluteScore.toFixed(2);
    }
  }
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2
        style={{
          color: 'white',
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        Endgame Practice
      </h2>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '15px',
        }}
      >
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
          style={{ padding: '5px', borderRadius: '4px', cursor: 'pointer' }}
        >
          <option value={0}>Nivel 0 (Muy fácil)</option>
          <option value={5}>Nivel 5 (Fácil)</option>
          <option value={10}>Nivel 10 (Medio)</option>
          <option value={15}>Nivel 15 (Difícil)</option>
          <option value={20}>Nivel 20 (Stockfish Máximo)</option>
        </select>

        <button
          onClick={() => setPlayerColor('w')}
          style={{
            padding: '5px 15px',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: playerColor === 'w' ? '#779556' : '#fff',
            color: playerColor === 'w' ? 'white' : 'black',
          }}
        >
          Blancas
        </button>

        <button
          onClick={() => setPlayerColor('b')}
          style={{
            padding: '5px 15px',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: playerColor === 'b' ? '#779556' : '#fff',
            color: playerColor === 'b' ? 'white' : 'black',
          }}
        >
          Negras
        </button>
      </div>

      <p
        style={{
          color: 'white',
          textAlign: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold',
        }}
      >
        Engine evaluation: {evalText}
      </p>

      <Chessboard
        options={{
          position: fen,
          onPieceDrop,
          boardOrientation: playerColor === 'w' ? 'white' : 'black',
          darkSquareStyle: { backgroundColor: '#779556' },
          lightSquareStyle: { backgroundColor: '#ebecd0' },
        }}
      />
    </div>
  );
}