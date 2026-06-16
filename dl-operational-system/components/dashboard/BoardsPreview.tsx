import Link from "next/link";
import { ArrowRight, KanbanSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { boards } from "@/lib/mock-data";
import { ROUTES } from "@/lib/routes";

/** Lista compacta dos boards no dashboard. */
export function BoardsPreview() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Boards</CardTitle>
        <Link
          href={ROUTES.boards}
          className="inline-flex items-center gap-1 text-xs text-neon hover:underline"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {boards.map((b) => (
          <Link
            key={b.id}
            href={ROUTES.boards}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3 transition-colors hover:border-neon-border"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neon-border bg-neon/[0.08] text-neon">
              <KanbanSquare className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm text-content">{b.title}</p>
              <p className="text-[11px] text-content-muted">
                {b.columnsCount} listas · {b.cardsCount} cards
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
