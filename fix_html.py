import glob
import re

new_footer = """    <div class="sidebar-footer">
      <div class="sidebar-user-wrap">
        <!-- User menu popup -->
        <div id="userMenu">
          <div class="user-menu-header">
            <div class="user-menu-name">John Doe</div>
            <div class="user-menu-email">john@digitalhorizons.com</div>
          </div>
          <button class="user-menu-item" onclick="window.location.href='settings.html'">⚙️ Account Settings</button>
          <button class="user-menu-item" onclick="Toast.info('Opening billing...');window.location.href='settings.html'">💳 Billing &amp; Plan</button>
          <button class="user-menu-item" onclick="Toast.info('Opening help...')">❓ Help &amp; Support</button>
          <div class="user-menu-divider"></div>
          <button class="user-menu-item danger" onclick="Logout.confirm()">🚪 Sign Out</button>
        </div>
        <!-- Clickable chip -->
        <div id="sidebarUserChip">
          <div class="sidebar-avatar">JD</div>
          <div>
            <div class="sidebar-user-name">John Doe</div>
            <div class="sidebar-user-role">Agency Admin</div>
          </div>
          <span class="chevron">▲</span>
        </div>
      </div>
    </div>
  </aside>"""

for f in ['src/clients.html', 'src/client-detail.html', 'src/dashboard.html', 'src/reports.html', 'src/settings.html']:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Replace sidebar footer
    pattern = r'<div class="sidebar-footer">.*?<div class="sidebar-user">.*?</div>\s*</div>\s*</div>\s*</aside>'
    content = re.sub(pattern, new_footer, content, flags=re.DOTALL)
    
    # 2. Replace Toast.info downloading PDF
    content = content.replace("Toast.info('Downloading PDF...')", "downloadReport()")
    content = content.replace("Toast.info('Downloading...')", "downloadReport()")
    
    # 3. Fix legend in dashboard
    if f == 'src/dashboard.html':
        content = content.replace("['#10B981','#F59E0B','#EF4444']\n  );", "['#10B981','#F59E0B','#EF4444'],\n    { plugins: { legend: { display: false } } }\n  );")
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print("Fixed", f)
