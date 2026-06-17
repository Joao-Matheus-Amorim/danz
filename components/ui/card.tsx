import * as React from "react";
import { cn } from "@/lib/utils";

/** Card de vidro padrão do DL Operational System. */
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { muted?: boolean }
>(({ className, muted, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(muted ? "dl-card-muted" : "dl-card", className)}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1 p-5", className)} {...props} />
);

export const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-base font-semibold text-content", className)} {...props} />
);

export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5 pt-0", className)} {...props} />
);
