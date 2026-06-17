import { currentProfile } from "@/lib/mock-data";
import { getSupabase } from "@/lib/supabase";

export async function getCurrentProfileId(): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) return currentProfile.id;

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error("Sessao ausente.");
  return data.user.id;
}
