import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { dashboardClientUpdates } from "@/lib/mock-data";
import { ROUTES } from "@/lib/routes";

/** Widget "Atualização de clientes" do dashboard. */
export function ClientUpdates() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Atualização de clientes</CardTitle>
        <Link
          href={ROUTES.clientes}
          className="inline-flex items-center gap-1 text-xs text-neon hover:underline"
        >
          Ver carteira <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {dashboardClientUpdates.map((name) => (
          <div
            key={name}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-content-muted">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-sm text-content">{name}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
