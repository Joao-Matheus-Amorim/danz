import { workspace as mockWorkspace } from "@/lib/mock-data";
import { getSupabase } from "@/lib/supabase";
import type { Workspace } from "@/lib/types";

let mockWorkspaceStore: Workspace = { ...mockWorkspace };

export async function getCurrentWorkspaceId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.workspace_id ?? null;
}

export async function getCurrentWorkspace(): Promise<Workspace | null> {
  const supabase = getSupabase();
  if (!supabase) return { ...mockWorkspaceStore };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return null;

  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, role")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { id: data.id as string, name: data.name as string, role: data.role as string };
}

export async function updateCurrentWorkspace(input: {
  name: string;
  role: string;
}): Promise<Workspace> {
  const name = input.name.trim();
  if (!name) throw new Error("Informe o nome do workspace.");
  const role = input.role.trim();

  const supabase = getSupabase();
  if (!supabase) {
    mockWorkspaceStore = { ...mockWorkspaceStore, name, role };
    return { ...mockWorkspaceStore };
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data, error } = await supabase
    .from("workspaces")
    .update({ name, role, updated_at: new Date().toISOString() })
    .eq("id", workspaceId)
    .select("id, name, role")
    .single();

  if (error) throw error;
  return { id: data.id as string, name: data.name as string, role: data.role as string };
}
