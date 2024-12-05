import FunctionViewContext from '../../context';
import EditMode from './EditMode';
import FunctionSelect from './FunctionSelect';
import InterruptSwitch from './InterruptSwitch';
import RunStateButton from './RunStateButton';
import { Logo } from '@/components/Logo';
import { SheetClose } from '@/components/ui/sheet';
import { ArrowRight, SlashIcon } from 'lucide-react';
import { useContext } from 'react';
import { NavLink } from 'react-router-dom';

export default function ChatHeader() {
  const { isRoot } = useContext(FunctionViewContext);
  return (
    <div className="border-b h-14 p-4 flex items-center justify-between">
      <div className="flex items-center gap-1">
        {isRoot ? (
          <>
            <NavLink to="/">
              <Logo className="w-6" />
            </NavLink>
            <SlashIcon className="text-muted-foreground/30 h-4 -rotate-6" />
          </>
        ) : (
          <SheetClose>
            <ArrowRight className="w-4" />
          </SheetClose>
        )}

        <FunctionSelect />
        <RunStateButton />
      </div>
      <div className="items-center flex">
        <EditMode />
        <InterruptSwitch />
      </div>
    </div>
  );
}
