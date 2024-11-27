import FunctionViewContext from '../../context';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import useCurrentEditState from '@/hooks/useCurrentEditState';
import {
  forksByMessageIndexState,
  runningState,
  stateHistoryByLineageState,
  toolCallsToLineageIdsState
} from '@/state';
import { SaveIcon } from 'lucide-react';
import { useCallback, useContext, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

export default function SaveButton() {
  const { name } = useContext(FunctionViewContext);
  const running = useRecoilValue(runningState);
  const editMode = useCurrentEditState();
  const stateHistoryByLineage = useRecoilValue(stateHistoryByLineageState);
  const toolCallsToLineageIds = useRecoilValue(toolCallsToLineageIdsState);
  const forksByMessageIndex = useRecoilValue(forksByMessageIndexState);

  const disabled = running || !!editMode;

  const handleSave = useCallback(() => {
    const json = JSON.stringify(
      {
        stateHistoryByLineage,
        toolCallsToLineageIds,
        forksByMessageIndex
      },
      null,
      2
    ); // Convert state to JSON
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_state.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [name, stateHistoryByLineage, toolCallsToLineageIds, forksByMessageIndex]);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // Prevent the default save dialog in the browser
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave, disabled]); // Add stateHistory as a dependency if it changes frequently

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={disabled}
            onClick={handleSave}
            variant="ghost"
            size="icon"
          >
            <SaveIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Save the state history</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
