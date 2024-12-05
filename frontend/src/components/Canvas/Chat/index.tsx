import CanvasChatBody from './Body';
import CanvasChatHeader from './Header';
import CanvasChatInput from './Input';
import useInteraction from '@/hooks/useInteraction';
import { canvasState } from '@/state';
import { useRecoilValue } from 'recoil';

export default function CanvasChat() {
  const { callCanvasAgent } = useInteraction();
  const canvas = useRecoilValue(canvasState);
  const submit = (message: string) => {
    if (!canvas) return;

    callCanvasAgent({
      chat_id: canvas.chatId,
      context: canvas.context,
      state: canvas.aiState,
      message
    });
  };

  return (
    <div className="flex flex-col flex-grow">
      <CanvasChatHeader />
      <CanvasChatBody />
      <CanvasChatInput onSubmit={submit} className="mt-auto" />
    </div>
  );
}
