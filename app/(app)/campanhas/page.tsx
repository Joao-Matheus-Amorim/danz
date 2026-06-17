"use client";

import * as React from "react";
import { Download, Copy, RefreshCw, ImageIcon, CreditCard } from "lucide-react";
import { CampaignHeader } from "@/components/campanhas/CampaignHeader";
import { MetaTokenNotice } from "@/components/campanhas/MetaTokenNotice";
import { CampaignMetrics } from "@/components/campanhas/CampaignMetrics";
import { CampaignClientsTable } from "@/components/campanhas/CampaignClientsTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { listCampaigns } from "@/lib/repositories/campaigns";
import type { Campaign } from "@/lib/types";

export default function CampanhasPage() {
  const { futureFeature, toast } = useToast();
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
        if (mounted) toast("Nao foi possivel carregar campanhas.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  return (
    <div className="space-y-6">
      <CampaignHeader />
      <MetaTokenNotice />

      <Tabs defaultValue="relatorios">
        <TabsList>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="criativos">Criativos</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="relatorios" className="space-y-6">
          <CampaignMetrics campaigns={campaigns} loading={loading} />

          <Card>
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-content">Processar todos</p>
                <p className="text-sm text-content-muted">
                  Busca e consolida os dados de todos os clientes (integração Meta na Fase 5).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select className="w-40" onChange={() => futureFeature("Filtro de período")} defaultValue="7d">
                  <option value="hoje">Hoje</option>
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                </Select>
                <Button variant="secondary" onClick={() => futureFeature("Buscar Todos")}>
                  <RefreshCw className="h-4 w-4" /> Buscar Todos
                </Button>
                <Button variant="outline" onClick={() => futureFeature("Copiar Todos")}>
                  <Copy className="h-4 w-4" /> Copiar Todos
                </Button>
              </div>
            </CardContent>
          </Card>

          <CampaignClientsTable campaigns={campaigns} loading={loading} />
        </TabsContent>

        <TabsContent value="criativos">
          <EmptyState
            icon={ImageIcon}
            title="Criativos"
            description="Galeria de criativos por cliente com performance. Captura via Meta Ads API chega na Fase 5."
          >
            <Button variant="outline" onClick={() => futureFeature("Importar criativos")}>
              <Download className="h-4 w-4" /> Importar criativos
            </Button>
          </EmptyState>
        </TabsContent>

        <TabsContent value="pagamentos">
          <EmptyState
            icon={CreditCard}
            title="Pagamentos &amp; recargas"
            description="Controle de saldo e recargas por cliente. Integração financeira planejada para a Fase 5."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
