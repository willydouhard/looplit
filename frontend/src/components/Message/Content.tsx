import type { IMessageContent } from '.';
import AutoResizeTextarea from '../AutoResizeTextarea';
import ImageEditor from '../ImageEditor';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { useCallback } from 'react';

interface Props {
  content: IMessageContent;
  onChange?: (content: IMessageContent) => void;
  autoFocus?: boolean;
  maxHeight?: number;
}

export function MessageContent({
  content,
  onChange,
  autoFocus,
  maxHeight
}: Props) {
  const placeholder = autoFocus ? 'Type your message here.' : 'Empty';
  const addImage = useCallback(
    (url: string) => {
      const toAdd = { type: 'image_url' as const, image_url: { url } };
      if (typeof content === 'string') {
        onChange?.([
          {
            type: 'text',
            text: content as string
          },
          toAdd
        ]);
      } else {
        onChange?.([...content, toAdd]);
      }
    },
    [content, onChange]
  );

  if (typeof content === 'string') {
    return (
      <AutoResizeTextarea
        maxHeight={maxHeight}
        value={content}
        autoFocus={autoFocus}
        onPasteImage={addImage}
        disabled={!onChange}
        onChange={(e) => onChange?.(e.target.value)}
        className="resize-none border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder={placeholder}
      />
    );
  } else {
    return (
      <div className="flex flex-col gap-2">
        {content.map((c, i) => {
          if (c.type === 'text') {
            return (
              <div className="flex" key={i}>
                <AutoResizeTextarea
                  key={i}
                  maxHeight={maxHeight}
                  disabled={!onChange}
                  value={c.text}
                  onPasteImage={addImage}
                  onChange={(e) =>
                    onChange?.(
                      content.map((c, changedIndex) => {
                        if (i !== changedIndex) {
                          return c;
                        } else {
                          return { ...c, text: e.target.value };
                        }
                      })
                    )
                  }
                  className="resize-none border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder={placeholder}
                />
                {i !== 0 ? (
                  <Button
                    onClick={() =>
                      onChange?.(
                        content.filter((_, deletedIndex) => i !== deletedIndex)
                      )
                    }
                    className="-mt-2"
                    variant="ghost"
                    size="icon"
                  >
                    <Trash2 />
                  </Button>
                ) : null}
              </div>
            );
          } else if (c.type === 'image_url') {
            const url =
              typeof c.image_url === 'string' ? c.image_url : c.image_url.url;
            return (
              <ImageEditor
                key={i}
                url={url}
                onDelete={() =>
                  onChange?.(
                    content.filter((_, deletedIndex) => i !== deletedIndex)
                  )
                }
              />
            );
          }
        })}
      </div>
    );
  }
}
