import FunctionViewContext from '../../context';
import { Button } from '@/components/ui/button';
import useCurrentEditState from '@/hooks/useCurrentEditState';
import { forksByMessageIndexState, stateHistoryByLineageState } from '@/state';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

interface Props {
  index: number;
}

export default function ForkNav({ index }: Props) {
  const editState = useCurrentEditState();

  const { id, currentLineageId, setCurrentLineageId, setCurrentStateIndex } =
    useContext(FunctionViewContext);
  const stateHistoryByLineage = useRecoilValue(stateHistoryByLineageState);
  const forksByMessage = useRecoilValue(forksByMessageIndexState);
  const forks = forksByMessage[id]?.[index];

  if (!forks?.length) return null;

  const currentForkIndex = forks.findIndex((f) => f === currentLineageId);

  if (currentForkIndex === undefined) return null;

  return (
    <div className="flex items-center text-muted-foreground">
      <Button
        onClick={() => {
          const goToLineageId = forks[currentForkIndex - 1];
          setCurrentLineageId?.(() => goToLineageId);
          setCurrentStateIndex?.(
            () => stateHistoryByLineage[goToLineageId].length - 1
          );
        }}
        variant="ghost"
        size="icon"
        disabled={currentForkIndex === 0 || !!editState}
      >
        <ChevronLeft />
      </Button>
      <span className="text-sm font-mono">
        {currentForkIndex + 1}/{forks.length}
      </span>
      <Button
        onClick={() => {
          const goToLineageId = forks[currentForkIndex + 1];
          setCurrentLineageId?.(() => goToLineageId);
          setCurrentStateIndex?.(
            () => stateHistoryByLineage[goToLineageId].length - 1
          );
        }}
        variant="ghost"
        size="icon"
        disabled={currentForkIndex === forks.length - 1 || !!editState}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
