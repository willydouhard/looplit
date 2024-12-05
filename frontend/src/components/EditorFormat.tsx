import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import useCurrentEditState from '@/hooks/useCurrentEditState';
import { editorFormatState } from '@/state';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

const STORAGE_KEY = 'editor-format-preference';

export function useEditorFormat() {
  const [format, setFormat] = useRecoilState(editorFormatState);

  // Sync to localStorage whenever format changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, format);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [format]);

  return [format, setFormat] as const;
}

export function EditorFormatSelect() {
  const [format, setFormat] = useEditorFormat();
  const editMode = useCurrentEditState();

  return (
    <Select
      disabled={!!editMode}
      value={format}
      onValueChange={setFormat as any}
    >
      <SelectTrigger className="w-fit gap-1.5 h-7 px-2 border-none">
        <SelectValue placeholder="Select format">{format}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="json">JSON</SelectItem>
        <SelectItem value="yaml">YAML</SelectItem>
      </SelectContent>
    </Select>
  );
}
