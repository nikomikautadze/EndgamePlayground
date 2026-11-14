import { IChessEngine , EngineEvaluation } from '../../domain/engine/iChessEngine.ts';

export class stockfishAdapter implements EngineEvaluation {
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

  public evaluatePosition(fen: string, depth: number = 15): void {
    if (!this.worker) this.init();
    this.worker?.postMessage('position fen ${fen}');
    this.worker?.postMessage('go depth ${depth}');
  }

  public onEvaluationReady(callback: (evalData: EngineEvaluation) => void): void {
    this.callback = callback;
  }

  public stop(): void {
    if (this.worker) {
      postMessage('quit');
      this.worker.terminate();
      this.worker = null;
    }
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const line = event.data;
    //parse stockfish returned text
    if(line.startsWith('info depth') && line.includes('score cp') && this.callback) {
      const matchScore = line.match(/score cp (-?\d+)/);
      const score = matchScore ? parseInt(matchScore[1], 10) / 100 : 0;
      this.callback({
        score,
        bestMove: ''
      });
    }

  }

}
