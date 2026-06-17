import { ClientStatusBadge } from "@/components/clientes/ClientStatusBadge";
import { ClientTags } from "@/components/clientes/ClientTags";
import type { Client } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** Linha da tabela de clientes. */
export function ClientRow({ client }: { client: Client }) {
  return (
    <tr className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-content">{client.name}</p>
      </td>
      <td className="px-4 py-3 text-sm text-content-muted">{client.niche}</td>
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
    </tr>
  );
}
