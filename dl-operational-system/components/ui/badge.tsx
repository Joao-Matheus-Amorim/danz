import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Badge genérico. As cores são passadas via className (ex.: constantes de
 * estilo em lib/constants.ts), mantendo o componente livre de regra de negócio.
 */
export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        className
      )}
      {...props}
    />
  );
}
