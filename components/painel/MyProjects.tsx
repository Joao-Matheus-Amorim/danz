import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import type { Board } from "@/lib/types";

export function MyProjects({
  boards,
  loading = false,
}: {
  boards: Board[];
  loading?: boolean;
}) {
  const visibleBoards = boards.slice(0, 4);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-neon-text" />
          <p className="dl-label">Meus projetos</p>
        </div>
        <div className="space-y-2">
          {loading ? (
            <p className="py-4 text-center text-sm text-content-muted">
              Carregando projetos...
            </p>
          ) : visibleBoards.length === 0 ? (
            <p className="py-4 text-center text-sm text-content-muted">
              Nenhum projeto encontrado.
            </p>
          ) : (
            visibleBoards.map((board) => (
              <Link
                key={board.id}
                href={ROUTES.boards}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface-muted p-3 transition-colors hover:border-neon-border"
              >
                <span className="text-sm text-content">{board.title}</span>
                <span className="text-[11px] text-content-muted">
                  {board.cardsCount} cards
                </span>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
