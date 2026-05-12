const os = require('os');
const path = require('path');
const fs = require('fs');

function freshHistory() {
  jest.resetModules();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'danz-history-'));
  process.env.SQLITE_ENABLED = 'true';
  process.env.SQLITE_PATH = path.join(dir, 'history.db');
  return {
    repo: require('../../database/repositories'),
    history: require('../historyService'),
  };
}

describe('historyService', () => {
  afterEach(() => {
    delete process.env.SQLITE_ENABLED;
    delete process.env.SQLITE_PATH;
    jest.resetModules();
  });

  test('normalizes limits with fallback and max cap', () => {
    const { history } = freshHistory();

    expect(history.normalizeLimit(undefined, 50, 200)).toBe(50);
    expect(history.normalizeLimit('0', 50, 200)).toBe(50);
    expect(history.normalizeLimit('10', 50, 200)).toBe(10);
    expect(history.normalizeLimit('999', 50, 200)).toBe(200);
  });

  test('lists notification history with metadata', () => {
    const { repo, history } = freshHistory();
    repo.saveNotification({
      id: 'ntf_history',
      createdAt: '2026-05-12T00:00:00.000Z',
      channel: 'internal',
      client: 'Dental Leads',
      type: 'DELIVERY_SUMMARY',
      severity: 'info',
      title: 'Resumo',
      message: 'Mensagem',
      payload: { state: 'SP' },
      status: 'created',
    });

    const response = history.listNotificationHistory({ limit: '5' });

    expect(response.ok).toBe(true);
    expect(response.meta).toEqual({ limit: 5 });
    expect(response.data).toHaveLength(1);
    expect(response.data[0].id).toBe('ntf_history');
    expect(response.data[0].payload).toEqual({ state: 'SP' });
  });

  test('lists job run history with steps', () => {
    const { repo, history } = freshHistory();
    repo.saveJobRun({
      id: 'run_history',
      taskKey: 'full_cycle',
      mode: 'mock',
      startedAt: '2026-05-12T00:00:00.000Z',
      status: 'running',
    });
    repo.saveJobRunStep('run_history', {
      key: 'step_a',
      label: 'Etapa A',
      status: 'done',
      at: '2026-05-12T00:01:00.000Z',
      details: { ok: true },
    });

    const response = history.listJobRunHistory({ limit: '3' });

    expect(response.ok).toBe(true);
    expect(response.meta).toEqual({ limit: 3 });
    expect(response.data[0].id).toBe('run_history');
    expect(response.data[0].steps).toHaveLength(1);
  });

  test('normalizes and filters unit result history for dashboard usage', () => {
    const { repo, history } = freshHistory();
    repo.saveUnitRunResult({
      id: 'unit_sp_success',
      jobRunId: 'run_1',
      companyId: 'cmp_dental_leads',
      unitKey: 'pimentas',
      unitName: 'Pimentas',
      state: 'SP',
      city: 'Guarulhos',
      sheetName: 'SP Maio',
      status: 'success',
      cells: 2,
      matchedRows: 1,
      startedAt: '2026-05-12T00:00:00.000Z',
      finishedAt: '2026-05-12T00:01:00.000Z',
      details: { dryRun: true },
    });
    repo.saveUnitRunResult({
      id: 'unit_ba_skipped',
      jobRunId: 'run_1',
      companyId: 'cmp_dental_leads',
      unitKey: 'salvador',
      unitName: 'Salvador',
      state: 'BA',
      status: 'skipped',
      cells: 0,
      matchedRows: 0,
      details: { dryRun: true },
    });

    const response = history.listUnitResultHistory({ limit: '20', state: 'SP', status: 'success' });

    expect(response.ok).toBe(true);
    expect(response.meta.total).toBe(1);
    expect(response.meta.filters).toMatchObject({ state: 'SP', status: 'success' });
    expect(response.data).toEqual([
      expect.objectContaining({
        id: 'unit_sp_success',
        jobRunId: 'run_1',
        companyId: 'cmp_dental_leads',
        unitKey: 'pimentas',
        unitName: 'Pimentas',
        matchedRows: 1,
        details: { dryRun: true },
      }),
    ]);
    expect(response.data[0].unit_key).toBeUndefined();
    expect(response.data[0].details_json).toBeUndefined();
  });
});
