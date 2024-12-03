import { parseConflicts } from '../StateMergeEditor';
import { Button } from '../ui/button';
import { canvasState } from '@/state';
import { ArrowRight, Check, X } from 'lucide-react';
import { useRecoilState } from 'recoil';

export default function CanvasHeader() {
  const [canvas, setCanvas] = useRecoilState(canvasState);

  if (!canvas) return null;

  const hasConflict = !!parseConflicts(canvas.aiState).length;

  return (
    <div className="flex h-[60px] items-center justify-between">
      <div className="text-xl font-medium flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2.5"
          onClick={() => setCanvas(undefined)}
        >
          <X className="!size-6" />
        </Button>
        State Canvas
      </div>
      <div className="flex items-center gap-4">
        {hasConflict ? (
          <>
            <Button variant="destructive">
              <X /> Reject All
            </Button>
            <Button>
              <Check /> Accept All
            </Button>
          </>
        ) : (
          <Button onClick={() => setCanvas(undefined)}>
            Continue <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
