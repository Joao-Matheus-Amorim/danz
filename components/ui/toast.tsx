"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, X } from "lucide-react";

/**
 * Sistema de toast minimalista.
 *
 * Usado principalmente para sinalizar "integração futura" em botões cuja
 * funcionalidade real chegará em fases posteriores — atendendo à regra de
 * que nenhum botão fique sem feedback. Substitui a necessidade de uma lib
 * externa de notificação no MVP.
 */

interface ToastItem {
  id: number;
  message: string;
}

interface ToastContextValue {
  /** Exibe uma mensagem genérica. */
  toast: (message: string) => void;
  /** Atalho para "integração futura" (padrão do projeto). */
  futureFeature: (feature: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const push = React.useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = React.useMemo<ToastContextValue>(
    () => ({
      toast: push,
      futureFeature: (feature) =>
        push(`${feature}: integração real planejada para uma fase futura do roadmap.`),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-neon-border bg-background/95 p-3.5 shadow-neon backdrop-blur-xl"
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-neon" />
              <p className="flex-1 text-sm text-content">{t.message}</p>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                className="text-content-muted transition-colors hover:text-content"
                aria-label="Fechar notificação"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
