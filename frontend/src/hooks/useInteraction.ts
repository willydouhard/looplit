import { ILooplitState, errorState, sessionState } from '@/state';
import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

export interface ICallStatefulFunctionPayload {
  func_name: string;
  lineage_id: string;
  state: ILooplitState;
}

export interface ICallCanvasAgentPayload {
  chat_id: string;
  context: string;
  message: string;
  state: string;
}

export default function useInteraction() {
  const session = useRecoilValue(sessionState);
  const setError = useSetRecoilState(errorState);

  const setInterrupt = useCallback(
    (interrupt: boolean) => {
      session?.socket.emit('set_interrupt', interrupt);
    },
    [session?.socket]
  );

  const callStatefulFunction = useCallback(
    (payload: ICallStatefulFunctionPayload) => {
      setError(undefined);
      session?.socket.emit('call_stateful_func', payload);
    },
    [session?.socket, setError]
  );

  const callCanvasAgent = useCallback(
    (payload: ICallCanvasAgentPayload) => {
      session?.socket.emit('call_canvas_agent', payload);
    },
    [session?.socket]
  );

  return {
    setInterrupt,
    callStatefulFunction,
    callCanvasAgent
  };
}
