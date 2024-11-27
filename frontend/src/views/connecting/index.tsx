import { Loader } from '@/components/Loader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { functionsState, sessionState } from '@/state';
import { AlertCircle } from 'lucide-react';
import { useRecoilValue } from 'recoil';

export default function ConnectingView() {
  const session = useRecoilValue(sessionState);
  const functions = useRecoilValue(functionsState);

  const alert = session?.error ? (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Failed to establish websocket connection.
      </AlertDescription>
    </Alert>
  ) : null;

  const connecting =
    !session || functions === undefined ? (
      <div className="flex items-center gap-1">
        <Loader /> Connecting...
      </div>
    ) : null;

  if (!alert && !connecting) return null;

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="max-w-[48rem] flex flex-col gap-4">
        {alert}
        {connecting}
      </div>
    </div>
  );
}
