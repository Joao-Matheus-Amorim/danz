import { PublicBriefingForm } from "@/components/briefings/PublicBriefingForm";

/**
 * Rota publica do formulario de briefing. Fica fora do grupo (app), entao nao
 * passa pelo AuthGate: o cliente preenche sem login. A leitura/gravacao usam as
 * funcoes security-definer do Supabase concedidas ao papel `anon`.
 */
export default function PublicBriefingPage({
  params,
}: {
  params: { token: string };
}) {
  return <PublicBriefingForm token={params.token} />;
}
