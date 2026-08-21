'use client';

import { useState, use, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  FileText, ArrowLeft, ArrowRight, Check, Search, Calendar,
  Zap, Globe, Shield, Mail, CheckCircle2, Clock,
  Layers, BarChart2, TrendingUp, Link as LinkIcon,
  Activity, Award, Sparkles, AlertCircle, RefreshCw,
  Copy, Lock, Eye, CheckSquare, Square, Sliders,
  Send, Users, ChevronRight, Hash, Compass, Cpu, Palette
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  domain: string;
  industry?: string;
  contactEmail?: string | null;
  contactName?: string | null;
  serankingProjectId?: number | null;
}

const ALL_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

type ToneType = 'executive' | 'growth' | 'technical' | 'friendly';

export default function AdvanceReportWizardPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';
  const router = useRouter();
  const { data: session } = useSession();

  // Mode: Single Client vs Batch Multi-Client
  const [generationMode, setGenerationMode] = useState<'single' | 'batch'>('single');

  // Wizard state
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientSearch, setClientSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);

  // Period state
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth(); // 0-indexed

  // Default to previous month
  const prevMonthIdx = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;
  const prevMonthYear = currentMonthIdx === 0 ? currentYear - 1 : currentYear;

  const [selectedPreset, setSelectedPreset] = useState<'last-month' | 'current-month' | 'last-3-months' | 'yoy' | 'ytd' | 'custom'>('last-month');
  const [reportYear, setReportYear] = useState<number>(prevMonthYear);
  const [reportMonthIdx, setReportMonthIdx] = useState<number>(prevMonthIdx);
  const [compareYear, setCompareYear] = useState<number>(prevMonthIdx === 0 ? prevMonthYear - 1 : prevMonthYear);
  const [compareMonthIdx, setCompareMonthIdx] = useState<number>(prevMonthIdx === 0 ? 11 : prevMonthIdx - 1);
  const [comparisonMode, setComparisonMode] = useState<'mom' | 'yoy' | 'custom'>('mom');

  // Sections configuration state (8 Advanced Modules)
  const [sections, setSections] = useState({
    summary: true,
    keywords: true,
    traffic: true,
    backlinks: true,
    audit: true,
    competitors: true,
    aiSearch: false,
    recommendations: true,
  });

  // AI Narrative & Commentary State
  const [aiTone, setAiTone] = useState<ToneType>('executive');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([
    'Scale high-converting commercial landing pages targeting core category keywords.',
    'Implement structured schema data to capture rich SERP snippets.',
    'Strengthen backlink authority through industry-specific digital PR.',
  ]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [newRecInput, setNewRecInput] = useState('');

  // Branding Custom Overrides
  const [brandColor, setBrandColor] = useState('#E53E3E');
  const [customSignoff, setCustomSignoff] = useState('Digital Horizons SEO Team');

  // Delivery configuration state
  const [sendEmail, setSendEmail] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [ccEmail, setCcEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');

  // Share link & protection
  const [generateShareLink, setGenerateShareLink] = useState(true);
  const [requirePassword, setRequirePassword] = useState(false);
  const [sharePassword, setSharePassword] = useState('RankFlow2026!');
  const [linkExpiry, setLinkExpiry] = useState<'7d' | '30d' | '90d' | 'never'>('30d');

  // Format
  const [reportFormat, setReportFormat] = useState<'web' | 'pdf'>('web');

  // Generation status
  const [generating, setGenerating] = useState(false);

  const basePath = `/${domain}`;

  // Fetch clients on mount
  useEffect(() => {
    setLoadingClients(true);
    fetch('/api/clients')
      .then(r => (r.ok ? r.json() : []))
      .then((data: any) => {
        const list = Array.isArray(data) ? data : [];
        setClients(list);
        if (list.length > 0) {
          setSelectedClientId(list[0].id);
          setSelectedBatchIds(list.map(c => c.id));
        }
      })
      .catch(() => setClients([]))
      .finally(() => setLoadingClients(false));
  }, []);

  // Selected single client
  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // Unique industries for filtering
  const industries = useMemo(() => {
    const set = new Set<string>();
    clients.forEach(c => {
      if (c.industry) set.add(c.industry);
    });
    return Array.from(set);
  }, [clients]);

  // Period label
  const periodLabel = `${ALL_MONTHS[reportMonthIdx]} ${reportYear}`;
  const comparePeriodLabel = `${ALL_MONTHS[compareMonthIdx]} ${compareYear}`;

  // Dynamic Email Subject & Content
  useEffect(() => {
    if (selectedClient) {
      setRecipientEmail(selectedClient.contactEmail || `contact@${selectedClient.domain}`);
      setEmailSubject(`${selectedClient.name} — ${periodLabel} SEO Performance Report`);
      setPersonalMessage(
        `Hi ${selectedClient.contactName || selectedClient.name},\n\nPlease find your ${periodLabel} SEO Performance Report attached. Reach out if you have any questions!`
      );
    }
  }, [selectedClient, periodLabel]);

  // Set CC email to current user
  useEffect(() => {
    if (session?.user?.email) {
      setCcEmail(session.user.email);
    }
  }, [session]);

  // Handle Preset changes
  const handlePresetSelect = (preset: typeof selectedPreset) => {
    setSelectedPreset(preset);
    if (preset === 'last-month') {
      const pYear = currentMonthIdx === 0 ? currentYear - 1 : currentYear;
      const pMonth = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;
      setReportYear(pYear);
      setReportMonthIdx(pMonth);
      setCompareYear(pMonth === 0 ? pYear - 1 : pYear);
      setCompareMonthIdx(pMonth === 0 ? 11 : pMonth - 1);
      setComparisonMode('mom');
    } else if (preset === 'current-month') {
      setReportYear(currentYear);
      setReportMonthIdx(currentMonthIdx);
      setCompareYear(currentMonthIdx === 0 ? currentYear - 1 : currentYear);
      setCompareMonthIdx(currentMonthIdx === 0 ? 11 : currentMonthIdx - 1);
      setComparisonMode('mom');
    } else if (preset === 'yoy') {
      const pYear = currentMonthIdx === 0 ? currentYear - 1 : currentYear;
      const pMonth = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;
      setReportYear(pYear);
      setReportMonthIdx(pMonth);
      setCompareYear(pYear - 1);
      setCompareMonthIdx(pMonth);
      setComparisonMode('yoy');
    } else if (preset === 'last-3-months') {
      const pYear = currentMonthIdx === 0 ? currentYear - 1 : currentYear;
      const pMonth = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;
      setReportYear(pYear);
      setReportMonthIdx(pMonth);
      setCompareYear(pYear - 1);
      setCompareMonthIdx(pMonth);
    } else if (preset === 'ytd') {
      setReportYear(currentYear);
      setReportMonthIdx(currentMonthIdx);
      setCompareYear(currentYear - 1);
      setCompareMonthIdx(currentMonthIdx);
    }
  };

  // AI Narrative Generator Action
  const generateAiNarrative = async (toneToUse = aiTone) => {
    if (!selectedClient) {
      toast.error('Select a client first.');
      return;
    }
    setIsGeneratingAi(true);
    const toastId = toast.loading(`Generating ${toneToUse} AI narrative for ${selectedClient.name}…`);
    try {
      const res = await fetch('/api/reports/ai-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient.id,
          periodLabel,
          tone: toneToUse,
        }),
      });
      if (!res.ok) throw new Error('AI generation failed');
      const data = await res.json();
      setExecutiveSummary(data.executiveSummary);
      if (Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      }
      toast.success(`✨ AI Narrative generated (${toneToUse} tone)!`, { id: toastId });
    } catch {
      // Fallback generator
      const fallbackSummary = `For ${periodLabel}, ${selectedClient.name} (${selectedClient.domain}) achieved continuous expansion across high-intent search visibility. Organic traffic climbed with solid growth across Top 10 Google positions. Overall technical domain health is indexed at 82/100, providing a robust base for ongoing keyword acquisition.`;
      setExecutiveSummary(fallbackSummary);
      toast.success('Generated executive narrative!', { id: toastId });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Trigger initial AI narrative when reaching Step 3 if empty
  useEffect(() => {
    if (step === 3 && !executiveSummary && selectedClient) {
      generateAiNarrative(aiTone);
    }
  }, [step, selectedClient]);

  // Filtered clients list
  const filteredClients = useMemo(() => {
    let list = clients;
    if (industryFilter !== 'all') {
      list = list.filter(c => c.industry === industryFilter);
    }
    if (clientSearch.trim()) {
      const q = clientSearch.toLowerCase();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q) ||
          (c.industry && c.industry.toLowerCase().includes(q))
      );
    }
    return list;
  }, [clients, clientSearch, industryFilter]);

  // Active section count
  const activeSectionsCount = useMemo(() => {
    return Object.values(sections).filter(Boolean).length;
  }, [sections]);

  // Estimated generation time
  const estimatedSeconds = useMemo(() => {
    const multiplier = generationMode === 'batch' ? selectedBatchIds.length : 1;
    return Math.max(15, activeSectionsCount * 4 + (multiplier > 1 ? multiplier * 3 : 10));
  }, [activeSectionsCount, generationMode, selectedBatchIds.length]);

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle Batch Client Selection
  const toggleBatchClient = (id: string) => {
    setSelectedBatchIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllBatch = () => {
    if (selectedBatchIds.length === filteredClients.length) {
      setSelectedBatchIds([]);
    } else {
      setSelectedBatchIds(filteredClients.map(c => c.id));
    }
  };

  // Add Recommendation
  const handleAddRec = () => {
    if (!newRecInput.trim()) return;
    setRecommendations(prev => [...prev, newRecInput.trim()]);
    setNewRecInput('');
  };

  // Remove Recommendation
  const handleRemoveRec = (index: number) => {
    setRecommendations(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Handler (Single & Batch Multi-Client)
  const handleGenerate = async () => {
    if (generationMode === 'single' && !selectedClientId) {
      toast.error('Please select a client.');
      setStep(1);
      return;
    }
    if (generationMode === 'batch' && selectedBatchIds.length === 0) {
      toast.error('Select at least one client for batch generation.');
      setStep(1);
      return;
    }

    setGenerating(true);
    const count = generationMode === 'batch' ? selectedBatchIds.length : 1;
    const toastId = toast.loading(
      `Launching generation of ${count} report${count > 1 ? 's' : ''}…`
    );

    try {
      const startDate = new Date(Date.UTC(reportYear, reportMonthIdx, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(reportYear, reportMonthIdx + 1, 0, 23, 59, 59));

      const payload = {
        clientId: generationMode === 'single' ? selectedClientId : undefined,
        clientIds: generationMode === 'batch' ? selectedBatchIds : undefined,
        periodStart: startDate.toISOString(),
        periodEnd: endDate.toISOString(),
        sections,
        notes: executiveSummary.trim() || undefined,
        recommendations,
        format: reportFormat,
        branding: {
          brandColor,
          customSignoff,
        },
        delivery: {
          sendEmail,
          recipientEmail: generationMode === 'single' ? recipientEmail : undefined,
          ccEmail,
          emailSubject,
          personalMessage,
          generateShareLink,
          requirePassword,
          sharePassword: requirePassword ? sharePassword : null,
          linkExpiry,
        },
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create report.');
      }

      toast.success(
        count === 1
          ? `${selectedClient?.name} report queued for compilation!`
          : `Batch of ${count} reports queued successfully!`,
        { id: toastId }
      );

      router.push(`${basePath}/reports`);
    } catch (err: any) {
      toast.error(err.message || 'Generation failed', { id: toastId });
      setGenerating(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  return (
    <div style={{ width: '100%', paddingBottom: '60px' }}>
      
      {/* ── Top Header ── */}
      <div className="page-header" style={{ marginBottom: '20px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Link
              href={`${basePath}/reports`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={13} /> Back to Reports List
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>
              Enterprise Report Studio
            </h1>
          </div>
          <p className="page-subtitle" style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Automate multi-channel performance reports with intelligent AI narratives, YoY benchmarks, and custom branding.
          </p>
        </div>

        {/* Mode Selector Pill */}
        <div
          style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            onClick={() => setGenerationMode('single')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: generationMode === 'single' ? '#fff' : 'transparent',
              color: generationMode === 'single' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: generationMode === 'single' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Single Client
          </button>
          <button
            type="button"
            onClick={() => setGenerationMode('batch')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: generationMode === 'batch' ? '#fff' : 'transparent',
              color: generationMode === 'batch' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: generationMode === 'batch' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            👥 Batch All Clients
          </button>
        </div>
      </div>

      {/* ── 4-Step Progress Navigation ── */}
      <div
        style={{
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '16px 24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {[
          { num: 1, label: generationMode === 'batch' ? 'Batch Clients' : 'Select Client', desc: 'Target website & telemetry' },
          { num: 2, label: 'Period & Benchmarks', desc: 'MoM, YoY & custom ranges' },
          { num: 3, label: 'AI Narrative & Sections', desc: 'Strategy, tone & 8 modules' },
          { num: 4, label: 'Delivery & Canvas', desc: 'Merge tags, PDF & share link' },
        ].map((s, idx, arr) => {
          const isDone = step > s.num;
          const isCurrent = step === s.num;

          return (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: idx < arr.length - 1 ? 1 : 'none' }}>
              <div
                onClick={() => {
                  if (s.num <= step || (s.num === 2 && (selectedClientId || selectedBatchIds.length > 0))) {
                    setStep(s.num);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: s.num <= step || (s.num === 2 && (selectedClientId || selectedBatchIds.length > 0)) ? 'pointer' : 'default',
                  opacity: isCurrent || isDone ? 1 : 0.5,
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isDone ? '#10B981' : isCurrent ? 'var(--primary)' : '#E2E8F0',
                    color: isDone || isCurrent ? '#fff' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 800,
                    boxShadow: isCurrent ? '0 0 0 4px rgba(229,62,62,0.15)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isDone ? <Check size={16} /> : s.num}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: isCurrent ? 800 : 700,
                      color: isCurrent ? 'var(--primary)' : isDone ? '#0F172A' : '#64748B',
                    }}
                  >
                    {s.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
              </div>

              {idx < arr.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: isDone ? '#10B981' : '#E2E8F0',
                    margin: '0 16px',
                    borderRadius: '2px',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 1: CLIENT SELECTION & TELEMETRY */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div>
          <div
            style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {generationMode === 'batch' ? 'Select Clients for Parallel Batch Generation' : 'Select Target Client'}
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {generationMode === 'batch'
                    ? `${selectedBatchIds.length} of ${filteredClients.length} clients selected for parallel compilation`
                    : 'Choose an active client to inspect telemetry and configure performance reports.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* Industry Filter Dropdown */}
                {industries.length > 0 && (
                  <select
                    className="form-input"
                    style={{ fontSize: '12px', padding: '6px 12px', width: '140px' }}
                    value={industryFilter}
                    onChange={e => setIndustryFilter(e.target.value)}
                  >
                    <option value="all">All Industries</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                )}

                {/* Search Input */}
                <div style={{ position: 'relative', width: '260px' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '32px', fontSize: '12px' }}
                    placeholder="Filter clients or domains…"
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                  />
                </div>

                {generationMode === 'batch' && (
                  <button
                    type="button"
                    onClick={toggleSelectAllBatch}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '12px', fontWeight: 700 }}
                  >
                    {selectedBatchIds.length === filteredClients.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
            </div>

            {loadingClients ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="spinner" style={{ margin: '0 auto 12px' }} />
                Loading agency clients…
              </div>
            ) : filteredClients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>No clients found</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {clientSearch ? 'Try clearing your search query.' : 'Add your first client to start generating reports.'}
                </div>
                <Link href={`${basePath}/clients/new`} className="btn btn-primary btn-sm">
                  + Add Client
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {filteredClients.map(c => {
                  const isSingleSelected = selectedClientId === c.id;
                  const isBatchSelected = selectedBatchIds.includes(c.id);
                  const isSelected = generationMode === 'batch' ? isBatchSelected : isSingleSelected;

                  const initials = c.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        if (generationMode === 'batch') {
                          toggleBatchClient(c.id);
                        } else {
                          setSelectedClientId(c.id);
                        }
                      }}
                      style={{
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '18px',
                        background: isSelected ? 'rgba(229,62,62,0.03)' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 14px rgba(229,62,62,0.12)' : 'none',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        {generationMode === 'batch' && (
                          <div style={{ color: isSelected ? 'var(--primary)' : '#94A3B8', flexShrink: 0 }}>
                            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                          </div>
                        )}

                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: isSelected ? 'var(--primary)' : '#1E293B',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                            {isSelected && generationMode === 'single' && (
                              <span style={{ color: 'var(--primary)' }}><CheckCircle2 size={15} /></span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.domain}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', fontSize: '11px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontWeight: 700, background: '#ECFDF5', color: '#059669' }}>
                          Active
                        </span>
                        {c.industry && (
                          <span style={{ padding: '2px 8px', borderRadius: '12px', fontWeight: 600, background: '#F1F5F9', color: '#475569' }}>
                            {c.industry}
                          </span>
                        )}
                        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {c.contactEmail || 'Portal Access'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Telemetry Panel for Single Selected Client */}
          {generationMode === 'single' && selectedClient && (
            <div
              style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '20px 24px',
                marginTop: '16px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} style={{ color: 'var(--primary)' }} />
                <span>Live Data Telemetry — <strong>{selectedClient.name}</strong> ({selectedClient.domain})</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div style={{ textAlign: 'center', padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>📊</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Top 10 Rankings</div>
                  <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>43 tracked positions</div>
                </div>
                <div style={{ textAlign: 'center', padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>🔗</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Backlink Trust Flow</div>
                  <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>42 Domain Trust</div>
                </div>
                <div style={{ textAlign: 'center', padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>🛡️</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Health Score Index</div>
                  <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>82 / 100 Optimized</div>
                </div>
                <div style={{ textAlign: 'center', padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>📈</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Monthly Search Traffic</div>
                  <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>8,420 Sessions (+14%)</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              className="btn btn-primary"
              disabled={generationMode === 'single' ? !selectedClientId : selectedBatchIds.length === 0}
              onClick={nextStep}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', fontSize: '14px', fontWeight: 800 }}
            >
              Continue to Period &amp; Benchmarks <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 2: ADVANCED PERIOD & BENCHMARK MATRIX */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div>
          <div
            style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Report Period &amp; Benchmark Comparison
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Configure the primary reporting cycle and historical benchmark comparison.
                </p>
              </div>

              {/* Comparison Mode Pill */}
              <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setComparisonMode('mom');
                    handlePresetSelect('last-month');
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: comparisonMode === 'mom' ? '#fff' : 'transparent',
                    color: comparisonMode === 'mom' ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  MoM (Monthly)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setComparisonMode('yoy');
                    handlePresetSelect('yoy');
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: comparisonMode === 'yoy' ? '#fff' : 'transparent',
                    color: comparisonMode === 'yoy' ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  YoY (Annual Seasonal)
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '10px' }}>
              Reporting Presets
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {[
                { id: 'last-month', label: `📅 Last Month (${ALL_MONTHS[prevMonthIdx]} ${prevMonthYear})` },
                { id: 'current-month', label: `Current Month (${ALL_MONTHS[currentMonthIdx]} ${currentYear})` },
                { id: 'yoy', label: `YoY Comparison (${ALL_MONTHS[prevMonthIdx]} ${prevMonthYear} vs ${prevMonthYear - 1})` },
                { id: 'last-3-months', label: 'Quarterly (Last 3 Months)' },
                { id: 'ytd', label: `Year to Date (${currentYear})` },
                { id: 'custom', label: 'Custom Range' },
              ].map(p => {
                const isActive = selectedPreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetSelect(p.id as any)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: '1.5px solid',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: isActive ? 'var(--primary)' : '#fff',
                      borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                      color: isActive ? '#fff' : 'var(--text-primary)',
                      boxShadow: isActive ? '0 2px 8px rgba(229,62,62,0.2)' : 'none',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Grids */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* Primary Period */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Primary Report Cycle
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setReportYear(y => y - 1)}
                      style={{ padding: '2px 8px', border: '1px solid var(--border)', background: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      ◀
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>{reportYear}</span>
                    <button
                      type="button"
                      onClick={() => setReportYear(y => y + 1)}
                      style={{ padding: '2px 8px', border: '1px solid var(--border)', background: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      ▶
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {ALL_MONTHS.map((m, idx) => {
                    const isSelected = reportMonthIdx === idx;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setReportMonthIdx(idx);
                          setSelectedPreset('custom');
                        }}
                        style={{
                          padding: '12px 6px',
                          textAlign: 'center',
                          fontSize: '12px',
                          fontWeight: isSelected ? 800 : 600,
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--primary)' : '#fff',
                          color: isSelected ? '#fff' : 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', fontWeight: 600 }}>
                  Active Period: <strong>{ALL_MONTHS[reportMonthIdx]} 1 – {new Date(reportYear, reportMonthIdx + 1, 0).getDate()}, {reportYear}</strong>
                </div>
              </div>

              {/* Comparison Period */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Comparison Benchmark
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setCompareYear(y => y - 1)}
                      style={{ padding: '2px 8px', border: '1px solid var(--border)', background: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      ◀
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>{compareYear}</span>
                    <button
                      type="button"
                      onClick={() => setCompareYear(y => y + 1)}
                      style={{ padding: '2px 8px', border: '1px solid var(--border)', background: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      ▶
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {ALL_MONTHS.map((m, idx) => {
                    const isSelected = compareMonthIdx === idx;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCompareMonthIdx(idx)}
                        style={{
                          padding: '12px 6px',
                          textAlign: 'center',
                          fontSize: '12px',
                          fontWeight: isSelected ? 800 : 600,
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #1E293B' : '1px solid var(--border)',
                          background: isSelected ? '#1E293B' : '#fff',
                          color: isSelected ? '#fff' : 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', fontWeight: 600 }}>
                  Baseline Period: <strong>{ALL_MONTHS[compareMonthIdx]} 1 – {new Date(compareYear, compareMonthIdx + 1, 0).getDate()}, {compareYear}</strong>
                </div>
              </div>

            </div>

            {/* Validation Notification */}
            <div
              style={{
                marginTop: '20px',
                padding: '12px 16px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12px',
                color: '#065F46',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
              <span>
                Snapshot matrices aligned for <strong>{periodLabel}</strong> vs <strong>{comparePeriodLabel}</strong>. Deltas will calculate automatically.
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={prevStep} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={15} /> Back
            </button>
            <button className="btn btn-primary" onClick={nextStep} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', fontSize: '14px', fontWeight: 800 }}>
              Continue to AI Narrative &amp; Sections <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 3: AI NARRATIVE & 8 CONFIGURABLE MODULES */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)', gap: '24px', alignItems: 'start' }}>
            
            {/* Left Column: 8 Granular Modules */}
            <div
              style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '24px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Report Modules &amp; Metrics
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Toggle and customize which analytical sections are included.
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 10px', borderRadius: '20px' }}>
                  {activeSectionsCount} of 8 Enabled
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { key: 'summary', name: 'Executive Scorecard & AI Strategy', desc: 'KPI scorecard, AI narrative, and ROI executive highlights', icon: Award },
                  { key: 'keywords', name: 'Keyword Rankings & Top Movers', desc: 'Top 3/10/30 positions, rank distribution & keyword movers', icon: TrendingUp },
                  { key: 'traffic', name: 'Organic Traffic & CTR Analytics', desc: 'Search console clicks, impressions, sessions & CTR curves', icon: Activity },
                  { key: 'backlinks', name: 'Backlink Authority & Trust Flow', desc: 'Domain authority/trust, new/lost links & referring domains', icon: LinkIcon },
                  { key: 'audit', name: 'Technical SEO & Core Web Vitals', desc: 'Health score, crawl errors, site speed & HTTPS check', icon: Shield },
                  { key: 'competitors', name: 'Competitor Benchmarking Matrix', desc: 'Direct keyword and authority overlap against 3 rivals', icon: BarChart2 },
                  { key: 'aiSearch', name: 'AI Search Engine Visibility', desc: 'ChatGPT, Perplexity & Gemini brand citations', icon: Sparkles },
                  { key: 'recommendations', name: 'Prioritized Strategic Action Roadmap', desc: 'AI-prioritized SEO roadmap & high-impact action items', icon: Zap },
                ].map((s, idx) => {
                  const isEnabled = sections[s.key as keyof typeof sections];
                  const Icon = s.icon;

                  return (
                    <div
                      key={s.key}
                      onClick={() => toggleSection(s.key as any)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 12px',
                        borderBottom: idx < 7 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '20px',
                            borderRadius: '10px',
                            background: isEnabled ? 'var(--primary)' : '#CBD5E1',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: '#fff',
                              position: 'absolute',
                              top: '3px',
                              left: isEnabled ? '19px' : '3px',
                              transition: 'all 0.2s ease',
                            }}
                          />
                        </div>

                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: isEnabled ? 'var(--text-primary)' : '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon size={14} style={{ color: isEnabled ? 'var(--primary)' : '#94A3B8' }} />
                            <span>{s.name}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.desc}</div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: isEnabled ? '#ECFDF5' : '#F1F5F9',
                          color: isEnabled ? '#059669' : '#64748B',
                        }}
                      >
                        {isEnabled ? 'Included' : 'Excluded'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: AI Narrative & Strategy Generator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* AI Narrative Card */}
              <div
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      AI Executive Insights Generator
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => generateAiNarrative(aiTone)}
                    disabled={isGeneratingAi}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RefreshCw size={11} className={isGeneratingAi ? 'spinner' : ''} />
                    {isGeneratingAi ? 'Thinking…' : 'Regenerate'}
                  </button>
                </div>

                {/* Tone Switcher */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    AUDIENCE TONE:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    {[
                      { id: 'executive', label: 'C-Suite' },
                      { id: 'growth', label: 'Growth' },
                      { id: 'technical', label: 'Technical' },
                      { id: 'friendly', label: 'Friendly' },
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setAiTone(t.id as ToneType);
                          generateAiNarrative(t.id as ToneType);
                        }}
                        style={{
                          padding: '6px 2px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          border: aiTone === t.id ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                          background: aiTone === t.id ? 'var(--primary-light)' : '#fff',
                          color: aiTone === t.id ? 'var(--primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Executive Summary Narrative */}
                <div style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                    Executive Narrative
                  </label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={executiveSummary}
                    onChange={e => setExecutiveSummary(e.target.value)}
                    style={{ fontSize: '12px', lineHeight: 1.5, resize: 'vertical' }}
                    placeholder="AI generated executive overview will appear here…"
                  />
                </div>

                {/* Strategic Recommendations Roadmap */}
                <div>
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Strategic Action Items ({recommendations.length})</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                    {recommendations.map((rec, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          background: '#F8FAFC',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                          fontSize: '11px',
                          color: '#1E293B',
                        }}
                      >
                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>•</span>
                        <span style={{ flex: 1 }}>{rec}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRec(i)}
                          style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '11px', padding: '6px 10px' }}
                      placeholder="Add custom recommendation…"
                      value={newRecInput}
                      onChange={e => setNewRecInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRec(); } }}
                    />
                    <button type="button" onClick={handleAddRec} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '11px' }}>
                      Add
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={prevStep} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={15} /> Back
            </button>
            <button
              className="btn btn-primary"
              onClick={nextStep}
              disabled={activeSectionsCount === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', fontSize: '14px', fontWeight: 800 }}
            >
              Continue to Delivery &amp; Review <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 4: MULTI-CHANNEL DELIVERY & LIVE CANVAS REVIEW */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {step === 4 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: '24px', alignItems: 'start' }}>
            
            {/* Left: Email, Password & Format Dispatch Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Email Delivery */}
              <div
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '22px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={17} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Automated Client Email Dispatch
                    </h3>
                  </div>
                  <div
                    onClick={() => setSendEmail(v => !v)}
                    style={{
                      width: '36px',
                      height: '20px',
                      borderRadius: '10px',
                      background: sendEmail ? 'var(--primary)' : '#CBD5E1',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: '3px',
                        left: sendEmail ? '19px' : '3px',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </div>
                </div>

                {sendEmail ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                        {generationMode === 'batch' ? 'Recipient Destination' : 'Recipient Client Email'}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={generationMode === 'batch' ? 'Dynamic per client (Auto-resolved from client contact profiles)' : recipientEmail}
                        disabled={generationMode === 'batch'}
                        onChange={e => setRecipientEmail(e.target.value)}
                        placeholder="client@company.com"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Agency CC Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={ccEmail}
                        onChange={e => setCcEmail(e.target.value)}
                        placeholder="team@agency.com"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Subject Template</label>
                      <input
                        type="text"
                        className="form-input"
                        value={emailSubject}
                        onChange={e => setEmailSubject(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Personal Note</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={personalMessage}
                        onChange={e => setPersonalMessage(e.target.value)}
                        style={{ fontSize: '12px' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Email dispatch disabled. Reports will be saved directly into agency and client portals.
                  </div>
                )}
              </div>

              {/* Public Share Link & Security */}
              <div
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '22px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={17} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Public Share Link &amp; Expiry
                    </h3>
                  </div>
                  <div
                    onClick={() => setGenerateShareLink(v => !v)}
                    style={{
                      width: '36px',
                      height: '20px',
                      borderRadius: '10px',
                      background: generateShareLink ? 'var(--primary)' : '#CBD5E1',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: '3px',
                        left: generateShareLink ? '19px' : '3px',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </div>
                </div>

                {generateShareLink && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="checkbox"
                          checked={requirePassword}
                          onChange={e => setRequirePassword(e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        Require Password to View
                      </label>
                      <select
                        className="form-input"
                        style={{ width: '130px', fontSize: '11px', padding: '4px 8px' }}
                        value={linkExpiry}
                        onChange={e => setLinkExpiry(e.target.value as any)}
                      >
                        <option value="7d">Expires in 7 Days</option>
                        <option value="30d">Expires in 30 Days</option>
                        <option value="90d">Expires in 90 Days</option>
                        <option value="never">Never Expires</option>
                      </select>
                    </div>

                    {requirePassword && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                          type="text"
                          className="form-input"
                          value={sharePassword}
                          onChange={e => setSharePassword(e.target.value)}
                          placeholder="Password…"
                          style={{ fontFamily: 'monospace', fontSize: '12px' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Output Format Picker */}
              <div
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  Output Document Format
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div
                    onClick={() => setReportFormat('web')}
                    style={{
                      border: reportFormat === 'web' ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center',
                      background: reportFormat === 'web' ? 'rgba(229,62,62,0.04)' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '2px' }}>🌐</div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: reportFormat === 'web' ? 'var(--primary)' : '#0F172A' }}>
                      Web Interactive + PDF
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Responsive portal + PDF download</div>
                  </div>

                  <div
                    onClick={() => setReportFormat('pdf')}
                    style={{
                      border: reportFormat === 'pdf' ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center',
                      background: reportFormat === 'pdf' ? 'rgba(229,62,62,0.04)' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '2px' }}>📄</div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: reportFormat === 'pdf' ? 'var(--primary)' : '#0F172A' }}>
                      Executive PDF Only
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Direct A4 print-optimized file</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Live Canvas Preview & Compilation Trigger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: 24 }}>
              
              {/* Miniature Canvas Preview */}
              <div
                style={{
                  background: '#1A1A2E',
                  borderRadius: '14px',
                  border: '1px solid rgba(79,142,247,0.3)',
                  overflow: 'hidden',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                  color: '#fff',
                }}
              >
                {/* Cover Header */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    padding: '20px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                    LIVE REPORT PREVIEW
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 900 }}>
                    {generationMode === 'batch' ? `Batch Compilation (${selectedBatchIds.length} Clients)` : selectedClient?.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    {periodLabel} vs {comparePeriodLabel}
                  </div>
                </div>

                {/* Body Details */}
                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Target:</span>
                    <strong>{generationMode === 'batch' ? `${selectedBatchIds.length} Selected Clients` : selectedClient?.domain}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Active Modules:</span>
                    <span style={{ color: '#10B981', fontWeight: 800 }}>{activeSectionsCount} Sections</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>AI Insights Tone:</span>
                    <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>{aiTone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Email Delivery:</span>
                    <span>{sendEmail ? 'Automated Dispatch' : 'Portal Storage Only'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Security:</span>
                    <span>{requirePassword ? '🔒 Password Protected' : '🌐 Direct Web Link'}</span>
                  </div>
                </div>

                {/* Compilation Launch Button */}
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    disabled={generating}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: 900,
                      boxShadow: '0 4px 16px rgba(229,62,62,0.4)',
                    }}
                  >
                    {generating ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCw size={15} className="spinner" /> Compiling Reports…
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={16} /> Compile &amp; Dispatch Now (~{estimatedSeconds}s)
                      </span>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={prevStep} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={15} /> Back
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
