import { useMonacoTheme } from './ThemeProvider';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useRef, useState } from 'react';

interface Props {
  value: Record<string, unknown>;
  height?: string;
  fitContent?: boolean;
  className?: string;
  onChange?: (value: Record<string, unknown>) => void;
}

const defaultOptions = {
  fontFamily: 'monospace, sans-serif',
  fontSize: 14,
  unicodeHighlight: {
    ambiguousCharacters: false,
    invisibleCharacters: false
  },
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
  folding: false,
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
  const theme = useMonacoTheme();
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [_, setError] = useState<string>();

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
        value={JSON.stringify(value, undefined, 2)}
        onChange={(value) => {
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
