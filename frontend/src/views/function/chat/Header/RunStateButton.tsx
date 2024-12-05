import { Loader } from '@/components/Loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { interruptState } from '@/state';
import { runningState } from '@/state';
import { PlayIcon } from 'lucide-react';
import { useRecoilState, useRecoilValue } from 'recoil';

export default function RunStateButton() {
  const running = useRecoilValue(runningState);

  const [interrupt, setInterrupt] = useRecoilState(interruptState);
  if (running) {
    return (
      <Badge>
        <Loader className="text-primary-foreground w-3 mr-1.5" /> Running
      </Badge>
    );
  } else if (interrupt) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            interrupt.callback();
            setInterrupt(undefined);
          }}
        >
          <PlayIcon className="text-green-500" />
        </Button>
        <Badge>Paused</Badge>
      </div>
    );
  } else {
    return null;
  }
}
