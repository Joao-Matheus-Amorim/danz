import { calendarEvents as mockCalendarEvents } from "@/lib/mock-data";
import { getCurrentProfileId } from "@/lib/repositories/auth";
import { getCurrentWorkspaceId } from "@/lib/repositories/workspace";
import { getSupabase } from "@/lib/supabase";
import type { CalendarEvent, CalendarEventType } from "@/lib/types";

interface CalendarEventRow {
  id: string;
  title: string;
  type: CalendarEventType;
  event_date: string;
  event_time: string | null;
  owner_id: string | null;
  client_id: string | null;
  profiles:
    | { name: string | null }
    | { name: string | null }[]
    | null;
}

export interface CalendarEventInput {
  title: string;
  type: CalendarEventType;
  date: string;
  time?: string;
}

let mockCalendarEventStore: CalendarEvent[] = [...mockCalendarEvents];

function getProfileName(
  profile:
    | { name: string | null }
    | { name: string | null }[]
    | null
): string | undefined {
  const value = Array.isArray(profile) ? profile[0] : profile;
  return value?.name ?? undefined;
}

function mapCalendarEvent(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    date: row.event_date,
    time: row.event_time?.slice(0, 5) ?? undefined,
    ownerId: row.owner_id ?? undefined,
    ownerName: getProfileName(row.profiles),
    clientId: row.client_id ?? undefined,
  };
}

const calendarSelect =
  "id, title, type, event_date, event_time, owner_id, client_id, profiles(name)";

export async function listCalendarEvents(): Promise<CalendarEvent[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return mockCalendarEventStore;
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .select(calendarSelect)
    .eq("workspace_id", workspaceId)
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapCalendarEvent(row as CalendarEventRow));
}

export async function listMyCalendarEvents(): Promise<CalendarEvent[]> {
  const supabase = getSupabase();
  const profileId = await getCurrentProfileId();

  if (!supabase) {
    return mockCalendarEventStore.filter((event) => event.ownerId === profileId);
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .select(calendarSelect)
    .eq("workspace_id", workspaceId)
    .eq("owner_id", profileId)
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapCalendarEvent(row as CalendarEventRow));
}

export async function createCalendarEvent(
  input: CalendarEventInput
): Promise<CalendarEvent> {
  const supabase = getSupabase();
  const title = input.title.trim();
  if (!title) throw new Error("Informe o titulo do evento.");

  const payload = {
    title,
    type: input.type,
    date: input.date,
    time: input.time?.trim() || undefined,
  };

  if (!supabase) {
    const event: CalendarEvent = {
      id: `event_${crypto.randomUUID()}`,
      ...payload,
      ownerId: await getCurrentProfileId(),
    };
    mockCalendarEventStore = [...mockCalendarEventStore, event];
    return event;
  }

  const [workspaceId, profileId] = await Promise.all([
    getCurrentWorkspaceId(),
    getCurrentProfileId(),
  ]);

  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      workspace_id: workspaceId,
      title: payload.title,
      type: payload.type,
      event_date: payload.date,
      event_time: payload.time ?? null,
      owner_id: profileId,
    })
    .select(calendarSelect)
    .single();

  if (error) throw error;
  return mapCalendarEvent(data as CalendarEventRow);
}
