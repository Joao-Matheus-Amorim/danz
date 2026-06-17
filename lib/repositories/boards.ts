import {
  boardCards as mockBoardCards,
  boardColumns as mockBoardColumns,
  boards as mockBoards,
} from "@/lib/mock-data";
import { getSupabase } from "@/lib/supabase";
import type { Board, BoardCard, BoardCardLabel, BoardColumn } from "@/lib/types";
import { getCurrentWorkspaceId } from "@/lib/repositories/workspace";

interface BoardRow {
  id: string;
  title: string;
  gradient: string;
  board_columns?: { id: string }[];
  board_cards?: { id: string }[];
}

interface BoardColumnRow {
  id: string;
  board_id: string;
  title: string;
  position: number;
}

interface BoardCardRow {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  labels: string[];
  assignee_id: string | null;
  checklist_total: number;
  checklist_done: number;
  due_date: string | null;
  position: number;
}

const DEFAULT_COLUMNS = ["Backlog", "Fazendo", "Concluido"];
const DEFAULT_COLUMNS_WITH_REVIEW = ["Backlog", "Fazendo", "Revisao", "Concluido"];
const BOARD_GRADIENTS = [
  "from-neon/30 to-event-blue/20",
  "from-event-purple/30 to-neon/20",
  "from-event-blue/30 to-event-purple/20",
  "from-warning/30 to-neon/20",
];

function mapBoard(row: BoardRow): Board {
  return {
    id: row.id,
    title: row.title,
    gradient: row.gradient,
    columnsCount: row.board_columns?.length ?? 0,
    cardsCount: row.board_cards?.length ?? 0,
  };
}

function mapColumn(row: BoardColumnRow): BoardColumn {
  return {
    id: row.id,
    boardId: row.board_id,
    title: row.title,
    order: row.position,
  };
}

function mapCard(row: BoardCardRow): BoardCard {
  return {
    id: row.id,
    boardId: row.board_id,
    columnId: row.column_id,
    title: row.title,
    description: row.description ?? undefined,
    labels: (row.labels ?? []) as BoardCardLabel[],
    assigneeId: row.assignee_id ?? undefined,
    checklistTotal: row.checklist_total,
    checklistDone: row.checklist_done,
    dueDate: row.due_date ?? undefined,
    order: row.position,
  };
}

function getMockColumns(boardId: string): BoardColumn[] {
  const existingColumns = mockBoardColumns
    .filter((column) => column.boardId === boardId)
    .sort((a, b) => a.order - b.order);

  if (existingColumns.length > 0) return existingColumns;

  const board = mockBoards.find((item) => item.id === boardId);
  const titles =
    board?.columnsCount && board.columnsCount >= 4 ? DEFAULT_COLUMNS_WITH_REVIEW : DEFAULT_COLUMNS;

  return titles.map((title, index) => ({
    id: `${boardId}_col_${index}`,
    boardId,
    title,
    order: index,
  }));
}

export async function listBoards(): Promise<Board[]> {
  const supabase = getSupabase();
  if (!supabase) return mockBoards;

  const { data, error } = await supabase
    .from("boards")
    .select("id, title, gradient, board_columns(id), board_cards(id)")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapBoard(row as BoardRow));
}

export async function getBoardDetail(boardId: string): Promise<{
  columns: BoardColumn[];
  cards: BoardCard[];
}> {
  const supabase = getSupabase();

  if (!supabase) {
    return {
      columns: getMockColumns(boardId),
      cards: mockBoardCards
        .filter((card) => card.boardId === boardId)
        .sort((a, b) => a.order - b.order),
    };
  }

  const [{ data: columns, error: columnsError }, { data: cards, error: cardsError }] =
    await Promise.all([
      supabase
        .from("board_columns")
        .select("id, board_id, title, position")
        .eq("board_id", boardId)
        .order("position", { ascending: true }),
      supabase
        .from("board_cards")
        .select(
          "id, board_id, column_id, title, description, labels, assignee_id, checklist_total, checklist_done, due_date, position"
        )
        .eq("board_id", boardId)
        .order("position", { ascending: true }),
    ]);

  if (columnsError) throw columnsError;
  if (cardsError) throw cardsError;

  return {
    columns: (columns ?? []).map((row) => mapColumn(row as BoardColumnRow)),
    cards: (cards ?? []).map((row) => mapCard(row as BoardCardRow)),
  };
}

export async function createBoard(title: string): Promise<Board> {
  const supabase = getSupabase();
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error("Informe o nome do quadro.");

  if (!supabase) {
    return {
      id: `board_${crypto.randomUUID()}`,
      title: cleanTitle,
      gradient: BOARD_GRADIENTS[0],
      columnsCount: DEFAULT_COLUMNS.length,
      cardsCount: 0,
    };
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error("Usuario autenticado nao esta vinculado a um workspace.");

  const gradient = BOARD_GRADIENTS[Math.floor(Math.random() * BOARD_GRADIENTS.length)];
  const { data: board, error } = await supabase
    .from("boards")
    .insert({ workspace_id: workspaceId, title: cleanTitle, gradient })
    .select("id, title, gradient")
    .single();

  if (error) throw error;

  const columnRows = DEFAULT_COLUMNS.map((columnTitle, index) => ({
    board_id: board.id,
    title: columnTitle,
    position: index,
  }));

  const { error: columnsError } = await supabase.from("board_columns").insert(columnRows);
  if (columnsError) {
    await supabase.from("boards").delete().eq("id", board.id);
    throw columnsError;
  }

  return {
    id: board.id,
    title: board.title,
    gradient: board.gradient,
    columnsCount: DEFAULT_COLUMNS.length,
    cardsCount: 0,
  };
}

export async function createBoardCard(input: {
  boardId: string;
  columnId: string;
  title: string;
  position: number;
}): Promise<BoardCard> {
  const supabase = getSupabase();
  const cleanTitle = input.title.trim();
  if (!cleanTitle) throw new Error("Informe o titulo do card.");

  if (!supabase) {
    return {
      id: `card_${crypto.randomUUID()}`,
      boardId: input.boardId,
      columnId: input.columnId,
      title: cleanTitle,
      labels: [],
      checklistTotal: 0,
      checklistDone: 0,
      order: input.position,
    };
  }

  const { data, error } = await supabase
    .from("board_cards")
    .insert({
      board_id: input.boardId,
      column_id: input.columnId,
      title: cleanTitle,
      labels: [],
      checklist_total: 0,
      checklist_done: 0,
      position: input.position,
    })
    .select(
      "id, board_id, column_id, title, description, labels, assignee_id, checklist_total, checklist_done, due_date, position"
    )
    .single();

  if (error) throw error;
  const card = mapCard(data as BoardCardRow);
  await pushBoardCardToTrelloBestEffort(card.id);
  return card;
}

export async function updateBoardCardPositions(cards: BoardCard[]): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const updates = cards.map((card) =>
    supabase
      .from("board_cards")
      .update({ column_id: card.columnId, position: card.order })
      .eq("id", card.id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;

  await pushBoardCardsToTrelloBestEffort(cards.map((card) => card.id));
}

async function pushBoardCardToTrelloBestEffort(cardId: string): Promise<void> {
  try {
    await pushBoardCardToTrello(cardId);
  } catch (error) {
    console.warn("Trello card push failed after local save.", error);
  }
}

async function pushBoardCardsToTrelloBestEffort(cardIds: string[]): Promise<void> {
  const results = await Promise.allSettled(
    cardIds.map((cardId) => pushBoardCardToTrello(cardId))
  );

  for (const result of results) {
    if (result.status === "rejected") {
      console.warn("Trello card push failed after local position save.", result.reason);
    }
  }
}

async function pushBoardCardToTrello(cardId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return;

  const response = await fetch("/api/trello/cards/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cardId }),
  });

  if (response.status === 400 || response.status === 500) {
    const payload = (await response.json()) as { error?: string };
    const message = payload.error ?? "Erro ao enviar card ao Trello.";
    if (
      message.includes("TRELLO_API_KEY") ||
      message.includes("TRELLO_API_TOKEN") ||
      (message.includes("external_id") && message.includes("does not exist"))
    ) {
      return;
    }
    throw new Error(message);
  }

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Erro ao enviar card ao Trello.");
  }
}

export async function syncTrelloBoard(): Promise<{
  boardId: string;
  lists: number;
  cards: number;
}> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase precisa estar configurado para sincronizar Trello.");

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sessao ausente para sincronizar Trello.");

  const response = await fetch("/api/trello/sync", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = (await response.json()) as {
    boardId?: string;
    lists?: number;
    cards?: number;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Erro ao sincronizar Trello.");
  }

  return {
    boardId: payload.boardId ?? "",
    lists: payload.lists ?? 0,
    cards: payload.cards ?? 0,
  };
}
