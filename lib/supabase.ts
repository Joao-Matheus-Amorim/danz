/**
 * Cliente Supabase — preparado para a Fase 2, sem quebrar o app no MVP.
 *
 * IMPORTANTE (dívida técnica registrada em docs/technical-debt-log.md):
 * No MVP NÃO há banco real. Este módulo apenas expõe a infraestrutura para
 * conexão futura. Se as variáveis de ambiente não existirem, `getSupabase()`
 * retorna `null` e a aplicação continua operando em modo mock.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Indica se o Supabase está configurado neste ambiente. */
export const isSupabaseConfigured = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

/**
 * Retorna o client Supabase ou `null` quando não configurado.
 * Consumidores devem checar `null` e cair para mock-data.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return cached;
}
