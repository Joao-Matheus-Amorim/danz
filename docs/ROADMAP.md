# Roadmap de Implementação — Tráfego Automator

Este roadmap deve ser atualizado a cada bloco de construção completo.

---

## Estado atual do roadmap

| Marco | Nome | Status | Objetivo |
|---|---|---|---|
| M1 | Registry de empresas e clínicas | Em construção funcional | Cadastrar/importar empresas, estados, clínicas, módulos e escopos |
| M2 | Planilha Dental literal | Em construção funcional | Preencher Leads e Valor na planilha real do cliente |
| M3 | Métricas detalhadas | Pendente | Criar abas auxiliares de campanhas, conjuntos, criativos e logs |
| M4 | WhatsApp API | Pendente | Enviar mensagens e alertas conforme módulos habilitados |
| M5 | Painel Admin e Cliente | Pendente | Criar interface para gestão e contas somente leitura |
| M6 | Módulos Admin avançados | Pendente | Subir criativos, criar campanhas e pausar anúncios com aprovação |

---

## M1 — Registry de empresas e clínicas

### Status

Implementado parcialmente e funcional via CLI.

### Entregue

- Empresa `Dental Leads` em `data/companies/dental-leads.json`.
- Clínicas de SP em `data/clients/servicos/odontologia/sp/dental-leads-sp.json`.
- Clínicas da Bahia em `data/clients/servicos/odontologia/ba/dental-leads-ba.json`.
- Loader de empresas.
- Loader de clínicas.
- Filtro por empresa, grupo, segmento, estado, cidade e módulo.
- Validação de registry.
- Derivação automática de colunas da planilha.

### Ajuste profissional aplicado neste bloco

O M1 foi refinado para suportar uma conta Meta Ads central compartilhada por empresa/estado, em vez de exigir uma conta por clínica.

### Próximos itens do M1

- Criar importação CSV/JSON em massa.
- Criar exportação do registry consolidado.
- Adicionar validação de duplicidade de `key`.
- Adicionar validação de conflito de colunas.
- Permitir herança da conta Meta central diretamente da empresa.

---

## M2 — Planilha Dental literal

### Status

Implementado parcialmente e funcional via CLI/dry-run.

### Entregue

- Job `src/jobs/dentalSheetFill.js`.
- Preenchimento cirúrgico de `Leads` e `Valor`.
- Preservação de `CPL`, totais, fórmulas e formatação.
- Suporte a dry-run.
- Suporte a conta Meta Ads central compartilhada.
- Filtro de campanhas por clínica via `campaignMatch`.

### Decisão atual

A fonte de dados do caso Dental é uma conta Meta Ads central. As clínicas são identificadas dentro dela por campanhas.

Fluxo oficial:

```text
Conta Meta central
  -> insights level=campaign
  -> filtrar campanhas por campaignMatch da clínica
  -> somar leads e gasto
  -> escrever Leads e Valor na planilha literal
```

### Próximos itens do M2

- Substituir `act_PREENCHER_CONTA_CENTRAL` pelo ID real da conta central.
- Validar `META_ACCESS_TOKEN` real.
- Validar Google Service Account real.
- Rodar dry-run com uma data única.
- Rodar execução real controlada em uma ou duas clínicas.
- Criar log persistente por execução.

---

## M3 — Métricas detalhadas

### Objetivo

Adicionar abas auxiliares sem alterar a planilha literal do cliente.

### Abas previstas

- `Campanhas`
- `Conjuntos`
- `Criativos`
- `Alertas`
- `Log Execuções`
- `Config`

### Regras

- A planilha literal continua sendo a visão principal do cliente.
- As abas auxiliares servem para auditoria, análise e evolução.
- M3 deve reutilizar o registry do M1 e a coleta Meta do M2.

---

## M4 — WhatsApp API

### Objetivo

Enviar mensagens e alertas pelo WhatsApp conforme módulos habilitados.

### Mensagens iniciais

- Planilha atualizada.
- Erro de execução por clínica.
- Resumo diário.
- Resumo semanal.
- Alerta de CPL alto.
- Alerta de gasto sem lead.

---

## M5 — Painel Admin e Cliente

### Objetivo

Criar interface para gestão e visualização.

### Painel Admin

- Gerenciar empresas.
- Gerenciar clínicas.
- Gerenciar módulos.
- Gerenciar regras.
- Gerenciar usuários.
- Executar jobs manualmente.
- Ver logs.

### Painel Cliente

- Dashboard somente leitura.
- Campanhas.
- Conjuntos.
- Criativos.
- Alertas.
- Relatórios.

---

## M6 — Módulos Admin avançados

### Objetivo

Implementar ações operacionais avançadas para clientes com módulos habilitados.

### Ações previstas

- Upload de criativos.
- Criação de campanhas.
- Criação de conjuntos.
- Pausa de anúncios.
- Campanha teste isolada.
- Aprovação antes de execução.
- Auditoria obrigatória.

---

## Regra de governança

Todo bloco completo deve atualizar:

1. `README.md`;
2. documento funcional/técnico em `docs/`;
3. documento UML/arquitetural quando houver mudança de fluxo ou entidade;
4. este `ROADMAP.md`.
