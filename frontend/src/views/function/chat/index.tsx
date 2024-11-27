import ChatBody from './Body';
import ChatHeader from './Header';
import MessageComposer from '@/components/MessageComposer';
import { useRef } from 'react';

export default function ChatView() {
  const composerPlaceholderRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex flex-col h-full bg-card relative">
      <ChatHeader />
      <div className="flex flex-col flex-grow px-4 overflow-y-auto">
        <ChatBody composerPlaceholderRef={composerPlaceholderRef} />
      </div>
      <MessageComposer composerPlaceholderRef={composerPlaceholderRef} />
    </div>
  );
}
