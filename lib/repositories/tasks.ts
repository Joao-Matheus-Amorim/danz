import { currentProfile, tasks as mockTasks } from "@/lib/mock-data";
import { getCurrentProfileId } from "@/lib/repositories/auth";
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
  due_date: string | null;
  done: boolean;
}

let mockTaskStore: Task[] = [...mockTasks];

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assignee_id,
    clientId: row.client_id ?? undefined,
    dueDate: row.due_date ?? undefined,
    done: row.done,
  };
}

export async function listMyTasks(): Promise<Task[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return mockTaskStore.filter((task) => task.assigneeId === currentProfile.id);
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
    .select("id, title, status, priority, assignee_id, client_id, due_date, done")
    .eq("workspace_id", workspaceId)
    .eq("assignee_id", profileId)
    .order("done", { ascending: true })
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapTask(row as TaskRow));
}

export async function listWorkspaceTasks(): Promise<Task[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return [...mockTaskStore];
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, status, priority, assignee_id, client_id, due_date, done")
    .eq("workspace_id", workspaceId)
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
  status?: TaskStatus;
  clientId?: string;
}): Promise<Task> {
  const supabase = getSupabase();
  const title = input.title.trim();
  if (!title) throw new Error("Informe o titulo da tarefa.");

  const dueDate = input.dueDate ?? new Date().toISOString().slice(0, 10);
  const priority = input.priority ?? "media";
  const status = input.status ?? "todo";
  const done = status === "done";

  if (!supabase) {
    const task: Task = {
      id: `task_${crypto.randomUUID()}`,
      title,
      status,
      priority,
      assigneeId: currentProfile.id,
      dueDate,
      clientId: input.clientId || undefined,
      done,
    };
    mockTaskStore = [task, ...mockTaskStore];
    return task;
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
      status,
      priority,
      assignee_id: profileId,
      client_id: input.clientId || null,
      due_date: dueDate,
      done,
    })
    .select("id, title, status, priority, assignee_id, client_id, due_date, done")
    .single();

  if (error) throw error;
  return mapTask(data as TaskRow);
}

export async function setTaskDone(taskId: string, done: boolean): Promise<Task> {
  const supabase = getSupabase();

  if (!supabase) {
    const existing = mockTaskStore.find((task) => task.id === taskId);
    if (!existing) throw new Error("Tarefa nao encontrada.");
    const updated: Task = {
      ...existing,
      done,
      status: done ? "done" : "todo",
    };
    mockTaskStore = mockTaskStore.map((task) =>
      task.id === taskId ? updated : task
    );
    return updated;
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      done,
      status: done ? "done" : "todo",
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .eq("id", taskId)
    .select("id, title, status, priority, assignee_id, client_id, due_date, done")
    .single();

  if (error) throw error;
  return mapTask(data as TaskRow);
}

export async function updateTask(
  taskId: string,
  input: {
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    clientId?: string;
  }
): Promise<Task> {
  const supabase = getSupabase();
  const title = input.title.trim();
  if (!title) throw new Error("Informe o titulo da tarefa.");

  const done = input.status === "done";

  if (!supabase) {
    const existing = mockTaskStore.find((task) => task.id === taskId);
    if (!existing) throw new Error("Tarefa nao encontrada.");
    const updated: Task = {
      ...existing,
      title,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate || undefined,
      clientId: input.clientId || undefined,
      done,
    };
    mockTaskStore = mockTaskStore.map((task) =>
      task.id === taskId ? updated : task
    );
    return updated;
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      title,
      status: input.status,
      priority: input.priority,
      due_date: input.dueDate || null,
      client_id: input.clientId || null,
      done,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .eq("id", taskId)
    .select("id, title, status, priority, assignee_id, client_id, due_date, done")
    .single();

  if (error) throw error;
  return mapTask(data as TaskRow);
}

export async function deleteTask(taskId: string): Promise<void> {
  const supabase = getSupabase();

  if (!supabase) {
    mockTaskStore = mockTaskStore.filter((task) => task.id !== taskId);
    return;
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", taskId);

  if (error) throw error;
}
