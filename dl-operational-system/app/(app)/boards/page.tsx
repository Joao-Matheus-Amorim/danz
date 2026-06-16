"use client";

import * as React from "react";
import { RefreshCw, Plus, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { BoardGrid } from "@/components/boards/BoardGrid";
import { KanbanBoard } from "@/components/boards/KanbanBoard";
import { useToast } from "@/components/ui/toast";
import {
  boards,
  getColumnsByBoard,
  getBoardCards,
} from "@/lib/mock-data";
import type { BoardColumn } from "@/lib/types";

/** Colunas padrão para boards que ainda não têm estrutura definida no mock. */
function defaultColumns(boardId: string): BoardColumn[] {
  return ["Backlog", "Fazendo", "Concluído"].map((title, i) => ({
    id: `${boardId}_col_${i}`,
    boardId,
    title,
    order: i,
  }));
}

export default function BoardsPage() {
  const { futureFeature } = useToast();
  const [openBoardId, setOpenBoardId] = React.useState<string | null>(null);

  const openBoard = boards.find((b) => b.id === openBoardId) ?? null;

  if (openBoard) {
    const columns =
      getColumnsByBoard(openBoard.id).length > 0
        ? getColumnsByBoard(openBoard.id)
        : defaultColumns(openBoard.id);
    const cards = getBoardCards(openBoard.id);

    return (
      <div className="space-y-6">
        <PageHeader
          label="Boards"
          title={openBoard.title}
          subtitle={`${columns.length} listas · ${cards.length} cards · arraste para reorganizar`}
          actions={
            <Button variant="secondary" onClick={() => setOpenBoardId(null)}>
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          }
        />
        <KanbanBoard columns={columns} initialCards={cards} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label="Boards"
        title="QUADROS ESTILO TRELLO"
        subtitle="Organize fluxos visuais com listas, cards, labels e checklists."
        actions={
          <>
            <Button variant="secondary" onClick={() => futureFeature("Atualizar do Trello")}>
              <RefreshCw className="h-4 w-4" /> Atualizar do Trello
            </Button>
            <Button variant="primary" onClick={() => futureFeature("Novo quadro")}>
              <Plus className="h-4 w-4" /> Novo quadro
            </Button>
          </>
        }
      />
      <BoardGrid boards={boards} onOpen={setOpenBoardId} />
    </div>
  );
}
