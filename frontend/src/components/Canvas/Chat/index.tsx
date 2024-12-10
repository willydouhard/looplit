import CanvasChatBody from './Body';
import CanvasChatHeader from './Header';
import CanvasChatInput from './Input';
import useInteraction from '@/hooks/useInteraction';
import { canvasState } from '@/state';
import { useRecoilState } from 'recoil';

export default function CanvasChat() {
  const { callCanvasAgent } = useInteraction();
  const [canvas, setCanvas] = useRecoilState(canvasState);
  const submit = (message: string) => {
    if (!canvas) return;
    setCanvas((prev) => {
      if (!prev) return undefined;
      return {
        ...prev,
        messages: [...prev.messages, { role: 'user', content: message }]
      };
    });
    callCanvasAgent({
      chat_id: canvas.chatId,
      context: canvas.context,
      state: canvas.aiState,
      message
    });
  };

  return (
    <div className="flex flex-col h-full">
      <CanvasChatHeader />
      <CanvasChatBody />
      <CanvasChatInput onSubmit={submit} className="mt-auto" />
    </div>
  );
}
