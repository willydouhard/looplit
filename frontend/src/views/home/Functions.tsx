import InlineText from '@/components/InlineText';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { functionsState } from '@/state';
import { FunctionSquareIcon, InfoIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export default function Functions() {
  const functions = useRecoilValue(functionsState);

  if (!functions) return null;

  const functionNames = Object.keys(functions);

  let content;

  if (functionNames.length === 0) {
    content = (
      <Alert variant="default">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>No Function Found</AlertTitle>
        <AlertDescription>
          Could not found a <InlineText>@stateful</InlineText> decorated
          function.
        </AlertDescription>
      </Alert>
    );
  } else {
    content = (
      <div className="flex flex-col gap-2">
        {functionNames.map((fn) => {
          return (
            <NavLink key={fn} to={`/fn/${fn}`}>
              <Button className="w-full" variant="outline">
                <FunctionSquareIcon /> {fn}
              </Button>
            </NavLink>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="scroll-m-20 text-3xl font-extrabold tracking-normal lg:text-4xl">
        Looplit Agent Studio
      </h1>
      <p className="leading-7 text-muted-foreground [&:not(:first-child)]:mt-4">
        Pick the agent you want to work on.
      </p>
      {content}
    </div>
  );
}
