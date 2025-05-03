import * as React from "react";
import { cn } from "@/lib/utils";

export interface NodeProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: React.ReactNode;
  selected?: boolean;
  type: string;
}

const Node = React.forwardRef<HTMLDivElement, NodeProps>(
  ({ className, title, icon, selected = false, type, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center p-4 bg-white border rounded-md shadow-sm cursor-pointer transition-all",
          selected && "ring-2 ring-primary",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-center w-12 h-12 mb-2 bg-muted rounded-full">
          {icon}
        </div>
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{type}</span>
      </div>
    );
  },
);

Node.displayName = "Node";

export { Node };
