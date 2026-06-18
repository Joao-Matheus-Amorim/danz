"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { KanbanCard } from "@/components/boards/KanbanCard";
import type { BoardCard, BoardColumn as BoardColumnType } from "@/lib/types";

export function KanbanColumn({
  column,
  cards,
  onCreateCard,
  onEditCard,
  onDeleteCard,
  pendingCardId,
  canDrag = true,
}: {
  column: BoardColumnType;
  cards: BoardCard[];
  onCreateCard?: (columnId: string) => void;
  onEditCard?: (card: BoardCard) => void;
  onDeleteCard?: (card: BoardCard) => void;
  pendingCardId?: string | null;
  canDrag?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-2xl border border-white/[0.06] bg-surface-muted">
      <div className="flex items-center justify-between px-3 py-2.5">
        <p className="text-sm font-medium text-content">
          {column.title}
          <span className="ml-2 text-xs text-content-muted">{cards.length}</span>
        </p>
        {onCreateCard && (
          <button
            type="button"
            onClick={() => onCreateCard(column.id)}
            className="rounded-lg p-1 text-content-muted transition-colors hover:bg-white/[0.06] hover:text-content"
            aria-label="Adicionar card"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 rounded-b-2xl p-2 transition-colors ${
          isOver ? "bg-neon/[0.04]" : ""
        }`}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              pending={pendingCardId === card.id}
              canDrag={canDrag}
            />
          ))}
        </SortableContext>
        {cards.length === 0 && (
          <p className="py-6 text-center text-xs text-content-muted">
            Solte cards aqui
          </p>
        )}
      </div>
    </div>
  );
}
