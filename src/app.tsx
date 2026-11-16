//import { PlayableBoard } from './features/playable-board/playableBoard.tsx';
import { SetupWidget } from './features/setup-lobby/setupWidget.tsx';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212' }}>
      <SetupWidget/>
    </div>
  );
}

export default App;