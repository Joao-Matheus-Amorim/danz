"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckSquare, Edit3, Trash2 } from "lucide-react";
import type { BoardCard as BoardCardType } from "@/lib/types";
import { BOARD_LABEL_STYLE, BOARD_LABEL_TEXT } from "@/lib/constants";
import { getProfileById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Card arrastável de uma coluna kanban (dnd-kit sortable). */
export function KanbanCard({
  card,
  onEdit,
  onDelete,
  pending = false,
  canDrag = true,
}: {
  card: BoardCardType;
  onEdit?: (card: BoardCardType) => void;
  onDelete?: (card: BoardCardType) => void;
  pending?: boolean;
  canDrag?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const assignee = getProfileById(card.assigneeId);
  const showActions = Boolean(onEdit || onDelete);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...(canDrag ? listeners : {})}
      className={cn(
        "group relative rounded-xl border border-white/[0.06] bg-surface p-3 shadow-card transition-shadow",
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        isDragging && "opacity-50 shadow-neon"
      )}
    >
      {showActions && (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          {onEdit && (
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onEdit(card)}
              className="rounded-md bg-surface/80 p-1 text-content-muted transition-colors hover:bg-white/[0.08] hover:text-content"
              aria-label="Editar card"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onDelete(card)}
              disabled={pending}
              className="rounded-md bg-surface/80 p-1 text-content-muted transition-colors hover:bg-alert/[0.12] hover:text-alert disabled:cursor-wait disabled:opacity-60"
              aria-label="Excluir card"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {card.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.labels.map((l) => (
            <span
              key={l}
              className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium text-content", BOARD_LABEL_STYLE[l])}
            >
              {BOARD_LABEL_TEXT[l]}
            </span>
          ))}
        </div>
      )}

      <p className={cn("text-sm text-content", showActions && "pr-12")}>
        {card.title}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[11px] text-content-muted">
          <CheckSquare className="h-3.5 w-3.5" />
          {card.checklistDone}/{card.checklistTotal}
        </span>
        {assignee && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-neon-border bg-neon/[0.10] text-[10px] font-semibold text-neon-text">
            {assignee.initials}
          </span>
        )}
      </div>
    </div>
  );
}
