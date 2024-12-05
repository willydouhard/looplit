import CanvasChatAssistantMessage from './AssistantMessage';
import CanvasChatUserMessage from './UserMessage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { canvasState } from '@/state';
import { AlertCircle } from 'lucide-react';
import { useRecoilValue } from 'recoil';

export default function CanvasChatBody() {
  const canvas = useRecoilValue(canvasState);

  if (!canvas) return null;

  return (
    <div className="flex flex-col gap-4 flex-grow px-6">
      {canvas?.messages.map((m, i) => {
        if (m.role === 'user') {
          return (
            <CanvasChatUserMessage
              key={canvas.chatId + i}
              content={m.content}
            />
          );
        } else if (m.role === 'assistant') {
          return (
            <CanvasChatAssistantMessage
              key={canvas.chatId + i}
              content={m.content}
            />
          );
        } else {
          return null;
        }
      })}
      {canvas.error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{canvas.error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
