import FunctionViewContext from '../../context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { functionsState, runningState } from '@/state';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export default function FunctionSelect() {
  const navigate = useNavigate();
  const { name, isRoot } = useContext(FunctionViewContext);

  const running = useRecoilValue(runningState);

  const functions = useRecoilValue(functionsState);
  const [goToFunc, setGoToFunc] = useState<string>();

  return (
    <>
      <AlertDialog
        open={!!goToFunc}
        onOpenChange={() => setGoToFunc(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Do you want to work on{' '}
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                {goToFunc}
              </code>
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The current state will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                navigate(`/fn/${goToFunc}`);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Select
        disabled={running || !isRoot}
        onValueChange={setGoToFunc}
        value={name}
      >
        <SelectTrigger className="gap-1 w-fit shadow-none border-none">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(functions || {}).map((fn) => (
            <SelectItem key={fn} value={fn}>
              {fn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
