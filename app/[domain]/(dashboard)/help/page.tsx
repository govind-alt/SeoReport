'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  BookOpen, Palette, CreditCard, Wrench, Search, Mail, Phone,
  ArrowRight, ChevronDown, MessageSquare, Info, ShieldAlert,
  Send, HelpCircle, CheckCircle, Clock, RefreshCw
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    desc: 'Learn how to connect your first client website and configure your SE Ranking API integration.',
    icon: <BookOpen size={20} />,
    color: '#6366F1',
    bg: 'rgba(99, 102, 241, 0.08)',
  },
  {
    id: 'customization',
    title: 'Report Customization',
    desc: 'Configure brand colors, upload agency logos, and structure custom report section templates.',
    icon: <Palette size={20} />,
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.08)',
  },
  {
    id: 'billing',
    title: 'Billing & Subscription',
    desc: 'Manage billing email alerts, plan tiers, payment details, and view current invoices.',
    icon: <CreditCard size={20} />,
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.08)',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    desc: 'Resolve database sync delays, API rate limits (429 errors), and report rendering issues.',
    icon: <Wrench size={20} />,
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.08)',
  },
];

const FAQS = [
  {
    q: 'Why are my SE Ranking API limits showing as 429?',
    a: 'A 429 status code indicates that the SE Ranking API rate limit has been exceeded. This usually happens when multiple clients are set to run automated audits or keyword checks simultaneously. To resolve this, space out client sync intervals in Settings or contact SE Ranking support to upgrade your API limit package.',
  },
  {
    q: 'How do I add a custom agency domain for report links?',
    a: 'Go to Settings → General → Custom Domain, input your custom portal domain (e.g. reports.youragency.com), and click Save. Then, add a CNAME record in your domain registrar pointing to cname.rankflow.app. A free Let\'s Encrypt SSL certificate will automatically be issued within 10 minutes of propagation.',
  },
  {
    q: 'Can clients log in to view a live dashboard?',
    a: 'RankFlow is structured as a white-label internal platform for agency admins. To share data with clients, you can generate secure read-only public sharing links via the Reports tab. This gives clients an interactive, fully branded portal view without needing login credentials.',
  },
  {
    q: 'Are report PDFs fully white-labeled?',
    a: 'Yes, absolutely. By configuring your Primary Color, Accent Color, and Agency Logo under Settings → Branding, all client portals, email alerts, and generated PDF reports will feature your brand identity without any mention of RankFlow.',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [issueType, setIssueType] = useState('Technical Support');

  const submitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all support fields.');
      return;
    }
    setIsSending(true);
    
    setTimeout(() => {
      setIsSending(false);
      setSubject('');
      setMessage('');
      toast.success('Support ticket created! Check your email for confirmation.');
    }, 1500);
  };

  const filteredFaqs = FAQS.filter(
    faq =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = CATEGORIES.filter(
    cat =>
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <div className="page-title">Help & Support</div>
          <div className="page-subtitle">Browse setup guides, view FAQs, or contact our agency support desk</div>
        </div>
      </div>

      <div style={{ padding: '24px 0', maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Sleek Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
          borderRadius: 16,
          padding: '48px 40px',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 32,
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--navy-border)'
        }}>
          {/* Subtle Glow Spheres */}
          <div style={{ position: 'absolute', top: '-10%', left: '10%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(79, 142, 247, 0.08)', filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '15%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.08)', filter: 'blur(40px)' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 10 }}>How can we help you today?</div>
            <div style={{ fontSize: 14, color: '#94A3B8', maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.6 }}>Search our documentation database for answers to common questions or reach out to our team.</div>
            
            {/* Search Input */}
            <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 10 }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px 16px 48px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.07)',
                  color: 'white',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
                placeholder="Search guides, API settings, subdomains..."
                onFocus={e => e.target.style.background = 'rgba(255,255,255,0.11)'}
                onBlur={e => e.target.style.background = 'rgba(255,255,255,0.07)'}
              />
            </div>
          </div>
        </div>

        {/* Two Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          
          {/* Left Column (Guides & FAQs) */}
          <div>
            
            {/* Categories Header */}
            <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 16 }}>Documentation Guides</div>
            
            {/* Categories Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 36 }}>
              {filteredCategories.map(cat => (
                <Link key={cat.id} href={`/help/guide/${cat.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: 20,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'var(--shadow-sm)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: cat.bg, color: cat.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 16
                    }}>{cat.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{cat.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>{cat.desc}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, fontSize: 12, fontWeight: 700, color: 'var(--primary-dark)' }}>
                      Read Guide <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              ))}
              {filteredCategories.length === 0 && (
                <div style={{ gridColumn: 'span 2', padding: '30px', textAlign: 'center', background: 'var(--gray-50)', borderRadius: 12, border: '1px dashed var(--border)' }}>
                  <Info size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>No guides match your search.</div>
                </div>
              )}
            </div>

            {/* FAQ List */}
            <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 16 }}>Frequently Asked Questions</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {filteredFaqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx} style={{
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: 'var(--surface)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition-fast)'
                  }}>
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: isOpen ? 'var(--gray-50)' : 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseEnter={e => { if(!isOpen) e.currentTarget.style.background = 'var(--gray-50)'; }}
                      onMouseLeave={e => { if(!isOpen) e.currentTarget.style.background = 'transparent'; }}>
                      <span>{faq.q}</span>
                      <ChevronDown size={14} style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        color: 'var(--text-muted)'
                      }} />
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '16px 20px 20px',
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.7,
                        borderTop: '1px solid var(--border)'
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredFaqs.length === 0 && (
                <div style={{ padding: '30px', textAlign: 'center', background: 'var(--gray-50)', borderRadius: 12, border: '1px dashed var(--border)' }}>
                  <HelpCircle size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>No FAQ entries found.</div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Support Desk Form) */}
          <div>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              boxShadow: 'var(--shadow)',
              overflow: 'hidden',
              position: 'sticky',
              top: 16
            }}>
              
              {/* Support Header */}
              <div style={{ padding: 20, borderBottom: '1px solid var(--border)', background: 'var(--gray-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Contact Support</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> Average response: <strong>under 2 hours</strong>
                </div>
              </div>

              {/* Support Form Body */}
              <div style={{ padding: 20 }}>
                <form onSubmit={submitSupport}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 11, marginBottom: 6 }}>Issue Type</label>
                    <select className="form-input" style={{ fontSize: 12, boxShadow: 'var(--shadow-sm)' }} value={issueType} onChange={e => setIssueType(e.target.value)}>
                      <option>Technical Support</option>
                      <option>Billing & Plan</option>
                      <option>Feature Request</option>
                      <option>API Issues</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 11, marginBottom: 6 }}>Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: 12, boxShadow: 'var(--shadow-sm)' }}
                      placeholder="e.g. Can't sync SE Ranking key"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 11, marginBottom: 6 }}>Message</label>
                    <textarea
                      className="form-input"
                      style={{ fontSize: 12, padding: '10px 12px', boxShadow: 'var(--shadow-sm)' }}
                      rows={5}
                      placeholder="Describe the issue in detail..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', borderRadius: 8, fontSize: 12, fontWeight: 700 }}
                    disabled={isSending}
                  >
                    {isSending ? <RefreshCw size={13} className="spinner" /> : <Send size={13} />}
                    {isSending ? 'Creating Ticket…' : 'Submit Ticket'}
                  </button>
                </form>

                {/* Direct Contact Links */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 12 }}>Direct Contact</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                      <Mail size={12} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    support@rankflow.app
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                      <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    1-800-555-RANK
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </>
  );
}
