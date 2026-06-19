import { briefingItems as mockBriefingItems } from "@/lib/mock-data";
import { getCurrentWorkspaceId } from "@/lib/repositories/workspace";
import { getSupabase } from "@/lib/supabase";
import type { BriefingItem } from "@/lib/types";

interface BriefingRow {
  id: string;
  month_ref: string;
}

interface BriefingItemRow {
  id: string;
  client_id: string | null;
  client_name: string;
  done: boolean;
  public_token: string | null;
  response: Record<string, string> | null;
  submitted_at: string | null;
}

const briefingItemSelect =
  "id, client_id, client_name, done, public_token, response, submitted_at";

let mockBriefingItemStore: BriefingItem[] = [...mockBriefingItems];

function mapBriefingItem(row: BriefingItemRow, monthRef: string): BriefingItem {
  return {
    id: row.id,
    monthRef,
    clientId: row.client_id ?? undefined,
    clientName: row.client_name,
    done: row.done,
    publicToken: row.public_token ?? undefined,
    submitted: row.submitted_at != null,
    response: row.response ?? undefined,
  };
}

export async function listBriefingItems(
  monthRef: string
): Promise<BriefingItem[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return mockBriefingItemStore.filter((item) => item.monthRef === monthRef);
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data: briefing, error: briefingError } = await supabase
    .from("briefings")
    .select("id, month_ref")
    .eq("workspace_id", workspaceId)
    .eq("month_ref", monthRef)
    .maybeSingle();

  if (briefingError) throw briefingError;
  if (!briefing) return [];

  const row = briefing as BriefingRow;
  const { data, error } = await supabase
    .from("briefing_items")
    .select(briefingItemSelect)
    .eq("briefing_id", row.id)
    .order("client_name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((item) =>
    mapBriefingItem(item as BriefingItemRow, row.month_ref)
  );
}

/**
 * Garante que o briefing do mes existe (e tem um item por cliente ativo do
 * workspace), criando o que faltar. So deve ser chamada por quem tem
 * permissao de editor (owner/admin/gestor) -- a RLS de briefings/briefing_items
 * exige is_workspace_editor para insert, entao um operador chamando isso
 * receberia erro de permissao em vez de criar nada.
 */
export async function ensureBriefingForMonth(monthRef: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  // Upsert por (workspace_id, month_ref) em vez de select+insert: se dois
  // editores abrirem a pagina ao mesmo tempo no primeiro acesso do mes, ambos
  // colidem na unique index e o upsert resolve para a mesma linha em vez de
  // um deles estourar erro de chave duplicada.
  const { data: briefing, error: briefingError } = await supabase
    .from("briefings")
    .upsert(
      { workspace_id: workspaceId, month_ref: monthRef },
      { onConflict: "workspace_id,month_ref", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (briefingError) throw briefingError;
  const briefingId = briefing.id as string;

  const { data: activeClients, error: clientsError } = await supabase
    .from("clients")
    .select("id, name")
    .eq("workspace_id", workspaceId)
    .eq("status", "ativo");

  if (clientsError) throw clientsError;
  if (!activeClients || activeClients.length === 0) return;

  // Upsert por (briefing_id, client_id) em vez de filtrar items existentes e
  // inserir so os que faltam: evita duplicar a linha (e o public_token) de um
  // cliente se dois editores rodarem isso ao mesmo tempo.
  const { error: insertItemsError } = await supabase.from("briefing_items").upsert(
    activeClients.map((client) => ({
      briefing_id: briefingId,
      client_id: client.id,
      client_name: client.name,
    })),
    { onConflict: "briefing_id,client_id", ignoreDuplicates: true }
  );

  if (insertItemsError) throw insertItemsError;
}

export async function setBriefingItemDone(
  itemId: string,
  done: boolean,
  monthRef: string
): Promise<BriefingItem> {
  const supabase = getSupabase();

  if (!supabase) {
    const existing = mockBriefingItemStore.find((item) => item.id === itemId);
    if (!existing) throw new Error("Briefing nao encontrado.");
    const updated: BriefingItem = { ...existing, done };
    mockBriefingItemStore = mockBriefingItemStore.map((item) =>
      item.id === itemId ? updated : item
    );
    return updated;
  }

  const { data, error } = await supabase
    .from("briefing_items")
    .update({ done })
    .eq("id", itemId)
    .select(briefingItemSelect)
    .single();

  if (error) throw error;
  return mapBriefingItem(data as BriefingItemRow, monthRef);
}
