// components/ui/ScrollArea.tsx

"use client";

import { forwardRef } from 'react';
import { cn } from "@lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'overflow-y-auto max-h-full p-4', // Adjusted to occupy full height
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';

export default ScrollArea;
