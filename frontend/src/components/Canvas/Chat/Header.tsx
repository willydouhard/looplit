import { Loader } from '@/components/Loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { canvasState } from '@/state';
import { SquarePen } from 'lucide-react';
import { useRecoilValue } from 'recoil';

export default function CanvasChatHeader() {
  const canvas = useRecoilValue(canvasState);
  if (!canvas) return null;
  return (
    <div className="h-[60px] flex justify-between items-center px-6">
      <Button variant="ghost" size="icon" className="-ml-2">
        <SquarePen className="!size-5" />
      </Button>
      <div>
        {canvas.running ? (
          <Badge>
            <Loader className="text-primary-foreground w-4 mr-1.5" /> Running
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
