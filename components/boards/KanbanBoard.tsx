"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "@/components/boards/KanbanColumn";
import { KanbanCard } from "@/components/boards/KanbanCard";
import type { BoardCard, BoardColumn } from "@/lib/types";

/**
 * Quadro kanban com drag and drop (dnd-kit) entre colunas.
 * Estado local (mock) — a persistência da nova ordem/coluna chega na Fase 3.
 */
export function KanbanBoard({
  columns,
  initialCards,
}: {
  columns: BoardColumn[];
  initialCards: BoardCard[];
}) {
  const [cards, setCards] = React.useState<BoardCard[]>(initialCards);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const cardsOf = (columnId: string) =>
    cards
      .filter((c) => c.columnId === columnId)
      .sort((a, b) => a.order - b.order);

  const findColumnId = (id: string): string | undefined => {
    if (columns.some((c) => c.id === id)) return id;
    return cards.find((c) => c.id === id)?.columnId;
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeCol = findColumnId(String(active.id));
    const overCol = findColumnId(String(over.id));
    if (!activeCol || !overCol) return;

    setCards((prev) => {
      const activeIndex = prev.findIndex((c) => c.id === active.id);
      if (activeIndex === -1) return prev;

      // Mesma coluna: reordena. Coluna diferente: move.
      if (activeCol === overCol && active.id !== over.id) {
        const colCards = prev.filter((c) => c.columnId === activeCol);
        const from = colCards.findIndex((c) => c.id === active.id);
        const to = colCards.findIndex((c) => c.id === over.id);
        if (from === -1 || to === -1) return prev;
        const reordered = arrayMove(colCards, from, to).map((c, i) => ({
          ...c,
          order: i,
        }));
        return prev.map((c) => reordered.find((r) => r.id === c.id) ?? c);
      }

      if (activeCol !== overCol) {
        return prev.map((c) =>
          c.id === active.id ? { ...c, columnId: overCol } : c
        );
      }
      return prev;
    });
  };

  const activeCard = cards.find((c) => c.id === activeId) ?? null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn key={col.id} column={col} cards={cardsOf(col.id)} />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? <KanbanCard card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
