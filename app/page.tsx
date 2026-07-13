import Link from 'next/link';
import './marketing.css';

export default function Home() {
  return (
    <main className="marketing-page">
      <header className="marketing-header">
        <div className="container nav-inner">
          <div className="logo">
            <div className="logo-icon">RF</div>
            RankFlow
          </div>
          <div className="nav-links">
            <Link href="#features">Features</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="/login" style={{ color: 'white', fontWeight: 700 }}>Log In</Link>
            <Link href="/login" className="btn-mktg-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>Start Free Trial</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg-glow"></div>
        <div className="container">
          <h1>Automate your agency&apos;s<br /><span>SEO reporting</span></h1>
          <p>Connect your SERanking account once. Generate beautiful, 100% white-labeled PDF and web reports for all your clients automatically on the 1st of every month.</p>
          <div className="hero-buttons">
            <Link href="/login" className="btn-mktg-primary">Start 14-Day Free Trial</Link>
            <Link href="#features" className="btn-mktg-secondary">See How it Works</Link>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="mockup-wrap">
          <div className="mockup-header">
            <div className="mockup-dot red"></div>
            <div className="mockup-dot yellow"></div>
            <div className="mockup-dot green"></div>
          </div>
          <div className="mockup-body">
            <div className="mockup-title">
              <div className="logo-icon" style={{ width: 28, height: 28, fontSize: 12 }}>RF</div>
              RankFlow Dashboard
            </div>
            
            <div className="mockup-kpi">
              <div className="mockup-card">
                <div className="mockup-card-title">Total Clients</div>
                <div className="mockup-card-value">24</div>
              </div>
              <div className="mockup-card">
                <div className="mockup-card-title">Avg Ranking</div>
                <div className="mockup-card-value" style={{ color: '#22c55e' }}>+4.2</div>
              </div>
              <div className="mockup-card">
                <div className="mockup-card-title">Site Audit Score</div>
                <div className="mockup-card-value">92/100</div>
              </div>
              <div className="mockup-card">
                <div className="mockup-card-title">Reports Sent</div>
                <div className="mockup-card-value">1,402</div>
              </div>
            </div>

            <div className="mockup-layout">
              <div className="mockup-main">
                <div className="mockup-card-title" style={{ marginBottom: 16 }}>Keyword Performance</div>
                <div style={{ height: 180, borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 10, width: 40, height: '40%', background: 'rgba(99,102,241,0.2)', borderTop: '2px solid #6366f1', borderRadius: '4px 4px 0 0' }}></div>
                  <div style={{ position: 'absolute', bottom: 0, left: 70, width: 40, height: '60%', background: 'rgba(99,102,241,0.4)', borderTop: '2px solid #6366f1', borderRadius: '4px 4px 0 0' }}></div>
                  <div style={{ position: 'absolute', bottom: 0, left: 130, width: 40, height: '50%', background: 'rgba(99,102,241,0.3)', borderTop: '2px solid #6366f1', borderRadius: '4px 4px 0 0' }}></div>
                  <div style={{ position: 'absolute', bottom: 0, left: 190, width: 40, height: '80%', background: 'rgba(99,102,241,0.6)', borderTop: '2px solid #6366f1', borderRadius: '4px 4px 0 0' }}></div>
                  <div style={{ position: 'absolute', bottom: 0, left: 250, width: 40, height: '100%', background: 'rgba(99,102,241,0.8)', borderTop: '2px solid #6366f1', borderRadius: '4px 4px 0 0' }}></div>
                </div>
              </div>
              <div className="mockup-side">
                <div className="mockup-card-title" style={{ marginBottom: 16 }}>Recent Reports</div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>✓</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Acme Corp - May</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Sent 2 hours ago</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>✓</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>GlobalTech - May</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Sent 3 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Everything an SEO agency needs</h2>
          <p className="section-subtitle">RankFlow is built from the ground up for SEO professionals who want to automate their entire reporting workflow.</p>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#8b5cf6' }}>⚡</div>
              <div className="feature-title">Native SERanking Sync</div>
              <div className="feature-desc">Connect your SERanking API key once. We automatically pull keyword rankings, backlinks, audit scores, and competitor data for every client.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#10b981' }}>🎨</div>
              <div className="feature-title">100% White-Labeled</div>
              <div className="feature-desc">Your logo, your brand colors, your custom domain (reports.youragency.com). Your clients will never know RankFlow exists.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#3b82f6' }}>🤖</div>
              <div className="feature-title">AI Recommendations</div>
              <div className="feature-desc">Our AI analyzes ranking drops and site audit issues to automatically write a custom &quot;Next Steps&quot; action plan for every single report.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#f59e0b' }}>📄</div>
              <div className="feature-title">Automated PDFs</div>
              <div className="feature-desc">Wake up on the 1st of the month to perfectly formatted PDF reports ready to send. No more wrestling with Google Looker Studio layouts.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#ef4444' }}>📊</div>
              <div className="feature-title">Google Search Console</div>
              <div className="feature-desc">Seamlessly blend SERanking keyword data with real Google Search Console clicks and impressions for a complete performance picture.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#ec4899' }}>🔐</div>
              <div className="feature-title">Client Portal</div>
              <div className="feature-desc">Give your clients a read-only login to view their metrics live, or send them secure, password-less share links to view web reports.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing">
        <div className="container">
          <h2 className="section-title">Simple, transparent pricing</h2>
          <p className="section-subtitle">No hidden fees. Cancel anytime. 14-day free trial on all plans.</p>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3 style={{ fontSize: '24px', color: 'white', fontWeight: 800 }}>Starter</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '8px' }}>For freelancers and small teams.</p>
              <div className="price">$99<span>/mo</span></div>
              <ul className="feature-list">
                <li>Up to 10 clients</li>
                <li>Automated PDF Exports</li>
                <li>SERanking Integration</li>
                <li>Basic White-labeling</li>
              </ul>
              <Link href="/login" className="btn-mktg-secondary" style={{ width: '100%', textAlign: 'center' }}>Start Free Trial</Link>
            </div>
            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <h3 style={{ fontSize: '24px', color: 'white', fontWeight: 800 }}>Pro</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '8px' }}>For growing SEO agencies.</p>
              <div className="price">$249<span>/mo</span></div>
              <ul className="feature-list">
                <li>Up to 50 clients</li>
                <li>Custom Domain (CNAME)</li>
                <li>Client Portal Logins</li>
                <li>AI Recommendations</li>
              </ul>
              <Link href="/login" className="btn-mktg-primary" style={{ width: '100%', textAlign: 'center' }}>Start Free Trial</Link>
            </div>
            <div className="pricing-card">
              <h3 style={{ fontSize: '24px', color: 'white', fontWeight: 800 }}>Enterprise</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '8px' }}>For large scale operations.</p>
              <div className="price">$499<span>/mo</span></div>
              <ul className="feature-list">
                <li>Unlimited clients</li>
                <li>Dedicated Account Manager</li>
                <li>Custom Webhooks & API</li>
                <li>SLA Guarantee</li>
              </ul>
              <Link href="/login" className="btn-mktg-secondary" style={{ width: '100%', textAlign: 'center' }}>Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-logo">
            <div className="logo-icon" style={{ width: 32, height: 32, fontSize: 14 }}>RF</div>
            RankFlow
          </div>
          <p>&copy; 2026 Digital Horizons Inc. All rights reserved.</p>
          <div className="footer-links">
            <Link href="#">Terms of Service</Link>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Security</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
