import { createContext } from 'react';

export interface IFunctionViewContext {
  isRoot: boolean;
  id: string;
  name: string;
  currentLineageId: string;
  currentStateIndex: number;
  setName?: (fn: (_ctx: IFunctionViewContext) => string) => void;
  setCurrentLineageId?: (fn: (_ctx: IFunctionViewContext) => string) => void;
  setCurrentStateIndex?: (fn: (_ctx: IFunctionViewContext) => number) => void;
}

const FunctionViewContext = createContext<IFunctionViewContext>({} as any);

export default FunctionViewContext;
