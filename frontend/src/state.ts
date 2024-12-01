import type { IMessage } from './components/Message';
import { atom } from 'recoil';
import { Socket } from 'socket.io-client';

export interface ISession {
  socket: Socket;
  error?: boolean;
}

export const sessionState = atom<ISession | undefined>({
  key: 'Session',
  dangerouslyAllowMutability: true,
  default: undefined
});

export interface ILooplitState {
  id: string;

  messages: IMessage[];
  tools: Record<string, any>[];
}

export const stateHistoryByLineageState = atom<Record<string, ILooplitState[]>>(
  {
    key: 'stateHistoryByLineage',
    default: {}
  }
);

export const toolCallsToLineageIdsState = atom<Record<string, string>>({
  key: 'toolCallsToLineageIds',
  default: {}
});

export const editStateState = atom<Record<string, ILooplitState>>({
  key: 'editState',
  default: {}
});

export const forksByMessageIndexState = atom<Record<string, string[][]>>({
  key: 'forksByMessageIndex',
  default: {}
});

export const functionsState = atom<Record<string, ILooplitState> | undefined>({
  key: 'Functions',
  default: undefined
});

export interface IInterrupt {
  callback: () => void;
  func_name: string;
}

export const interruptState = atom<IInterrupt | undefined>({
  key: 'Interrupt',
  default: undefined
});

export const runningState = atom<boolean>({
  key: 'Running',
  default: false
});

export interface IError {
  lineage_id: string;
  error: string;
}

export const errorState = atom<IError | undefined>({
  key: 'Error',
  default: undefined
});
