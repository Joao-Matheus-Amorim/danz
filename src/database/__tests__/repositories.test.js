const os = require('os');
const path = require('path');
const fs = require('fs');

function freshRepositories() {
  jest.resetModules();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'danz-db-'));
  process.env.SQLITE_ENABLED = 'true';
  process.env.SQLITE_PATH = path.join(dir, 'test.db');
  return require('../repositories');
}

describe('SQLite repositories', () => {
  afterEach(() => {
    delete process.env.SQLITE_ENABLED;
    delete process.env.SQLITE_PATH;
    jest.resetModules();
  });

  test('persists and lists notifications', () => {
    const repo = freshRepositories();
    repo.saveNotification({
      id: 'ntf_test',
      createdAt: '2026-05-12T00:00:00.000Z',
      channel: 'whatsapp',
      client: 'Dental Leads',
      type: 'INFO',
      severity: 'info',
      title: 'Teste',
      message: 'Mensagem',
      action: 'Nenhuma',
      payload: { unit: 'Pimentas' },
      status: 'created',
    });

    const rows = repo.listPersistedNotifications({ limit: 10 });
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('ntf_test');
    expect(rows[0].payload).toEqual({ unit: 'Pimentas' });
  });

  test('persists job runs with steps', () => {
    const repo = freshRepositories();
    repo.saveJobRun({
      id: 'run_test',
      taskKey: 'full_cycle',
      mode: 'mock',
      startedAt: '2026-05-12T00:00:00.000Z',
      status: 'running',
      result: null,
    });
    repo.saveJobRunStep('run_test', {
      key: 'step_1',
      label: 'Executar etapa',
      status: 'done',
      at: '2026-05-12T00:01:00.000Z',
      details: { ok: true },
    });
    repo.saveJobRun({
      id: 'run_test',
      taskKey: 'full_cycle',
      mode: 'mock',
      startedAt: '2026-05-12T00:00:00.000Z',
      finishedAt: '2026-05-12T00:02:00.000Z',
      status: 'success',
      result: { done: true },
    });

    const rows = repo.listPersistedJobRuns({ limit: 10 });
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('success');
    expect(rows[0].steps).toHaveLength(1);
    expect(rows[0].steps[0].details).toEqual({ ok: true });
  });

  test('persists unit run results', () => {
    const repo = freshRepositories();
    repo.saveUnitRunResult({
      id: 'unit_test',
      jobRunId: null,
      companyId: 'cmp_dental_leads',
      unitKey: 'pimentas',
      unitName: 'Pimentas',
      state: 'SP',
      city: 'Guarulhos',
      sheetName: 'SP · MAIO',
      status: 'success',
      cells: 10,
      matchedRows: 5,
      error: null,
      startedAt: '2026-05-12T00:00:00.000Z',
      finishedAt: '2026-05-12T00:01:00.000Z',
      details: { dryRun: true },
    });

    const rows = repo.listUnitRunResults({ limit: 10 });
    expect(rows).toHaveLength(1);
    expect(rows[0].unit_key).toBe('pimentas');
    expect(rows[0].cells).toBe(10);
    expect(rows[0].matched_rows).toBe(5);
  });
});
