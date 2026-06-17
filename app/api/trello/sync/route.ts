import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface TrelloBoard {
  id: string;
  name: string;
}

interface TrelloList {
  id: string;
  name: string;
  pos: number;
  closed: boolean;
}

interface TrelloCard {
  id: string;
  idList: string;
  name: string;
  desc: string;
  pos: number;
  due: string | null;
  closed: boolean;
}

const TRELLO_BASE_URL = "https://api.trello.com/1";
const DEFAULT_GRADIENT = "from-neon/30 to-event-blue/20";

interface DynamicSupabaseClient {
  from: (table: string) => any;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variavel ${name} nao configurada.`);
  return value;
}

async function trelloRequest<T>(path: string): Promise<T> {
  const key = requiredEnv("TRELLO_API_KEY");
  const token = requiredEnv("TRELLO_API_TOKEN");
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${TRELLO_BASE_URL}${path}${separator}key=${key}&token=${token}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Trello ${response.status}: ${detail}`);
  }

  return response.json() as Promise<T>;
}

async function upsertByExternalId<T extends { id: string }>(
  supabase: DynamicSupabaseClient,
  table: string,
  externalId: string,
  payload: Record<string, unknown>,
  select = "id"
): Promise<T> {
  const { data: existing, error: selectError } = await supabase
    .from(table)
    .select(select)
    .eq("external_id", externalId)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existing) {
    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq("external_id", externalId)
      .select(select)
      .single();

    if (error) throw error;
    return data as T;
  }

  const { data, error } = await supabase
    .from(table)
    .insert({ ...payload, external_id: externalId })
    .select(select)
    .single();

  if (error) throw error;
  return data as T;
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseAnonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Sessao ausente." }, { status: 401 });
    }

    const boardId = process.env.TRELLO_BOARD_ID;
    if (!boardId) {
      return NextResponse.json(
        { error: "Configure TRELLO_BOARD_ID para sincronizar o Trello." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: membership, error: membershipError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .limit(1)
      .maybeSingle();

    if (membershipError) throw membershipError;
    if (!membership?.workspace_id) {
      return NextResponse.json(
        { error: "Usuario autenticado nao esta vinculado a um workspace." },
        { status: 403 }
      );
    }

    const [trelloBoard, trelloLists, trelloCards] = await Promise.all([
      trelloRequest<TrelloBoard>(`/boards/${boardId}?fields=name`),
      trelloRequest<TrelloList[]>(`/boards/${boardId}/lists?fields=name,pos,closed`),
      trelloRequest<TrelloCard[]>(
        `/boards/${boardId}/cards?fields=name,desc,pos,due,closed,idList&filter=open`
      ),
    ]);

    const board = await upsertByExternalId<{ id: string }>(supabase, "boards", trelloBoard.id, {
      workspace_id: membership.workspace_id,
      title: trelloBoard.name,
      gradient: DEFAULT_GRADIENT,
      updated_at: new Date().toISOString(),
    });

    const listIdMap = new Map<string, string>();
    const openLists = trelloLists
      .filter((list) => !list.closed)
      .sort((a, b) => a.pos - b.pos);

    for (const [index, list] of openLists.entries()) {
      const column = await upsertByExternalId<{ id: string }>(
        supabase,
        "board_columns",
        list.id,
        {
          board_id: board.id,
          title: list.name,
          position: index,
        }
      );
      listIdMap.set(list.id, column.id);
    }

    const cardsByList = new Map<string, TrelloCard[]>();
    for (const card of trelloCards.filter((item) => !item.closed)) {
      const existing = cardsByList.get(card.idList) ?? [];
      existing.push(card);
      cardsByList.set(card.idList, existing);
    }

    let cardCount = 0;
    for (const [trelloListId, cards] of cardsByList.entries()) {
      const columnId = listIdMap.get(trelloListId);
      if (!columnId) continue;

      for (const [index, card] of cards.sort((a, b) => a.pos - b.pos).entries()) {
        await upsertByExternalId<{ id: string }>(supabase, "board_cards", card.id, {
          board_id: board.id,
          column_id: columnId,
          title: card.name,
          description: card.desc || null,
          due_date: card.due ? card.due.slice(0, 10) : null,
          position: index,
          updated_at: new Date().toISOString(),
        });
        cardCount += 1;
      }
    }

    return NextResponse.json({
      boardId: board.id,
      lists: openLists.length,
      cards: cardCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao sincronizar Trello." },
      { status: 500 }
    );
  }
}
