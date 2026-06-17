"use client";

import * as React from "react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase";
import { BRAND } from "@/lib/constants";
import {
  BRIEFING_FORM_FIELDS,
  type BriefingResponse,
} from "@/lib/briefing-form";

interface FormMeta {
  clientName: string;
  monthRef: string;
}

type Status = "loading" | "ready" | "notfound" | "submitted" | "unavailable";

function emptyForm(): BriefingResponse {
  return Object.fromEntries(BRIEFING_FORM_FIELDS.map((field) => [field.key, ""]));
}

export function PublicBriefingForm({ token }: { token: string }) {
  const [status, setStatus] = React.useState<Status>("loading");
  const [meta, setMeta] = React.useState<FormMeta | null>(null);
  const [form, setForm] = React.useState<BriefingResponse>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const supabase = getSupabase();

    if (!supabase) {
      setStatus("unavailable");
      return;
    }

    void (async () => {
      try {
        const { data, error: rpcError } = await supabase.rpc(
          "public_briefing_form",
          { p_token: token }
        );
        if (!mounted) return;
        if (rpcError) {
          console.error(rpcError);
          setStatus("notfound");
          return;
        }
        const row = Array.isArray(data) ? data[0] : null;
        if (!row) {
          setStatus("notfound");
          return;
        }
        if (row.submitted) {
          setStatus("submitted");
          return;
        }
        setMeta({ clientName: row.client_name, monthRef: row.month_ref });
        setStatus("ready");
      } catch (rejection) {
        // A promise da RPC pode rejeitar (offline, CORS, Supabase inacessivel)
        // antes de virar um erro estruturado; evita ficar preso no spinner.
        if (!mounted) return;
        console.error(rejection);
        setStatus("notfound");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  async function handleSubmit() {
    if (submitting) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setSubmitting(true);
    setError(null);

    const payload: BriefingResponse = Object.fromEntries(
      BRIEFING_FORM_FIELDS.map((field) => [field.key, form[field.key]?.trim() ?? ""])
    );

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "submit_briefing_response",
        { p_token: token, p_response: payload }
      );

      if (rpcError) {
        console.error(rpcError);
        setError("Não foi possível enviar. Tente novamente em instantes.");
        return;
      }
      if (data === false) {
        // Token invalido ou ja respondido.
        setStatus("submitted");
        return;
      }
      setStatus("submitted");
    } catch (rejection) {
      // A promise da RPC pode rejeitar (offline, CORS, Supabase inacessivel)
      // em vez de retornar um erro estruturado.
      console.error(rejection);
      setError("Não foi possível enviar. Verifique sua conexão e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neon-border bg-neon/[0.10] font-bold text-neon-text shadow-neon">
          {BRAND.shortName}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-content">{BRAND.system}</p>
          <p className="text-[11px] text-content-muted">{BRAND.legalName}</p>
        </div>
      </div>

      {status === "loading" && (
        <Card>
          <CardContent className="p-8 text-center text-sm text-content-muted">
            Carregando formulário...
          </CardContent>
        </Card>
      )}

      {status === "unavailable" && (
        <Card>
          <CardContent className="p-8 text-center text-sm text-content-muted">
            Formulário indisponível neste ambiente.
          </CardContent>
        </Card>
      )}

      {status === "notfound" && (
        <Card>
          <CardContent className="space-y-2 p-8 text-center">
            <p className="text-base font-semibold text-content">Link inválido</p>
            <p className="text-sm text-content-muted">
              Este formulário não foi encontrado. Verifique o link com a equipe.
            </p>
          </CardContent>
        </Card>
      )}

      {status === "submitted" && (
        <Card>
          <CardContent className="space-y-3 p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-neon-text" />
            <p className="text-base font-semibold text-content">
              Briefing recebido!
            </p>
            <p className="text-sm text-content-muted">
              Obrigado. Já recebemos suas informações e a equipe dará sequência.
            </p>
          </CardContent>
        </Card>
      )}

      {status === "ready" && meta && (
        <Card>
          <CardContent className="space-y-5 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-neon-text" />
              <div>
                <h1 className="text-lg font-semibold text-content">
                  Briefing — {meta.clientName}
                </h1>
                <p className="text-sm text-content-muted">
                  Referência {meta.monthRef}. Preencha o que for relevante e envie.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {BRIEFING_FORM_FIELDS.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={`bf-${field.key}`}>{field.label}</Label>
                  {field.multiline ? (
                    <Textarea
                      id={`bf-${field.key}`}
                      value={form[field.key] ?? ""}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, [field.key]: event.target.value }))
                      }
                      placeholder={field.placeholder}
                      rows={3}
                      disabled={submitting}
                    />
                  ) : (
                    <Input
                      id={`bf-${field.key}`}
                      value={form[field.key] ?? ""}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, [field.key]: event.target.value }))
                      }
                      placeholder={field.placeholder}
                      disabled={submitting}
                    />
                  )}
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-alert">{error}</p>}

            <Button
              variant="primary"
              className="w-full"
              onClick={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting ? "Enviando..." : "Enviar briefing"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
