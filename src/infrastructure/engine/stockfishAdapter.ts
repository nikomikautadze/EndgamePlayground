import { IChessEngine , EngineEvaluation } from '../../domain/engine/iChessEngine.ts';

export class stockfishAdapter implements IChessEngine {
  private worker: Worker | null = null;
  private callback: ((evalData: EngineEvaluation) => void) | null = null;


  // stockfish.js usage adapted to typescript
  public init(): void {
    if (this.worker) return;

    const wasmSupported = typeof WebAssembly == 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));

    this.worker = new Worker(wasmSupported ? '/stockfish.wasm.js' : '/stockfish.js');
    this.worker.addEventListener('message', (e) => this.handleWorkerMessage(e));
    this.worker.postMessage('uci');
    this.worker.postMessage('isready');
  }

  private currentTurn: 'w' | 'b' = 'w';

  public evaluatePosition(fen: string, depth: number = 15): void {
    if (!this.worker) this.init();
    const parts = fen.split('');
    if (parts.length > 1) {
      this.currentTurn = parts[1] as 'w' | 'b';
    }
    this.worker?.postMessage(`position fen ${fen}`);
    this.worker?.postMessage(`go depth ${depth}`);
  }

  public onEvaluationReady(callback: (evalData: EngineEvaluation) => void): void {
    this.callback = callback;
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

    //parse stockfish returned text
    if(line.startsWith('info depth') && this.callback) {
      let score = 0;
      let mate: number | null = null;

      const mateMatch = line.match(/score mate (-?\d+)/);
      if (mateMatch) {
        mate = parseInt(mateMatch[1], 10);
        if (this.currentTurn === 'b') mate = -mate;
      }
      else {
        const cpMatch = line.match(/score cp (-?\d+)/);
        if (cpMatch) {
          let cp = parseInt(cpMatch[1], 10);
          if (this.currentTurn === 'b') mate = -mate;
          score = cp/100;
        }
      }
      this.callback({
        score,
        mate,
        bestMove: undefined
      });
    }

  }

}
