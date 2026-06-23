/* ═══════════════════════════════════════════
   RankFlow — Core Application JS
   Version 2.0 — Full Wireframe Implementation
   ═══════════════════════════════════════════ */

/* ─── Toast Notifications ─── */
const Toast = {
  container: null,
  init() {
    this.container = document.getElementById('toastContainer');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toastContainer';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'info', duration = 3500) {
    if (!this.container) this.init();
    const icons = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span style="font-size:16px;flex-shrink:0;">${icons[type]}</span><span style="flex:1;">${message}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;color:rgba(255,255,255,0.6);cursor:pointer;font-size:16px;padding:0;flex-shrink:0;">✕</button>`;
    this.container.appendChild(toast);
    requestAnimationFrame(() => { requestAnimationFrame(() => { toast.classList.add('show'); }); });
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'danger'); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg) { this.show(msg, 'info'); }
};

/* ─── Modal Manager ─── */
const Modal = {
  init() {
    // Open triggers
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => Modal.open(btn.dataset.modalOpen));
    });
    // Close triggers
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => Modal.close(btn.dataset.modalClose));
    });
    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) Modal.close(overlay.id);
      });
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(o => Modal.close(o.id));
      }
    });
  },
  open(id) {
    const overlay = document.getElementById(id);
    if (overlay) { overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
  },
  close(id) {
    const overlay = document.getElementById(id);
    if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
  }
};

/* ─── Tab Manager ─── */
const Tabs = {
  init(containerId) {
    const container = containerId ? document.getElementById(containerId) : document;
    if (!container) return;
    container.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        const group = tab.dataset.tabGroup || tab.closest('[data-tab-group]')?.dataset.tabGroup || 'default';
        const target = tab.dataset.tab;
        // Deactivate all in same group
        const tabBar = tab.closest('.tabs');
        if (tabBar) {
          tabBar.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        }
        // Hide all content panels for this group
        container.querySelectorAll(`.tab-content[data-tab-group="${group}"]`).forEach(panel => {
          panel.classList.remove('active');
        });
        // Activate selected
        tab.classList.add('active');
        const panel = container.querySelector(`.tab-content[data-tab="${target}"][data-tab-group="${group}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  }
};

/* ─── Notification Dropdown ─── */
const NotifDropdown = {
  init() {
    document.querySelectorAll('[data-notif-toggle]').forEach(bell => {
      bell.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById(bell.dataset.notifToggle || 'notifDropdown');
        if (dropdown) {
          const isOpen = dropdown.classList.contains('open');
          // Close all other dropdowns first
          document.querySelectorAll('.notif-dropdown.open').forEach(d => d.classList.remove('open'));
          if (!isOpen) dropdown.classList.add('open');
        }
      });
    });
    // Mark all read
    document.querySelectorAll('[data-mark-read]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.notif-item.unread').forEach(item => item.classList.remove('unread'));
        document.querySelectorAll('.notif-count-badge').forEach(b => b.style.display = 'none');
        document.querySelectorAll('.notif-dot').forEach(d => d.style.display = 'none');
        Toast.success('All notifications marked as read');
      });
    });
    // Close on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.notif-dropdown.open').forEach(d => d.classList.remove('open'));
    });
  }
};

/* ─── Dropdown Manager ─── */
const Dropdown = {
  init() {
    document.querySelectorAll('[data-dropdown]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = document.getElementById(trigger.dataset.dropdown);
        if (!menu) return;
        const isOpen = menu.classList.contains('open');
        document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
        if (!isOpen) menu.classList.add('open');
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    });
  }
};

/* ─── Table Search & Filter ─── */
const TableFilter = {
  init(searchInputId, tableId) {
    const input = document.getElementById(searchInputId);
    const table = document.getElementById(tableId);
    if (!input || !table) return;
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      table.querySelectorAll('tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }
};

/* ─── Pill Filter (Keywords page) ─── */
const PillFilter = {
  init() {
    document.querySelectorAll('.pill[data-filter]').forEach(pill => {
      pill.addEventListener('click', () => {
        const group = pill.dataset.filterGroup || 'default';
        document.querySelectorAll(`.pill[data-filter-group="${group}"]`).forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.dataset.filter;
        const targetTable = document.getElementById(pill.dataset.filterTarget);
        if (!targetTable) return;
        targetTable.querySelectorAll('tbody tr[data-filter]').forEach(row => {
          if (filter === 'all' || row.dataset.filter === filter) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });
  }
};

/* ─── Bulk Select (Clients table) ─── */
const BulkSelect = {
  init(tableId, bulkBarId) {
    const table = document.getElementById(tableId);
    const bar = document.getElementById(bulkBarId);
    if (!table || !bar) return;
    const masterCb = table.querySelector('thead input[type="checkbox"]');
    const rows = table.querySelectorAll('tbody input[type="checkbox"]');
    const countEl = bar.querySelector('.bulk-count');

    const updateBar = () => {
      const selected = [...rows].filter(cb => cb.checked).length;
      if (selected > 0) {
        bar.style.display = 'flex';
        if (countEl) countEl.textContent = `${selected} client${selected > 1 ? 's' : ''} selected`;
      } else {
        bar.style.display = 'none';
      }
    };

    if (masterCb) {
      masterCb.addEventListener('change', () => {
        rows.forEach(cb => { cb.checked = masterCb.checked; });
        updateBar();
      });
    }
    rows.forEach(cb => cb.addEventListener('change', () => {
      if (masterCb) masterCb.indeterminate = [...rows].some(c => c.checked) && ![...rows].every(c => c.checked);
      updateBar();
    }));

    const clearBtn = bar.querySelector('.bulk-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        rows.forEach(cb => cb.checked = false);
        if (masterCb) masterCb.checked = false;
        bar.style.display = 'none';
      });
    }
  }
};

/* ─── Audit Inline Expand ─── */
const AuditExpand = {
  init() {
    document.querySelectorAll('[data-expand-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.expandTarget);
        if (!target) return;
        const isOpen = target.style.display !== 'none' && target.style.display !== '';
        target.style.display = isOpen ? 'none' : 'table-row';
        btn.textContent = isOpen ? '▶ View URLs' : '▼ Collapse';
      });
    });
  }
};

/* ─── Collapsible Panels ─── */
const Collapsible = {
  init() {
    document.querySelectorAll('.collapsible-header').forEach(header => {
      const panel = header.closest('.collapsible');
      const body = panel?.querySelector('.collapsible-body');
      if (!body) return;
      body.style.display = 'none'; // Start collapsed
      header.addEventListener('click', () => {
        const isOpen = panel.classList.contains('open');
        if (isOpen) {
          panel.classList.remove('open');
          body.style.display = 'none';
        } else {
          panel.classList.add('open');
          body.style.display = 'block';
        }
      });
    });
  }
};

/* ─── View Toggle (Table/Grid) ─── */
const ViewToggle = {
  init() {
    document.querySelectorAll('[data-view-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.viewToggle;
        const group = btn.dataset.group || 'default';
        // Toggle buttons
        document.querySelectorAll(`[data-view-toggle][data-group="${group}"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Toggle views
        document.querySelectorAll(`[data-view][data-view-group="${group}"]`).forEach(v => {
          v.style.display = v.dataset.view === view ? '' : 'none';
        });
      });
    });
  }
};

/* ─── Health Score Gauge ─── */
const Gauge = {
  render(containerId, score, maxScore = 100) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const pct = score / maxScore;
    const offset = circumference * (1 - pct);
    const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
    container.innerHTML = `
      <div class="gauge-container">
        <div class="gauge">
          <svg class="gauge-svg" width="100" height="100" viewBox="0 0 100 100">
            <circle class="gauge-track" cx="50" cy="50" r="${radius}" stroke-dasharray="${circumference}"/>
            <circle class="gauge-fill" cx="50" cy="50" r="${radius}"
              stroke="${color}" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
          </svg>
          <div class="gauge-text">
            <div class="gauge-value" style="color:${color};">${score}</div>
            <div class="gauge-label">/ ${maxScore}</div>
          </div>
        </div>
      </div>`;
  }
};

/* ─── Chart.js Helpers ─── */
const Charts = {
  bar(canvasId, labels, datasets, opts = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.Chart) return null;
    return new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: datasets.length > 1 } },
        scales: {
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        },
        ...opts
      }
    });
  },
  line(canvasId, labels, datasets, opts = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.Chart) return null;
    return new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: datasets.length > 1 } },
        scales: {
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        },
        elements: { point: { radius: 3 }, line: { tension: 0.4 } },
        ...opts
      }
    });
  },
  doughnut(canvasId, labels, data, colors, opts = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.Chart) return null;
    return new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
        ...opts
      }
    });
  }
};

/* ─── Password Strength Checker ─── */
const PasswordStrength = {
  check(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return { score, level: ['', 'weak', 'fair', 'good', 'strong'][score] };
  },
  render(inputId, barId) {
    const input = document.getElementById(inputId);
    const bars = document.querySelectorAll(`#${barId} .strength-bar`);
    if (!input) return;
    input.addEventListener('input', () => {
      const { score, level } = this.check(input.value);
      bars.forEach((bar, i) => {
        bar.className = `strength-bar ${i < score ? level : ''}`;
      });
    });
  }
};

/* ─── Date Range Picker (simple dropdown) ─── */
const DatePicker = {
  init() {
    document.querySelectorAll('.date-range-btn').forEach(btn => {
      const menu = btn.nextElementSibling;
      if (!menu || !menu.classList.contains('date-range-menu')) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
      });
      menu.querySelectorAll('[data-period]').forEach(opt => {
        opt.addEventListener('click', () => {
          btn.querySelector('.date-range-label').textContent = opt.textContent;
          menu.style.display = 'none';
          Toast.info(`Showing data for: ${opt.textContent}`);
        });
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.date-range-menu').forEach(m => m.style.display = 'none');
    });
  }
};

/* ─── Tag Input ─── */
const TagInput = {
  init(wrapperId) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    const input = wrapper.querySelector('input');
    if (!input) return;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        e.preventDefault();
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `${input.value.trim()}<span class="tag-remove" onclick="this.parentElement.remove()">×</span>`;
        wrapper.insertBefore(tag, input);
        input.value = '';
      }
    });
  }
};

/* ─── Delete Confirmation (Type "DELETE") ─── */
const DeleteConfirm = {
  init(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input || !btn) return;
    btn.disabled = true;
    btn.style.opacity = '0.5';
    input.addEventListener('input', () => {
      const enabled = input.value === 'DELETE';
      btn.disabled = !enabled;
      btn.style.opacity = enabled ? '1' : '0.5';
    });
  }
};

/* ─── Initialize on DOMContentLoaded ─── */
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  Modal.init();
  Tabs.init();
  NotifDropdown.init();
  Dropdown.init();
  PillFilter.init();
  AuditExpand.init();
  Collapsible.init();
  ViewToggle.init();
  DatePicker.init();

  // Initialize bulk select if applicable
  if (document.getElementById('clientsTable')) {
    BulkSelect.init('clientsTable', 'bulkActionBar');
  }

  // Initialize delete confirmation if applicable
  if (document.getElementById('deleteConfirmInput')) {
    DeleteConfirm.init('deleteConfirmInput', 'deleteConfirmBtn');
  }

  // Tag inputs
  document.querySelectorAll('[data-tag-input]').forEach(w => TagInput.init(w.id));

  // Password strength meters
  if (document.getElementById('passwordInput')) {
    PasswordStrength.render('passwordInput', 'strengthBars');
  }

  console.log('✅ RankFlow App v2.0 initialized');
});
