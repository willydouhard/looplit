import { useMonacoTheme } from './ThemeProvider';
import { AspectRatio } from './ui/aspect-ratio';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import Editor from '@monaco-editor/react';
import { omit } from 'lodash';
import type { editor } from 'monaco-editor';
import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownCodeEditor = ({
  language,
  code
}: {
  language: string;
  code: string;
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [height, setHeight] = useState<number>();
  const theme = useMonacoTheme();

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

    const editorHeight = contentHeight;
    setHeight(editorHeight);
  }

  return (
    <Editor
      height={height}
      defaultValue={code}
      language={language}
      theme={theme}
      options={{
        fontFamily: 'inter, monospace, sans-serif',
        renderLineHighlight: 'none',
        fontSize: 12,
        lineNumbers: 'off',
        minimap: { enabled: false },
        readOnly: true,
        lineNumbersMinChars: 0,
        folding: false,
        lineDecorationsWidth: 0,
        overviewRulerLanes: 0,
        scrollbar: {
          useShadows: false,
          alwaysConsumeMouseWheel: false
        }
      }}
      onMount={(editor) => {
        editorRef.current = editor;

        adjustEditorHeightToContent();
      }}
    />
  );
};

const Markdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code(props) {
          return (
            <code
              {...omit(props, ['node'])}
              className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
            />
          );
        },
        pre({ children, ...props }: any) {
          const codeChildren = props.node?.children?.[0];
          const className = codeChildren?.properties?.className?.[0];
          const match = /language-(\w+)/.exec(className || '');
          const code = codeChildren?.children?.[0]?.value;
          const showSyntaxHighlighter = match && code;

          if (showSyntaxHighlighter) {
            return <MarkdownCodeEditor code={code} language={match[1] || ''} />;
          }

          return (
            <div className="min-h-10 overflow-x-auto rounded-md bg-accent p-1">
              <code
                {...props}
                style={{
                  whiteSpace: 'pre-wrap'
                }}
              >
                {children}
              </code>
            </div>
          );
        },
        a({ children, ...props }) {
          return (
            <a {...props} className="text-primary" target="_blank">
              {children}
            </a>
          );
        },
        img: (image: any) => {
          return (
            <AspectRatio
              ratio={16 / 9}
              className="max-h-[200px] max-w-[355px] bg-muted"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full rounded-md object-cover"
              />
            </AspectRatio>
          );
        },
        blockquote(props) {
          return (
            <blockquote
              {...omit(props, ['node'])}
              className="mt-6 border-l-2 pl-6 italic"
            />
          );
        },
        em(props) {
          return <span {...omit(props, ['node'])} className="italic" />;
        },
        strong(props) {
          return <span {...omit(props, ['node'])} className="font-bold" />;
        },
        hr() {
          return <Separator />;
        },
        ul(props) {
          return (
            <ul
              {...omit(props, ['node'])}
              className="my-3 ml-3 list-disc pl-2 [&>li]:mt-1"
            />
          );
        },
        ol(props) {
          return (
            <ol
              {...omit(props, ['node'])}
              className="my-3 ml-3 list-decimal [&>li]:mt-1"
            />
          );
        },
        h1(props) {
          return (
            <h1
              {...omit(props, ['node'])}
              className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
            />
          );
        },
        h2(props) {
          return (
            <h2
              {...omit(props, ['node'])}
              className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
            />
          );
        },
        h3(props) {
          return (
            <h3
              {...omit(props, ['node'])}
              className="scroll-m-20 text-2xl font-semibold tracking-tight"
            />
          );
        },
        h4(props) {
          return (
            <h4
              {...omit(props, ['node'])}
              className="scroll-m-20 text-xl font-semibold tracking-tight"
            />
          );
        },
        p(props) {
          return (
            <p
              {...omit(props, ['node'])}
              className="leading-7 [&:not(:first-child)]:mt-6"
            />
          );
        },
        table({ children, ...props }) {
          return (
            <Card className="[&:not(:first-child)]:mt-2 [&:not(:last-child)]:mb-2">
              <Table {...props}>{children}</Table>
            </Card>
          );
        },
        thead({ children, ...props }) {
          return <TableHeader {...props}>{children}</TableHeader>;
        },
        tr({ children, ...props }) {
          return <TableRow {...props}>{children}</TableRow>;
        },
        th({ children, ...props }) {
          return <TableHead {...props}>{children}</TableHead>;
        },
        td({ children, ...props }) {
          return <TableCell {...props}>{children}</TableCell>;
        },
        tbody({ children, ...props }) {
          return <TableBody {...props}>{children}</TableBody>;
        }
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export default Markdown;
