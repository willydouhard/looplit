import CanvasChatAssistantMessage from './AssistantMessage';
import CanvasChatUserMessage from './UserMessage';
import { canvasState } from '@/state';
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
              key={canvas.sessionId + i}
              content={m.content}
            />
          );
        } else if (m.role === 'assistant') {
          return (
            <CanvasChatAssistantMessage
              key={canvas.sessionId + i}
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
