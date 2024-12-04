import ChatBody from './Body';
import ChatHeader from './Header';
import MessageComposer from '@/components/MessageComposer';

export default function ChatView() {
  return (
    <div className="flex flex-col h-full bg-card relative">
      <ChatHeader />
      <div className="flex flex-col flex-grow px-4 overflow-y-auto">
        <ChatBody />
      </div>
      <MessageComposer />
    </div>
  );
}
