import { createYamlConflict } from './components/StateMergeEditor';
import {
  IError,
  IInterrupt,
  ILooplitState,
  canvasState,
  errorState,
  functionsState,
  interruptState,
  runningState,
  sessionState,
  stateHistoryByLineageState,
  toolCallsToLineageIdsState
} from './state';
import { useCallback, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import io from 'socket.io-client';
import { toast } from 'sonner';

export default function SocketConnection() {
  const setSession = useSetRecoilState(sessionState);
  const setError = useSetRecoilState(errorState);
  const setCanvas = useSetRecoilState(canvasState);
  const setFunctions = useSetRecoilState(functionsState);
  const setInterrupt = useSetRecoilState(interruptState);
  const setRunning = useSetRecoilState(runningState);
  const setStateHistoryByLineage = useSetRecoilState(
    stateHistoryByLineageState
  );
  const setToolCallsToLineageIds = useSetRecoilState(
    toolCallsToLineageIdsState
  );

  const connect = useCallback(() => {
    const devServer = 'http://127.0.0.1:8000';
    const { protocol, host } = window.location;
    const uri = `${protocol}//${host}`;

    const url = import.meta.env.DEV ? devServer : uri;

    const socket = io(url, {
      path: '/ws/socket.io',
      extraHeaders: {}
    });

    setSession((old) => {
      old?.socket?.removeAllListeners();
      old?.socket?.close();
      return {
        socket
      };
    });

    socket.on('connect', () => {
      socket.emit('connection_successful');
      setSession((s) => ({ ...s!, error: false }));
    });

    socket.on('connect_error', () => {
      setSession((s) => ({ ...s!, error: true }));
    });

    socket.on('stateful_funcs', (funcs: Record<string, ILooplitState>) => {
      setFunctions(funcs);
    });

    socket.on('start', () => {
      setRunning(true);
    });

    socket.on('end', () => {
      setRunning(false);
    });

    socket.on('error', (error: IError) => {
      setError(error);
    });

    socket.on('interrupt', ({ func_name }: IInterrupt, callback) => {
      setInterrupt({
        func_name,
        callback
      });
    });

    socket.on(
      'output_state',
      ({
        lineage_id,
        state
      }: {
        func_name: string;
        lineage_id: string;
        state: ILooplitState;
      }) => {
        setStateHistoryByLineage((prev) => {
          return {
            ...prev,
            [lineage_id]: prev[lineage_id]
              ? [...prev[lineage_id], state]
              : [state]
          };
        });
      }
    );

    socket.on('map_tc_to_lid', ({ tc, lid }: { tc: string; lid: string }) => {
      setToolCallsToLineageIds((prev) => ({
        ...prev,
        [tc]: lid
      }));
    });

    socket.on('code_change', (target: string) => {
      toast.info(`${target} updated!`);
    });

    socket.on('canvas_agent_start', () => {
      setCanvas((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          error: undefined,
          running: true
        };
      });
    });

    socket.on(
      'canvas_agent_end',
      ({
        error,
        response
      }: {
        error?: string;
        response?: { role: string; content: string };
      }) => {
        setCanvas((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            error,
            messages: response ? [...prev.messages, response] : prev.messages,
            running: false
          };
        });
      }
    );

    socket.on(
      'state_edit',
      ({ old_str, new_str }: { old_str: string; new_str: string }) => {
        setCanvas((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            aiState: createYamlConflict(prev.aiState, old_str, new_str)
          };
        });
      }
    );
  }, [setSession]);

  useEffect(() => {
    connect();
  }, [connect]);

  return null;
}
