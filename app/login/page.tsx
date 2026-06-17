"use client";

import { useRouter } from "next/navigation";
import { Sparkles, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";

/**
 * Tela de login. No MVP a autenticação é simbólica — qualquer submit leva
 * ao dashboard. A auth real (Supabase Auth) chega na Fase 2.
 */
export default function LoginPage() {
  const router = useRouter();

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
              router.push(ROUTES.dashboard);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="voce@dental-lead.com.br" />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              <LogIn className="h-4 w-4" /> Entrar
            </Button>
          </form>

          <p className="mt-4 text-center text-[11px] text-content-muted">
            Autenticação real (Supabase Auth) chega na Fase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
