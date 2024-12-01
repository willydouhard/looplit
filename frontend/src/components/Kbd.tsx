import { usePlatform } from '@/hooks/usePlatform';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { Command, CornerDownLeft } from 'lucide-react';
import { ForwardedRef, forwardRef } from 'react';

export type KbdProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
};

const Kbd = forwardRef(
  (
    { asChild, children, className, ...kbdProps }: KbdProps,
    forwardedRef: ForwardedRef<HTMLElement>
  ) => {
    const { isMac } = usePlatform();
    const Comp = asChild ? Slot : 'kbd';

    const formatChildren = (child: React.ReactNode): React.ReactNode => {
      if (typeof child === 'string') {
        const lowerChild = child.toLowerCase();
        if (lowerChild === 'enter') {
          return <CornerDownLeft className="h-4 w-4" />;
        }
        if (lowerChild === 'cmd+enter' || lowerChild === 'ctrl+enter') {
          const cmdKey = isMac ? <Command className="h-4 w-4" /> : 'Ctrl';
          return (
            <>
              {cmdKey}
              <CornerDownLeft className="h-4 w-4 ml-0.5" />
            </>
          );
        }
        return isMac
          ? child.replace(/cmd/i, '⌘')
          : child.replace(/cmd/i, 'Ctrl');
      }
      return child;
    };

    const formattedChildren = Array.isArray(children)
      ? children.map(formatChildren)
      : formatChildren(children);

    return (
      <Comp
        {...kbdProps}
        className={cn(
          'inline-flex select-none items-center justify-center whitespace-nowrap rounded-[4px] bg-muted px-1 py-[1px] font-mono text-xs tracking-tight text-muted-foreground shadow',
          className
        )}
        ref={forwardedRef}
      >
        {formattedChildren}
      </Comp>
    );
  }
);
Kbd.displayName = 'Kbd';

export { Kbd };
