import FunctionView from '../function';
import FunctionViewContext, { IFunctionViewContext } from '../function/context';
import { functionsState, stateHistoryByLineageState } from '@/state';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

export default function RootFunctionView() {
  const { name: rootFunction } = useParams();
  const functions = useRecoilValue(functionsState);
  const setstateHistoryByLineage = useSetRecoilState(
    stateHistoryByLineageState
  );

  const [ctx, setCtx] = useState<IFunctionViewContext>({
    isRoot: true,
    id: 'root',
    name: rootFunction!,
    currentLineageId: 'root',
    currentStateIndex: 0
  });

  useEffect(() => {
    const rootState =
      functions && rootFunction ? [functions[rootFunction]] : [];
    setstateHistoryByLineage({ root: rootState });
    if (rootFunction) {
      document.title = rootFunction;
    }
    setCtx((prev) => ({
      ...prev,
      name: rootFunction!,
      currentLineageId: 'root',
      currentStateIndex: 0
    }));
  }, [rootFunction]);

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
  }, [rootFunction, setCtx]);

  if (!rootFunction) return null;

  return (
    <FunctionViewContext.Provider
      value={{
        ...ctx,
        ...setFns
      }}
    >
      <FunctionView />
    </FunctionViewContext.Provider>
  );
}
