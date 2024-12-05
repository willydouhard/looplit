import AutoResizeTextarea from '@/components/AutoResizeTextarea';
import { Kbd } from '@/components/Kbd';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { canvasState } from '@/state';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';

interface Props {
  className?: string;
  onSubmit: (message: string) => void;
}

export default function CanvasChatInput({ onSubmit, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const canvas = useRecoilValue(canvasState);
  const [value, setValue] = useState('');

  const disabled = canvas?.running || !value;

  const submit = useCallback(() => {
    if (!value) return;
    onSubmit(value);
    setValue('');
  }, [value, disabled]);

  // Keyboard shortcut handler
  useEffect(() => {
    if (!ref.current) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        submit();
      }
    };

    ref.current.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      ref.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [submit]);

  const submitButton = useMemo(() => {
    return (
      <Button size="sm" disabled={disabled} onClick={submit}>
        Submit <Kbd>Cmd+Enter</Kbd>
      </Button>
    );
  }, [submit]);

  if (!canvas) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'w-full flex flex-col gap-1 border-t border-b px-6 py-4',
        className
      )}
    >
      <AutoResizeTextarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxHeight={200}
        placeholder="Ask AI..."
      />
      <div className="flex justify-end">
        <div className="flex items-center gap-2">{submitButton}</div>
      </div>
    </div>
  );
}
