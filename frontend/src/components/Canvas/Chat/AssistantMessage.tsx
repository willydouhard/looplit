import { Logo } from '@/components/Logo';
import Markdown from '@/components/Markdown';

interface Props {
  content: string;
}

export default function CanvasChatAssistantMessage({ content }: Props) {
  return (
    <div className="flex gap-4">
      <Logo className="w-4" />
      <div>
        <Markdown>{content}</Markdown>
      </div>
    </div>
  );
}
