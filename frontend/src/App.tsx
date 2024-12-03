import MonacoTheme from './MonacoTheme';
import { router } from './Router';
import SocketConnection from './SocketConnection';
import CodeCanvas from './components/Canvas';
import { ThemeProvider } from './components/ThemeProvider';
import { functionsState, sessionState } from './state';
import ConnectingView from './views/connecting';
import { Toaster } from '@/components/ui/sonner';
import { RouterProvider } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

function App() {
  const session = useRecoilValue(sessionState);
  const functions = useRecoilValue(functionsState);

  const ready = session && !session.error && functions !== undefined;

  return (
    <ThemeProvider storageKey="vite-ui-theme">
      <MonacoTheme />
      <SocketConnection />
      <Toaster position="top-center" />
      <ConnectingView />
      <CodeCanvas />
      {ready ? <RouterProvider router={router} /> : null}
    </ThemeProvider>
  );
}

export default App;
