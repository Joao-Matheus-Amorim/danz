import {
  documents as mockDocuments,
  driveFolders as mockDriveFiles,
  sheets as mockSheets,
} from "@/lib/mock-data";
import { getCurrentWorkspaceId } from "@/lib/repositories/workspace";
import { getSupabase } from "@/lib/supabase";
import type {
  DocumentItem,
  DriveFile,
  DriveItemKind,
  DriveSource,
  SheetItem,
} from "@/lib/types";

interface DriveFileRow {
  id: string;
  name: string;
  kind: string;
  file_type: string;
  owner_name: string;
  source: string;
  modified_at: string;
}

interface DocumentRow {
  id: string;
  title: string;
  owner_name: string;
  updated_at: string;
}

interface SheetRow {
  id: string;
  title: string;
  owner_name: string;
  updated_at: string;
}

const driveKinds = new Set<DriveItemKind>(["folder", "file"]);
const driveSources = new Set<DriveSource>([
  "meu-drive",
  "compartilhados",
  "recentes",
]);

function asDriveKind(value: string): DriveItemKind {
  return driveKinds.has(value as DriveItemKind)
    ? (value as DriveItemKind)
    : "file";
}

function asDriveSource(value: string): DriveSource {
  return driveSources.has(value as DriveSource)
    ? (value as DriveSource)
    : "meu-drive";
}

function mapDriveFile(row: DriveFileRow): DriveFile {
  return {
    id: row.id,
    name: row.name,
    kind: asDriveKind(row.kind),
    fileType: row.file_type,
    owner: row.owner_name,
    source: asDriveSource(row.source),
    modifiedAt: row.modified_at,
  };
}

function mapDocument(row: DocumentRow): DocumentItem {
  return {
    id: row.id,
    title: row.title,
    owner: row.owner_name,
    updatedAt: row.updated_at,
  };
}

function mapSheet(row: SheetRow): SheetItem {
  return {
    id: row.id,
    title: row.title,
    owner: row.owner_name,
    updatedAt: row.updated_at,
  };
}

async function requireWorkspaceId(): Promise<string> {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }
  return workspaceId;
}

export async function listDriveFiles(): Promise<DriveFile[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return mockDriveFiles;
  }

  const workspaceId = await requireWorkspaceId();
  const { data, error } = await supabase
    .from("drive_files")
    .select("id, name, kind, file_type, owner_name, source, modified_at")
    .eq("workspace_id", workspaceId)
    .order("modified_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapDriveFile(row as DriveFileRow));
}

export async function listDocuments(): Promise<DocumentItem[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return mockDocuments;
  }

  const workspaceId = await requireWorkspaceId();
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, owner_name, updated_at")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapDocument(row as DocumentRow));
}

export async function listSheets(): Promise<SheetItem[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return mockSheets;
  }

  const workspaceId = await requireWorkspaceId();
  const { data, error } = await supabase
    .from("sheets")
    .select("id, title, owner_name, updated_at")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapSheet(row as SheetRow));
}
