import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variavel ${name} nao configurada.`);
  return value;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
    const anonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Sessao ausente." }, { status: 401 });
    }

    const body = (await request.json()) as { email?: string; name?: string; role?: string };
    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim();
    const role = body.role;
    const validRoles = ["owner", "admin", "gestor", "operador"];

    if (!email || !name || !role || !validRoles.includes(role)) {
      return NextResponse.json({ error: "Dados invalidos para convite." }, { status: 400 });
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
    if (!membership?.workspace_id || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json(
        { error: "Apenas owner/admin podem convidar usuarios." },
        { status: 403 }
      );
    }

    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email
    );
    if (inviteError) throw inviteError;

    const userId = invited.user.id;

    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: userId,
      name,
      initials: initials(name),
      email,
      job_title: "",
    });
    if (profileError) throw profileError;

    const { error: memberError } = await adminClient.from("workspace_members").upsert({
      workspace_id: membership.workspace_id,
      profile_id: userId,
      role,
    });
    if (memberError) throw memberError;

    return NextResponse.json({ id: userId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao convidar usuario." },
      { status: 500 }
    );
  }
}
