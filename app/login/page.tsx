"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, LogIn, Sparkles, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="rounded-2xl border border-neon-border bg-white/[0.03] px-5 py-4 text-sm text-content-muted shadow-neon">
            Carregando login...
          </div>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || ROUTES.dashboard;
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pendingAction, setPendingAction] = React.useState<"login" | "signup" | null>(null);

  React.useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next);
    });
  }, [next, router]);

  async function authenticate(mode: "login" | "signup") {
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      router.push(ROUTES.dashboard);
      return;
    }

    setPendingAction(mode);

    const credentials = { email, password };
    const { error: authError } =
      mode === "login"
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp({
            ...credentials,
            options: { data: { name: email.split("@")[0] || "DL" } },
          });

    setPendingAction(null);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.replace(next);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md border-neon-border shadow-neon">
        <CardContent className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 animate-pulse-dot rounded-full bg-neon/[0.12] blur-2xl" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-neon-border bg-neon/[0.08] shadow-neon-strong">
                <Sparkles className="h-6 w-6 text-neon" />
              </div>
            </div>
            <p className="dl-label">{BRAND.legalName}</p>
            <h1 className="mt-1 text-xl font-bold text-content">{BRAND.system}</h1>
            <p className="mt-1 text-sm text-content-muted">
              Acesse a central operacional do workspace.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void authenticate("login");
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@dental-lead.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={isSupabaseConfigured}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={isSupabaseConfigured}
                minLength={isSupabaseConfigured ? 6 : undefined}
              />
            </div>

            {error ? (
              <div className="flex gap-2 rounded-xl border border-alert/30 bg-alert/[0.08] p-3 text-xs text-alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <Button type="submit" variant="primary" className="w-full" disabled={pendingAction !== null}>
              {pendingAction === "login" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Entrar
            </Button>

            {isSupabaseConfigured ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={pendingAction !== null}
                onClick={() => void authenticate("signup")}
              >
                {pendingAction === "signup" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Criar acesso
              </Button>
            ) : null}
          </form>

          <p className="mt-4 text-center text-[11px] text-content-muted">
            {isSupabaseConfigured
              ? "Supabase Auth ativo neste ambiente."
              : "Modo mock: configure NEXT_PUBLIC_SUPABASE_* para ativar Supabase Auth."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
