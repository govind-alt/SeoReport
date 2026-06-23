import glob
import re

for f in glob.glob('src/*.html'):
    if 'report-pdf' in f or 'help.html' in f:
        continue
    
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace Toast.info('Opening help...') with window.location.href='help.html'
    content = content.replace("Toast.info('Opening help...')", "window.location.href='help.html'")
    
    # The sidebar link looks like:
    # <a href="#" class="sidebar-item">
    #   <span class="sidebar-item-icon">❓</span>
    #   <span class="sidebar-item-label">Help &amp; Support</span>
    # </a>
    # Or just "Help"
    pattern = r'<a href="#"( class="sidebar-item"(?: active)?)>(\s*<span class="sidebar-item-icon">[^<]+</span>\s*<span class="sidebar-item-label">Help(?: &amp; Support)?</span>\s*)</a>'
    content = re.sub(pattern, r'<a href="help.html"\1>\2</a>', content)

    # Some might be just <a href="#" class="sidebar-item"><span class="sidebar-item-icon">❓</span><span class="sidebar-item-label">Help &amp; Support</span></a> on one line
    pattern2 = r'<a href="#" class="sidebar-item"><span class="sidebar-item-icon">❓</span><span class="sidebar-item-label">Help(?: &amp; Support)?</span></a>'
    content = re.sub(pattern2, r'<a href="help.html" class="sidebar-item"><span class="sidebar-item-icon">❓</span><span class="sidebar-item-label">Help &amp; Support</span></a>', content)
    
    # reports.html specific
    pattern3 = r'<a href="#" class="sidebar-item">\s*<span class="sidebar-item-icon">❓</span>\s*<span class="sidebar-item-label">Help &amp; Support</span>\s*</a>'
    content = re.sub(pattern3, r'<a href="help.html" class="sidebar-item">\n        <span class="sidebar-item-icon">❓</span>\n        <span class="sidebar-item-label">Help &amp; Support</span>\n      </a>', content)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print("Fixed", f)
