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
    const supabaseAnonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Sessao ausente." }, { status: 401 });
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        {
          error:
            "Configure GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_PRIVATE_KEY para exportar para o Sheets.",
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const spreadsheetId = body?.spreadsheetId as string | undefined;
    const sheetName = body?.sheetName as string | undefined;
    const rows = body?.rows as Record<string, unknown>[] | undefined;
    const mode = (body?.mode as string | undefined) ?? "replace";

    if (!spreadsheetId || !sheetName || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: "Informe spreadsheetId, sheetName e rows." },
        { status: 400 }
      );
    }
    if (!["replace", "append"].includes(mode)) {
      return NextResponse.json({ error: "mode deve ser replace ou append." }, { status: 400 });
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
    if (!["owner", "admin", "gestor"].includes(String(membership.role))) {
      return NextResponse.json(
        { error: "Apenas perfis com permissao de edicao podem exportar para o Sheets." },
        { status: 403 }
      );
    }

    const client = new GoogleSheetsClient();
    const result =
      mode === "append"
        ? await client.appendRows(spreadsheetId, sheetName, rows)
        : await client.clearAndWrite(spreadsheetId, sheetName, rows);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao exportar para o Sheets." },
      { status: 500 }
    );
  }
}
