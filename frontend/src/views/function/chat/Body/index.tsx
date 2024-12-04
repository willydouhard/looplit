// ChatBody.tsx
import FunctionViewContext from '../../context';
import AskAIButton from './AskAIButton';
import ForkButton from './ForkButton';
import ForkNav from './ForkNav';
import ToolCall from './ToolCall';
import CopyButton from '@/components/CopyButton';
import Message, { IMessage } from '@/components/Message';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import useCurrentState from '@/hooks/useCurrentState';
import useSetEditState from '@/hooks/useSetEditState';
import { errorState, runningState } from '@/state';
import { AlertCircle } from 'lucide-react';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';

export default function ChatBody() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollPositionStore = useRef({
    position: 0,
    set: (position: number) => {
      scrollPositionStore.current.position = position;
    },
    get: () => scrollPositionStore.current.position
  });
  const running = useRecoilValue(runningState);
  const { currentLineageId } = useContext(FunctionViewContext);
  const currentState = useCurrentState();
  const setEditState = useSetEditState();
  const error = useRecoilValue(errorState);

  // Handle scroll events to store position
  const handleScroll = useCallback((e: any) => {
    const target = e.target as HTMLDivElement;
    scrollPositionStore.current.set(target.scrollTop);
  }, []);

  // Auto scroll to bottom when running
  useEffect(() => {
    if (ref.current && currentState?.messages && running) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [currentState?.messages, running]);

  const onMessageChange = useCallback(
    (m: IMessage, index: number) => {
      const targetScroll = scrollPositionStore.current.get();
      setEditState({
        ...currentState,
        messages: [
          ...currentState.messages.slice(0, index),
          m,
          ...currentState.messages.slice(
            index + 1,
            currentState.messages.length
          )
        ]
      });
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.scrollTop = targetScroll;
        }
      });
    },
    [currentState, setEditState]
  );

  if (!currentState) return null;

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="flex flex-col gap-4 py-4 flex-grow overflow-y-auto"
    >
      {currentState.messages.map((m, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 border px-4 py-2 rounded-md bg-background"
        >
          <Message
            maxHeight={Number.MAX_SAFE_INTEGER}
            message={m}
            onChange={running ? undefined : (m) => onMessageChange(m, i)}
          >
            {m.tool_calls ? (
              <div className="flex flex-col gap-1">
                {m.tool_calls.map((tc) => (
                  <ToolCall
                    key={tc.id}
                    call={tc}
                    messages={currentState.messages}
                  />
                ))}
              </div>
            ) : null}
            <div className="flex items-center -ml-2">
              <CopyButton content={m} />
              <ForkNav index={i} />
              <ForkButton index={i} />
              <AskAIButton index={i} />
            </div>
          </Message>
        </div>
      ))}
      {error?.lineage_id === currentLineageId ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
