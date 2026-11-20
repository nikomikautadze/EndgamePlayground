import {
  IChessEngine,
  EngineEvaluation,
} from '../../domain/engine/iChessEngine.ts';

export class stockfishAdapter implements IChessEngine {
  private worker: Worker | null = null;
  private callback: ((evalData: EngineEvaluation) => void) | null = null;

  // stockfish.js usage adapted to typescript
  public init(): void {
    if (this.worker) return;

    const wasmSupported =
      typeof WebAssembly == 'object' &&
      WebAssembly.validate(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00),
      );

    this.worker = new Worker(
      wasmSupported ? '/stockfish.wasm.js' : '/stockfish.js',
    );
    this.worker.addEventListener('message', (e) => this.handleWorkerMessage(e));
    this.worker.postMessage('uci');
    this.worker.postMessage('isready');
  }


  public evaluatePosition(
    fen: string,
    depth: number = 15,
    moveTime?: number,
  ): void {
    if (!this.worker) this.init();

    this.worker?.postMessage(`position fen ${fen}`);
    if (moveTime) {
      this.worker?.postMessage(`go movetime ${moveTime}`);
    } else {
      this.worker?.postMessage(`go depth ${depth}`);
    }
  }

  public onEvaluationReady(
    callback: (evalData: EngineEvaluation) => void,
  ): void {
    this.callback = callback;
  }

  public setDifficulty(skillLevel: number): void {
    if (!this.worker) this.init();
    this.worker?.postMessage('setoption name UCI_LimitStrength value true');
    this.worker?.postMessage(`setoption name Skill Level value ${skillLevel}`);
  }

  public stop(): void {
    if (this.worker) {
      this.worker.postMessage('quit');
      this.worker.terminate();
      this.worker = null;
    }
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const line = event.data;

    if (line.startsWith('bestmove') && this.callback) {
      const match = line.match(/^bestmove\s+(\w+)/);
      if (match) {
        const moveStr = match[1];
        this.callback({
          score: 0,
          mate: null,
          bestMove: {
            from: moveStr.substring(0, 2),
            to: moveStr.substring(2, 4),
            promotion: moveStr.length === 5 ? moveStr[4] : undefined,
          },
        });
      }
    }
  }
}
