const { dashboardData } = require('../web/mockData');
const { notifyWhatsapp, createNotification } = require('./notificationCenter');
const { saveJobRun, saveJobRunStep, listPersistedJobRuns } = require('../database/repositories');
const { logger } = require('../utils/logger');

const taskRuns = [];

const tasks = [
  {
    key: 'pull_meta_ads',
    name: 'Puxar dados do Meta Ads',
    description: 'Coleta campanhas, conjuntos, criativos, gasto, leads, CTR, CPL e ações da Meta Ads API.',
    schedule: 'A cada 30 minutos ou manualmente',
    status: 'mock_ready',
    requiresEnv: ['META_ACCESS_TOKEN', 'OTICA1_AD_ACCOUNT_ID', 'OTICA2_AD_ACCOUNT_ID'],
    output: ['campaigns', 'adsets', 'creatives', 'insights'],
  },
  {
    key: 'analyze_performance',
    name: 'Analisar performance',
    description: 'Classifica campanhas e criativos como OK, destaque, CPL alto, CTR baixo ou gasto sem lead.',
    schedule: 'Após cada coleta Meta Ads',
    status: 'mock_ready',
    requiresEnv: [],
    output: ['diagnostics', 'recommendations', 'critical_alerts'],
  },
  {
    key: 'fill_sheets',
    name: 'Preencher Google Sheets',
    description: 'Atualiza a planilha do cliente com leads, gasto, CPL, campanhas e alertas.',
    schedule: 'Diário ou após coleta',
    status: 'mock_ready',
    requiresEnv: ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY'],
    output: ['updated_spreadsheet'],
  },
  {
    key: 'check_balance',
    name: 'Verificar saldo das contas',
    description: 'Consulta saldo/status das contas de anúncio e dispara alerta quando chegar no limite.',
    schedule: 'A cada 4 horas',
    status: 'mock_ready',
    requiresEnv: ['META_ACCESS_TOKEN'],
    output: ['balance_alerts'],
  },
  {
    key: 'send_whatsapp_alerts',
    name: 'Enviar alertas no WhatsApp',
    description: 'Envia alerta para o gestor quando CPL sobe, saldo acaba ou criativo gasta sem lead.',
    schedule: 'Tempo real, quando existir alerta crítico',
    status: 'mock_ready',
    requiresEnv: ['WHATSAPP_PROVIDER', 'ZAPI_INSTANCE_ID', 'ZAPI_TOKEN', 'WHATSAPP_TO'],
    output: ['whatsapp_notification'],
  },
  {
    key: 'suggest_actions',
    name: 'Sugerir ações automáticas',
    description: 'Recomenda pausar criativo, manter rodando ou criar campanha teste isolada.',
    schedule: 'Após análise de performance',
    status: 'mock_ready',
    requiresEnv: [],
    output: ['pause_suggestion', 'test_campaign_suggestion'],
  },
];

function persistRun(run) {
  try { saveJobRun(run); } catch (error) { logger.warn(`Falha ao persistir job run ${run.id}: ${error.message}`); }
}

function persistStep(runId, step) {
  try { saveJobRunStep(runId, step); } catch (error) { logger.warn(`Falha ao persistir step ${runId}: ${error.message}`); }
}

function listTasks() {
  return tasks;
}

function listTaskRuns({ limit = 50 } = {}) {
  const persisted = listPersistedJobRuns({ limit });
  if (persisted) return persisted;
  return taskRuns.slice(0, limit);
}

function summarizeMockMetaData() {
  const clients = Object.values(dashboardData);
  return {
    clients: clients.length,
    campaigns: clients.reduce((sum, client) => sum + client.campaigns.length, 0),
    adsets: clients.reduce((sum, client) => sum + client.adsets.length, 0),
    creatives: clients.reduce((sum, client) => sum + client.creatives.length, 0),
    alerts: clients.reduce((sum, client) => sum + client.alerts.length, 0),
    totalSpend: clients.reduce((sum, client) => sum + Number(client.summary.spend || 0), 0),
    totalLeads: clients.reduce((sum, client) => sum + Number(client.summary.leads || 0), 0),
  };
}

async function runTask(taskKey = 'full_cycle', options = {}) {
  const startedAt = new Date().toISOString();
  const run = {
    id: `run_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    taskKey,
    mode: options.real ? 'real' : 'mock',
    startedAt,
    finishedAt: null,
    status: 'running',
    steps: [],
    result: null,
  };

  taskRuns.unshift(run);
  persistRun(run);

  const addStep = (key, label, status = 'done', details = {}) => {
    const step = { key, label, status, at: new Date().toISOString(), details };
    run.steps.push(step);
    persistStep(run.id, step);
  };

  try {
    const summary = summarizeMockMetaData();

    if (taskKey === 'pull_meta_ads' || taskKey === 'full_cycle') {
      addStep('pull_meta_ads', 'Coletar campanhas, conjuntos e criativos da Meta Ads', 'done', summary);
    }

    if (taskKey === 'analyze_performance' || taskKey === 'full_cycle') {
      addStep('analyze_performance', 'Analisar CPL, CTR, ROI, gasto e leads', 'done', {
        diagnostics: ['CPL_ALTO', 'SEM_LEAD_COM_GASTO', 'DESTAQUE'],
      });
    }

    if (taskKey === 'fill_sheets' || taskKey === 'full_cycle') {
      addStep('fill_sheets', 'Preparar preenchimento da planilha Google Sheets', 'done', {
        spreadsheetMode: 'mock_or_dry_run',
      });
    }

    if (taskKey === 'check_balance' || taskKey === 'full_cycle') {
      addStep('check_balance', 'Verificar saldo das contas de anúncio', 'done', {
        lowBalanceClients: ['Ótica 2'],
      });
    }

    if (taskKey === 'send_whatsapp_alerts' || taskKey === 'full_cycle') {
      const alert = await notifyWhatsapp({
        client: 'Ótica 2',
        type: 'AUTOMATION_RUN_ALERT',
        severity: 'critical',
        title: '🚨 Rotina automática detectou problema',
        message: 'Criativo VIDEO_lentes_premium gastou verba sem gerar leads. Recomendação: pausar ou testar isolado.',
        action: '1 pausar | 2 testar isolado | 3 manter rodando',
        payload: { taskRunId: run.id },
      }, { dryRun: true });
      addStep('send_whatsapp_alerts', 'Enviar alerta WhatsApp mock', 'done', { notificationId: alert.notification.id });
    }

    if (taskKey === 'suggest_actions' || taskKey === 'full_cycle') {
      addStep('suggest_actions', 'Gerar ações sugeridas', 'done', {
        actions: ['pause_creative', 'create_test_campaign', 'keep_running'],
      });
    }

    run.status = 'success';
    run.finishedAt = new Date().toISOString();
    run.result = {
      message: options.real
        ? 'Execução real solicitada. Integrações reais dependem de .env configurado.'
        : 'Execução mock concluída. Este é o fluxo que rodará sozinho quando as APIs forem conectadas.',
      summary,
    };
    persistRun(run);

    createNotification({
      client: 'Sistema',
      type: 'TASK_RUN_COMPLETED',
      severity: 'success',
      title: '✅ Rotina automática concluída',
      message: `Tarefa ${taskKey} executada em modo ${run.mode}.`,
      action: 'Ver detalhes em /api/tasks/runs',
      payload: { taskRunId: run.id },
      status: 'logged',
    });

    return run;
  } catch (error) {
    run.status = 'error';
    run.finishedAt = new Date().toISOString();
    run.result = { error: error.message };
    persistRun(run);
    return run;
  }
}

module.exports = {
  listTasks,
  listTaskRuns,
  runTask,
  summarizeMockMetaData,
};
