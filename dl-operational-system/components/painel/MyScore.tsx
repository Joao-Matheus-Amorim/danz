import { Award, Trophy, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BRAND } from "@/lib/constants";

/** Lateral do meu painel: medalhas, pontuação e cultura. */
export function MyScore() {
  const medals = ["Pontualidade", "Entregas no prazo", "Briefings 100%"];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-neon" />
            <p className="dl-label">Minhas medalhas</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {medals.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 rounded-full border border-neon-border bg-neon/[0.08] px-2.5 py-1 text-[11px] text-neon"
              >
                <Trophy className="h-3 w-3" /> {m}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="dl-label">Minha pontuação</p>
          <p className="mt-2 text-3xl font-bold text-content">
            820 <span className="text-sm font-normal text-content-muted">pts</span>
          </p>
          <div className="mt-3">
            <Progress value={82} />
            <p className="mt-1.5 text-[11px] text-content-muted">
              82% rumo ao próximo nível
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-neon" />
            <p className="dl-label">Cultura {BRAND.shortName}</p>
          </div>
          <p className="text-sm text-content-muted">
            Clareza, ritmo e dono do resultado. Cada entrega aproxima o cliente do
            crescimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
