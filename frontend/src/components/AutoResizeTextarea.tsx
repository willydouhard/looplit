import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useRef } from 'react';

interface Props extends React.ComponentProps<'textarea'> {
  maxHeight?: number;
  onPasteImage?: (base64Url: string) => void;
}

const AutoResizeTextarea = ({
  maxHeight,
  onPasteImage,
  className,
  ...props
}: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i]?.type.indexOf('image') !== -1) {
            const file = items[i]?.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const base64Url = reader.result;
                onPasteImage?.(base64Url as string);
              };
              reader.readAsDataURL(file);
            }
          }
        }
      }
    },
    [onPasteImage]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Add paste event listener
    textarea.addEventListener('paste', handlePaste);

    return () => {
      // Remove paste event listener
      textarea.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !maxHeight) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [props.value]);

  return (
    <Textarea
      ref={textareaRef}
      {...props}
      className={cn(
        'p-0 min-h-6 resize-none border-none overflow-y-auto shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0',
        className
      )}
      style={{ maxHeight }}
    />
  );
};

export default AutoResizeTextarea;
