import {
  type ILooplitState,
  forksByMessageIndexState,
  stateHistoryByLineageState
} from '../state';
import useInteraction from './useInteraction';
import FunctionViewContext from '@/views/function/context';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

export const useForkState = () => {
  const { callStatefulFunction } = useInteraction();
  const {
    id,
    name,
    currentLineageId,
    setCurrentLineageId,
    setCurrentStateIndex
  } = useContext(FunctionViewContext);

  return useRecoilCallback(
    ({ set }) =>
      async (state: ILooplitState, messageIndex: number) => {
        // Generate new lineage ID
        const newLineageId = uuidv4();

        // Create new state with parent reference
        const newState: ILooplitState = {
          ...state,
          id: newLineageId
        };

        // Update state history with new lineage
        set(stateHistoryByLineageState, (prevHistory) => ({
          ...prevHistory,
          [newLineageId]: [newState]
        }));

        // Update forks tracking
        set(forksByMessageIndexState, (prevForks) => {
          const updatedForks = { ...prevForks };

          if (!updatedForks[id]) {
            updatedForks[id] = [];
          }

          // Initialize fork array for specific message index if it doesn't exist
          if (!updatedForks[id][messageIndex]) {
            updatedForks[id][messageIndex] = [currentLineageId];
          }

          // Add new fork to the array
          updatedForks[id][messageIndex] = [
            ...updatedForks[id][messageIndex],
            newLineageId
          ];

          return updatedForks;
        });

        // Switch to new lineage
        setCurrentLineageId?.(() => newLineageId);
        setCurrentStateIndex?.(() => 0);

        callStatefulFunction({
          func_name: name,
          lineage_id: newLineageId,
          state: newState
        });

        return newLineageId;
      },
    [
      callStatefulFunction,
      name,
      currentLineageId,
      setCurrentLineageId,
      setCurrentStateIndex
    ]
  );
};
