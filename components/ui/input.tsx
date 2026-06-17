import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-content placeholder:text-content-muted/70 transition-colors focus-visible:border-neon-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon/20",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[80px] w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-content placeholder:text-content-muted/70 transition-colors focus-visible:border-neon-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon/20",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-content transition-colors focus-visible:border-neon-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon/20 [&>option]:bg-background",
      className
    )}
    {...props}
  />
));
Select.displayName = "Select";

export const Label = ({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn("mb-1.5 block text-xs font-medium text-content-muted", className)}
    {...props}
  />
);
