import FunctionViewContext from '../../context';
import LineageNav from './LineageNav';
import SaveButton from './SaveButton';
import UploadButton from './UploadButton';
import { Button } from '@/components/ui/button';
import { SparklesIcon } from 'lucide-react';
import { useContext } from 'react';

export default function StateHeader() {
  const { isRoot } = useContext(FunctionViewContext);
  return (
    <div className="border-b h-14 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-sm font-medium leading-none">State History</span>
        <LineageNav />
        <Button variant="ghost" size="icon" disabled>
          <SparklesIcon />
        </Button>
      </div>
      {isRoot ? (
        <div className="items-center flex gap-1">
          <SaveButton />
          <UploadButton />
        </div>
      ) : null}
    </div>
  );
}
