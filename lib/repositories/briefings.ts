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

  const { data: existingBriefing, error: briefingError } = await supabase
    .from("briefings")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("month_ref", monthRef)
    .maybeSingle();

  if (briefingError) throw briefingError;

  let briefingId = existingBriefing?.id as string | undefined;

  if (!briefingId) {
    const { data: createdBriefing, error: createBriefingError } = await supabase
      .from("briefings")
      .insert({ workspace_id: workspaceId, month_ref: monthRef })
      .select("id")
      .single();

    if (createBriefingError) throw createBriefingError;
    briefingId = createdBriefing.id as string;
  }

  const [{ data: activeClients, error: clientsError }, { data: existingItems, error: itemsError }] =
    await Promise.all([
      supabase.from("clients").select("id, name").eq("workspace_id", workspaceId).eq("status", "ativo"),
      supabase.from("briefing_items").select("client_id").eq("briefing_id", briefingId),
    ]);

  if (clientsError) throw clientsError;
  if (itemsError) throw itemsError;

  const clientIdsWithItem = new Set((existingItems ?? []).map((item) => item.client_id));
  const missingItems = (activeClients ?? []).filter((client) => !clientIdsWithItem.has(client.id));

  if (missingItems.length === 0) return;

  const { error: insertItemsError } = await supabase.from("briefing_items").insert(
    missingItems.map((client) => ({
      briefing_id: briefingId,
      client_id: client.id,
      client_name: client.name,
    }))
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
