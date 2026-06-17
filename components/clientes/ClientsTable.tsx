import { ClientRow } from "@/components/clientes/ClientRow";
import { Card } from "@/components/ui/card";
import type { Client } from "@/lib/types";

const COLUMNS = ["Cliente", "Bandeira", "Plano", "Status", "Inicio", "Tags"];

export function ClientsTable({
  clients,
  loading = false,
  onEdit,
  onDelete,
  pendingId,
}: {
  clients: Client[];
  loading?: boolean;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  pendingId?: string | null;
}) {
  const showActions = Boolean(onEdit || onDelete);
  const columns = showActions ? [...COLUMNS, ""] : COLUMNS;

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              {columns.map((c, index) => (
                <th
                  key={c || `actions-${index}`}
                  className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-label text-content-muted"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-content-muted">
                  Carregando clientes...
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-content-muted">
                  Nenhum cliente encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  pending={pendingId === client.id}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
