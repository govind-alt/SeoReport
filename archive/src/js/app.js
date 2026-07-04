/* ═══════════════════════════════════════════
   RankFlow — App.js v3.1 GODMODE
   Logout + PDF Download + All interactions
   ═══════════════════════════════════════════ */

'use strict';

/* ─── Toast System ─── */
const Toast = {
  _container: null,
  _get() {
    if (!this._container) {
      this._container = document.getElementById('toastContainer');
      if (!this._container) {
        this._container = document.createElement('div');
        this._container.id = 'toastContainer';
        this._container.className = 'toast-container';
        document.body.appendChild(this._container);
      }
    }
    return this._container;
  },
  show(msg, type = 'info', duration = 3500) {
    const icons = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' };
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `
      <span style="font-size:16px;flex-shrink:0;">${icons[type] || 'ℹ️'}</span>
      <span style="flex:1;font-size:13px;line-height:1.4;">${msg}</span>
      <button style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:18px;line-height:1;padding:0 0 0 6px;flex-shrink:0;" onclick="this.closest('.toast').remove()">×</button>`;
    this._get().appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, duration);
    return t;
  },
  success(m) { return this.show(m, 'success'); },
  error(m) { return this.show(m, 'danger'); },
  warning(m) { return this.show(m, 'warning'); },
  info(m) { return this.show(m, 'info'); },
  loading(m) {
    const t = this.show(`<span class="spinner">⟳</span> ${m}`, 'info', 30000);
    return { dismiss: () => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); } };
  }
};

/* ─── Modal System ─── */
const Modal = {
  init() {
    // data-modal-open triggers
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); Modal.open(btn.dataset.modalOpen); });
    });
    // data-modal-close triggers
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => Modal.close(btn.dataset.modalClose));
    });
    // Close on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => { if (e.target === overlay) Modal.close(overlay.id); });
    });
    // ESC key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(o => Modal.close(o.id));
    });
  },
  open(id) {
    const el = document.getElementById(id);
    if (!el) { console.warn(`Modal #${id} not found`); return; }
    el.classList.add('active');
    document.body.style.overflow = 'hidden';
  },
  close(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active');
    document.body.style.overflow = '';
  }
};

/* ─── Notification Dropdown ─── */
const NotifDropdown = {
  init() {
    document.querySelectorAll('[data-notif-toggle]').forEach(bell => {
      bell.addEventListener('click', e => {
        e.stopPropagation();
        const dropdown = document.getElementById(bell.dataset.notifToggle || 'notifDropdown');
        if (!dropdown) return;
        const isOpen = dropdown.classList.contains('open');
        document.querySelectorAll('.notif-dropdown.open').forEach(d => d.classList.remove('open'));
        document.querySelectorAll('.dropdown-menu.open').forEach(d => d.classList.remove('open'));
        if (!isOpen) dropdown.classList.add('open');
      });
    });

    // Mark all read
    document.querySelectorAll('[data-mark-read]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        document.querySelectorAll('.notif-item.unread').forEach(i => i.classList.remove('unread'));
        document.querySelectorAll('.notif-count, .notif-unread-dot').forEach(b => b.style.display = 'none');
        document.querySelectorAll('.notif-count-badge').forEach(b => b.textContent = '0');
        Toast.success('All notifications marked as read');
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.notif-dropdown.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.dropdown-menu.open').forEach(d => d.classList.remove('open'));
    });
  }
};

/* ─── Dropdown Menus ─── */
const Dropdown = {
  init() {
    document.querySelectorAll('[data-dropdown]').forEach(trigger => {
      trigger.addEventListener('click', e => {
        e.stopPropagation();
        const menu = document.getElementById(trigger.dataset.dropdown);
        if (!menu) return;
        const isOpen = menu.classList.contains('open');
        document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
        document.querySelectorAll('.notif-dropdown.open').forEach(d => d.classList.remove('open'));
        if (!isOpen) menu.classList.add('open');
      });
    });
  }
};

/* ─── Client Tabs (detail page) ─── */
const ClientTabs = {
  current: 'overview',
  init() {
    document.querySelectorAll('.ctab').forEach(tab => {
      tab.addEventListener('click', () => {
        const name = tab.dataset.tab || tab.textContent.trim().toLowerCase().replace(/\s+/g, '-');
        this.show(name, tab);
      });
    });
  },
  show(name, el) {
    this.current = name;
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.ctab').forEach(t => t.classList.remove('active'));
    const panel = document.getElementById('tab-' + name);
    if (panel) panel.classList.add('active');
    if (el) { el.classList.add('active'); }
    else {
      const tab = document.querySelector(`.ctab[data-tab="${name}"]`);
      if (tab) tab.classList.add('active');
    }
    // Fire chart init if needed
    document.dispatchEvent(new CustomEvent('tabchange', { detail: { name } }));
  }
};

/* ─── Settings Nav ─── */
const SettingsNav = {
  init() {
    document.querySelectorAll('.settings-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        if (!section) return;
        document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        const panel = document.getElementById('panel-' + section);
        if (panel) panel.classList.add('active');
      });
    });
  }
};

/* ─── Table Search ─── */
const TableFilter = {
  init(inputId, tableId) {
    const input = document.getElementById(inputId);
    const table = document.getElementById(tableId);
    if (!input || !table) return;
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      table.querySelectorAll('tbody tr:not(.expand-row)').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }
};

/* ─── Pill Filters ─── */
const PillFilter = {
  init() {
    document.querySelectorAll('.pill[data-filter]').forEach(pill => {
      pill.addEventListener('click', () => {
        const group = pill.dataset.filterGroup || 'default';
        const filter = pill.dataset.filter;
        const targetId = pill.dataset.filterTarget;
        document.querySelectorAll(`.pill[data-filter-group="${group}"]`).forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        if (!targetId) return;
        const table = document.getElementById(targetId);
        if (!table) return;
        table.querySelectorAll('tbody tr[data-filter]').forEach(row => {
          if (filter === 'all' || (row.dataset.filter || '').split(' ').includes(filter)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });
  }
};

/* ─── Bulk Select ─── */
const BulkSelect = {
  init(tableId, barId) {
    const table = document.getElementById(tableId);
    const bar = document.getElementById(barId);
    if (!table || !bar) return;
    const masterCb = table.querySelector('thead input[type="checkbox"]');
    const getRows = () => [...table.querySelectorAll('tbody input[type="checkbox"].row-checkbox')];
    const countEl = bar.querySelector('.bulk-count');

    const update = () => {
      const rows = getRows();
      const n = rows.filter(cb => cb.checked).length;
      bar.style.display = n > 0 ? 'flex' : 'none';
      if (countEl) countEl.textContent = `${n} client${n !== 1 ? 's' : ''} selected`;
      if (masterCb) masterCb.indeterminate = n > 0 && n < rows.length;
    };

    if (masterCb) {
      masterCb.addEventListener('change', () => {
        getRows().forEach(cb => cb.checked = masterCb.checked);
        update();
      });
    }
    getRows().forEach(cb => cb.addEventListener('change', update));

    const clearBtn = bar.querySelector('.bulk-clear');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      getRows().forEach(cb => cb.checked = false);
      if (masterCb) { masterCb.checked = false; masterCb.indeterminate = false; }
      bar.style.display = 'none';
    });
  }
};

/* ─── Audit URL Expand ─── */
const AuditExpand = {
  init() {
    document.querySelectorAll('[data-expand-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.expandTarget);
        if (!target) return;
        const isOpen = target.style.display === 'table-row';
        target.style.display = isOpen ? 'none' : 'table-row';
        btn.textContent = isOpen ? '▶ View URLs' : '▼ Collapse';
        btn.style.color = isOpen ? 'var(--primary)' : 'var(--success)';
      });
    });
  }
};

/* ─── Delete Confirmation ─── */
const DeleteConfirm = {
  init(inputId, btnId, word = 'DELETE') {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input || !btn) return;
    const check = () => {
      const ok = input.value === word;
      btn.disabled = !ok;
      btn.style.opacity = ok ? '1' : '0.4';
      btn.style.cursor = ok ? 'pointer' : 'not-allowed';
    };
    check();
    input.addEventListener('input', check);
  }
};

/* ─── Tag Input ─── */
const TagInput = {
  init(wrapperId) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    const input = wrapper.querySelector('input');
    if (!input) return;
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && input.value.trim()) {
        e.preventDefault();
        const tag = document.createElement('span');
        tag.className = 'tag';
        const val = input.value.trim();
        tag.innerHTML = `${val} <span class="tag-remove" onclick="this.parentElement.remove()">×</span>`;
        wrapper.insertBefore(tag, input);
        input.value = '';
      }
    });
  }
};

/* ─── Password Strength ─── */
const PasswordStrength = {
  score(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  },
  init(inputId, barsId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const bars = document.querySelectorAll(`#${barsId} .strength-bar`);
    const labels = ['', 'weak', 'fair', 'good', 'strong'];
    input.addEventListener('input', () => {
      const s = this.score(input.value);
      bars.forEach((bar, i) => { bar.className = `strength-bar${i < s ? ' ' + labels[s] : ''}`; });
    });
  }
};

/* ─── Chart.js Wrappers ─── */
const Charts = {
  _instances: {},
  _palette: {
    primary: 'rgba(99,102,241,0.85)',
    primaryLight: 'rgba(99,102,241,0.12)',
    success: 'rgba(16,185,129,0.85)',
    danger: 'rgba(239,68,68,0.8)',
    warning: 'rgba(245,158,11,0.85)',
    info: 'rgba(59,130,246,0.85)',
    purple: 'rgba(139,92,246,0.85)'
  },
  _defaults() {
    if (!window.Chart) return;
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.color = '#94A3B8';
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.plugins.tooltip.backgroundColor = '#0F172A';
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.titleFont = { size: 12, weight: 700 };
    Chart.defaults.scale.grid.color = 'rgba(0,0,0,0.04)';
    Chart.defaults.scale.border.display = false;
  },
  destroy(id) {
    if (this._instances[id]) { this._instances[id].destroy(); delete this._instances[id]; }
  },
  line(id, labels, datasets, opts = {}) {
    if (!window.Chart) return;
    this.destroy(id);
    const ctx = document.getElementById(id);
    if (!ctx) return;
    const inst = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: datasets.length > 1, position: 'top', labels: { boxWidth: 10, padding: 16 } } },
        scales: {
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { padding: 6 } },
          x: { grid: { display: false }, ticks: { padding: 4 } }
        },
        elements: { point: { radius: 4, hoverRadius: 6 }, line: { tension: 0.4, borderWidth: 2 } },
        ...opts
      }
    });
    this._instances[id] = inst;
    return inst;
  },
  bar(id, labels, datasets, opts = {}) {
    if (!window.Chart) return;
    this.destroy(id);
    const ctx = document.getElementById(id);
    if (!ctx) return;
    const inst = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: datasets.length > 1, position: 'top', labels: { boxWidth: 10, padding: 16 } } },
        scales: {
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { padding: 6 } },
          x: { grid: { display: false }, ticks: { padding: 4 } }
        },
        ...opts
      }
    });
    this._instances[id] = inst;
    return inst;
  },
  doughnut(id, labels, data, colors, opts = {}) {
    if (!window.Chart) return;
    this.destroy(id);
    const ctx = document.getElementById(id);
    if (!ctx) return;
    const inst = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '72%',
        plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, padding: 12 } } },
        ...opts
      }
    });
    this._instances[id] = inst;
    return inst;
  }
};

/* ─── Global View Switch (table/grid) ─── */
function switchView(view, groupEl) {
  const group = groupEl ? groupEl.dataset.viewGroup || 'default' : 'default';
  document.querySelectorAll(`[data-view-group="${group}"] .view-toggle-btn`).forEach(b => b.classList.remove('active'));
  if (groupEl) groupEl.classList.add('active');
  document.querySelectorAll(`[data-view="${view}"][data-view-group="${group}"]`).forEach(el => el.style.display = '');
  const views = ['table', 'grid'].filter(v => v !== view);
  views.forEach(v => document.querySelectorAll(`[data-view="${v}"][data-view-group="${group}"]`).forEach(el => el.style.display = 'none'));
}

/* ─── Global Tab Switch for client-detail ─── */
function switchTab(name, el) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ctab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('tab-' + name);
  if (panel) panel.classList.add('active');
  if (el) el.classList.add('active');
  document.dispatchEvent(new CustomEvent('tabchange', { detail: { name } }));
}

/* ─── Global Settings Panel Switch ─── */
function showSettings(section, el) {
  document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.settings-nav-item').forEach(n => n.classList.remove('active'));
  const panel = document.getElementById('panel-' + section);
  if (panel) panel.classList.add('active');
  if (el) el.classList.add('active');
}

/* ─── Report Preview ─── */
function showPreview(client, rowEl) {
  // Hide all previews
  document.querySelectorAll('.report-preview-block').forEach(p => p.style.display = 'none');
  const target = document.getElementById('preview-' + client);
  if (target) target.style.display = 'block';
  // Highlight row
  document.querySelectorAll('#reportsTable tbody tr').forEach(r => r.style.background = '');
  if (rowEl) rowEl.style.background = 'linear-gradient(90deg,#EEF2FF,#F8F9FF)';
}

/* ─── Collapse Audit Rows ─── */
function toggleExpand(id, btn) {
  const row = document.getElementById(id);
  if (!row) return;
  const isOpen = row.style.display === 'table-row';
  row.style.display = isOpen ? 'none' : 'table-row';
  if (btn) {
    btn.textContent = isOpen ? '▶ View URLs' : '▼ Collapse';
    btn.style.color = isOpen ? 'var(--primary)' : 'var(--success)';
  }
}

/* ─── GSC Connect ─── */
function connectGSC() {
  const loader = Toast.loading('Redirecting to Google OAuth...');
  setTimeout(() => {
    loader.dismiss();
    const notConn = document.getElementById('gscNotConnected');
    const conn = document.getElementById('gscConnected');
    if (notConn) notConn.style.display = 'none';
    if (conn) conn.style.display = 'block';
    Toast.success('✅ Google Search Console connected! 8 properties found.');
  }, 1800);
}

function disconnectGSC() {
  if (!confirm('Disconnect Google Search Console? Analytics data will become unavailable.')) return;
  const notConn = document.getElementById('gscNotConnected');
  const conn = document.getElementById('gscConnected');
  if (conn) conn.style.display = 'none';
  if (notConn) notConn.style.display = 'block';
  Toast.warning('GSC disconnected.');
}

/* ─── Report Download (opens printable report-pdf.html) ─── */
function downloadReport(opts = {}) {
  const client = opts.client || 'Acme Corp';
  const period = opts.period || 'June 2026';
  const health = opts.health || '76';
  const sessions = opts.sessions || '8,420';
  const keywords = opts.keywords || '47';
  // Build URL to the printable report
  const base = location.pathname.includes('/src/') ? '' : 'src/';
  const params = new URLSearchParams({ client, period, health, sessions, keywords });
  const url = `report-pdf.html?${params.toString()}`;
  const win = window.open(url, '_blank');
  if (!win) Toast.warning('Pop-up blocked — please allow pop-ups for this site.');
  else Toast.info('Opening report PDF viewer...');
}

/* ─── Report Sharing ─── */
function copyShareLink() {
  const link = `${location.origin}/reports/share/rf-${Math.random().toString(36).slice(2,8)}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(() => Toast.success('Share link copied! Valid for 30 days.'));
  } else {
    Toast.info('Share link: ' + link);
  }
}

/* ─── Delete Confirmation Check ─── */
function checkDeleteConfirm(val) {
  const btn = document.getElementById('deleteConfirmBtn');
  if (!btn) return;
  const ok = val === 'DELETE';
  btn.disabled = !ok;
  btn.style.opacity = ok ? '1' : '0.4';
}

function confirmDeleteAgency() {
  if (!confirm('Final warning: Delete your entire agency and all data?')) return;
  Toast.error('Agency deletion queued. Check your email to confirm.');
  setTimeout(() => { window.location.href = 'login.html'; }, 3000);
}

/* ─── Logout ─── */
const Logout = {
  _menuId: 'userMenu',

  init() {
    // User chip click → toggle menu
    const chip = document.getElementById('sidebarUserChip');
    if (chip) {
      chip.addEventListener('click', e => {
        e.stopPropagation();
        this.toggleMenu();
      });
    }
    // Close on outside click
    document.addEventListener('click', () => this.closeMenu());
  },

  toggleMenu() {
    const menu = document.getElementById(this._menuId);
    if (!menu) return;
    const open = menu.classList.toggle('open');
    // Close other dropdowns
    if (open) {
      document.querySelectorAll('.notif-dropdown.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.dropdown-menu:not(#userMenu).open').forEach(d => d.classList.remove('open'));
    }
  },

  closeMenu() {
    const menu = document.getElementById(this._menuId);
    if (menu) menu.classList.remove('open');
  },

  confirm() {
    this.closeMenu();
    Modal.open('logoutModal');
  },

  execute() {
    Modal.close('logoutModal');
    const t = Toast.info('Signing out...');
    setTimeout(() => {
      t.remove();
      window.location.href = 'login.html';
    }, 1200);
  }
};

/* ─── Page Init ─── */
document.addEventListener('DOMContentLoaded', () => {
  // Chart defaults
  Charts._defaults();

  // Core systems
  Modal.init();
  NotifDropdown.init();
  Dropdown.init();
  PillFilter.init();
  AuditExpand.init();
  ClientTabs.init();
  SettingsNav.init();
  Logout.init();

  // Inject logout modal if not present
  if (!document.getElementById('logoutModal')) {
    document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay" id="logoutModal">
      <div class="modal modal-sm">
        <div class="modal-header">
          <div>
            <div class="modal-title">Sign Out</div>
            <div class="modal-subtitle">You'll need to sign back in to access your dashboard</div>
          </div>
          <button class="modal-close" data-modal-close="logoutModal">✕</button>
        </div>
        <div class="modal-body" style="text-align:center;padding:28px 24px;">
          <div style="font-size:40px;margin-bottom:14px;">👋</div>
          <div style="font-size:15px;font-weight:700;margin-bottom:8px;">Sign out of RankFlow?</div>
          <div style="font-size:13px;color:var(--text-muted);line-height:1.6;">
            You're signed in as <strong>John Doe</strong><br/>
            <span style="font-size:12px;">john@digitalhorizons.com</span>
          </div>
        </div>
        <div class="modal-footer" style="justify-content:center;gap:12px;">
          <button class="btn btn-secondary" data-modal-close="logoutModal" style="min-width:110px;">Stay Signed In</button>
          <button class="btn btn-danger" onclick="Logout.execute()" style="min-width:110px;">Sign Out →</button>
        </div>
      </div>
    </div>`);
    // Re-init modals so new one is wired
    Modal.init();
  }

  // Bulk select
  if (document.getElementById('clientsTable')) {
    BulkSelect.init('clientsTable', 'bulkActionBar');
  }

  // Delete confirm
  if (document.getElementById('deleteConfirmInput')) {
    DeleteConfirm.init('deleteConfirmInput', 'deleteConfirmBtn', 'DELETE');
  }

  // Tag inputs
  document.querySelectorAll('[data-tag-input]').forEach(w => TagInput.init(w.id));

  // Password strength
  if (document.getElementById('passwordInput')) {
    PasswordStrength.init('passwordInput', 'strengthBars');
  }

  console.log('🚀 RankFlow v3.1 — GODMODE + Logout + PDF active');
});
