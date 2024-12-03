import Markdown from '@/components/Markdown';

interface Props {
  content: string;
}

export default function CanvasChatUserMessage({ content }: Props) {
  return (
    <div className="bg-accent px-4 py-1 ml-auto max-w-[80%] rounded-lg">
      <Markdown>{content}</Markdown>
    </div>
  );
}
