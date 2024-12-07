import { Button } from '../ui/button';
import { ILooplitState, canvasState, editStateState } from '@/state';
import { load as yamlParse } from 'js-yaml';
import { ArrowRight, Check, X } from 'lucide-react';
import { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { toast } from 'sonner';

export default function CanvasHeader() {
  const [canvas, setCanvas] = useRecoilState(canvasState);
  const setEditState = useSetRecoilState(editStateState);

  const onContinue = useCallback(() => {
    if (!canvas) return;
    try {
      const state = yamlParse(canvas.aiState, {}) as ILooplitState;
      setEditState((prev) => {
        const next = { ...prev };
        const prevState = next[canvas.lineageId] || {};
        next[canvas.lineageId] = { ...prevState, ...state };
        return next;
      });
      setCanvas(undefined);
      toast.info('Modifications applied to edit mode.');
    } catch (err) {
      toast.error('Failed to parse canvas state: ' + String(err));
    }
  }, [canvas, setEditState]);

  if (!canvas) return null;

  return (
    <div className="flex h-[60px] items-center justify-between">
      <div className="text-xl font-medium flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2.5"
          disabled={canvas.running}
          onClick={() => setCanvas(undefined)}
        >
          <X className="!size-6" />
        </Button>
        State Canvas
      </div>
      <div className="flex items-center gap-4">
        {canvas.rejectAll && canvas.acceptAll ? (
          <>
            <Button
              onClick={canvas.rejectAll}
              disabled={canvas.running}
              variant="destructive"
            >
              <X /> Reject All
            </Button>
            <Button onClick={canvas.acceptAll} disabled={canvas.running}>
              <Check /> Accept All
            </Button>
          </>
        ) : (
          <Button disabled={canvas.running} onClick={onContinue}>
            Continue <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
