import CanvasFloatingInput from '@/components/Canvas/CanvasFloatingInput';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import useCurrentEditState from '@/hooks/useCurrentEditState';
import useCurrentState from '@/hooks/useCurrentState';
import { runningState } from '@/state';
import { SparklesIcon } from 'lucide-react';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

interface Props {
  index: number;
}

export default function AskAIButton({ index }: Props) {
  const isRunning = useRecoilValue(runningState);
  const editState = useCurrentEditState();
  const currentState = useCurrentState();
  const [open, setOpen] = useState(false);

  if (!currentState) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                disabled={isRunning || !!editState}
                className="text-muted-foreground"
                variant="ghost"
                size="icon"
              >
                <SparklesIcon />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ask AI</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent
        align="start"
        className="p-0 shadow-none border-none bg-transparent"
      >
        <CanvasFloatingInput
          setOpen={setOpen}
          selectedText={JSON.stringify(
            currentState.messages[index],
            undefined,
            2
          )}
        />
      </PopoverContent>
    </Popover>
  );
}
