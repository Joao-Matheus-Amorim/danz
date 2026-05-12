const {
  applyDelivery,
  buildDeliveryMessage,
  normalizeDeliveryMode,
  shouldWriteSheets,
  summarizeRunResult,
} = require('../deliveryManager');
const { listNotifications } = require('../notificationCenter');

describe('deliveryManager', () => {
  const baseResult = {
    scope: { state: 'SP' },
    since: '2026-05-10',
    until: '2026-05-10',
    dryRun: true,
    fields: ['leads', 'value'],
    totalUnits: 37,
    success: 0,
    skipped: 37,
    errors: 0,
    diagnostics: [
      {
        type: 'shared_ad_account_invalid',
        companyName: 'Dental Leads',
        state: 'SP',
        reason: 'adAccountId pendente',
        unitCount: 37,
        message: 'Dental Leads / SP: conta Meta central pendente.',
      },
    ],
    sheetResults: [],
  };

  test('normalizes valid delivery modes and rejects invalid modes', () => {
    expect(normalizeDeliveryMode('NONE')).toBe('none');
    expect(normalizeDeliveryMode(' approval ')).toBe('approval');
    expect(() => normalizeDeliveryMode('whatsapp')).toThrow('Delivery inválido');
  });

  test('summarizes run result without leaking per-unit payload', () => {
    const summary = summarizeRunResult({ ...baseResult, results: [{ unitKey: 'x' }] });

    expect(summary).toMatchObject({
      since: '2026-05-10',
      until: '2026-05-10',
      totalUnits: 37,
      skipped: 37,
    });
    expect(summary.results).toBeUndefined();
  });

  test('builds a readable delivery message', () => {
    expect(buildDeliveryMessage(baseResult)).toContain('Unidades: 37');
    expect(buildDeliveryMessage(baseResult)).toContain('Campos: leads,value');
  });

  test('delivery none does not create notification', () => {
    const delivery = applyDelivery(baseResult, 'none');

    expect(delivery).toEqual({ mode: 'none', status: 'none', notification: null });
  });

  test('delivery notify creates internal notification', () => {
    const delivery = applyDelivery(baseResult, 'notify');

    expect(delivery.status).toBe('notification_created');
    expect(delivery.notification).toMatchObject({
      channel: 'internal',
      type: 'DELIVERY_SUMMARY',
      title: 'Resumo de entrega operacional',
    });
    expect(listNotifications({ limit: 1 })[0].id).toBe(delivery.notification.id);
  });

  test('delivery approval creates pending approval and blocks sheet writes', () => {
    const delivery = applyDelivery(baseResult, 'approval');

    expect(delivery.status).toBe('pending_approval');
    expect(delivery.notification).toMatchObject({
      channel: 'internal',
      type: 'APPROVAL_REQUIRED',
      status: 'pending_approval',
    });
    expect(shouldWriteSheets({ dryRun: false, delivery: 'approval' })).toBe(false);
  });

  test('sheet writes are allowed only outside dry-run and approval mode', () => {
    expect(shouldWriteSheets({ dryRun: true, delivery: 'none' })).toBe(false);
    expect(shouldWriteSheets({ dryRun: false, delivery: 'none' })).toBe(true);
    expect(shouldWriteSheets({ dryRun: false, delivery: 'notify' })).toBe(true);
  });
});
