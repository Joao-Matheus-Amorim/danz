"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckSquare } from "lucide-react";
import type { BoardCard as BoardCardType } from "@/lib/types";
import { BOARD_LABEL_STYLE, BOARD_LABEL_TEXT } from "@/lib/constants";
import { getProfileById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Card arrastável de uma coluna kanban (dnd-kit sortable). */
export function KanbanCard({ card }: { card: BoardCardType }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const assignee = getProfileById(card.assigneeId);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab rounded-xl border border-white/[0.06] bg-surface p-3 shadow-card transition-shadow active:cursor-grabbing",
        isDragging && "opacity-50 shadow-neon"
      )}
    >
      {card.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.labels.map((l) => (
            <span
              key={l}
              className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium text-background", BOARD_LABEL_STYLE[l])}
            >
              {BOARD_LABEL_TEXT[l]}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-content">{card.title}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[11px] text-content-muted">
          <CheckSquare className="h-3.5 w-3.5" />
          {card.checklistDone}/{card.checklistTotal}
        </span>
        {assignee && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-neon-border bg-neon/[0.10] text-[10px] font-semibold text-neon">
            {assignee.initials}
          </span>
        )}
      </div>
    </div>
  );
}
