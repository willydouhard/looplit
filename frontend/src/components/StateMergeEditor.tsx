import { useMonacoTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import Editor from '@monaco-editor/react';
import { Position, Range, editor } from 'monaco-editor';
import { useEffect, useMemo, useRef } from 'react';

const ABOVE = editor.ContentWidgetPositionPreference.ABOVE;

export const START = '<<<<<<<';
export const MIDDLE = '=======';
export const END = '>>>>>>>';

interface Props {
  value: string;
  readOnly?: boolean;
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

interface Conflict {
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

export const parseConflicts = (text: string): Conflict[] => {
  const lines = text.split('\n');
  const conflicts: Conflict[] = [];
  let currentConflict: Conflict | null = null;

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
  const theme = useMonacoTheme();

  const headerBg = theme === 'looplit-dark' ? 'bg-sky-800' : 'bg-sky-200';
  const currentBg = theme === 'looplit-dark' ? 'bg-sky-950' : 'bg-sky-300';
  const incomingBg = theme === 'looplit-dark' ? 'bg-teal-950' : 'bg-teal-300';
  const footerBg = theme === 'looplit-dark' ? 'bg-teal-800' : 'bg-teal-200';
  const buttonHover = 'hover:text-blue-400';

  const conflictedText = useMemo(() => addBlankLines(value), [value]);

  // const conflictedText = addBlankLines(`
  // function greeting() {
  // <<<<<<< HEAD
  // console.log("Hello");
  // return 'Hello World!';
  // =======
  // console.log("Hi");
  // return 'Hi there!';
  // >>>>>>> feature-branch
  // }
  // function farewell() {
  // <<<<<<< HEAD
  // return 'Goodbye!';
  // =======
  // return 'See you later!';
  // >>>>>>> feature-branch
  // }
  // `.trim());

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
    conflicts: Conflict[]
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
        'conflict-actions absolute left-0 z-10 !flex gap-4 text-muted-foreground h-4 w-fit';

      const acceptCurrentBtn = document.createElement('div');
      acceptCurrentBtn.className = `action-button h-4 accept-current text-xs cursor-pointer whitespace-nowrap ${buttonHover}`;
      acceptCurrentBtn.textContent = 'Accept Current';
      acceptCurrentBtn.onclick = () => handleAcceptCurrent(conflict, editor);

      const acceptIncomingBtn = document.createElement('div');
      acceptIncomingBtn.className = `action-button h-4 accept-incoming text-xs cursor-pointer whitespace-nowrap ${buttonHover}`;
      acceptIncomingBtn.textContent = 'Accept Incoming';
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
  };

  const makeEdit = (
    editor: editor.IStandaloneCodeEditor,
    conflict: Conflict,
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

    // Re-parse and decorate remaining conflicts
    const remainingConflicts = parseConflicts(model.getValue());
    addConflictDecorations(editor, remainingConflicts);
  };

  const handleAcceptCurrent = (
    conflict: Conflict,
    editor: editor.IStandaloneCodeEditor
  ) => {
    if (!editor) return;
    makeEdit(editor, conflict, conflict.current);
  };

  const handleAcceptIncoming = (
    conflict: Conflict,
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
        language="json"
        defaultValue={conflictedText}
        onMount={(editor) => {
          editorRef.current = editor;
          const conflicts = parseConflicts(conflictedText);
          addConflictDecorations(editor, conflicts);
        }}
        onChange={(newText) => {
          if (!editorRef.current) return;
          const remainingConflicts = parseConflicts(newText || '');
          addConflictDecorations(editorRef.current, remainingConflicts);
        }}
        theme={theme}
        options={{
          readOnly,
          fontFamily: 'inter, monospace, sans-serif',
          fontSize: 15,
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
          }
        }}
      />
    </div>
  );
};

export default StateMergeEditor;
