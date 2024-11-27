import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  editStateState,
  errorState,
  forksByMessageIndexState,
  interruptState,
  runningState,
  stateHistoryByLineageState,
  toolCallsToLineageIdsState
} from '@/state';
import { UploadIcon } from 'lucide-react';
import { ChangeEvent, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { toast } from 'sonner';

export default function UploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler to trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const running = useRecoilValue(runningState);
  const setStateHistoryByLineage = useSetRecoilState(
    stateHistoryByLineageState
  );
  const setToolCallsToLineageIds = useSetRecoilState(
    toolCallsToLineageIdsState
  );
  const setForksByMessageIndex = useSetRecoilState(forksByMessageIndexState);
  const setInterrupt = useSetRecoilState(interruptState);
  const setEditState = useSetRecoilState(editStateState);
  const setError = useSetRecoilState(errorState);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const parsedData = JSON.parse(result);
            setStateHistoryByLineage(parsedData.stateHistoryByLineage);
            setToolCallsToLineageIds(parsedData.toolCallsToLineageIds);
            setForksByMessageIndex(parsedData.forksByMessageIndex);

            setInterrupt(undefined);
            setError(undefined);
            setEditState({});
          }
        } catch (err) {
          toast.error('Invalid JSON file: ' + String(err));
        }
      };
      reader.readAsText(file);
    } else {
      toast.error('Please upload a valid JSON file');
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleButtonClick}
            disabled={running}
            variant="ghost"
            size="icon"
          >
            <UploadIcon />
            <input
              ref={fileInputRef}
              className="hidden"
              disabled={running}
              type="file"
              accept=".json"
              onChange={handleFileChange}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Upload a saved state history</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
