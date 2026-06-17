import { currentProfile } from "@/lib/mock-data";
import { getCurrentWorkspaceId } from "@/lib/repositories/workspace";
import { getSupabase } from "@/lib/supabase";
import type { Profile, ProfileRole } from "@/lib/types";

interface ProfileRow {
  id: string;
  name: string;
  initials: string;
  email: string;
  job_title: string;
}

export async function getCurrentProfileId(): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) return currentProfile.id;

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error("Sessao ausente.");
  return data.user.id;
}

function mapProfile(row: ProfileRow, role: ProfileRole): Profile {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    email: row.email,
    role,
    jobTitle: row.job_title,
  };
}

export async function getCurrentProfile(): Promise<Profile> {
  const supabase = getSupabase();
  if (!supabase) return currentProfile;

  const [profileId, workspaceId] = await Promise.all([
    getCurrentProfileId(),
    getCurrentWorkspaceId(),
  ]);

  const profileQuery = supabase
    .from("profiles")
    .select("id, name, initials, email, job_title")
    .eq("id", profileId)
    .single();

  const membershipQuery = workspaceId
    ? supabase
        .from("workspace_members")
        .select("role")
        .eq("workspace_id", workspaceId)
        .eq("profile_id", profileId)
        .maybeSingle()
    : Promise.resolve({ data: null, error: null });

  const [{ data: profile, error: profileError }, { data: membership, error: membershipError }] =
    await Promise.all([profileQuery, membershipQuery]);

  if (profileError) throw profileError;
  if (membershipError) throw membershipError;

  return mapProfile(profile as ProfileRow, (membership?.role ?? "operador") as ProfileRole);
}
