'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Search, TrendingUp, DollarSign, BarChart2, CheckCircle2,
  Plus, ExternalLink, Sparkles, Filter, RefreshCw, ArrowUpRight,
  Globe, Shield, ChevronRight, Layers, FileText
} from 'lucide-react';

interface KeywordResult {
  id: string;
  keyword: string;
  volume: number;
  difficulty: number; // 0 - 100
  cpc: number;
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  topResult: string;
  trend: 'up' | 'stable' | 'down';
}

const INITIAL_KEYWORDS: KeywordResult[] = [
  { id: '1', keyword: 'digital marketing agency', volume: 22400, difficulty: 68, cpc: 14.50, intent: 'Commercial', topResult: 'agencyanalytics.com', trend: 'up' },
  { id: '2', keyword: 'seo audit services', volume: 8800, difficulty: 54, cpc: 18.20, intent: 'Transactional', topResult: 'semrush.com', trend: 'up' },
  { id: '3', keyword: 'local seo optimization tool', volume: 5400, difficulty: 42, cpc: 9.80, intent: 'Commercial', topResult: 'brightlocal.com', trend: 'stable' },
  { id: '4', keyword: 'how to improve google rankings', volume: 33100, difficulty: 76, cpc: 6.40, intent: 'Informational', topResult: 'backlinko.com', trend: 'up' },
  { id: '5', keyword: 'best rank tracking software', volume: 12100, difficulty: 61, cpc: 12.00, intent: 'Commercial', topResult: 'seranking.com', trend: 'up' },
  { id: '6', keyword: 'technical seo checklist 2026', volume: 14800, difficulty: 48, cpc: 7.90, intent: 'Informational', topResult: 'ahrefs.com', trend: 'stable' },
  { id: '7', keyword: 'white label seo reporting dashboard', volume: 2900, difficulty: 36, cpc: 15.60, intent: 'Transactional', topResult: 'rankflow.app', trend: 'up' },
  { id: '8', keyword: 'ecommerce backlink building strategies', volume: 4100, difficulty: 58, cpc: 11.30, intent: 'Informational', topResult: 'moz.com', trend: 'down' },
];

const MOCK_CLIENTS = [
  { id: 'c1', name: 'Acme HealthPlus', domain: 'healthplus.com' },
  { id: 'c2', name: 'Apex Law Group', domain: 'apexlaw.com' },
  { id: 'c3', name: 'UrbanStay Rentals', domain: 'urbanstay.io' },
  { id: 'c4', name: 'TechCraft Solutions', domain: 'techcraft.dev' },
];

export default function KeywordExplorerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [keywords, setKeywords] = useState<KeywordResult[]>(INITIAL_KEYWORDS);
  const [selectedKw, setSelectedKw] = useState<KeywordResult | null>(null);
  const [clients, setClients] = useState<{id: string, name: string, domain: string}[]>(MOCK_CLIENTS);
  const [assignClientId, setAssignClientId] = useState(MOCK_CLIENTS[0].id);
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const [diffFilter, setDiffFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setClients(data);
          setAssignClientId(data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/seranking/keyword-research?keyword=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Failed to fetch keyword research');
      
      const data = await res.json();
      
      // Transform SERanking data to KeywordResult format if needed, 
      // or directly use it since the demo mock matches the schema mostly.
      const mappedResults: KeywordResult[] = data.map((item: any, i: number) => ({
        id: String(Date.now() + i),
        keyword: item.keyword,
        volume: item.search_volume || 0,
        difficulty: item.difficulty || 0,
        cpc: item.cpc || 0,
        intent: item.intent || 'Informational',
        topResult: item.topResult || 'google.com',
        trend: item.trend || 'stable',
      }));

      setKeywords(prev => [...mappedResults, ...prev]);
      toast.success(`Found ${mappedResults.length} new keyword research results for "${searchQuery}"`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to get keyword research data');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTrackKeyword = () => {
    if (!selectedKw) return;
    const client = clients.find(c => c.id === assignClientId);
    toast.success(`Keyword "${selectedKw.keyword}" added to ${client?.name}'s tracking campaign!`);
    setSelectedKw(null);
  };

  const filteredKeywords = keywords.filter(k => {
    const matchIntent = intentFilter === 'all' || k.intent.toLowerCase() === intentFilter.toLowerCase();
    let matchDiff = true;
    if (diffFilter === 'easy') matchDiff = k.difficulty <= 40;
    if (diffFilter === 'medium') matchDiff = k.difficulty > 40 && k.difficulty <= 65;
    if (diffFilter === 'hard') matchDiff = k.difficulty > 65;
    return matchIntent && matchDiff;
  });

  const avgVolume = Math.round(keywords.reduce((s, k) => s + k.volume, 0) / (keywords.length || 1));
  const avgCpc = (keywords.reduce((s, k) => s + k.cpc, 0) / (keywords.length || 1)).toFixed(2);
  const avgDiff = Math.round(keywords.reduce((s, k) => s + k.difficulty, 0) / (keywords.length || 1));

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Keyword Explorer & Opportunity Research</div>
          <div className="page-subtitle">Discover high-volume search opportunities, SERP difficulty scores, and assign keywords to clients</div>
        </div>
      </div>

      <div style={{ padding: '24px 0', maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Search Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
          borderRadius: 16,
          padding: '36px 32px',
          color: 'white',
          marginBottom: 28,
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--navy-border)'
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} style={{ color: '#4F8EF7' }} /> Agency Keyword Intelligence Engine
          </div>
          <p style={{ fontSize: 13, color: '#94A3B8', maxWidth: 600, marginBottom: 20, lineHeight: 1.6 }}>
            Analyze search volume, CPC value, and competition metrics across millions of keywords. Instantly push high-value targets into client campaigns.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, maxWidth: 640 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Enter seed keyword (e.g., SEO audit, local marketing)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  fontSize: 14,
                  outline: 'none'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              style={{
                padding: '0 24px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #4F8EF7 0%, #2563EB 100%)',
                color: 'white',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(79,142,247,0.35)'
              }}
            >
              {isSearching ? <RefreshCw size={14} className="spinner" /> : <Search size={14} />}
              {isSearching ? 'Analyzing SERP...' : 'Explore Keywords'}
            </button>
          </form>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 28 }}>
          {[
            { label: 'Avg Monthly Search Volume', val: avgVolume.toLocaleString(), sub: 'Across researched keywords', icon: <TrendingUp size={20} />, color: '#4F8EF7', bg: 'rgba(79,142,247,0.08)' },
            { label: 'Avg Keyword Difficulty', val: `${avgDiff} / 100`, sub: avgDiff > 50 ? 'Moderate Competition' : 'Low Competition', icon: <BarChart2 size={20} />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
            { label: 'Avg Cost Per Click (CPC)', val: `$${avgCpc}`, sub: 'Estimated Google Ads CPC', icon: <DollarSign size={20} />, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Tracked Keywords', val: keywords.length, sub: 'Active database opportunities', icon: <Layers size={20} />, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          ].map((item, idx) => (
            <div key={idx} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 20,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{item.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Filter Controls & Keyword Table */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          {/* Table Toolbar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-50)' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Keyword Opportunities ({filteredKeywords.length})</div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <select
                value={intentFilter}
                onChange={e => setIntentFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, background: 'var(--surface)', color: 'var(--text-primary)' }}
              >
                <option value="all">All Search Intents</option>
                <option value="commercial">Commercial</option>
                <option value="transactional">Transactional</option>
                <option value="informational">Informational</option>
              </select>

              <select
                value={diffFilter}
                onChange={e => setDiffFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, background: 'var(--surface)', color: 'var(--text-primary)' }}
              >
                <option value="all">All Difficulty Levels</option>
                <option value="easy">Easy (KD ≤ 40)</option>
                <option value="medium">Medium (KD 41-65)</option>
                <option value="hard">Hard (KD &gt; 65)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                {['Keyword', 'Search Volume', 'Difficulty (KD)', 'Est. CPC', 'Intent', 'Top Ranker #1', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredKeywords.map(kw => (
                <tr key={kw.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {kw.keyword}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>
                    {kw.volume.toLocaleString()} / mo
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 44, height: 6, borderRadius: 3, background: 'var(--gray-200)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${kw.difficulty}%`,
                          height: '100%',
                          background: kw.difficulty > 65 ? '#EF4444' : kw.difficulty > 40 ? '#F59E0B' : '#10B981'
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: kw.difficulty > 65 ? '#EF4444' : kw.difficulty > 40 ? '#F59E0B' : '#10B981' }}>
                        {kw.difficulty}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    ${kw.cpc.toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: kw.intent === 'Commercial' ? 'rgba(79,142,247,0.1)' : kw.intent === 'Transactional' ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.1)',
                      color: kw.intent === 'Commercial' ? 'var(--primary)' : kw.intent === 'Transactional' ? '#10B981' : '#8B5CF6'
                    }}>
                      {kw.intent}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <code>{kw.topResult}</code>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => setSelectedKw(kw)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Plus size={12} /> Track for Client
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Assign Modal */}
        {selectedKw && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
          }}>
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, maxWidth: 460, width: '100%', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Add Keyword to Client Campaign</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>
                Assigning <strong>&ldquo;{selectedKw.keyword}&rdquo;</strong> ({selectedKw.volume.toLocaleString()} vol/mo) to rank tracking campaign.
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Select Client</label>
                <select
                  value={assignClientId}
                  onChange={e => setAssignClientId(e.target.value)}
                  className="form-input"
                  style={{ fontSize: 13 }}
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.domain})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleTrackKeyword}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px 0', fontSize: 13, justifyContent: 'center' }}
                >
                  Confirm & Start Tracking
                </button>
                <button
                  onClick={() => setSelectedKw(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px 0', fontSize: 13, justifyContent: 'center' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
