import { useEditorFormat } from '@/components/EditorFormat';
import JsonEditor from '@/components/JsonEditor';
import YamlEditor from '@/components/YamlEditor';
import useCurrentState from '@/hooks/useCurrentState';
import useSetEditState from '@/hooks/useSetEditState';
import { omit } from 'lodash';

export default function StateBody() {
  const currentState = useCurrentState();
  const setEditState = useSetEditState();
  const [format] = useEditorFormat();

  if (format === 'json') {
    return (
      <JsonEditor
        onChange={(v) =>
          setEditState({ ...(v as any), messages: currentState.messages })
        }
        height="100%"
        className="h-full pt-2 px-1"
        value={omit(currentState, 'id', 'messages')}
      />
    );
  } else {
    return (
      <YamlEditor
        onChange={(v) =>
          setEditState({ ...(v as any), messages: currentState.messages })
        }
        height="100%"
        className="h-full pt-2 px-1"
        value={omit(currentState, 'id', 'messages')}
      />
    );
  }
}
