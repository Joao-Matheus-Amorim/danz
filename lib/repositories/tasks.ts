import { currentProfile, tasks as mockTasks } from "@/lib/mock-data";
import { getSupabase } from "@/lib/supabase";
import { getCurrentWorkspaceId } from "@/lib/repositories/workspace";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

interface TaskRow {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string;
  client_id: string | null;
  due_date: string;
  done: boolean;
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assignee_id,
    clientId: row.client_id ?? undefined,
    dueDate: row.due_date,
    done: row.done,
  };
}

async function getCurrentProfileId(): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) return currentProfile.id;

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error("Sessao ausente para carregar tarefas.");
  return data.user.id;
}

export async function listMyTasks(): Promise<Task[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return mockTasks.filter((task) => task.assigneeId === currentProfile.id);
  }

  const profileId = await getCurrentProfileId();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, status, priority, assignee_id, client_id, due_date, done")
    .eq("assignee_id", profileId)
    .order("done", { ascending: true })
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapTask(row as TaskRow));
}

export async function createTask(input: {
  title: string;
  dueDate?: string;
  priority?: TaskPriority;
}): Promise<Task> {
  const supabase = getSupabase();
  const title = input.title.trim();
  if (!title) throw new Error("Informe o titulo da tarefa.");

  const dueDate = input.dueDate ?? new Date().toISOString().slice(0, 10);
  const priority = input.priority ?? "media";

  if (!supabase) {
    return {
      id: `task_${crypto.randomUUID()}`,
      title,
      status: "todo",
      priority,
      assigneeId: currentProfile.id,
      dueDate,
      done: false,
    };
  }

  const [workspaceId, profileId] = await Promise.all([
    getCurrentWorkspaceId(),
    getCurrentProfileId(),
  ]);

  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id: workspaceId,
      title,
      status: "todo",
      priority,
      assignee_id: profileId,
      due_date: dueDate,
      done: false,
    })
    .select("id, title, status, priority, assignee_id, client_id, due_date, done")
    .single();

  if (error) throw error;
  return mapTask(data as TaskRow);
}

export async function setTaskDone(taskId: string, done: boolean): Promise<Task> {
  const supabase = getSupabase();

  if (!supabase) {
    const existing = mockTasks.find((task) => task.id === taskId);
    if (!existing) throw new Error("Tarefa nao encontrada.");
    return {
      ...existing,
      done,
      status: done ? "done" : "todo",
    };
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      done,
      status: done ? "done" : "todo",
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select("id, title, status, priority, assignee_id, client_id, due_date, done")
    .single();

  if (error) throw error;
  return mapTask(data as TaskRow);
}
