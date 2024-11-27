import FunctionViewContext from '../../context';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import useCurrentEditState from '@/hooks/useCurrentEditState';
import useCurrentLineage from '@/hooks/useCurrentLineage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useContext, useEffect } from 'react';

export default function LineageNav() {
  const editState = useCurrentEditState();

  const currentLineage = useCurrentLineage();
  const { currentStateIndex, setCurrentStateIndex } =
    useContext(FunctionViewContext);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (editState) return;
      if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
        if (event.shiftKey) {
          // Redo (Cmd+Shift+Z or Ctrl+Shift+Z)
          if (currentStateIndex < currentLineage.length - 1) {
            setCurrentStateIndex?.((prev) => prev.currentStateIndex + 1);
          }
        } else {
          // Undo (Cmd+Z or Ctrl+Z)
          if (currentStateIndex > 0) {
            setCurrentStateIndex?.((prev) => prev.currentStateIndex - 1);
          }
        }
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStateIndex, editState, currentLineage, setCurrentStateIndex]);

  if (!currentLineage) return null;

  return (
    <div className="flex items-center text-muted-foreground">
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                setCurrentStateIndex?.((prev) => prev.currentStateIndex - 1);
              }}
              variant="ghost"
              size="icon"
              disabled={currentStateIndex === 0 || !!editState}
            >
              <ChevronLeft />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go to previous state</p>
          </TooltipContent>
        </Tooltip>

        <span className="text-sm font-mono">
          {currentStateIndex + 1}/{currentLineage.length}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                setCurrentStateIndex?.((prev) => prev.currentStateIndex + 1);
              }}
              variant="ghost"
              size="icon"
              disabled={
                currentStateIndex === currentLineage.length - 1 || !!editState
              }
            >
              <ChevronRight />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go to next state</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
