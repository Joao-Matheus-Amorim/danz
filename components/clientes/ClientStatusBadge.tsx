import { Badge } from "@/components/ui/badge";
import type { ClientStatus } from "@/lib/types";
import { CLIENT_STATUS_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Badge de status do cliente (Ativo/Pausado). */
export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge
      className={cn(
        status === "ativo"
          ? "text-neon border-neon-border bg-neon/[0.08]"
          : "text-content-muted border-white/10 bg-white/[0.03]"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "ativo" ? "bg-neon" : "bg-content-muted"
        )}
      />
      {CLIENT_STATUS_LABEL[status]}
    </Badge>
  );
}
