import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Estado vazio padronizado (placeholders de painéis centrais). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 p-10 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neon-border bg-neon/[0.08] text-neon shadow-neon">
        <Icon className="h-6 w-6" />
      </div>
      <p className="dl-label">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-content-muted">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
