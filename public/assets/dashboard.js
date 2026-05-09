let currentClient = 'all';
let lastNotificationId = null;
let currentPage = 'dashboard';

const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const num = (value) => Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const pct = (value) => `${num(value)}%`;

const pages = [
  { id: 'dashboard', label: 'Dashboard', icon: '▣' },
  { id: 'campanhas', label: 'Campanhas', icon: '◈' },
  { id: 'criativos', label: 'Criativos', icon: '◉' },
  { id: 'automacao', label: 'Automação', icon: '⟳' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '✉' },
];

async function api(path, options) {
  const response = await fetch(path, options);
  return response.json();
}

function kpi(label, value, cls = '') {
  return `<div class="glass card tilt"><div class="label">${label}</div><div class="value ${cls}">${value}</div></div>`;
}

function statusClass(status) {
  return `s-${String(status || 'OK').replaceAll(' ', '_')}`;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, (match) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[match]));
}

async function init() {
  renderPageNav();
  const clients = await api('/api/clients');
  const items = [{ key: 'all', name: 'Consolidado' }, ...clients];

  for (const root of [clientNav, quickNav]) {
    if (!root) continue;
    root.innerHTML = items.map((client) => `
      <button class="${client.key === 'all' ? 'active' : ''} ${root.id === 'quickNav' ? 'chip' : ''}" data-client="${client.key}">${client.name}</button>
    `).join('');
    root.querySelectorAll('button').forEach((button) => {
      button.onclick = () => loadClient(button.dataset.client);
    });
  }

  await loadClient('all');
  await loadTasks();
  await loadTaskRuns();
  await loadNotifications();
  setInterval(loadNotifications, 5000);
  setInterval(loadTaskRuns, 7000);
  bindTilt();
  bindParallax();
}

function renderPageNav() {
  const html = pages.map((page) => `
    <button class="nav-page ${page.id === currentPage ? 'active' : ''}" data-page="${page.id}">${page.icon} ${page.label}</button>
  `).join('');

  if (pageNav) pageNav.innerHTML = html;
  if (mobileNav) mobileNav.innerHTML = html;

  document.querySelectorAll('[data-page]').forEach((button) => {
    button.onclick = () => showPage(button.dataset.page);
  });
}

function showPage(pageId) {
  currentPage = pageId;
  document.querySelectorAll('.page').forEach((page) => page.classList.toggle('active', page.id === `page-${pageId}`));
  document.querySelectorAll('[data-page]').forEach((button) => button.classList.toggle('active', button.dataset.page === pageId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadClient(client) {
  currentClient = client;
  document.querySelectorAll('button[data-client]').forEach((button) => button.classList.toggle('active', button.dataset.client === client));

  const data = await api(`/api/dashboard?client=${client}`);
  if (pageTitle) pageTitle.innerHTML = `${data.name || 'Dashboard'} <span class="gradient">Control Room</span>`;

  const summary = data.summary || {};
  if (kpis) {
    kpis.innerHTML = [
      kpi('Gasto', money(summary.spend)),
      kpi('Leads', num(summary.leads), 'blue'),
      kpi('CPL', money(summary.cpl), 'green'),
      kpi('CTR', pct(summary.ctr), 'blue'),
      kpi('ROI', `${num(summary.roi)}x`, 'orange'),
      kpi('Valor total', money(summary.totalValue), 'green'),
    ].join('');
  }

  if (campaignRows) {
    campaignRows.innerHTML = (data.campaigns || []).map((campaign) => `
      <tr>
        <td>${campaign.client ? `<small>${campaign.client}</small><br>` : ''}<strong>${campaign.name}</strong></td>
        <td>${money(campaign.spend)}</td>
        <td>${num(campaign.leads)}</td>
        <td>${money(campaign.cpl)}</td>
        <td>${pct(campaign.ctr)}</td>
        <td>${num(campaign.roi)}x</td>
        <td>${campaign.status}</td>
      </tr>
    `).join('');
  }

  if (creativeRows) {
    creativeRows.innerHTML = (data.creatives || []).map((creative) => `
      <tr>
        <td><strong>${creative.name}</strong></td>
        <td>${creative.campaign}</td>
        <td>${money(creative.spend)}</td>
        <td>${num(creative.leads)}</td>
        <td>${creative.cpl ? money(creative.cpl) : '—'}</td>
        <td>${pct(creative.ctr)}</td>
        <td><span class="status ${statusClass(creative.status)}">${creative.status}</span></td>
        <td>${creative.recommendation}</td>
      </tr>
    `).join('');
  }

  if (alerts) {
    alerts.innerHTML = (data.alerts || []).map((alert) => `
      <div class="alert ${alert.severity}"><span class="dot"></span><div><strong>${alert.type}${alert.client ? ` · ${alert.client}` : ''}</strong><p>${alert.message}<br><b>Ação:</b> ${alert.action}</p></div></div>
    `).join('') || '<p class="muted">Nenhum alerta ativo.</p>';
  }

  if (bars) {
    const spends = (data.campaigns || []).map((campaign) => campaign.spend);
    const maxSpend = Math.max(...spends, 1);
    bars.innerHTML = spends.map((value) => `
      <div class="bar" title="${money(value)}" style="height:${Math.max(8, (value / maxSpend) * 100)}%"></div>
    `).join('');
  }

  setTimeout(bindTilt, 30);
}

async function loadTasks() {
  if (!window.automationTasks) return;
  const tasks = await api('/api/tasks');
  automationTasks.innerHTML = tasks.map((task) => `
    <div class="task-card">
      <div class="task-head"><strong>${escapeHtml(task.name)}</strong><span>${escapeHtml(task.status)}</span></div>
      <p>${escapeHtml(task.description)}</p>
      <small>Agenda: ${escapeHtml(task.schedule)}</small>
      <div class="task-env">${(task.requiresEnv || []).length ? task.requiresEnv.map((env) => `<code>${escapeHtml(env)}</code>`).join('') : '<code>sem credencial</code>'}</div>
      <button class="action task-run" onclick="runAutomationTask('${task.key}')">Rodar esta rotina</button>
    </div>
  `).join('');
}

async function loadTaskRuns() {
  if (!window.automationRuns) return;
  const runs = await api('/api/tasks/runs');
  automationRuns.innerHTML = runs.length ? runs.map((run) => `
    <div class="run-card ${run.status}">
      <div class="task-head"><strong>${escapeHtml(run.taskKey)}</strong><span>${escapeHtml(run.status)} · ${escapeHtml(run.mode)}</span></div>
      <p>${escapeHtml(run.result?.message || 'Execução registrada.')}</p>
      <ol>${(run.steps || []).map((step) => `<li><b>${escapeHtml(step.label)}</b><br><small>${new Date(step.at).toLocaleString('pt-BR')}</small></li>`).join('')}</ol>
    </div>
  `).join('') : '<p class="muted">Nenhuma rotina executada ainda. Clique em “Rodar ciclo completo”.</p>';
}

async function runAutomationTask(taskKey = 'full_cycle') {
  const run = await api('/api/tasks/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskKey }),
  });
  await loadTaskRuns();
  await loadNotifications();
  showPage('automacao');
  showToast(`Rotina ${run.taskKey} executada`);
}

async function loadNotifications() {
  const data = await api('/api/notifications');
  if (notificationCount) notificationCount.textContent = `${data.length} notificações`;

  if (notifications) {
    notifications.innerHTML = data.length ? data.map((notification) => `
      <div class="notification ${notification.severity}">
        <span class="dot"></span>
        <div>
          <strong>${escapeHtml(notification.title)} · ${escapeHtml(notification.client)}</strong>
          <p>${escapeHtml(notification.message)}<br><b>Ação:</b> ${escapeHtml(notification.action || '-')}</p>
          <div class="meta">${escapeHtml(notification.status)} · ${escapeHtml(notification.provider || 'mock')} · ${new Date(notification.createdAt).toLocaleString('pt-BR')}</div>
        </div>
      </div>
    `).join('') : '<p class="muted">Nenhuma notificação enviada ainda.</p>';
  }

  if (data[0] && lastNotificationId && data[0].id !== lastNotificationId) showToast();
  if (data[0]) lastNotificationId = data[0].id;
}

async function sendDemoAlert() {
  await api('/api/alerts/send-demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client: currentClient === 'all' ? 'Ótica 2' : currentClient,
      message: 'Criativo gastou R$140 sem gerar leads. Recomenda-se pausar.',
    }),
  });
  await loadNotifications();
  showPage('whatsapp');
  showToast('Alerta WhatsApp mock enviado');
}

async function simulate(action) {
  await api(`/api/actions/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client: currentClient, creativeId: 'ad_demo' }),
  });
  await loadNotifications();
  showPage('whatsapp');
  showToast('Ação simulada registrada');
}

function showToast(message = 'Notificação registrada') {
  if (toast.querySelector('strong')) toast.querySelector('strong').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function bindTilt() {
  document.querySelectorAll('.tilt').forEach((element) => {
    if (element.dataset.tiltBound) return;
    element.dataset.tiltBound = '1';
    element.addEventListener('mousemove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const depth = Number(element.dataset.depth || 8);
      element.style.transform = `perspective(900px) rotateX(${(-y * depth).toFixed(2)}deg) rotateY(${(x * depth).toFixed(2)}deg)`;
    });
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
    });
  });
}

function bindParallax() {
  window.addEventListener('mousemove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 18;
    const y = (event.clientY / window.innerHeight - 0.5) * 18;
    document.querySelectorAll('.orb').forEach((orb, index) => {
      orb.style.translate = `${(x * (index + 1)) / 3}px ${(y * (index + 1)) / 3}px`;
    });
  });
}

init();
