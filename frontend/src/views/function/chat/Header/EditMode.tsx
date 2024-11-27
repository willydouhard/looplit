import FunctionViewContext from '../../context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import useCurrentEditState from '@/hooks/useCurrentEditState';
import useSetEditState from '@/hooks/useSetEditState';
import { stateHistoryByLineageState } from '@/state';
import { cloneDeep } from 'lodash';
import { Check, RotateCcw } from 'lucide-react';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';

export default function EditMode() {
  const { currentLineageId, setCurrentStateIndex } =
    useContext(FunctionViewContext);
  const setStateHistoryByLineage = useSetRecoilState(
    stateHistoryByLineageState
  );
  const editState = useCurrentEditState();
  const setEditState = useSetEditState();

  if (editState)
    return (
      <div className="flex items-center">
        <Badge>Edit Mode</Badge>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setEditState(undefined)}
                size="icon"
                variant="ghost"
              >
                <RotateCcw className="text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove changes</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  const state = cloneDeep(editState);
                  setEditState(undefined);
                  setStateHistoryByLineage((prev) => ({
                    ...prev,
                    [currentLineageId]: [...prev[currentLineageId], state]
                  }));
                  setCurrentStateIndex?.((prev) => prev.currentStateIndex + 1);
                }}
                size="icon"
                variant="ghost"
              >
                <Check className="text-green-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Apply changes & create new state</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );

  return null;
}
