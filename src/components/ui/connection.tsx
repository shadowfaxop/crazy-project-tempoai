import * as React from "react";
import { cn } from "@/lib/utils";

export interface ConnectionProps extends React.SVGAttributes<SVGPathElement> {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  selected?: boolean;
}

const Connection = React.forwardRef<SVGPathElement, ConnectionProps>(
  (
    { className, startX, startY, endX, endY, selected = false, ...props },
    ref,
  ) => {
    // Calculate control points for a curved line
    const midX = (startX + endX) / 2;

    const path = `M${startX},${startY} C${midX},${startY} ${midX},${endY} ${endX},${endY}`;

    return (
      <path
        ref={ref}
        d={path}
        className={cn(
          "fill-none stroke-2 stroke-muted-foreground",
          selected && "stroke-primary stroke-[3px]",
          className,
        )}
        {...props}
      />
    );
  },
);

Connection.displayName = "Connection";

export { Connection };
