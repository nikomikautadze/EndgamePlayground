import { useEffect, useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { stockfishAdapter } from '../../infrastructure/engine/stockfishAdapter.ts';

export function PlayableBoard() {
  const initialFen = '8/8/8/8/8/6k1/8/4R1K1 w - - 0 1';
  const [fen, setFen] = useState(initialFen);

  const game = useMemo(() => new Chess(initialFen), []);
  const engine = useMemo(() => new stockfishAdapter(), []);

  const [evaluation, setEvaluation] = useState<{
    score: number;
    mate: number | null;
  } | null>(null);

  useEffect(() => {
    engine.init();
    engine.onEvaluationReady((evalData) => {
      setEvaluation({score: evalData.score, mate: evalData.mate});
    });

    return () => {
      engine.stop();
    };
  }, [engine]);

  useEffect(() => {
    engine.evaluatePosition(fen);
  }, [engine, fen]);

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (!targetSquare) return false;

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
    if (evaluation.mate !== null) {
      evalText =
        evaluation.mate > 0
          ? `M${evaluation.mate}`
          : `-M${Math.abs(evaluation.mate)}`;
    } else {
      evalText =
        evaluation.score > 0
          ? `+${evaluation.score.toFixed(2)}`
          : evaluation.score.toFixed(2);
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
      <p style={{ color: 'white', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
        Engine evaluation: {evalText}
      </p>

      <Chessboard
        options={{
          position: fen,
          onPieceDrop,
          boardOrientation: 'white',
          darkSquareStyle: { backgroundColor: '#779556' },
          lightSquareStyle: { backgroundColor: '#ebecd0' },
        }}
      />
    </div>
  );
}