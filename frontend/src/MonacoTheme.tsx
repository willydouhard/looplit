import { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

const colors = {
  gray: {
    '50': '#f9fafb',
    '100': '#f3f4f6',
    '200': '#e5e7eb',
    '300': '#d1d5db',
    '400': '#9ca3af',
    '500': '#6b7280',
    '600': '#4b5563',
    '700': '#374151',
    '800': '#1f2937',
    '900': '#111827',
    '950': '#030712'
  },
  green: {
    '50': '#f0fdf4',
    '100': '#dcfce7',
    '200': '#bbf7d0',
    '300': '#86efac',
    '400': '#4ade80',
    '500': '#22c55e',
    '600': '#16a34a',
    '700': '#15803d',
    '800': '#166534',
    '900': '#14532d',
    '950': '#052e16'
  },
  red: {
    '50': '#fef2f2',
    '100': '#fee2e2',
    '200': '#fecaca',
    '300': '#fca5a5',
    '400': '#f87171',
    '500': '#ef4444',
    '600': '#dc2626',
    '700': '#b91c1c',
    '800': '#991b1b',
    '900': '#7f1d1d',
    '950': '#450a0a'
  }
};

export default function MonacoTheme() {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;

    const white = '#ffffff';
    const black = '#000000';

    // full rule list: https://github.com/Microsoft/vscode/blob/913e891c34f8b4fe2c0767ec9f8bfd3b9dbe30d9/src/vs/editor/standalone/common/themes.ts#L13
    monaco.editor.defineTheme('looplit-light', {
      base: 'vs',
      inherit: true,
      rules: [
        {
          token: '',
          foreground: black,
          background: white
        },
        {
          token: 'string.value.json',
          foreground: colors.gray[900]
        },
        { token: 'string.yaml', foreground: colors.gray[900] },
        { token: 'number', foreground: colors.gray[800] }
      ],
      colors: {
        'editor.foreground': black,
        // This is matching the light theme card color
        'editor.background': '#F5F5F5',
        'editorCursor.foreground': black,
        'editor.lineHighlightBackground': colors.gray[100],
        'editorLineNumber.foreground': colors.gray[400],
        'editorLineNumber.activeForeground': black,
        'editor.selectionBackground': colors.gray[300],
        'editor.inactiveSelectionBackground': colors.gray[200],
        'editorIndentGuide.background': colors.gray[200],
        'editorWhitespace.foreground': colors.gray[300],
        'diffEditor.insertedTextBackground': colors.green[300],
        'diffEditor.removedTextBackground': colors.red[300],
        'diffEditor.insertedLineBackground': colors.green[100],
        'diffEditor.removedLineBackground': colors.red[100]
      }
    });

    monaco.editor.defineTheme('looplit-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        {
          token: '',
          foreground: white,
          background: colors.gray[900]
        },
        { token: 'string.json', foreground: colors.gray[200] },
        {
          token: 'string.value.json',
          foreground: colors.gray[200]
        },
        { token: 'string.yaml', foreground: colors.gray[200] },
        { token: 'number', foreground: colors.gray[300] }
      ],
      colors: {
        'editor.foreground': white,
        // This is matching the dark theme card color
        'editor.background': '#0A0A0A',
        'editorCursor.foreground': white,
        'editor.lineHighlightBackground': colors.gray[800],
        'editorLineNumber.foreground': colors.gray[400],
        'editorLineNumber.activeForeground': white,
        'editor.selectionBackground': colors.gray[700],
        'editor.inactiveSelectionBackground': colors.gray[600],
        'editorIndentGuide.background': colors.gray[700],
        'editorWhitespace.foreground': colors.gray[600],
        'diffEditor.insertedTextBackground': colors.green[700],
        'diffEditor.removedTextBackground': colors.red[700],
        'diffEditor.insertedLineBackground': colors.green[900],
        'diffEditor.removedLineBackground': colors.red[900]
      }
    });
  }, [monaco]);

  return null;
}
