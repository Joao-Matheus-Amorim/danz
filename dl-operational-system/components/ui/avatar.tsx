import { cn } from "@/lib/utils";

/** Avatar com iniciais — usado na topbar e em atribuições. */
export function Avatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-neon-border bg-neon/[0.10] text-xs font-semibold text-neon",
        className
      )}
    >
      {initials}
    </div>
  );
}
