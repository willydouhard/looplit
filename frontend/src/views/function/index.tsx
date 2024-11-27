import ChatView from './chat';
import FunctionViewContext from './context';
import StateView from './state';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';
import useCurrentLineage from '@/hooks/useCurrentLineage';
import { useContext, useEffect } from 'react';

export default function FunctionView() {
  const { setCurrentStateIndex } = useContext(FunctionViewContext);
  const currentLineage = useCurrentLineage();

  useEffect(() => {
    if (!currentLineage) return;
    setCurrentStateIndex?.(() => currentLineage.length - 1);
  }, [currentLineage, setCurrentStateIndex]);

  return (
    <div className="h-screen w-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={70}>
          <ChatView />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={30}>
          <StateView />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
