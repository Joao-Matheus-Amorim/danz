# Tráfego Automator — Danz

Plataforma operacional para gestão de tráfego pago, automação de planilhas, análise de campanhas, histórico auditável e futuras notificações por WhatsApp.

O foco inicial é o caso **Dental Leads**: clínicas odontológicas em múltiplos estados, uma conta Meta Ads central compartilhada, campanhas representando unidades/clínicas e uma planilha literal que precisa ser preenchida com segurança.

---

## Estado real do projeto

O projeto hoje **não é mais um script solto**. Ele já possui base de produto:

- registry multi-cliente via JSON/YAML;
- validação agrupada de pendências do registry;
- adapters por segmento;
- preenchimento Dental em dry-run e modo controlado;
- delivery operacional `none`, `log`, `notify`, `approval`;
- persistência local SQLite;
- histórico operacional por API;
- painel web com dashboard, automação, WhatsApp mock, histórico e análise de campanhas;
- árvore visual `Campanhas -> Conjuntos -> Criativos`;
- normalização por IDs para preparar dados reais do Meta Ads;
- testes automatizados e `npm run check` cobrindo backend e JS do painel.

---

## Status dos grupos concluídos

| Grupo | Status | Resultado |
|---|---:|---|
| Grupo 1 | OK | YAML/registry funcional e validado |
| Grupo 1.5 | OK | `registry:validate` agrupando `adAccountId pendente` por estado |
| Grupo 4 | OK | Segment adapters criados, com `odontologia` e fallback `generic` |
| Grupo 5 | OK | Delivery operacional `none/log/notify/approval` |
| Grupo 6 | OK | Endpoints de histórico operacional |
| Grupo 6.1 | OK | Teste HTTP real dos endpoints locais com token |
| Grupo 7.1 | OK | Painel visual lendo histórico real protegido por token |
| Grupo 8 | OK | Aba Campanhas em árvore: campanha -> conjunto -> criativo |
| Grupo 8.1 | OK | Normalização por IDs para preparar Meta Ads real |

---

## O que ainda não é produção real

Ainda não estamos em operação real porque faltam credenciais e validações controladas:

- `META_ACCESS_TOKEN` real;
- `act_...` real da conta Meta central;
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` real;
- `GOOGLE_PRIVATE_KEY` real;
- planilha compartilhada com a service account;
- `OPERATIONAL_API_TOKEN` definido no ambiente;
- validação dry-run com dados reais da Meta;
- primeira escrita real em Google Sheets com escopo mínimo;
- deploy com variáveis configuradas;
- decisão sobre banco definitivo de produção, já que SQLite local é ótimo para desenvolvimento, mas não é banco cloud definitivo para SaaS.

---

## Fluxo operacional atual

```text
Registry de empresas/unidades
  -> Segment Adapter
    -> Meta Ads Client / dry-run
      -> Matching por campanha/unidade
        -> Sheet Resolver por estado/mês/data
          -> Dental Fill
            -> Delivery Manager
              -> SQLite / Histórico
                -> Painel Web
```

---

## Campanhas, conjuntos e criativos

O painel já representa a estrutura correta:

```text
Campanha
  -> Conjunto
    -> Criativo
```

Para o mock e para o futuro Meta real, o vínculo profissional é por ID:

```text
campaign.id
  -> adset.campaignId
    -> creative.adsetId
```

Os nomes continuam sendo exibidos na interface:

```text
campaignName
adsetName
adName/name
```

Essa decisão prepara o projeto para a API real do Meta Ads, onde nomes são dados de exibição e IDs são os vínculos confiáveis.

---

## Como validar localmente

```bash
npm install
npm run check
npm test
npm run registry:validate
npm run dental:fill:dry -- --state SP --day 2026-05-10 --delivery approval
```

Resultado esperado hoje:

```text
check passa
test passa
registry:validate mostra BA e SP agrupados por adAccountId pendente
dental:fill:dry roda em dry-run e pula unidades porque a conta Meta central ainda está pendente
```

---

## Rodar o painel local

```bash
npm run web
```

Acesse:

```text
http://localhost:3000
```

Aba principal de produto hoje:

- Dashboard;
- Campanhas;
- Criativos;
- Automação;
- WhatsApp;
- Histórico.

---

## Testar endpoints protegidos em dev

Defina um token local:

```powershell
$env:OPERATIONAL_API_TOKEN="dev-local-123"
npm run web
```

Em outro terminal:

```powershell
$token="dev-local-123"
curl.exe "http://localhost:3000/api/history/notifications?limit=10" -H "Authorization: Bearer $token"
curl.exe "http://localhost:3000/api/history/job-runs?limit=10" -H "Authorization: Bearer $token"
curl.exe "http://localhost:3000/api/history/unit-results?state=SP&limit=10" -H "Authorization: Bearer $token"
```

---

## Operação Dental atual

### Registry

```bash
npm run registry:list
npm run registry:list -- --state SP
npm run registry:list -- --state BA
npm run registry:validate
```

Hoje o `registry:validate` deve acusar apenas pendência agrupada de `adAccountId`, porque a conta real ainda não foi configurada.

### Dental Fill dry-run

```bash
npm run dental:fill:dry -- --state SP --day 2026-05-10 --delivery none
npm run dental:fill:dry -- --state SP --day 2026-05-10 --delivery log
npm run dental:fill:dry -- --state SP --day 2026-05-10 --delivery notify
npm run dental:fill:dry -- --state SP --day 2026-05-10 --delivery approval
```

---

## Caminho para operar real

Ordem segura:

1. Configurar `OPERATIONAL_API_TOKEN`.
2. Configurar `META_ACCESS_TOKEN`.
3. Trocar `act_PREENCHER_CONTA_CENTRAL` pelo `act_...` real da conta Meta central.
4. Configurar service account Google:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`;
   - `GOOGLE_PRIVATE_KEY`.
5. Compartilhar a planilha com a service account.
6. Rodar `npm run registry:validate`.
7. Rodar `dental:fill:dry` para um único dia e um único estado.
8. Confirmar se aparecem métricas reais e `matchedRows > 0`.
9. Rodar real com `--delivery approval` ou `--delivery none` em escopo pequeno.
10. Conferir a planilha manualmente.
11. Só depois ampliar para intervalo maior ou rotina automática.

---

## Próximos cortes recomendados

1. **Grupo 8.2 — Laboratório Criativo**  
   Transformar a aba Criativos em análise por categoria: vencedores, atenção, queimando verba e testes sugeridos.

2. **Grupo 9 — Integração Meta real em staging**  
   Validar token, conta central e insights reais sem escrever planilha.

3. **Grupo 10 — Escrita real controlada no Google Sheets**  
   Primeiro teste real em um dia, um estado e com auditoria.

4. **Grupo 11 — WhatsApp real**  
   Somente após histórico, aprovação e operação real mínima estarem confiáveis.

---

## Documentos principais

- `docs/ROADMAP.md` — visão de fases e prioridade.
- `docs/OPERATIONAL_IMPLEMENTATION_PHASES.md` — fases operacionais detalhadas.
- `docs/OPERACAO_REAL.md` — checklist para operação real.
- `docs/SEGMENT_ADAPTERS.md` — arquitetura de adapters por segmento.
- `docs/M1_CLIENT_REGISTRY_MODULE.md` — registry de clientes.
- `docs/M2_DENTAL_SHEET_AUTOMATION_SPEC.md` — preenchimento Dental.
- `docs/DENTAL_SHARED_META_UML.md` — visão UML da conta Meta central compartilhada.

---

## Regra de governança

Toda mudança relevante deve manter coerentes:

1. README;
2. ROADMAP;
3. documento técnico correspondente em `docs/`;
4. testes;
5. validação operacional local.
