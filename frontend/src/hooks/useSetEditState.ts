import { ILooplitState, editStateState } from '@/state';
import FunctionViewContext from '@/views/function/context';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';

export default function useSetEditState() {
  const { currentLineageId } = useContext(FunctionViewContext);
  const setEditState = useSetRecoilState(editStateState);

  return (state?: ILooplitState) => {
    return setEditState((prev) => {
      const next = { ...prev };
      if (state) {
        next[currentLineageId] = state;
      } else {
        delete next[currentLineageId];
      }
      return next;
    });
  };
}
