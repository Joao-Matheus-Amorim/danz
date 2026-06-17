import { cn } from "@/lib/utils";

/** Barra de progresso neon. `value` é a porcentagem (0–100). */
export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-white/[0.06]", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-neon-soft to-neon shadow-neon transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
