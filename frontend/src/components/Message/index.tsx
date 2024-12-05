import ImageDialog from '../ImageDialog';
import { Button } from '../ui/button';
import { MessageContent } from './Content';
import RoleSelect from './RoleSelect';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { ListPlusIcon, Trash2 } from 'lucide-react';
import { useCallback } from 'react';

export interface ITextContent {
  type: 'text';
  text: string;
}

export interface IImageUrlContent {
  type: 'image_url';
  image_url: string | { url: string };
}

export interface IToolCall {
  id: string;
  index?: number;
  type: 'function';
  function: {
    name: string;
    arguments: Record<string, any> | string;
  };
}

export type IMessageContent = string | (ITextContent | IImageUrlContent)[];

export interface IMessage {
  content?: IMessageContent;
  role: string;
  name?: string;
  tool_calls?: IToolCall[];
  tool_call_id?: string;
}

interface Props {
  message: IMessage;
  autoFocus?: boolean;
  onChange?: (message: IMessage) => void;
  onDelete?: () => void;
  maxHeight?: number;
  children?: React.ReactNode;
}

export default function Message({
  message,
  onChange,
  onDelete,
  autoFocus,
  maxHeight,
  children
}: Props) {
  const addText = useCallback(() => {
    const toAdd = { type: 'text' as const, text: '' };
    if (typeof message.content === 'string') {
      onChange?.({
        ...message,
        content: [
          {
            type: 'text',
            text: message.content as string
          },
          toAdd
        ]
      });
    } else {
      onChange?.({
        ...message,
        content: [...(message.content || []), toAdd]
      });
    }
  }, [message.content, onChange]);

  const addImage = useCallback(
    (url: string) => {
      const toAdd = { type: 'image_url' as const, image_url: { url } };
      if (typeof message.content === 'string') {
        onChange?.({
          ...message,
          content: [
            {
              type: 'text',
              text: message.content as string
            },
            toAdd
          ]
        });
      } else {
        onChange?.({
          ...message,
          content: [...(message.content || []), toAdd]
        });
      }
    },
    [message, onChange]
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <RoleSelect
            disabled={!onChange}
            value={message.role}
            onValueChange={(v) => {
              onChange?.({
                ...message,
                role: v
              });
            }}
          />
          {message.tool_call_id ? (
            <span className="italic font-normal text-muted-foreground">
              {message.tool_call_id}
            </span>
          ) : null}
        </div>

        {onChange ? (
          <TooltipProvider delayDuration={100}>
            <div className="flex -mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="text-muted-foreground"
                    onClick={addText}
                    variant="ghost"
                    size="icon"
                  >
                    <ListPlusIcon size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Text Block</p>
                </TooltipContent>
              </Tooltip>
              <ImageDialog onAddImage={addImage} />
              {onDelete ? (
                <Button
                  className="text-muted-foreground"
                  onClick={onDelete}
                  variant="ghost"
                  size="icon"
                >
                  <Trash2 size={14} />
                </Button>
              ) : null}
            </div>
          </TooltipProvider>
        ) : null}
      </div>
      <MessageContent
        autoFocus={autoFocus}
        maxHeight={maxHeight}
        content={message.content || ''}
        onChange={
          onChange ? (content) => onChange({ ...message, content }) : undefined
        }
      />
      {children}
    </div>
  );
}
