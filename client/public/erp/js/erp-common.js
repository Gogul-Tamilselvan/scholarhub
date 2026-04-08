/* ============================================================
   Scholar India Publishers — ERP Common JS
   Set WEB_APP_URL to your deployed Google Apps Script web app URL
   ============================================================ */

const DEFAULT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzxOlBhBgX3j-VmjjPfo2CwbbeHLJEex3m5OPjTKLYnnf91D7sD9zi2sPByNfI2HZW8/exec';

const WEB_APP_URL = (function() {
  // Try to get from localStorage (configurable by admin), fallback to default
  let url = localStorage.getItem('erp_webapp_url');
  if (!url) {
    url = DEFAULT_WEB_APP_URL;
    localStorage.setItem('erp_webapp_url', url);
  }
  return url;
})();

/* ─── API HELPERS ─────────────────────────────────────────── */
async function apiGet(params) {
  const url = WEB_APP_URL;
  if (!url) {
    console.error('ERP: No WEB_APP_URL configured. Go to /erp/setup.html to configure.');
    return { status: 'error', message: 'Web App URL not configured. Please set up the ERP backend first.' };
  }
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(url + '?' + qs, { method: 'GET', redirect: 'follow' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function apiPost(data) {
  const url = WEB_APP_URL;
  if (!url) return { status: 'error', message: 'Web App URL not configured.' };
  // Use text/plain to avoid CORS preflight — GAS doPost reads e.postData.contents as text
  // and JSON.parses it, so the payload format is unchanged.
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify(data),
    redirect: 'follow'
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function apiBatchGet(actions) {
  return apiPost({ action: 'batch', actions });
}

/* ─── SIDEBAR BUILDERS ────────────────────────────────────── */
const ADMIN_NAV = [
  { key: 'dashboard',         label: 'Dashboard',         icon: 'fa-tachometer-alt', href: 'admin-dashboard.html' },
  { key: 'manuscripts',       label: 'Manuscripts',        icon: 'fa-file-alt',       href: 'admin-manuscripts.html' },
  { key: 'approve-reviewers', label: 'Approve Reviewers',  icon: 'fa-user-check',     href: 'admin-approve-reviewers.html' },
  { key: 'approve-reviews',   label: 'Approve Reviews',    icon: 'fa-check-square',   href: 'admin-approve-reviews.html' },
  { key: 'assign',            label: 'Assign Work',        icon: 'fa-tasks',          href: 'admin-assign.html' },
  { key: 'assignments',       label: 'Assignments',        icon: 'fa-list-check',     href: 'admin-assignments.html' },
  { key: 'final-submissions', label: 'Final Submissions',  icon: 'fa-file-upload',    href: 'admin-final-submissions.html' },
  { key: 'payments',          label: 'Payments',           icon: 'fa-credit-card',    href: 'admin-payments.html' },
  { key: 'books',             label: 'Books',              icon: 'fa-book',           href: 'admin-books.html' },
  { key: 'contact',           label: 'Contact Leads',      icon: 'fa-envelope-open-text', href: 'admin-contact.html' },
  { key: 'newsletter',        label: 'Newsletter',         icon: 'fa-newspaper',      href: 'admin-newsletter.html' },
  { key: 'messages',          label: 'Messages',           icon: 'fa-comments',       href: 'admin-messages.html' },
  { key: 'popup',             label: 'Broadcast Popup',    icon: 'fa-bullhorn',       href: 'admin-popup.html' },
  { key: 'deadlines',         label: 'Deadlines',          icon: 'fa-calendar-alt',   href: 'admin-deadlines.html' },
  { key: 'performance',       label: 'Performance',        icon: 'fa-chart-bar',      href: 'admin-performance.html' },
  { key: 'login-activity',    label: 'Login Activity',     icon: 'fa-history',        href: 'admin-login-activity.html' },
  { key: 'users',             label: 'Users',              icon: 'fa-users-cog',      href: 'admin-users.html' },
];

const MEMBER_NAV = [
  { key: 'dashboard',  label: 'Dashboard',         icon: 'fa-tachometer-alt', href: 'member-dashboard.html' },
  { key: 'reviews',    label: 'My Assignments',     icon: 'fa-tasks',          href: 'member-reviews.html' },
  { key: 'messages',   label: 'Messages',           icon: 'fa-comments',       href: 'member-messages.html' },
  { key: 'profile',    label: 'My Profile',         icon: 'fa-user-circle',    href: 'member-profile.html' },
];

function buildAdminSidebar(activeKey) {
  const userName = sessionStorage.getItem('userName') || 'Admin';
  const userRole = sessionStorage.getItem('userRole') || 'Administrator';
  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';

  const navHtml = ADMIN_NAV.map(item => `
    <a class="sidebar-nav-item" href="${item.href}">
      <span class="sidebar-nav-link${item.key === activeKey ? ' active' : ''}">
        <i class="fa ${item.icon}"></i>
        <span>${item.label}</span>
      </span>
    </a>`).join('');

  const sidebar = document.createElement('aside');
  sidebar.className = 'erp-sidebar';
  sidebar.id = 'erpSidebar';
  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <img src="assets/sip-logo.png" alt="SIP Logo" onerror="this.style.display='none'">
      <div class="sidebar-logo-text">
        <div class="brand">Scholar India</div>
        <div class="sub">Publishers ERP</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section-title">Navigation</div>
      ${navHtml}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user" onclick="window.location.href='admin-users.html'">
        <div class="user-avatar">${initials}</div>
        <div class="user-details">
          <div class="user-name">${userName}</div>
          <div class="user-role">${userRole}</div>
        </div>
      </div>
      <a class="sidebar-logout" onclick="adminLogout()">
        <i class="fa fa-sign-out-alt"></i> Sign Out
      </a>
    </div>`;

  const layout = document.querySelector('.erp-layout');
  if (layout) layout.insertBefore(sidebar, layout.firstChild);

  // Add toggle button to header
  const header = document.querySelector('.erp-header .header-left');
  if (header) {
    const btn = document.createElement('button');
    btn.className = 'sidebar-toggle-btn';
    btn.innerHTML = '<i class="fa fa-bars"></i>';
    btn.onclick = toggleMobileSidebar;
    header.insertBefore(btn, header.firstChild);
  }

  // Add overlay
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebarOverlay';
  overlay.onclick = toggleMobileSidebar;
  document.body.appendChild(overlay);

  // Sync user name in header
  const headerName = document.getElementById('header-user-name');
  if (headerName) headerName.textContent = userName;
  const headerName2 = document.getElementById('header-user-name2');
  if (headerName2) headerName2.textContent = userName;
  const headerAvatar = document.getElementById('header-avatar');
  if (headerAvatar) headerAvatar.textContent = initials;
}

function buildMemberSidebar(activeKey) {
  const userName = sessionStorage.getItem('userName') || 'Member';
  const userRole = sessionStorage.getItem('userRole') || 'Reviewer';
  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'RV';

  const navHtml = MEMBER_NAV.map(item => `
    <a class="sidebar-nav-item" href="${item.href}">
      <span class="sidebar-nav-link${item.key === activeKey ? ' active' : ''}">
        <i class="fa ${item.icon}"></i>
        <span>${item.label}</span>
      </span>
    </a>`).join('');

  const sidebar = document.createElement('aside');
  sidebar.className = 'erp-sidebar';
  sidebar.id = 'erpSidebar';
  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <img src="assets/sip-logo.png" alt="SIP Logo" onerror="this.style.display='none'">
      <div class="sidebar-logo-text">
        <div class="brand">Scholar India</div>
        <div class="sub">Member Portal</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section-title">Navigation</div>
      ${navHtml}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user" onclick="window.location.href='member-profile.html'">
        <div class="user-avatar">${initials}</div>
        <div class="user-details">
          <div class="user-name">${userName}</div>
          <div class="user-role">${userRole}</div>
        </div>
      </div>
      <a class="sidebar-logout" onclick="memberLogout()">
        <i class="fa fa-sign-out-alt"></i> Sign Out
      </a>
    </div>`;

  const layout = document.querySelector('.erp-layout');
  if (layout) layout.insertBefore(sidebar, layout.firstChild);

  // Add toggle button to header
  const header = document.querySelector('.erp-header .header-left');
  if (header) {
    const btn = document.createElement('button');
    btn.className = 'sidebar-toggle-btn';
    btn.innerHTML = '<i class="fa fa-bars"></i>';
    btn.onclick = toggleMobileSidebar;
    header.insertBefore(btn, header.firstChild);
  }

  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebarOverlay';
  overlay.onclick = toggleMobileSidebar;
  document.body.appendChild(overlay);

  const headerName = document.getElementById('header-user-name');
  if (headerName) headerName.textContent = userName;
  const headerAvatar = document.getElementById('header-avatar');
  if (headerAvatar) headerAvatar.textContent = initials;

  // Check for popup broadcasts
  checkBroadcastPopup();
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('erpSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.toggle('mobile-open');
  if (overlay) overlay.classList.toggle('show');
}

/* ─── LOGOUT ──────────────────────────────────────────────── */
function adminLogout() {
  const name = sessionStorage.getItem('userName') || '';
  const id = sessionStorage.getItem('userId') || '';
  const role = sessionStorage.getItem('userRole') || '';
  apiPost({ action: 'logActivity', action_type: 'Logout', userId: id, userName: name, role: role, details: 'Logged out', page: 'admin' }).catch(() => {});
  sessionStorage.clear();
  window.location.href = 'admin-login.html';
}

function memberLogout() {
  const name = sessionStorage.getItem('userName') || '';
  const id = sessionStorage.getItem('userId') || '';
  const role = sessionStorage.getItem('userRole') || '';
  apiPost({ action: 'logActivity', action_type: 'Logout', userId: id, userName: name, role: role, details: 'Logged out', page: 'member' }).catch(() => {});
  sessionStorage.clear();
  window.location.href = 'member-login.html';
}

/* ─── BROADCAST POPUP CHECK ───────────────────────────────── */
async function checkBroadcastPopup() {
  try {
    const userId = sessionStorage.getItem('userId') || '';
    const role = (sessionStorage.getItem('userRole') || '').toLowerCase();
    const res = await apiGet({ action: 'getPopups' });
    if (res.status !== 'success') return;
    const now = new Date();
    const popups = res.data.filter(p => {
      const start = p['Start Time'] ? new Date(p['Start Time']) : new Date(0);
      const end = p['End Time'] ? new Date(p['End Time']) : new Date(9999,0);
      const target = String(p['Target'] || 'all').toLowerCase();
      const seenKey = 'popup_seen_' + (p['Popup ID'] || p['Title']);
      if (sessionStorage.getItem(seenKey)) return false;
      if (now < start || now > end) return false;
      if (target === 'all') return true;
      return target.includes(role) || target.includes(userId);
    });
    if (popups.length > 0) {
      showPopupModal(popups[0]);
    }
  } catch (e) {}
}

function showPopupModal(popup) {
  const div = document.createElement('div');
  div.className = 'modal-overlay show';
  div.id = 'broadcastPopupModal';
  div.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3><i class="fa fa-bullhorn" style="color:var(--warning);"></i> ${popup['Title'] || 'Announcement'}</h3>
        <button class="modal-close" onclick="closeBroadcastPopup('${popup['Popup ID'] || popup['Title']}')">×</button>
      </div>
      <div class="modal-body">
        <p style="font-size:.88rem;line-height:1.6;color:var(--text);">${(popup['Message'] || '').replace(/\n/g,'<br>')}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeBroadcastPopup('${popup['Popup ID'] || popup['Title']}')"><i class="fa fa-check"></i> Got it</button>
      </div>
    </div>`;
  document.body.appendChild(div);
}

function closeBroadcastPopup(id) {
  sessionStorage.setItem('popup_seen_' + id, '1');
  const el = document.getElementById('broadcastPopupModal');
  if (el) el.remove();
}

/* ─── UTILITIES ───────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fa ${icon}"></i> ${msg}`;
  container.appendChild(t);
  setTimeout(() => t.style.opacity = '0', 3000);
  setTimeout(() => t.remove(), 3400);
}

function fmtDate(val) {
  if (!val && val !== 0) return '—';
  try {
    let d;
    if (typeof val === 'number') {
      // Excel serial date from Google Sheets (days since 1899-12-30)
      if (val > 25000 && val < 100000) {
        d = new Date((val - 25569) * 86400 * 1000);
      } else {
        d = new Date(val);
      }
    } else {
      // Normalize 'yyyy-MM-dd HH:mm:ss' → 'yyyy-MM-ddTHH:mm:ss' for Safari/Firefox
      const s = String(val).replace(' ', 'T');
      d = new Date(s);
    }
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return String(val); }
}

function fmtDT(val) {
  if (!val && val !== 0) return '—';
  try {
    const s = typeof val === 'string' ? val.replace(' ', 'T') : val;
    const d = new Date(s);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return String(val); }
}

function statusBadge(status) {
  if (!status) return '<span class="badge badge-gray">—</span>';
  const s = String(status).toLowerCase().trim();
  if (s.includes('active') || s.includes('approved') || s.includes('completed') || s.includes('published') || s.includes('accepted') || s.includes('paid'))
    return `<span class="badge badge-success">${status}</span>`;
  if (s.includes('pending') || s.includes('submitted') || s.includes('under') || s.includes('review'))
    return `<span class="badge badge-info">${status}</span>`;
  if (s.includes('reject') || s.includes('revoke') || s.includes('cancel') || s.includes('inactive') || s.includes('deactivat'))
    return `<span class="badge badge-danger">${status}</span>`;
  if (s.includes('revision') || s.includes('remind') || s.includes('overdue') || s.includes('late'))
    return `<span class="badge badge-warning">${status}</span>`;
  if (s.includes('admin') || s.includes('editorial'))
    return `<span class="badge badge-purple">${status}</span>`;
  if (s.includes('reviewer'))
    return `<span class="badge badge-teal">${status}</span>`;
  return `<span class="badge badge-gray">${status}</span>`;
}

function sortTable(data, key, asc = true) {
  return [...data].sort((a, b) => {
    const va = String(a[key] || '').toLowerCase();
    const vb = String(b[key] || '').toLowerCase();
    return asc ? va.localeCompare(vb) : vb.localeCompare(va);
  });
}

function exportCSV(data, filename) {
  if (!data || !data.length) { showToast('No data to export', 'warning'); return; }
  const headers = Object.keys(data[0]);
  const rows = [headers, ...data.map(r => headers.map(h => `"${String(r[h] || '').replace(/"/g, '""')}"`))]
    .map(r => r.join(',')).join('\n');
  const blob = new Blob([rows], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (filename || 'export') + '_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToast('CSV exported', 'success');
}

function printTable(title) {
  const w = window.open('', '_blank');
  const html = document.querySelector('.erp-table')?.outerHTML || '<p>No table found</p>';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const userName = sessionStorage.getItem('userName') || 'Administrator';
  const userRole = sessionStorage.getItem('userRole') || 'Admin';
  
  const headerHTML = `
    <div class="print-header">
      <div style="text-align: center; border-bottom: 2px solid #213361; padding-bottom: 12px; margin-bottom: 16px;">
        <h1 style="margin: 0 0 4px 0; color: #213361; font-size: 20px; font-weight: 700;">Scholar India Publishers</h1>
        <h2 style="margin: 0; color: #555; font-size: 16px; font-weight: 600;">${title || 'Report'}</h2>
        <p style="margin: 8px 0 0 0; color: #666; font-size: 12px;">Generated on ${dateStr} at ${timeStr}</p>
      </div>
    </div>
  `;
  
  const footerHTML = `
    <div class="print-footer" style="margin-top: 20px; padding-top: 12px; border-top: 2px solid #213361; font-size: 11px; color: #666;">
      <p style="margin: 4px 0;">Generated by: ${userName} (${userRole})</p>
      <p style="margin: 4px 0;">Scholar Journal of Commerce and Management | Scholar Journal of Humanities and Social Sciences</p>
      <p style="margin: 4px 0;">Address: New Delhi, India</p>
    </div>
  `;
  
  w.document.write(`<!DOCTYPE html><html><head><title>${title || 'Print'}</title>
    <style>
      * { box-sizing: border-box; }
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        padding: 20px; 
        margin: 0;
        color: #333;
      }
      .print-header { margin-bottom: 16px; }
      .print-footer { font-size: 11px; color: #666; }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-top: 12px;
      }
      th { 
        background: #213361; 
        color: white;
        padding: 10px; 
        border: 1px solid #ddd; 
        font-size: 11px; 
        font-weight: 600;
        text-align: left;
      }
      td { 
        padding: 8px 10px; 
        border: 1px solid #ddd; 
        font-size: 11px; 
      }
      tr:nth-child(even) { background: #f9f9f9; }
      tr:hover { background: #f0f0f0; }
      @media print {
        body { padding: 10px; }
        .print-header { page-break-inside: avoid; }
        .print-footer { 
          margin-top: 30px;
          position: relative;
          bottom: 0;
        }
        table { page-break-inside: avoid; }
      }
    </style>
    </head><body>${headerHTML}${html}${footerHTML}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 500);
}

function toggleActionMenu(btn) {
  const wrap = btn.closest('.action-wrap');
  if (!wrap) return;
  const menu = wrap.querySelector('.action-menu');
  if (!menu) return;
  const isOpen = menu.classList.contains('show');
  // Close all menus
  document.querySelectorAll('.action-menu.show').forEach(m => m.classList.remove('show'));
  if (!isOpen) menu.classList.add('show');
}
// Close action menus on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.action-wrap')) {
    document.querySelectorAll('.action-menu.show').forEach(m => m.classList.remove('show'));
  }
});

function closeModal(id) {
  const el = id ? document.getElementById(id) : document.querySelector('.modal-overlay.show');
  if (el) el.classList.remove('show');
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

function getVal(obj, keys) {
  if (!obj || !keys) return '';
  const objKeys = Object.keys(obj);
  for (const k of keys) {
    // Exact match first
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
    // Trimmed match (handles trailing/leading spaces in Google Sheets column names)
    const trimmed = k.trim().toLowerCase();
    const found = objKeys.find(ok => ok.trim().toLowerCase() === trimmed);
    if (found && obj[found] !== undefined && obj[found] !== null && obj[found] !== '') return obj[found];
  }
  return '';
}

function logActivity(actionType, details, page) {
  const uid = sessionStorage.getItem('userId') || '';
  const uname = sessionStorage.getItem('userName') || '';
  const role = sessionStorage.getItem('userRole') || '';
  if (!uid) return;
  apiPost({ action: 'logActivity', action_type: actionType, userId: uid, userName: uname, role, details, page }).catch(() => {});
}

/* ─── SETUP CHECK ─────────────────────────────────────────── */
function checkSetup() {
  // Ensure URL is always initialized
  let url = localStorage.getItem('erp_webapp_url');
  if (!url) {
    url = DEFAULT_WEB_APP_URL;
    localStorage.setItem('erp_webapp_url', url);
  }
  // Only show banner if URL is invalid (shouldn't happen with our auto-init)
  if (!url || !url.includes('script.google.com')) {
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#fef3c7;color:#92400e;padding:10px 20px;font-size:.8rem;font-weight:600;text-align:center;border-bottom:1px solid #fde68a;';
    banner.innerHTML = '<i class="fa fa-exclamation-triangle"></i> Google Apps Script backend not configured. <a href="setup.html" style="color:#92400e;font-weight:700;text-decoration:underline;">Click here to set up</a>.';
    document.body.insertBefore(banner, document.body.firstChild);
  }
}

// Ensure setup runs after DOM is ready if called
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkSetup);
} else {
  checkSetup();
}
