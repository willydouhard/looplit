import useCurrentEditState from './useCurrentEditState';
import useCurrentLineage from './useCurrentLineage';
import FunctionViewContext from '@/views/function/context';
import { useContext } from 'react';

export default function useCurrentState() {
  const editState = useCurrentEditState();
  const { currentStateIndex } = useContext(FunctionViewContext);
  const currentLineage = useCurrentLineage();

  if (editState) return editState;
  return currentLineage?.[currentStateIndex];
}
