import { profiles as mockProfiles } from "@/lib/mock-data";
import { getCurrentWorkspaceId } from "@/lib/repositories/workspace";
import { getSupabase } from "@/lib/supabase";
import type { Profile, ProfileRole } from "@/lib/types";

let mockMembersStore: Profile[] = [...mockProfiles];

interface MemberRow {
  role: ProfileRole;
  manager_id: string | null;
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
    managerId: row.manager_id,
  };
}

export async function getWorkspaceMembers(): Promise<Profile[]> {
  const supabase = getSupabase();
  if (!supabase) return [...mockMembersStore];

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, manager_id, profiles ( id, name, initials, email, job_title )")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as unknown as MemberRow[]).map(mapMemberRow);
}

function assertCanChangeOwnership(members: Profile[], profileId: string, nextRole?: ProfileRole) {
  if (nextRole === "owner") {
    throw new Error("Transferencia de propriedade nao e suportada por aqui.");
  }
  const target = members.find((member) => member.id === profileId);
  const owners = members.filter((member) => member.role === "owner");
  if (target?.role === "owner" && owners.length <= 1) {
    throw new Error("O workspace precisa de ao menos um proprietario.");
  }
}

export async function updateMemberRole(profileId: string, role: ProfileRole): Promise<Profile[]> {
  const supabase = getSupabase();
  if (!supabase) {
    assertCanChangeOwnership(mockMembersStore, profileId, role);
    mockMembersStore = mockMembersStore.map((member) =>
      member.id === profileId ? { ...member, role } : member
    );
    return [...mockMembersStore];
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error("Usuario autenticado nao esta vinculado a um workspace.");

  const members = await getWorkspaceMembers();
  assertCanChangeOwnership(members, profileId, role);

  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("workspace_id", workspaceId)
    .eq("profile_id", profileId);

  if (error) throw error;
  return getWorkspaceMembers();
}

export async function updateMemberManager(
  profileId: string,
  managerId: string | null
): Promise<Profile[]> {
  if (managerId === profileId) {
    throw new Error("Um usuario nao pode ser gestor de si mesmo.");
  }

  const supabase = getSupabase();
  if (!supabase) {
    mockMembersStore = mockMembersStore.map((member) =>
      member.id === profileId ? { ...member, managerId } : member
    );
    return [...mockMembersStore];
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error("Usuario autenticado nao esta vinculado a um workspace.");

  const { error } = await supabase
    .from("workspace_members")
    .update({ manager_id: managerId })
    .eq("workspace_id", workspaceId)
    .eq("profile_id", profileId);

  if (error) throw error;
  return getWorkspaceMembers();
}

export async function removeMember(profileId: string): Promise<Profile[]> {
  const supabase = getSupabase();
  if (!supabase) {
    assertCanChangeOwnership(mockMembersStore, profileId);
    mockMembersStore = mockMembersStore.filter((member) => member.id !== profileId);
    return [...mockMembersStore];
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error("Usuario autenticado nao esta vinculado a um workspace.");

  const members = await getWorkspaceMembers();
  assertCanChangeOwnership(members, profileId);

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
      { id, name, initials, email, role: input.role, jobTitle: "", managerId: null },
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
