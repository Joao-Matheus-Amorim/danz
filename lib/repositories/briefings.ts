import { briefingItems as mockBriefingItems } from "@/lib/mock-data";
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
}

let mockBriefingItemStore: BriefingItem[] = [...mockBriefingItems];

function mapBriefingItem(row: BriefingItemRow, monthRef: string): BriefingItem {
  return {
    id: row.id,
    monthRef,
    clientId: row.client_id ?? undefined,
    clientName: row.client_name,
    done: row.done,
  };
}

export async function listBriefingItems(
  monthRef: string
): Promise<BriefingItem[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return mockBriefingItemStore.filter((item) => item.monthRef === monthRef);
  }

  const { data: briefing, error: briefingError } = await supabase
    .from("briefings")
    .select("id, month_ref")
    .eq("month_ref", monthRef)
    .maybeSingle();

  if (briefingError) throw briefingError;
  if (!briefing) return [];

  const row = briefing as BriefingRow;
  const { data, error } = await supabase
    .from("briefing_items")
    .select("id, client_id, client_name, done")
    .eq("briefing_id", row.id)
    .order("client_name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((item) =>
    mapBriefingItem(item as BriefingItemRow, row.month_ref)
  );
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
    .select("id, client_id, client_name, done")
    .single();

  if (error) throw error;
  return mapBriefingItem(data as BriefingItemRow, monthRef);
}
