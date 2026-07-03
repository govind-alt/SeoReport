import Link from 'next/link';
import './marketing.css';

export default function Home() {
  return (
    <>
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
            <Link href="/onboarding" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', color: 'white' }}>Start Free Trial</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <h1>Automate your agency's<br /><span>SEO reporting</span></h1>
          <p>Connect your SERanking account once. Generate beautiful, 100% white-labeled PDF and web reports for all your clients automatically on the 1st of every month.</p>
          <div className="hero-buttons">
            <Link href="/onboarding" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>Start 14-Day Free Trial</Link>
            <Link href="#features" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '16px' }}>See How it Works</Link>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="mockup-wrap">
          <div className="mockup-header">
            <div className="mockup-dot"></div><div className="mockup-dot"></div><div className="mockup-dot"></div>
          </div>
          <div className="mockup-body">
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '24px' }}>Agency Dashboard</div>
            <div className="mockup-kpi">
              <div className="mockup-card" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' }}></div>
              <div className="mockup-card"></div>
              <div className="mockup-card"></div>
              <div className="mockup-card"></div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 2, height: '250px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
              <div style={{ flex: 1, height: '250px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
            </div>
          </div>
        </div>
      </div>

      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Everything an SEO agency needs</h2>
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
              <div className="feature-desc">Our AI analyzes ranking drops and site audit issues to automatically write a custom "Next Steps" action plan for every single report.</div>
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
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3 style={{ fontSize: '20px', color: 'white' }}>Starter</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>For freelancers and small teams.</p>
              <div className="price">$99<span>/mo</span></div>
              <ul className="feature-list">
                <li>Up to 10 clients</li>
                <li>Automated PDF Exports</li>
                <li>SERanking Integration</li>
                <li>Basic White-labeling</li>
              </ul>
              <Link href="/onboarding" className="btn btn-secondary" style={{ width: '100%' }}>Start Free Trial</Link>
            </div>
            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <h3 style={{ fontSize: '20px', color: 'white' }}>Pro</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>For growing SEO agencies.</p>
              <div className="price">$249<span>/mo</span></div>
              <ul className="feature-list">
                <li>Up to 50 clients</li>
                <li>Custom Domain (CNAME)</li>
                <li>Client Portal Logins</li>
                <li>AI Recommendations</li>
              </ul>
              <Link href="/onboarding" className="btn btn-primary" style={{ width: '100%' }}>Start Free Trial</Link>
            </div>
            <div className="pricing-card">
              <h3 style={{ fontSize: '20px', color: 'white' }}>Enterprise</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>For large scale operations.</p>
              <div className="price">$499<span>/mo</span></div>
              <ul className="feature-list">
                <li>Unlimited clients</li>
                <li>Dedicated Account Manager</li>
                <li>Custom Webhooks & API</li>
                <li>SLA Guarantee</li>
              </ul>
              <Link href="/onboarding" className="btn btn-secondary" style={{ width: '100%' }}>Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>RankFlow</div>
          <p>&copy; 2026 Digital Horizons Inc. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Security</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
