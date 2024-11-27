import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import useCurrentEditState from '@/hooks/useCurrentEditState';
import useCurrentLineage from '@/hooks/useCurrentLineage';
import useCurrentState from '@/hooks/useCurrentState';
import { useForkState } from '@/hooks/useForkState';
import useSetEditState from '@/hooks/useSetEditState';
import { runningState } from '@/state';
import { cloneDeep } from 'lodash';
import { RefreshCw } from 'lucide-react';
import { useRecoilValue } from 'recoil';

interface Props {
  index: number;
}

export default function ForkButton({ index }: Props) {
  const forkState = useForkState();
  const isRunning = useRecoilValue(runningState);
  const setEditState = useSetEditState();
  const editState = useCurrentEditState();
  const currentLineage = useCurrentLineage();
  const currentState = useCurrentState();

  if (!currentLineage || !currentState) return null;

  const isAnyStateLastMessage = currentLineage.find(
    (s) => s.messages.length - 1 === index
  );
  const isForkable = isAnyStateLastMessage;
  const isUserOrTool = ['user', 'tool'].includes(
    currentState.messages[index].role
  );

  if (!isForkable || !isUserOrTool) return null;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={isRunning}
            onClick={() => {
              const state = cloneDeep(currentState);
              state.messages = state.messages.slice(0, index + 1);
              setEditState(undefined);
              forkState(state, index);
            }}
            className={editState ? 'text-green-500' : 'text-muted-foreground'}
            variant="ghost"
            size="icon"
          >
            <RefreshCw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Fork & Re-run</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
