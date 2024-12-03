import { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

export default function MonacoTheme() {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;

    const white = '#ffffff';
    const black = '#000000';

    monaco.editor.defineTheme('looplit-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.foreground': black,
        // This is matching the light theme bg color
        'editor.background': '#F5F5F5',
        'editorCursor.foreground': black
      }
    });

    monaco.editor.defineTheme('looplit-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.foreground': white,
        // This is matching the dark theme bg color
        'editor.background': '#0A0A0A',
        'editorCursor.foreground': white
      }
    });
  }, [monaco]);

  return null;
}
