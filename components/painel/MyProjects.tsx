import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { boards } from "@/lib/mock-data";
import { ROUTES } from "@/lib/routes";

/** Bloco "Meus projetos" — boards em que o usuário participa (mock: todos). */
export function MyProjects() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-neon" />
          <p className="dl-label">Meus projetos</p>
        </div>
        <div className="space-y-2">
          {boards.slice(0, 4).map((b) => (
            <Link
              key={b.id}
              href={ROUTES.boards}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface-muted p-3 transition-colors hover:border-neon-border"
            >
              <span className="text-sm text-content">{b.title}</span>
              <span className="text-[11px] text-content-muted">
                {b.cardsCount} cards
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
