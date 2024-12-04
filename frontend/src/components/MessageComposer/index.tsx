import type { IMessage } from '../Message';
import Message from '../Message';
import { Kbd } from '@/components/Kbd';
import { Button } from '@/components/ui/button';
import useCurrentEditState from '@/hooks/useCurrentEditState';
import useCurrentState from '@/hooks/useCurrentState';
import useInteraction from '@/hooks/useInteraction';
import {
  ILooplitState,
  runningState,
  stateHistoryByLineageState
} from '@/state';
import FunctionViewContext from '@/views/function/context';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

export default function MessageComposer() {
  const ref = useRef<HTMLDivElement>(null);
  const editState = useCurrentEditState();
  const running = useRecoilValue(runningState);
  const [composer, setComposer] = useState<IMessage>({
    role: 'user',
    content: ''
  });
  const currentState = useCurrentState();
  const { name, currentLineageId, currentStateIndex, setCurrentStateIndex } =
    useContext(FunctionViewContext);
  const setStateHistoryByLineage = useSetRecoilState(
    stateHistoryByLineageState
  );
  const { callStatefulFunction } = useInteraction();

  const disabled = running || !composer.content || !!editState;

  const addMessage = useCallback(
    (send?: boolean) => {
      if (disabled) return;
      const newState: ILooplitState = {
        ...currentState,
        id: uuidv4(),
        tools: currentState?.tools ? [...currentState.tools] : [],
        messages: currentState?.messages
          ? [...currentState.messages, composer]
          : [composer]
      };

      // Update state history
      setStateHistoryByLineage((prev) => {
        const currentLineage = [...(prev[currentLineageId] || [])];

        // Remove any states after the current index
        currentLineage.splice(currentStateIndex + 1);

        // Add the new state
        currentLineage.push(newState);

        return {
          ...prev,
          [currentLineageId]: currentLineage
        };
      });

      // Update current state index to point to the new state
      setCurrentStateIndex?.((prev) => prev.currentStateIndex + 1);

      setComposer((prev) => ({
        role: prev.role,
        content: ''
      }));

      if (send) {
        callStatefulFunction({
          func_name: name,
          lineage_id: currentLineageId,
          state: newState
        });
      }
    },
    [
      disabled,
      composer,
      currentLineageId,
      currentState,
      currentStateIndex,
      name,
      setStateHistoryByLineage,
      setCurrentStateIndex,
      callStatefulFunction
    ]
  );

  // Keyboard shortcut handler
  useEffect(() => {
    if (!ref.current) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        addMessage(true);
      }
    };

    ref.current.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      ref.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [addMessage]);

  const addMessageButton = (
    <Button
      data-testid="add-message-tabs"
      onClick={() => addMessage()}
      size="sm"
      variant="outline"
      disabled={disabled}
    >
      Add
    </Button>
  );

  const submitButton = useMemo(() => {
    return (
      <Button size="sm" disabled={disabled} onClick={() => addMessage(true)}>
        Submit <Kbd>Cmd+Enter</Kbd>
      </Button>
    );
  }, [addMessage]);

  return (
    <div ref={ref} className="flex flex-col gap-1 border-t border-b px-4 py-2">
      <Message
        autoFocus
        message={composer}
        onChange={setComposer}
        maxHeight={200}
      >
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            {addMessageButton}
            {submitButton}
          </div>
        </div>
      </Message>
    </div>
  );
}
