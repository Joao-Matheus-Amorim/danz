"use client";

import * as React from "react";
import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { listCampaigns } from "@/lib/repositories/campaigns";
import { ROUTES } from "@/lib/routes";
import type { Campaign } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

/** Resumo de campanhas ativas no dashboard. */
export function CampaignSummary() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    listCampaigns()
      .then((items) => {
        if (mounted) setCampaigns(items);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const activeCampaigns = campaigns.filter((c) => c.status === "ativa");

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Campanhas ativas</CardTitle>
        <Link
          href={ROUTES.campanhas}
          className="inline-flex items-center gap-1 text-xs text-neon-text hover:underline"
        >
          Ver todas <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <CampaignSummaryEmpty text="Carregando campanhas..." />
        ) : activeCampaigns.length === 0 ? (
          <CampaignSummaryEmpty text="Nenhuma campanha em veiculacao no momento." />
        ) : (
          activeCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface-muted p-3"
            >
              <span className="text-sm text-content">{campaign.clientName}</span>
              <span className="text-sm font-medium text-neon-text">
                {formatCurrency(campaign.spendCents)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function CampaignSummaryEmpty({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-4 text-sm text-content-muted">
      <Megaphone className="h-4 w-4 text-content-muted" />
      {text}
    </div>
  );
}
