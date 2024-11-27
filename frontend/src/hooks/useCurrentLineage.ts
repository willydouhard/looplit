import { stateHistoryByLineageState } from '@/state';
import FunctionViewContext from '@/views/function/context';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

export default function useCurrentLineage() {
  const { currentLineageId } = useContext(FunctionViewContext);
  const stateHistoryByLineage = useRecoilValue(stateHistoryByLineageState);
  return stateHistoryByLineage[currentLineageId];
}
