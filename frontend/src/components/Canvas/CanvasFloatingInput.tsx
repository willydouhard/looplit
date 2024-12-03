import AutoResizeTextarea from '../AutoResizeTextarea';
import { Kbd } from '../Kbd';
import { Button } from '../ui/button';
import useCurrentState from '@/hooks/useCurrentState';
import { canvasState } from '@/state';
import FunctionViewContext from '@/views/function/context';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

export interface ICanvasInputProps {
  selectedText: string;
  setOpen?: (open: boolean) => void;
}

export default function CanvasFloatingInput({
  selectedText,
  setOpen
}: ICanvasInputProps) {
  const ref = useRef<HTMLDivElement>(null);
  const setCanvas = useSetRecoilState(canvasState);
  const currentState = useCurrentState();
  const { currentLineageId } = useContext(FunctionViewContext);
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(() => {
    if (!value || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setCanvas({
      context: selectedText,
      sessionId: uuidv4(),
      running: false,
      messages: [{ role: 'user', content: value }],
      aiState: JSON.stringify(currentState, undefined, 2),
      lineageId: currentLineageId,
      openCoords: {
        x: rect.x,
        y: rect.y
      }
    });
    setOpen?.(false);
    setValue('');
  }, [value, currentState, currentLineageId]);

  // Keyboard shortcut handler
  useEffect(() => {
    if (!ref.current) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
      }
    };

    ref.current.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      ref.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSubmit]);

  if (!selectedText) return null;

  return (
    <div
      ref={ref}
      className="p-3 rounded-md border bg-background flex flex-col"
    >
      <AutoResizeTextarea
        maxHeight={200}
        autoFocus
        placeholder="Describe the issue..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        disabled={!value}
        size="sm"
        onClick={handleSubmit}
        className="ml-auto p-1 h-6"
      >
        Submit <Kbd>Cmd+Enter</Kbd>
      </Button>
    </div>
  );
}
