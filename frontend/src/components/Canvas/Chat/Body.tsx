import CanvasChatAssistantMessage from './AssistantMessage';
import CanvasChatUserMessage from './UserMessage';
import { canvasState } from '@/state';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { toast } from 'sonner';

export default function CanvasChatBody() {
  const canvas = useRecoilValue(canvasState);

  useEffect(() => {
    if (canvas?.error) {
      toast.error('Failed to run agent: ' + canvas.error);
    }
  }, [canvas?.error]);

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
    </div>
  );
}
