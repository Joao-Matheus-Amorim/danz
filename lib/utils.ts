/**
 * Utilitários puros e reutilizáveis.
 * Sem dependências de React — apenas funções de apoio e formatação.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Combina classes tailwind resolvendo conflitos (padrão shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata data ISO em pt-BR usando um pattern date-fns. */
export function formatDate(iso: string, pattern = "dd 'de' MMM yyyy"): string {
  return format(parseISO(iso), pattern, { locale: ptBR });
}

/** Formata mês/ano por extenso (ex.: "Junho de 2026"). */
export function formatMonthYear(date: Date): string {
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

/** Converte centavos em moeda BRL. */
export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Formata número grande com separador de milhar pt-BR. */
export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

/** Variação percentual formatada com sinal (ex.: "-100%", "+12%"). */
export function formatDelta(pct: number | null): string {
  if (pct === null) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

/** Iniciais a partir de um nome completo (máx. 2 letras). */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Gera um id simples para entidades criadas em estado local (mock). */
export function localId(prefix = "tmp"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
