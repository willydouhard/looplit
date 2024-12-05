import { useMonacoTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import { canvasState } from '@/state';
import Editor from '@monaco-editor/react';
import { Position, Range, editor } from 'monaco-editor';
import { useEffect, useMemo, useRef } from 'react';
import { useSetRecoilState } from 'recoil';

const ABOVE = editor.ContentWidgetPositionPreference.ABOVE;

export const START = '<<<<<<<';
export const MIDDLE = '=======';
export const END = '>>>>>>>';

interface Props {
  value: string;
  readOnly?: boolean;
}

export function createYamlConflict(
  yaml: string,
  oldStr: string,
  newStr: string
) {
  const startIndex = yaml.indexOf(oldStr);
  if (startIndex === -1) return yaml;

  // Find start of the line containing oldStr
  let lineStart = startIndex;
  while (lineStart > 0 && yaml[lineStart - 1] !== '\n') {
    lineStart--;
  }

  const endIndex = startIndex + oldStr.length;
  const before = yaml.substring(0, lineStart);
  const after = yaml.substring(endIndex);
  const indentation = yaml.substring(lineStart, startIndex);

  const conflict = `${before}<<<<<<< Current
${indentation}${oldStr}
=======
${indentation}${newStr}
>>>>>>> AI suggestion${after}`;
  return conflict;
}

// Add blank lines before conflicts
const addBlankLines = (text: string) => {
  const lines = text.split('\n');
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    // If this line starts a conflict and it's not the first line
    // and the previous line isn't already blank
    if (lines[i].startsWith(START) && i > 0 && lines[i - 1].trim() !== '') {
      newLines.push(''); // Add blank line
    }
    newLines.push(lines[i]);
  }

  return newLines.join('\n');
};

interface IConflict {
  marker: 'start' | 'middle';
  current: string[];
  incoming: string[];
  startLine: number;
  headerLine: number;
  separatorLine: number;
  footerLine: number;
  endLine: number;
  hasBlankLineBefore: boolean;
}

export const parseConflicts = (text: string): IConflict[] => {
  const lines = text.split('\n');
  const conflicts: IConflict[] = [];
  let currentConflict: IConflict | null = null;

  lines.forEach((line, index) => {
    if (line.startsWith(START)) {
      // @ts-expect-error partial
      currentConflict = {
        marker: 'start',
        current: [],
        incoming: [],
        startLine: index,
        headerLine: index,
        hasBlankLineBefore: index > 0 && lines[index - 1].trim() === ''
      };
    } else if (line.startsWith(MIDDLE) && currentConflict) {
      currentConflict.marker = 'middle';
      currentConflict.separatorLine = index;
    } else if (line.startsWith(END) && currentConflict) {
      currentConflict.footerLine = index;
      currentConflict.endLine = index;
      conflicts.push({ ...currentConflict });
      currentConflict = null;
    } else if (currentConflict) {
      if (currentConflict.marker === 'start') {
        currentConflict.current.push(line);
      } else if (currentConflict.marker === 'middle') {
        currentConflict.incoming.push(line);
      }
    }
  });

  return conflicts;
};

const StateMergeEditor = ({ value, readOnly }: Props) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<editor.IModelDeltaDecoration[]>(null);
  const widgetsRef = useRef<editor.IContentWidget[]>([]);
  const setCanvas = useSetRecoilState(canvasState);
  const theme = useMonacoTheme();

  const headerBg = theme === 'looplit-dark' ? 'bg-sky-800' : 'bg-sky-200';
  const currentBg = theme === 'looplit-dark' ? 'bg-sky-950' : 'bg-sky-300';
  const incomingBg = theme === 'looplit-dark' ? 'bg-teal-950' : 'bg-teal-300';
  const footerBg = theme === 'looplit-dark' ? 'bg-teal-800' : 'bg-teal-200';
  const buttonHover = 'hover:text-blue-400';

  const conflictedText = useMemo(() => addBlankLines(value), [value]);

  const clearAllWidgets = (editor: editor.IStandaloneCodeEditor) => {
    // Remove all existing content widgets
    if (widgetsRef.current.length > 0) {
      widgetsRef.current.forEach((widget) => {
        editor.removeContentWidget(widget);
      });
      widgetsRef.current = [];
    }
  };

  const addConflictDecorations = (
    editor: editor.IStandaloneCodeEditor,
    conflicts: IConflict[]
  ) => {
    // Clear existing decorations and widgets
    if (decorationsRef.current) {
      // @ts-expect-error monaco
      decorationsRef.current.clear();
    }
    clearAllWidgets(editor);

    const decorations: editor.IModelDeltaDecoration[] = [];

    conflicts.forEach((conflict, idx) => {
      decorations.push({
        range: new Range(
          conflict.headerLine + 1,
          1,
          conflict.headerLine + 1,
          1
        ),
        options: {
          isWholeLine: true,
          className: `conflict-header ${headerBg}`,
          linesDecorationsClassName: 'conflict-header-margin'
        }
      });

      decorations.push({
        range: new Range(conflict.headerLine + 2, 1, conflict.separatorLine, 1),
        options: {
          isWholeLine: true,
          className: `current-change ${currentBg}`,
          linesDecorationsClassName: 'current-change-margin'
        }
      });

      decorations.push({
        range: new Range(conflict.separatorLine + 2, 1, conflict.footerLine, 1),
        options: {
          isWholeLine: true,
          className: `incoming-change ${incomingBg}`,
          linesDecorationsClassName: 'incoming-change-margin'
        }
      });

      decorations.push({
        range: new Range(
          conflict.footerLine + 1,
          1,
          conflict.footerLine + 1,
          1
        ),
        options: {
          isWholeLine: true,
          className: `conflict-footer ${footerBg}`,
          linesDecorationsClassName: 'conflict-footer-margin'
        }
      });

      // Add action buttons with proper cleanup
      const widgetId = `conflict-actions-${idx}`;
      const actionsContainer = document.createElement('div');
      actionsContainer.className =
        'conflict-actions absolute left-0 z-10 !flex gap-4 text-muted-foreground h-5 w-fit';

      const acceptCurrentBtn = document.createElement('div');
      acceptCurrentBtn.className = `action-button h-5 accept-current text-sm cursor-pointer whitespace-nowrap ${buttonHover}`;
      acceptCurrentBtn.textContent = 'Accept Current';
      acceptCurrentBtn.onclick = () => handleAcceptCurrent(conflict, editor);

      const acceptIncomingBtn = document.createElement('div');
      acceptIncomingBtn.className = `action-button h-5 accept-incoming text-sm cursor-pointer whitespace-nowrap ${buttonHover}`;
      acceptIncomingBtn.textContent = 'Accept AI';
      acceptIncomingBtn.onclick = () => handleAcceptIncoming(conflict, editor);

      actionsContainer.appendChild(acceptCurrentBtn);
      actionsContainer.appendChild(acceptIncomingBtn);

      const contentWidget = {
        domNode: actionsContainer,
        getId: () => widgetId,
        getDomNode: () => actionsContainer,
        getPosition: () => ({
          position: {
            lineNumber: conflict.headerLine + 1,
            column: 1
          },
          preference: [ABOVE]
        })
      };

      widgetsRef.current.push(contentWidget);
      editor.addContentWidget(contentWidget);
    });

    // @ts-expect-error monaco
    decorationsRef.current = editor.createDecorationsCollection(decorations);

    // Scroll to the last decoration if there are any decorations
    if (decorations.length > 0) {
      const lastDecoration = decorations[decorations.length - 1];
      editor.revealLineInCenter(lastDecoration.range.startLineNumber);
    }
  };

  const makeEdit = (
    editor: editor.IStandaloneCodeEditor,
    conflict: IConflict,
    newLines: string[]
  ) => {
    const model = editor.getModel();

    if (!model) return;

    // Determine if we need to remove a blank line before the conflict
    const startLineNumber = conflict.hasBlankLineBefore
      ? conflict.headerLine
      : conflict.headerLine + 1;

    const endLineNumber = conflict.footerLine + 2;
    const range = new Range(startLineNumber, 1, endLineNumber, 1);

    // Add newline at the end of the resolved content
    const newTextLines = newLines.join('\n') + '\n';

    const newPosition = new Position(
      startLineNumber + newLines.length - 1,
      newLines[newLines.length - 1].length + 1
    );

    editor.pushUndoStop();
    editor.executeEdits('conflict-resolution', [
      {
        range: range,
        text: newTextLines,
        forceMoveMarkers: true
      }
    ]);
    editor.pushUndoStop();

    editor.setPosition(newPosition);
    editor.focus();
  };

  const handleAcceptCurrent = (
    conflict: IConflict,
    editor: editor.IStandaloneCodeEditor
  ) => {
    if (!editor) return;
    makeEdit(editor, conflict, conflict.current);
  };

  const handleAcceptIncoming = (
    conflict: IConflict,
    editor: editor.IStandaloneCodeEditor
  ) => {
    if (!editor) return;
    makeEdit(editor, conflict, conflict.incoming);
  };

  // Clean up widgets when component unmounts
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        clearAllWidgets(editorRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const conflicedText = addBlankLines(value);
    const forceRender = editor.getValue() !== conflicedText;

    if (!forceRender) return;

    const conflicts = parseConflicts(conflictedText);

    if (conflicts) {
      editor.setValue(conflictedText);
    } else {
      const position = editor.getPosition();
      editor.setValue(conflictedText);
      if (position) editor.setPosition(position);
    }
  }, [value]);

  return (
    <div
      className={cn(
        'flex-grow',
        theme === 'looplit-dark' ? 'monaco-dark-card' : 'monaco-light-card'
      )}
    >
      <Editor
        height="100%"
        width="100%"
        loading={null}
        language="yaml"
        defaultValue={conflictedText}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
        onChange={(newText) => {
          if (!editorRef.current) return;
          const remainingConflicts = parseConflicts(newText || '');
          addConflictDecorations(editorRef.current, remainingConflicts);
          setCanvas((prev) => {
            if (!prev) return prev;
            const nextAiState = editorRef.current?.getValue() || '';
            if (!remainingConflicts.length) {
              return {
                ...prev,
                aiState: nextAiState,
                acceptAll: undefined,
                rejectAll: undefined
              };
            }
            return {
              ...prev,
              aiState: nextAiState,
              acceptAll: () =>
                remainingConflicts.forEach(
                  (c) =>
                    editorRef.current &&
                    handleAcceptIncoming(c, editorRef.current)
                ),
              rejectAll: () =>
                remainingConflicts.forEach(
                  (c) =>
                    editorRef.current &&
                    handleAcceptCurrent(c, editorRef.current)
                )
            };
          });
        }}
        theme={theme}
        options={{
          readOnly,
          fontFamily: 'inter, monospace, sans-serif',
          fontSize: 15,
          lineHeight: 24,
          wordWrap: 'on',
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
          lineNumbersMinChars: 1,
          lineDecorationsWidth: 30,
          glyphMargin: false,
          folding: false,
          scrollbar: {
            useShadows: false,
            alwaysConsumeMouseWheel: false
          },
          renderWhitespace: 'boundary'
        }}
      />
    </div>
  );
};

export default StateMergeEditor;
