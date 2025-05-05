import * as React from "react";
import { cn } from "@/lib/utils";

export interface CanvasContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const CanvasContainer = React.forwardRef<HTMLDivElement, CanvasContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full h-full overflow-auto bg-secondary/20",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CanvasContainer.displayName = "CanvasContainer";

export { CanvasContainer };
