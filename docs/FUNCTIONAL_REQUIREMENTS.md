# Documento de Requisitos Funcionais — Tráfego Automator

---

## 1. Visão Geral

O Tráfego Automator será uma plataforma multi-cliente para gestão de métricas e automações de tráfego pago. O sistema deve organizar clientes em grupos, regiões e segmentos, puxar dados do Meta Ads, preencher planilhas automaticamente, enviar mensagens via WhatsApp API e controlar o acesso por usuários, módulos e permissões.

---

## 2. Conceitos Principais

### 2.1 Grupo

Define o tipo de pacote operacional do cliente.

| Grupo | Significado |
|---|---|
| Admin | Clientes com mais funções/módulos habilitados |
| Serviços | Clientes com menos funções/módulos habilitados |

### 2.2 Região

Agrupamento geográfico para organização e execução por escopo.

Exemplos:

- SP;
- Bahia;
- RJ;
- MG.

### 2.3 Segmento

Agrupamento por tipo de negócio.

Exemplos:

- Clínicas;
- Óticas;
- Odontologia;
- Saúde;
- Estética.

### 2.4 Cliente

Empresa, clínica ou negócio atendido pelo sistema. Cada cliente pode possuir:

- grupo;
- região;
- segmento;
- conta Meta Ads;
- planilha Google;
- módulos habilitados;
- regras;
- usuários vinculados;
- WhatsApp de destino.

### 2.5 Módulo

Função habilitável por cliente. Exemplo:

- puxar métricas Meta Ads;
- preencher planilha;
- enviar WhatsApp;
- analisar criativos;
- verificar saldo;
- subir criativo;
- criar campanha;
- pausar anúncio.

### 2.6 Usuário

Pessoa com acesso ao sistema. O usuário pode ser interno/admin ou conta secundária de cliente.

---

## 3. Requisitos Funcionais

## RF-001 — Cadastrar cliente

O sistema deve permitir cadastrar clientes com:

- nome;
- chave única;
- grupo;
- região;
- segmento;
- status ativo/inativo;
- conta Meta Ads;
- dados de planilha;
- dados de WhatsApp;
- regras operacionais;
- módulos habilitados.

### Critério de aceite

O cliente cadastrado deve aparecer nos filtros por grupo, região e segmento.

---

## RF-002 — Organizar clientes por grupo

O sistema deve separar clientes nos grupos:

- Admin;
- Serviços.

### Critério de aceite

Ao selecionar o grupo Admin, somente clientes Admin devem ser processados. Ao selecionar Serviços, somente clientes Serviços devem ser processados.

---

## RF-003 — Organizar clientes por região

O sistema deve permitir filtrar clientes por região, como SP ou Bahia.

### Critério de aceite

Um comando ou tela deve permitir executar rotinas apenas para uma região específica.

---

## RF-004 — Organizar clientes por segmento

O sistema deve permitir filtrar clientes por segmento, como Clínicas, Óticas ou Odontologia.

### Critério de aceite

Um comando ou tela deve permitir executar rotinas apenas para um segmento específico.

---

## RF-005 — Habilitar/desabilitar módulos por cliente

O sistema deve permitir que cada cliente tenha módulos próprios.

Exemplo de módulos:

```json
{
  "pullMetaMetrics": true,
  "fillSheet": true,
  "sendWhatsappReport": true,
  "analyzeCreatives": true,
  "checkBalance": true,
  "uploadCreative": false,
  "createCampaign": false,
  "pauseAds": false
}
```

### Critério de aceite

Uma função só deve rodar para o cliente se o módulo correspondente estiver habilitado.

---

## RF-006 — Criar usuários

O sistema deve permitir criar usuários com:

- nome;
- e-mail;
- papel;
- status;
- escopo de acesso;
- permissões.

### Critério de aceite

Usuários inativos não devem conseguir acessar o sistema.

---

## RF-007 — Criar contas secundárias de cliente

O sistema deve permitir criar contas secundárias para clientes com permissão somente leitura.

### Critério de aceite

A conta secundária deve visualizar métricas, campanhas, conjuntos, criativos, alertas e relatórios, mas não editar nem executar ações avançadas.

---

## RF-008 — Controlar acesso por papel

O sistema deve suportar os papéis:

- super_admin;
- operator_admin;
- client_admin;
- client_viewer;
- client_readonly_sheet.

### Critério de aceite

Cada papel deve ter permissões distintas.

---

## RF-009 — Controlar acesso por escopo

O usuário deve acessar somente os grupos, regiões, segmentos e clientes permitidos em seu escopo.

### Critério de aceite

Um usuário vinculado a uma clínica não deve visualizar dados de outra clínica.

---

## RF-010 — Validar módulo + permissão antes de ações

Toda ação deve verificar:

- cliente ativo;
- módulo habilitado no cliente;
- usuário ativo;
- permissão do usuário;
- escopo do usuário.

### Critério de aceite

Uma ação deve ser bloqueada caso qualquer uma das condições falhe.

---

## RF-011 — Validar token Meta Ads

O sistema deve validar o token Meta Ads antes de executar jobs reais.

### Critério de aceite

Caso o token esteja ausente ou inválido, o sistema deve bloquear a execução real e retornar erro claro.

---

## RF-012 — Puxar campanhas do Meta Ads

O sistema deve puxar campanhas existentes no Meta Ads para cada cliente habilitado.

### Dados mínimos

- campaign_id;
- campaign_name;
- gasto;
- leads;
- CPL;
- impressões;
- cliques;
- CTR;
- ROI estimado;
- período.

### Critério de aceite

As campanhas devem ser listadas e/ou escritas na aba Campanhas da planilha.

---

## RF-013 — Puxar conjuntos do Meta Ads

O sistema deve puxar conjuntos de anúncios existentes no Meta Ads para cada cliente habilitado.

### Dados mínimos

- campaign_id;
- campaign_name;
- adset_id;
- adset_name;
- gasto;
- leads;
- CPL;
- impressões;
- cliques;
- CTR;
- período.

### Critério de aceite

Os conjuntos devem ser listados e/ou escritos na aba Conjuntos da planilha.

---

## RF-014 — Puxar criativos/anúncios do Meta Ads

O sistema deve puxar criativos/anúncios existentes no Meta Ads para cada cliente habilitado.

### Dados mínimos

- campaign_id;
- campaign_name;
- adset_id;
- adset_name;
- ad_id;
- ad_name;
- gasto;
- leads;
- CPL;
- impressões;
- cliques;
- CTR;
- período.

### Critério de aceite

Os criativos devem ser listados e/ou escritos na aba Criativos da planilha.

---

## RF-015 — Normalizar métricas

O sistema deve transformar dados brutos do Meta Ads em um formato padrão.

### Métricas normalizadas

- cliente;
- unidade;
- nível;
- data início;
- data fim;
- campanha;
- conjunto;
- criativo;
- gasto;
- leads;
- CPL;
- impressões;
- cliques;
- CTR;
- valor estimado;
- ROI;
- moeda.

### Critério de aceite

Todas as planilhas devem receber colunas padronizadas.

---

## RF-016 — Preencher aba Campanhas

O sistema deve preencher a aba Campanhas da planilha com dados de campanhas.

### Critério de aceite

A aba deve ser atualizada sem preenchimento manual.

---

## RF-017 — Preencher aba Conjuntos

O sistema deve preencher a aba Conjuntos da planilha com dados de conjuntos.

### Critério de aceite

A aba deve conter todos os conjuntos retornados pela Meta Ads API no período.

---

## RF-018 — Preencher aba Criativos

O sistema deve preencher a aba Criativos da planilha com dados de anúncios/criativos.

### Critério de aceite

A aba deve conter todos os criativos/anúncios retornados pela Meta Ads API no período.

---

## RF-019 — Preencher dashboard da planilha

O sistema deve gerar KPIs consolidados na aba Dashboard.

### KPIs mínimos

- gasto total;
- total de leads;
- CPL médio;
- CTR médio;
- ROI estimado;
- quantidade de campanhas;
- quantidade de conjuntos;
- quantidade de criativos;
- alertas ativos.

### Critério de aceite

O dashboard deve ser gerado automaticamente após a coleta.

---

## RF-020 — Analisar criativos

O sistema deve classificar criativos com base nas regras do cliente.

### Status possíveis

- OK;
- DESTAQUE;
- CPL_ALTO;
- CTR_BAIXO;
- SEM_GASTO;
- SEM_LEAD_COM_GASTO.

### Critério de aceite

Cada criativo analisado deve receber status e recomendação.

---

## RF-021 — Verificar saldo

O sistema deve verificar saldo/status da conta de anúncio quando o módulo estiver habilitado.

### Critério de aceite

Se o saldo estiver abaixo do limite configurado, deve ser gerado alerta.

---

## RF-022 — Enviar mensagem WhatsApp

O sistema deve enviar mensagens pela WhatsApp API para clientes habilitados.

### Tipos de mensagem

- alerta de CPL alto;
- criativo com gasto sem lead;
- saldo baixo;
- relatório diário;
- relatório semanal;
- erro de execução;
- confirmação de planilha atualizada.

### Critério de aceite

A mensagem deve ser enviada somente se o cliente possuir módulo e WhatsApp habilitados.

---

## RF-023 — Registrar notificações

O sistema deve registrar cada mensagem enviada ou tentativa de envio.

### Dados mínimos

- cliente;
- canal;
- destino;
- tipo;
- status;
- data/hora;
- resposta da API;
- erro, se houver.

---

## RF-024 — Registrar execuções

O sistema deve registrar cada execução de rotina.

### Dados mínimos

- ID da execução;
- grupo;
- região;
- segmento;
- cliente;
- início;
- fim;
- status;
- total processado;
- erro, se houver.

---

## RF-025 — Processar clientes em lote

O sistema deve processar múltiplos clientes em lotes controlados.

### Critério de aceite

Erro em um cliente não deve interromper o processamento dos demais.

---

## RF-026 — Rodar por escopo

O sistema deve executar comandos por:

- todos os clientes;
- grupo;
- região;
- segmento;
- cliente específico.

### Exemplo

```bash
npm run sync -- --group servicos --region sp --segment clinicas
```

---

## RF-027 — Subir criativo

O sistema deve permitir subir criativos para clientes com módulo habilitado.

### Critério de aceite

A ação deve ser bloqueada para clientes sem o módulo `uploadCreative`.

---

## RF-028 — Criar campanha

O sistema deve permitir criar campanhas para clientes com módulo habilitado.

### Critério de aceite

A criação deve exigir permissão do usuário e, se configurado, aprovação prévia.

---

## RF-029 — Pausar anúncio

O sistema deve permitir pausar anúncio para clientes com módulo habilitado.

### Critério de aceite

A pausa deve ser registrada em log de auditoria.

---

## RF-030 — Aprovar ação avançada

Ações avançadas devem poder exigir aprovação.

### Ações avançadas

- pausar anúncio;
- subir criativo;
- criar campanha;
- alterar orçamento;
- criar campanha teste.

### Critério de aceite

Sem aprovação, a ação não deve ser executada quando `requireApproval` estiver ativo.

---

## RF-031 — Painel Admin

O sistema deve possuir painel para operadores administrarem:

- clientes;
- módulos;
- regras;
- integrações;
- usuários;
- execuções;
- logs;
- alertas.

---

## RF-032 — Painel Cliente

O sistema deve possuir painel somente leitura para clientes.

### Deve visualizar

- dashboard;
- campanhas;
- conjuntos;
- criativos;
- alertas;
- relatórios;
- status de planilha.

### Não deve permitir

- editar cliente;
- editar módulos;
- criar campanha;
- subir criativo;
- pausar anúncio;
- ver dados de outros clientes.

---

## RF-033 — Auditoria

O sistema deve registrar ações importantes.

### Ações auditáveis

- login;
- edição de cliente;
- edição de módulo;
- execução de job;
- envio de WhatsApp;
- criação de campanha;
- pausa de anúncio;
- alteração de regra;
- criação de usuário.

---

## RF-034 — Modo dry-run

O sistema deve permitir execução simulada sem chamar APIs externas reais.

### Critério de aceite

No dry-run, nenhuma alteração real deve ser feita em Meta Ads, Sheets ou WhatsApp.

---

## RF-035 — Tratamento de erro por cliente

O sistema deve registrar erro individual por cliente e continuar a execução dos próximos clientes.

### Critério de aceite

O relatório final da execução deve mostrar clientes com sucesso e clientes com falha.

---

# 4. Requisitos Não Funcionais

## RNF-001 — Segurança

Credenciais devem ficar fora do repositório e serem carregadas por variáveis de ambiente ou secret manager.

## RNF-002 — Escalabilidade

O sistema deve suportar pelo menos 153 clientes processados em lote.

## RNF-003 — Observabilidade

O sistema deve gerar logs claros de execução, erro e auditoria.

## RNF-004 — Resiliência

Falhas em APIs externas devem ter tratamento, retry controlado e registro.

## RNF-005 — Manutenibilidade

Novos módulos devem poder ser adicionados sem reescrever todo o sistema.

## RNF-006 — Organização

A configuração de clientes deve ser organizada por grupo, região e segmento.

---

# 5. Matriz de Módulos

| Módulo | Serviços | Admin | Conta secundária cliente |
|---|---:|---:|---:|
| pullMetaMetrics | Sim | Sim | Visualiza |
| fillSheet | Sim | Sim | Visualiza status |
| sendWhatsappReport | Sim | Sim | Não executa |
| analyzeCreatives | Opcional | Sim | Visualiza |
| checkBalance | Opcional | Sim | Visualiza |
| uploadCreative | Não | Sim | Não |
| createCampaign | Não | Sim | Não |
| createAdset | Não | Sim | Não |
| pauseAds | Não | Sim | Não |
| createTestCampaign | Não | Sim | Não |
| editModules | Não | Sim interno | Não |
| manageUsers | Não | Sim interno | Não |

---

# 6. Critérios de Aceite Gerais

O MVP operacional deve:

- carregar clientes por grupo/região/segmento;
- puxar métricas reais do Meta Ads;
- escrever planilhas com campanhas, conjuntos e criativos;
- enviar WhatsApp quando habilitado;
- bloquear funções não habilitadas;
- bloquear usuários sem permissão;
- registrar logs;
- processar múltiplos clientes sem travar tudo em uma falha.
