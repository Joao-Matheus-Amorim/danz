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
    const anonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Sessao ausente." }, { status: 401 });
    }

    const metaAccessToken = process.env.META_ACCESS_TOKEN;
    if (!metaAccessToken) {
      return NextResponse.json(
        { error: "Configure META_ACCESS_TOKEN para vincular contas de anuncio." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const adAccountId = (body?.adAccountId as string | undefined)?.trim();
    if (!adAccountId) {
      return NextResponse.json({ error: "Informe adAccountId." }, { status: 400 });
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: membership, error: membershipError } = await callerClient
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
    if (!["owner", "admin"].includes(String(membership.role))) {
      return NextResponse.json(
        { error: "Apenas owner/admin podem vincular contas de anuncio." },
        { status: 403 }
      );
    }

    const client = new MetaAdsClient(metaAccessToken, process.env.META_API_VERSION || "v19.0");
    const account = await client.validateAdAccount(adAccountId);

    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: record, error: insertError } = await adminClient
      .from("ad_accounts")
      .upsert(
        { workspace_id: membership.workspace_id, external_id: account.id, name: account.name },
        { onConflict: "workspace_id,external_id" }
      )
      .select("id, external_id, name")
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(record);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao vincular conta de anuncio." },
      { status: 500 }
    );
  }
}
