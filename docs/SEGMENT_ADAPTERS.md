# Grupo 4 — Segment Adapters

Camada incremental para transformar o fluxo Dental em uma base reutilizável por segmento, sem quebrar o job atual.

---

## Objetivo

Separar regras específicas de segmento da execução operacional.

No momento, o caso inicial continua sendo **odontologia / Dental Leads**, mas a estrutura permite adicionar novos segmentos sem duplicar toda a lógica de preenchimento.

---

## Decisão de implementação

O `dentalSheetFill.js` continua existindo como job operacional estável.

A mudança é interna:

```text
src/jobs/dentalSheetFill.js
  -> usa src/segments
  -> resolve adapter por segment
  -> mantém exports antigos por compatibilidade
```

---

## Estrutura adicionada

```text
src/segments/
  index.js
  generic/
    index.js
  odontologia/
    index.js
    campaignMatcher.js
    fields.js
```

---

## Contrato inicial do adapter

```js
{
  segment,
  defaultModule,
  allowedFields,
  defaultFields,
  matchMetricToUnit(row, unit),
  filterRowsForUnit(rows, unit),
  parseFields(fields),
  buildFieldUpdates({ unit, sheetName, row, total, selectedFields })
}
```

---

## Adapter odontologia

Responsável por:

- identificar campanhas por `campaignMatch`;
- suportar `ids`, `exact` e `contains`;
- aplicar filtro apenas quando a unidade usa `shared_ad_account`;
- validar campos `leads`, `value` e `cpl`;
- montar updates de células preservando o contrato da planilha Dental.

---

## Adapter genérico

O adapter `generic` é um fallback seguro.

Ele reaproveita o comportamento atual de odontologia por enquanto, apenas para evitar quebra quando um segmento desconhecido aparecer.

Antes de usar em produção para outro nicho, o segmento deve ganhar um adapter próprio.

---

## Compatibilidade preservada

O job Dental continua exportando:

- `metricMatchesUnit`;
- `filterRowsForUnit`;
- `parseFields`;
- `buildFieldUpdates`.

Essas funções agora delegam para os adapters, mas mantêm o contrato externo.

---

## Validação esperada

```bash
npm run check
npm test
npm run registry:list -- --state SP
npm run registry:list -- --state BA
npm run registry:validate
npm run dental:fill:dry -- --state SP --day 2026-05-10
```

---

## Próximos passos

1. Criar adapters específicos para novos segmentos.
2. Remover dependência semântica de `dentalSheetFill` quando houver um job genérico de preenchimento.
3. Levar delivery real para `log`, `notify` e `approval`.
