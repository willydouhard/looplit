import { useMonacoTheme } from './ThemeProvider';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  value: Record<string, unknown>;
  height?: string;
  fitContent?: boolean;
  className?: string;
  onChange?: (value: Record<string, unknown>) => void;
}

export const defaultOptions = {
  fontFamily: 'inter, monospace, sans-serif',
  fontSize: 14,
  lineHeight: 24,
  renderWhitespace: 'boundary' as const,
  unicodeHighlight: {
    ambiguousCharacters: false,
    invisibleCharacters: false
  },
  wordWrap: 'on' as const,
  minimap: { enabled: false },
  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  contextmenu: false,
  renderLineHighlight: 'none' as const,
  scrollBeyondLastLine: false,
  overviewRulerLanes: 0,
  lineNumbersMinChars: 0,
  glyphMargin: false,
  lineNumbers: 'off' as const,
  folding: true,
  scrollbar: {
    useShadows: false,
    alwaysConsumeMouseWheel: false
  }
};

export default function JsonEditor({
  value,
  className,
  height,
  fitContent,
  onChange
}: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const preventNextOnChange = useRef(false);
  const theme = useMonacoTheme();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (error) {
      const id = toast.error(error);
      return () => {
        toast.dismiss(id);
      };
    }
  }, [error]);

  function adjustEditorHeightToContent() {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const editorElement = editor.getDomNode(); // Get the editor DOM node
    if (!editorElement) {
      return;
    }

    // Use the scrollHeight to get the total content height including word-wrapped lines
    const contentHeight = editor.getContentHeight();

    const editorHeight = contentHeight + 6;

    const maxHeight = 500;

    editorElement.style.height = `${Math.min(maxHeight, editorHeight)}px`; // Adjust editor container height
    editor.layout(); // Update editor layout
  }

  const jsonString = JSON.stringify(value, undefined, 2);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const forceRender = editor.getValue() !== jsonString;
    if (forceRender) {
      const position = editor.getPosition();
      preventNextOnChange.current = true;
      editor.setValue(jsonString);
      if (position) editor.setPosition(position);
    }
  }, [jsonString]);

  return (
    <div className={className}>
      <Editor
        loading={null}
        width="100%"
        height={height}
        theme={theme}
        options={{
          ...defaultOptions,
          readOnly: !onChange
        }}
        defaultValue={jsonString}
        onChange={(value) => {
          if (preventNextOnChange.current) {
            preventNextOnChange.current = false;
            return;
          }
          try {
            setError(undefined);
            const jsonValue = JSON.parse(value || '');
            onChange?.(jsonValue);
          } catch (err) {
            setError(String(err));
          }
        }}
        language="json"
        onMount={(editor) => {
          editorRef.current = editor;

          if (!fitContent) return;

          editor.onDidContentSizeChange(() => {
            adjustEditorHeightToContent();
          });

          editor.layout();
          adjustEditorHeightToContent();
        }}
      />
    </div>
  );
}
