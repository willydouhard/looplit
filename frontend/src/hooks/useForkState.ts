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
        const newLineageId = uuidv4();

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
          // Create a deep copy of the previous forks
          const updatedForks = { ...prevForks };

          // Initialize the function ID array if it doesn't exist
          if (!updatedForks[id]) {
            updatedForks[id] = [];
          }

          // Create a new array for the message index if it doesn't exist
          // or create a copy of the existing array
          const messageIndexForks = updatedForks[id][messageIndex]
            ? [...updatedForks[id][messageIndex]]
            : [currentLineageId];

          // Create a new array with all indices up to messageIndex
          const newMessageIndexArray = [
            ...updatedForks[id].slice(0, messageIndex)
          ];

          // Add the updated forks array at messageIndex
          newMessageIndexArray[messageIndex] = [
            ...messageIndexForks,
            newLineageId
          ];

          // Update the function ID array with the new message index array
          updatedForks[id] = newMessageIndexArray;

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
