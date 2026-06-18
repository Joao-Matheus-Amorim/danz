import { profiles as mockProfiles } from "@/lib/mock-data";
import { getCurrentWorkspaceId } from "@/lib/repositories/workspace";
import { getSupabase } from "@/lib/supabase";
import type { Profile, ProfileRole } from "@/lib/types";

let mockMembersStore: Profile[] = [...mockProfiles];

interface MemberRow {
  role: ProfileRole;
  profiles: {
    id: string;
    name: string;
    initials: string;
    email: string;
    job_title: string;
  };
}

function mapMemberRow(row: MemberRow): Profile {
  return {
    id: row.profiles.id,
    name: row.profiles.name,
    initials: row.profiles.initials,
    email: row.profiles.email,
    role: row.role,
    jobTitle: row.profiles.job_title,
  };
}

export async function getWorkspaceMembers(): Promise<Profile[]> {
  const supabase = getSupabase();
  if (!supabase) return [...mockMembersStore];

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, profiles ( id, name, initials, email, job_title )")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as unknown as MemberRow[]).map(mapMemberRow);
}

export async function updateMemberRole(profileId: string, role: ProfileRole): Promise<Profile[]> {
  const supabase = getSupabase();
  if (!supabase) {
    mockMembersStore = mockMembersStore.map((member) =>
      member.id === profileId ? { ...member, role } : member
    );
    return [...mockMembersStore];
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error("Usuario autenticado nao esta vinculado a um workspace.");

  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("workspace_id", workspaceId)
    .eq("profile_id", profileId);

  if (error) throw error;
  return getWorkspaceMembers();
}

export async function removeMember(profileId: string): Promise<Profile[]> {
  const supabase = getSupabase();
  if (!supabase) {
    mockMembersStore = mockMembersStore.filter((member) => member.id !== profileId);
    return [...mockMembersStore];
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error("Usuario autenticado nao esta vinculado a um workspace.");

  const members = await getWorkspaceMembers();
  const target = members.find((member) => member.id === profileId);
  const owners = members.filter((member) => member.role === "owner");
  if (target?.role === "owner" && owners.length <= 1) {
    throw new Error("O workspace precisa de ao menos um proprietario.");
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("profile_id", profileId);

  if (error) throw error;
  return getWorkspaceMembers();
}

export async function inviteMember(input: {
  email: string;
  name: string;
  role: ProfileRole;
}): Promise<Profile[]> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email || !name) throw new Error("Informe nome e e-mail.");

  const supabase = getSupabase();
  if (!supabase) {
    const id = `u_${Date.now()}`;
    const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
    mockMembersStore = [
      ...mockMembersStore,
      { id, name, initials, email, role: input.role, jobTitle: "" },
    ];
    return [...mockMembersStore];
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Sessao ausente.");

  const response = await fetch("/api/workspace/members/invite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ email, name, role: input.role }),
  });

  const payload = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Nao foi possivel convidar o usuario.");
  }

  return getWorkspaceMembers();
}
