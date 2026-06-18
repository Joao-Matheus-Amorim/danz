import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MetaAdsClient } from "@/lib/integrations/meta-ads";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variavel ${name} nao configurada.`);
  return value;
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseAnonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Sessao ausente." }, { status: 401 });
    }

    const metaAccessToken = process.env.META_ACCESS_TOKEN;
    if (!metaAccessToken) {
      return NextResponse.json(
        { error: "Configure META_ACCESS_TOKEN para consultar o Meta Ads." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const adAccountRecordId = body?.adAccountRecordId as string | undefined;
    const level = (body?.level as string | undefined) ?? "campaign";
    const since = body?.since as string | undefined;
    const until = body?.until as string | undefined;

    if (!adAccountRecordId || !since || !until) {
      return NextResponse.json(
        { error: "Informe adAccountRecordId, since e until." },
        { status: 400 }
      );
    }
    if (!["campaign", "adset", "ad"].includes(level)) {
      return NextResponse.json(
        { error: "level deve ser campaign, adset ou ad." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: membership, error: membershipError } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (membershipError) throw membershipError;
    if (!membership?.workspace_id) {
      return NextResponse.json(
        { error: "Usuario autenticado nao esta vinculado a um workspace." },
        { status: 403 }
      );
    }

    // ad_accounts.external_id so e gravado por app/api/meta/ad-accounts/link
    // (service role, apos validar a conta na Graph API) — nunca pelo cliente.
    // Por isso essa busca por id+workspace_id e prova valida de ownership.
    const { data: adAccount, error: adAccountError } = await supabase
      .from("ad_accounts")
      .select("external_id")
      .eq("id", adAccountRecordId)
      .eq("workspace_id", membership.workspace_id)
      .maybeSingle();

    if (adAccountError) throw adAccountError;
    if (!adAccount?.external_id) {
      return NextResponse.json(
        { error: "Conta de anuncio nao encontrada neste workspace." },
        { status: 404 }
      );
    }

    const client = new MetaAdsClient(metaAccessToken, process.env.META_API_VERSION || "v19.0");
    const [balance, insights] = await Promise.all([
      client.getBalance(adAccount.external_id),
      client.getInsights(adAccount.external_id, level as "campaign" | "adset" | "ad", since, until),
    ]);

    return NextResponse.json({ balance, insights });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao consultar Meta Ads." },
      { status: 500 }
    );
  }
}
