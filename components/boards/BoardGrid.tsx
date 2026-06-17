"use client";

import { BoardCard } from "@/components/boards/BoardCard";
import type { Board } from "@/lib/types";

/** Grid responsivo de boards. */
export function BoardGrid({
  boards,
  onOpen,
}: {
  boards: Board[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {boards.map((b) => (
        <BoardCard key={b.id} board={b} onOpen={onOpen} />
      ))}
    </div>
  );
}
