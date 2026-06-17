/**
 * Campos fixos do formulario publico de briefing. A resposta e gravada como
 * jsonb (chave -> texto) na coluna `briefing_items.response`. Compartilhado entre
 * a rota publica (coleta) e a UI da agencia (exibicao).
 */
export interface BriefingFormField {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

export const BRIEFING_FORM_FIELDS: BriefingFormField[] = [
  {
    key: "objetivo",
    label: "Objetivo do mês",
    placeholder: "O que você quer alcançar neste mês?",
    multiline: true,
  },
  {
    key: "ofertas",
    label: "Ofertas e promoções",
    placeholder: "Promoções, condições especiais, destaques do mês.",
    multiline: true,
  },
  {
    key: "datas",
    label: "Datas importantes",
    placeholder: "Lançamentos, eventos, feriados relevantes.",
  },
  {
    key: "observacoes",
    label: "Observações",
    placeholder: "Qualquer outra informação que devemos saber.",
    multiline: true,
  },
  {
    key: "materiais",
    label: "Link de materiais",
    placeholder: "Drive, fotos, logos, vídeos (cole o link).",
  },
];

export type BriefingResponse = Record<string, string>;
