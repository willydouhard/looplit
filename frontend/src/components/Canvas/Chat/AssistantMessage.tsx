import { Logo } from '@/components/Logo';
import Markdown from '@/components/Markdown';

interface Props {
  content: string;
}

export default function CanvasChatAssistantMessage({ content }: Props) {
  return (
    <div className="flex gap-4 items-start">
      <Logo className="w-5 mt-1.5" />
      <div>
        <Markdown>{content}</Markdown>
      </div>
    </div>
  );
}
