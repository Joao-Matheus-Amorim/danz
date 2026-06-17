import { Edit3, Trash2 } from "lucide-react";
import { ClientStatusBadge } from "@/components/clientes/ClientStatusBadge";
import { ClientTags } from "@/components/clientes/ClientTags";
import { Button } from "@/components/ui/button";
import type { Client } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** Linha da tabela de clientes. */
export function ClientRow({
  client,
  onEdit,
  onDelete,
  pending = false,
}: {
  client: Client;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  pending?: boolean;
}) {
  const showActions = Boolean(onEdit || onDelete);

  return (
    <tr className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-content">{client.name}</p>
      </td>
      <td className="px-4 py-3 text-sm text-content-muted">{client.bandeira}</td>
      <td className="px-4 py-3 text-sm text-content-muted">{client.plan}</td>
      <td className="px-4 py-3">
        <ClientStatusBadge status={client.status} />
      </td>
      <td className="px-4 py-3 text-sm text-content-muted">
        {formatDate(client.startDate, "MMM yyyy")}
      </td>
      <td className="px-4 py-3">
        <ClientTags tags={client.tags} />
      </td>
      {showActions && (
        <td className="px-4 py-3">
          <div className="flex justify-end gap-2">
            {onEdit && (
              <Button
                variant="secondary"
                size="icon"
                onClick={() => onEdit(client)}
                aria-label="Editar cliente"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="icon"
                onClick={() => onDelete(client)}
                disabled={pending}
                aria-label="Excluir cliente"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}
