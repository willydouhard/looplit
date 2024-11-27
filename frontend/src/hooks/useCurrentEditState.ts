import { editStateState } from '@/state';
import FunctionViewContext from '@/views/function/context';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

export default function useCurrentEditState() {
  const { currentLineageId } = useContext(FunctionViewContext);
  const editState = useRecoilValue(editStateState);

  return editState[currentLineageId];
}
