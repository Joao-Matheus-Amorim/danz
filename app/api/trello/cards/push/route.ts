import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface BoardCardRecord {
  id: string;
  external_id: string | null;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  position: number;
}

interface BoardRecord {
  id: string;
  external_id: string | null;
}

interface ColumnRecord {
  id: string;
  external_id: string | null;
}

interface TrelloCardResponse {
  id: string;
}

const TRELLO_BASE_URL = "https://api.trello.com/1";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variavel ${name} nao configurada.`);
  return value;
}

function trelloUrl(path: string, params: Record<string, string>): string {
  const key = requiredEnv("TRELLO_API_KEY");
  const token = requiredEnv("TRELLO_API_TOKEN");
  const search = new URLSearchParams({ ...params, key, token });
  return `${TRELLO_BASE_URL}${path}?${search.toString()}`;
}

async function trelloRequest<T>(
  path: string,
  init: RequestInit,
  params: Record<string, string>
): Promise<T> {
  const response = await fetch(trelloUrl(path, params), {
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Trello ${response.status}: ${detail}`);
  }

  return response.json() as Promise<T>;
}

export async function POST(request: Request) {
  try {
    const { cardId } = (await request.json()) as { cardId?: string };
    if (!cardId) {
      return NextResponse.json({ error: "cardId obrigatorio." }, { status: 400 });
    }

    const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseAnonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Sessao ausente." }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: card, error: cardError } = await supabase
      .from("board_cards")
      .select("id, external_id, board_id, column_id, title, description, due_date, position")
      .eq("id", cardId)
      .single();

    if (cardError) throw cardError;

    const currentCard = card as BoardCardRecord;
    const [{ data: board, error: boardError }, { data: column, error: columnError }] =
      await Promise.all([
        supabase
          .from("boards")
          .select("id, external_id")
          .eq("id", currentCard.board_id)
          .single(),
        supabase
          .from("board_columns")
          .select("id, external_id")
          .eq("id", currentCard.column_id)
          .single(),
      ]);

    if (boardError) throw boardError;
    if (columnError) throw columnError;

    const currentBoard = board as BoardRecord;
    const currentColumn = column as ColumnRecord;

    if (!currentBoard.external_id || !currentColumn.external_id) {
      return NextResponse.json({
        skipped: true,
        reason: "Card pertence a quadro/lista sem vinculo Trello.",
      });
    }

    if (!currentCard.external_id) {
      const created = await trelloRequest<TrelloCardResponse>(
        "/cards",
        { method: "POST" },
        {
          idList: currentColumn.external_id,
          name: currentCard.title,
          desc: currentCard.description ?? "",
          pos: String(currentCard.position + 1),
          ...(currentCard.due_date ? { due: currentCard.due_date } : {}),
        }
      );

      const { error: updateError } = await supabase
        .from("board_cards")
        .update({ external_id: created.id })
        .eq("id", currentCard.id);

      if (updateError) throw updateError;

      return NextResponse.json({ pushed: true, externalId: created.id, created: true });
    }

    await trelloRequest<TrelloCardResponse>(
      `/cards/${currentCard.external_id}`,
      { method: "PUT" },
      {
        idList: currentColumn.external_id,
        name: currentCard.title,
        desc: currentCard.description ?? "",
        pos: String(currentCard.position + 1),
        ...(currentCard.due_date ? { due: currentCard.due_date } : {}),
      }
    );

    return NextResponse.json({
      pushed: true,
      externalId: currentCard.external_id,
      created: false,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao enviar card ao Trello." },
      { status: 500 }
    );
  }
}
