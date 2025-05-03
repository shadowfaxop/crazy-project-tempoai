import * as React from "react";
import { cn } from "@/lib/utils";

export interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon: React.ReactNode;
  description?: string;
}

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  ({ className, title, icon, description, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center p-3 border rounded-md bg-background cursor-move hover:bg-accent transition-colors",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-center w-10 h-10 mr-3 bg-primary/10 rounded-md text-primary">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-medium">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    );
  },
);

ServiceCard.displayName = "ServiceCard";

export { ServiceCard };
