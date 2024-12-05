import { useMonacoTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import Editor from '@monaco-editor/react';
import { load as yamlParse, dump as yamlStringify } from 'js-yaml';
import { type editor } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  value: Record<string, unknown>;
  height?: string;
  fitContent?: boolean;
  className?: string;
  onChange?: (value: Record<string, unknown>) => void;
}

// This is a hack to make all strings multi-line strings.
function convertToMultiline(obj: any): any {
  if (typeof obj === 'string' && !obj.includes('\n')) {
    return `${obj}\n`;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertToMultiline);
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertToMultiline(v)])
    );
  }
  return obj;
}

function cleanupMultiline(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/\n$/, '');
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanupMultiline);
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, cleanupMultiline(v)])
    );
  }
  return obj;
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

export default function YamlEditor({
  value,
  className,
  height,
  fitContent,
  onChange
}: Props) {
  const preventNextOnChange = useRef(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
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
    if (!editor) return;

    const editorElement = editor.getDomNode();
    if (!editorElement) return;

    const contentHeight = editor.getContentHeight();
    const editorHeight = contentHeight + 6;
    const maxHeight = 500;

    editorElement.style.height = `${Math.min(maxHeight, editorHeight)}px`;
    editor.layout();
  }

  // Convert JSON to YAML string for initial display with proper multiline handling
  const yamlString = yamlStringify(convertToMultiline(value), {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    flowLevel: -1,
    skipInvalid: true,
    noCompatMode: true,
    styles: {
      '!!str': 'literal' // Use literal style (|) for multiline strings
    }
  });

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const forceRender = editor.getValue() !== yamlString;
    if (forceRender) {
      const position = editor.getPosition();
      preventNextOnChange.current = true;
      editor.setValue(yamlString);
      if (position) editor.setPosition(position);
    }
  }, [yamlString]);

  return (
    <div className={cn(className, 'relative')}>
      <Editor
        loading={null}
        width="100%"
        height={height}
        theme={theme}
        options={{
          ...defaultOptions,
          readOnly: !onChange
        }}
        defaultValue={yamlString}
        onChange={(value) => {
          if (preventNextOnChange.current) {
            preventNextOnChange.current = false;
            return;
          }
          if (!value) return;

          try {
            setError(undefined);
            // Parse YAML with more lenient options
            const jsonValue = yamlParse(value, {}) as Record<string, unknown>;
            const cleanedValue = cleanupMultiline(jsonValue);

            onChange?.(cleanedValue);
          } catch (err) {
            setError(String(err));
          }
        }}
        language="yaml"
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
