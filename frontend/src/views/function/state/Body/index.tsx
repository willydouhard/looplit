import JsonEditor from '@/components/JsonEditor';
import useCurrentState from '@/hooks/useCurrentState';
import useSetEditState from '@/hooks/useSetEditState';
import { omit } from 'lodash';

export default function StateBody() {
  const currentState = useCurrentState();
  const setEditState = useSetEditState();

  return (
    <JsonEditor
      onChange={(v) => setEditState(v as any)}
      height="100%"
      className="h-full pt-2 px-1"
      value={omit(currentState, 'id')}
    />
  );
}
