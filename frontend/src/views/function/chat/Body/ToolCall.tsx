import JsonEditor from '@/components/JsonEditor';
import { Loader } from '@/components/Loader';
import type { IMessage, IToolCall } from '@/components/Message';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { runningState, toolCallsToLineageIdsState } from '@/state';
import NestedFunctionView from '@/views/nestedFunction';
import { PanelRightOpen, WrenchIcon } from 'lucide-react';
import { useRecoilValue } from 'recoil';

interface Props {
  call: IToolCall;
  messages: IMessage[];
}

export default function ToolCall({ call, messages }: Props) {
  const running = useRecoilValue(runningState);
  const toolCallsToLineageIds = useRecoilValue(toolCallsToLineageIdsState);

  const response = messages.find(
    (m) => m.role === 'tool' && m.tool_call_id === call.id
  );
  const loading = running && !response;

  const lineageId = toolCallsToLineageIds[call.id];
  const callPrefix = 'call_';
  const funcName =
    lineageId && call.function.name.startsWith(callPrefix)
      ? call.function.name.slice(callPrefix.length)
      : call.function.name;

  const tc = (
    <Button
      variant="outline"
      size="sm"
      className={cn('w-fit', !lineageId ? 'cursor-auto' : '')}
    >
      {lineageId ? (
        <PanelRightOpen className="w-3" />
      ) : (
        <WrenchIcon className="w-3" />
      )}{' '}
      {funcName}{' '}
      <span className="italic font-normal	text-muted-foreground">{call.id}</span>{' '}
      {loading ? <Loader /> : null}
    </Button>
  );

  return (
    <div className="flex flex-col gap-1">
      {lineageId ? (
        <NestedFunctionView
          toolCallId={call.id}
          funcName={funcName}
          lineageId={lineageId}
        >
          {tc}
        </NestedFunctionView>
      ) : (
        tc
      )}
      <JsonEditor
        fitContent
        className="overflow-hidden rounded-md pt-2"
        value={
          typeof call.function.arguments === 'string'
            ? JSON.parse(call.function.arguments)
            : call.function.arguments
        }
      />
    </div>
  );
}
