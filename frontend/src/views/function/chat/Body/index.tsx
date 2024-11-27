import FunctionViewContext from '../../context';
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
import { RefObject, useCallback, useContext, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';

interface Props {
  composerPlaceholderRef: RefObject<HTMLDivElement>;
}

export default function ChatBody({ composerPlaceholderRef }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const running = useRecoilValue(runningState);
  const { currentLineageId } = useContext(FunctionViewContext);
  const currentState = useCurrentState();
  const setEditState = useSetEditState();
  const error = useRecoilValue(errorState);

  useEffect(() => {
    if (ref.current && currentState?.messages && running) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [currentState?.messages, running]);

  const onMessageChange = useCallback(
    (m: IMessage, index: number) => {
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
    },
    [currentState, setEditState]
  );

  if (!currentState) return null;

  return (
    <div
      ref={ref}
      className="flex flex-col gap-4 pt-4 flex-grow overflow-y-auto"
    >
      <div className="pt-10" />
      {currentState.messages.map((m, i) => {
        return (
          <div
            key={i}
            className="flex flex-col gap-1 border px-4 py-2 rounded-md bg-background"
          >
            <Message
              maxHeight={200}
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
                <ForkNav index={i} />
                <ForkButton index={i} />
                <CopyButton content={m} />
              </div>
            </Message>
          </div>
        );
      })}
      {error?.lineage_id === currentLineageId ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.error}</AlertDescription>
        </Alert>
      ) : null}
      <div ref={composerPlaceholderRef} />
    </div>
  );
}
