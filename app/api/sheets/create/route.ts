import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleSheetsClient } from "@/lib/integrations/google-sheets";

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

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        {
          error:
            "Configure GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_PRIVATE_KEY para criar planilhas.",
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const title = (body?.title as string | undefined)?.trim();
    if (!title) {
      return NextResponse.json({ error: "Informe title." }, { status: 400 });
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
        { error: "Apenas owner/admin podem criar planilhas." },
        { status: 403 }
      );
    }

    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const client = new GoogleSheetsClient();
    const spreadsheetId = await client.createSpreadsheet(title);

    const { data: sheetRecord, error: insertError } = await adminClient
      .from("sheets")
      .insert({
        workspace_id: membership.workspace_id,
        title,
        external_id: spreadsheetId,
      })
      .select("id, title, external_id")
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(sheetRecord);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar planilha." },
      { status: 500 }
    );
  }
}
