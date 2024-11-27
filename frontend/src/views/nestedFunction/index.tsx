import FunctionView from '../function';
import FunctionViewContext, { IFunctionViewContext } from '../function/context';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { stateHistoryByLineageState } from '@/state';
import { useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';

interface Props {
  children: React.ReactNode;
  funcName: string;
  toolCallId: string;
  lineageId: string;
}

export default function NestedFunctionView({
  children,
  funcName,
  toolCallId,
  lineageId
}: Props) {
  const stateHistory = useRecoilValue(stateHistoryByLineageState);

  const [ctx, setCtx] = useState<IFunctionViewContext>({
    isRoot: false,
    id: toolCallId,
    name: funcName,
    currentLineageId: lineageId,
    currentStateIndex: stateHistory[lineageId]?.length || 0
  });

  const setFns: Pick<
    IFunctionViewContext,
    'setCurrentLineageId' | 'setCurrentStateIndex' | 'setName'
  > = useMemo(() => {
    return {
      setName: (fn: (_ctx: IFunctionViewContext) => string) => {
        setCtx((_ctx) => ({
          ..._ctx,
          name: fn(_ctx)
        }));
      },
      setCurrentLineageId: (fn: (_ctx: IFunctionViewContext) => string) => {
        setCtx((_ctx) => ({
          ..._ctx,
          currentLineageId: fn(_ctx)
        }));
      },
      setCurrentStateIndex: (fn: (_ctx: IFunctionViewContext) => number) => {
        setCtx((_ctx) => ({
          ..._ctx,
          currentStateIndex: fn(_ctx)
        }));
      }
    };
  }, [setCtx]);

  return (
    <FunctionViewContext.Provider
      value={{
        ...ctx,
        ...setFns
      }}
    >
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="!max-w-[90%] w-full p-0 [&>button]:hidden">
          <FunctionView />
        </SheetContent>
      </Sheet>
    </FunctionViewContext.Provider>
  );
}
