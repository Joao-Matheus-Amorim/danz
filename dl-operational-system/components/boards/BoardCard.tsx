"use client";

import { MoreVertical, Layers, SquareStack } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import type { Board } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Card de um quadro no grid de boards. */
export function BoardCard({
  board,
  onOpen,
}: {
  board: Board;
  onOpen: (id: string) => void;
}) {
  const { futureFeature } = useToast();

  return (
    <Card className="group overflow-hidden transition-colors hover:border-neon-border">
      <div className={cn("h-20 w-full bg-gradient-to-br", board.gradient)} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onOpen(board.id)}
            className="text-left text-base font-semibold text-content hover:text-neon"
          >
            {board.title}
          </button>
          <button
            type="button"
            onClick={() => futureFeature("Menu do quadro")}
            className="rounded-lg p-1 text-content-muted transition-colors hover:bg-white/[0.06] hover:text-content"
            aria-label="Opções do quadro"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-content-muted">
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" /> {board.columnsCount} listas
          </span>
          <span className="inline-flex items-center gap-1">
            <SquareStack className="h-3.5 w-3.5" /> {board.cardsCount} cards
          </span>
        </div>
      </div>
    </Card>
  );
}
