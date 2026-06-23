/* ═══════════════════════════════════════════════════
   RankFlow — Shared App Utilities
   ═══════════════════════════════════════════════════ */

// ─── Toast Notifications ───
const Toast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(msg, type = 'info', duration = 3500) {
    this.init();
    const icons = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' };
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
    this.container.appendChild(t);
    requestAnimationFrame(() => { requestAnimationFrame(() => { t.classList.add('show'); }); });
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 400);
    }, duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'danger'); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg) { this.show(msg, 'info'); }
};

// ─── Modal Manager ───
const Modal = {
  open(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
  },
  close(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
  },
  init() {
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => Modal.open(btn.dataset.modalOpen));
    });
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => Modal.close(btn.dataset.modalClose));
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });
  }
};

// ─── Tabs ───
const Tabs = {
  init(containerId) {
    const container = document.getElementById(containerId) || document;
    container.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        const group = tab.dataset.tabGroup || 'default';
        const target = tab.dataset.tab;
        container.querySelectorAll(`.tab-item[data-tab-group="${group}"]`).forEach(t => t.classList.remove('active'));
        container.querySelectorAll(`.tab-content[data-tab-group="${group}"]`).forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const content = container.querySelector(`.tab-content[data-tab="${target}"][data-tab-group="${group}"]`);
        if (content) content.classList.add('active');
      });
    });
  }
};

// ─── Dropdown ───
const Dropdown = {
  init() {
    document.querySelectorAll('[data-dropdown-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = document.getElementById(btn.dataset.dropdownToggle);
        if (menu) menu.classList.toggle('open');
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu.open, .notif-dropdown.open').forEach(m => m.classList.remove('open'));
    });
  }
};

// ─── Search Filter ───
const TableSearch = {
  init(inputId, tableId) {
    const input = document.getElementById(inputId);
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

// ─── Password Strength ───
const PasswordStrength = {
  calc(pwd) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(4, score);
  },
  update(inputId, barId, labelId) {
    const input = document.getElementById(inputId);
    const bars = document.querySelectorAll(`#${barId} .strength-bar`);
    const label = document.getElementById(labelId);
    if (!input || !bars.length) return;
    const levels = ['', 'weak', 'fair', 'good', 'strong'];
    const labels = ['', '🔴 Weak', '🟡 Fair', '🟢 Good', '💪 Strong'];
    input.addEventListener('input', () => {
      const score = this.calc(input.value);
      bars.forEach((bar, i) => {
        bar.className = 'strength-bar';
        if (i < score) bar.classList.add(levels[score]);
      });
      if (label) label.textContent = labels[score] || '';
    });
  }
};

// ─── Health Score Gauge ───
const Gauge = {
  render(id, value, color = '#4F46E5') {
    const el = document.getElementById(id);
    if (!el) return;
    const r = 40;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    el.innerHTML = `
      <svg class="gauge-svg" width="100" height="100" viewBox="0 0 100 100">
        <circle class="gauge-track" cx="50" cy="50" r="${r}"/>
        <circle class="gauge-fill" cx="50" cy="50" r="${r}"
          stroke="${color}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
      </svg>
      <div class="gauge-text">
        <span class="gauge-value">${value}</span>
        <span class="gauge-label">/ 100</span>
      </div>`;
  }
};

// ─── Chart Helpers (Chart.js wrappers) ───
const Charts = {
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0F172A', padding: 10, titleColor: '#F8FAFC', bodyColor: '#94A3B8', cornerRadius: 8 } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 11 } } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#94A3B8', font: { size: 11 } }, beginAtZero: true }
    }
  },
  line(canvasId, labels, datasets) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    return new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: datasets.map(d => ({ ...d, tension: 0.4, pointRadius: 3, pointBackgroundColor: d.borderColor })) },
      options: { ...this.defaultOptions }
    });
  },
  bar(canvasId, labels, datasets) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    return new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: datasets.map(d => ({ ...d, borderRadius: 4, borderSkipped: false })) },
      options: { ...this.defaultOptions }
    });
  },
  doughnut(canvasId, labels, data, colors) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    return new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: { legend: { position: 'right', labels: { color: '#64748B', font: { size: 11 }, padding: 12, usePointStyle: true } }, tooltip: { backgroundColor: '#0F172A', padding: 10, cornerRadius: 8 } }
      }
    });
  }
};

// ─── Sidebar Active State ───
function initSidebar() {
  const page = window.location.pathname.split('/').pop().replace('.html', '');
  document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
    if (item.dataset.page === page) item.classList.add('active');
  });
}

// ─── Animate Numbers ───
function animateNumber(el, target, duration = 1200, format = v => v.toLocaleString()) {
  if (!el) return;
  const start = 0, step = 16;
  let current = start;
  const increment = target / (duration / step);
  const timer = setInterval(() => {
    current = Math.min(current + increment, target);
    el.textContent = format(Math.round(current));
    if (current >= target) clearInterval(timer);
  }, step);
}

// ─── Initialize on DOM ready ───
document.addEventListener('DOMContentLoaded', () => {
  Modal.init();
  Dropdown.init();
  Tabs.init();
  initSidebar();
});
