import CanvasChatBody from './Body';
import CanvasChatHeader from './Header';
import CanvasChatInput from './Input';

export default function CanvasChat() {
  // TODO: submit
  const submit = (content: string, context?: string) => {};

  return (
    <div className="flex flex-col flex-grow">
      <CanvasChatHeader />
      <CanvasChatBody />
      <CanvasChatInput onSubmit={submit} className="mt-auto" />
    </div>
  );
}
