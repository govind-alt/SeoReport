'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  CheckSquare, Square, Plus, Trash2, Calendar, User,
  AlertTriangle, Filter, CheckCircle2, Clock, Wrench, Search, Layers,
  TrendingUp, Sparkles, ShieldCheck, Check, ArrowRight
} from 'lucide-react';

interface SeoTask {
  id: string;
  title: string;
  clientName: string;
  category: 'Technical Audit' | 'On-Page Meta' | 'Backlink Outreach' | 'Content Optimization' | 'Page Speed';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  assignee: string;
  completed: boolean;
}

const INITIAL_TASKS: SeoTask[] = [
  { id: 't1', title: 'Fix 14 missing meta description tags on product pages', clientName: 'Acme HealthPlus', category: 'On-Page Meta', priority: 'High', dueDate: 'Jul 24, 2026', assignee: 'Alex Johnson', completed: false },
  { id: 't2', title: 'Compress LCP image assets & enable Next WebP caching', clientName: 'Apex Law Group', category: 'Page Speed', priority: 'High', dueDate: 'Jul 25, 2026', assignee: 'Sarah Miller', completed: false },
  { id: 't3', title: 'Disavow 8 spammy backlink domains flagged in audit', clientName: 'UrbanStay Rentals', category: 'Backlink Outreach', priority: 'Medium', dueDate: 'Jul 28, 2026', assignee: 'Jake Andrews', completed: true },
  { id: 't4', title: 'Update blog posts with 2026 targeted primary keywords', clientName: 'TechCraft Solutions', category: 'Content Optimization', priority: 'Medium', dueDate: 'Jul 30, 2026', assignee: 'Alex Johnson', completed: false },
  { id: 't5', title: 'Fix duplicate canonical URL tags across paginated pages', clientName: 'Acme HealthPlus', category: 'Technical Audit', priority: 'Low', dueDate: 'Aug 02, 2026', assignee: 'Lisa Torres', completed: false },
];

export default function AgencyTasksPage() {
  const [tasks, setTasks] = useState<SeoTask[]>(INITIAL_TASKS);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'high' | 'completed'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('Acme HealthPlus');
  const [category, setCategory] = useState<SeoTask['category']>('Technical Audit');
  const [priority, setPriority] = useState<SeoTask['priority']>('High');
  const [dueDate, setDueDate] = useState('Jul 28, 2026');
  const [assignee, setAssignee] = useState('Alex Johnson');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: SeoTask = {
      id: String(Date.now()),
      title,
      clientName,
      category,
      priority,
      dueDate,
      assignee,
      completed: false,
    };

    setTasks(prev => [newTask, ...prev]);
    setIsCreating(false);
    setTitle('');
    toast.success('SEO Action Task created successfully!');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = !t.completed;
      toast.success(`Task "${t.title}" marked as ${next ? 'completed' : 'pending'}.`);
      return { ...t, completed: next };
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Task removed from action plan.');
  };

  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === 'all' || t.category.toLowerCase() === filterCategory.toLowerCase();
    
    let matchTab = true;
    if (filterTab === 'pending') matchTab = !t.completed;
    if (filterTab === 'high') matchTab = !t.completed && t.priority === 'High';
    if (filterTab === 'completed') matchTab = t.completed;

    return matchSearch && matchCategory && matchTab;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const highPriorityCount = tasks.filter(t => !t.completed && t.priority === 'High').length;
  const progressPct = Math.round((completedCount / (tasks.length || 1)) * 100);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Agency SEO Task Manager & Action Plan</div>
          <div className="page-subtitle">Track technical audit resolutions, content optimizations, and client campaign deliverables</div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700 }}
        >
          <Plus size={15} /> Add Action Task
        </button>
      </div>

      <div style={{ padding: '8px 0', width: '100%' }}>

        {/* Hero Progress & Overview Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 16,
          padding: '28px 32px',
          color: 'white',
          marginBottom: 28,
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 32,
          alignItems: 'center'
        }}>
          {/* Left: Overall Campaign Progress */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#4F8EF7', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} /> Campaign Milestone Tracker
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              {progressPct}% Client Deliverables Completed
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 18, lineHeight: 1.5 }}>
              {completedCount} of {tasks.length} total tasks completed across active agency accounts. {highPriorityCount > 0 ? `${highPriorityCount} critical items pending review.` : 'All critical items resolved!'}
            </div>

            {/* Visual Progress Bar */}
            <div style={{ width: '100%', height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative' }}>
              <div style={{
                width: `${progressPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4F8EF7 0%, #10B981 100%)',
                borderRadius: 5,
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* Right: Quick Stat Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 6 }}>Total Tasks</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{tasks.length}</div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Active tasks</div>
            </div>

            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#FCA5A5', textTransform: 'uppercase', marginBottom: 6 }}>High Priority</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#F87171' }}>{highPriorityCount}</div>
              <div style={{ fontSize: 10, color: '#FCA5A5', marginTop: 2 }}>Requires action</div>
            </div>

            <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6EE7B7', textTransform: 'uppercase', marginBottom: 6 }}>Completed</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#34D399' }}>{completedCount}</div>
              <div style={{ fontSize: 10, color: '#6EE7B7', marginTop: 2 }}>Client ready</div>
            </div>
          </div>
        </div>

        {/* Tab Filters & Toolbar */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          {/* Header Bar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 6, background: 'var(--surface)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
              {[
                { id: 'all', label: `All Tasks (${tasks.length})` },
                { id: 'pending', label: `Pending (${pendingCount})` },
                { id: 'high', label: `High Priority (${highPriorityCount})` },
                { id: 'completed', label: `Completed (${completedCount})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 7,
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: filterTab === tab.id ? 'var(--primary)' : 'transparent',
                    color: filterTab === tab.id ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.15s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search & Category Filter */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 220 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search task title..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '7px 12px 7px 34px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, background: 'var(--surface)', color: 'var(--text-primary)' }}
                />
              </div>

              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, background: 'var(--surface)', color: 'var(--text-primary)' }}
              >
                <option value="all">All Categories</option>
                <option value="technical audit">Technical Audit</option>
                <option value="on-page meta">On-Page Meta</option>
                <option value="backlink outreach">Backlink Outreach</option>
                <option value="content optimization">Content Optimization</option>
                <option value="page speed">Page Speed</option>
              </select>
            </div>
          </div>

          {/* Task List */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTasks.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No tasks match your current filter.
              </div>
            ) : (
              filteredTasks.map(t => (
                <div key={t.id} style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: t.completed ? 'var(--gray-50)' : 'var(--surface)',
                  transition: 'background 0.15s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                    <button
                      onClick={() => toggleTask(t.id)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: t.completed ? '#10B981' : 'var(--text-muted)' }}
                    >
                      {t.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>

                    <div>
                      <div style={{
                        fontSize: 14, fontWeight: 700,
                        color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: t.completed ? 'line-through' : 'none'
                      }}>
                        {t.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>{t.clientName}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>• {t.category}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>• Assignee: {t.assignee}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: t.priority === 'High' ? 'rgba(239,68,68,0.1)' : t.priority === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(79,142,247,0.1)',
                      color: t.priority === 'High' ? '#EF4444' : t.priority === 'Medium' ? '#F59E0B' : 'var(--primary)'
                    }}>
                      {t.priority} Priority
                    </span>

                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {t.dueDate}
                    </span>

                    <button
                      onClick={() => deleteTask(t.id)}
                      style={{ padding: '6px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#EF4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Task Modal */}
        {isCreating && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
          }}>
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, maxWidth: 500, width: '100%', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Create New SEO Action Task</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Assign an actionable SEO checklist item for a client</div>

              <form onSubmit={handleCreateTask}>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Optimize H1 headers on services page..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="form-input"
                    style={{ fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Client</label>
                    <select value={clientName} onChange={e => setClientName(e.target.value)} className="form-input" style={{ fontSize: 12 }}>
                      <option value="Acme HealthPlus">Acme HealthPlus</option>
                      <option value="Apex Law Group">Apex Law Group</option>
                      <option value="UrbanStay Rentals">UrbanStay Rentals</option>
                      <option value="TechCraft Solutions">TechCraft Solutions</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value as any)} className="form-input" style={{ fontSize: 12 }}>
                      <option value="Technical Audit">Technical Audit</option>
                      <option value="On-Page Meta">On-Page Meta</option>
                      <option value="Backlink Outreach">Backlink Outreach</option>
                      <option value="Content Optimization">Content Optimization</option>
                      <option value="Page Speed">Page Speed</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value as any)} className="form-input" style={{ fontSize: 12 }}>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assignee</label>
                    <input type="text" value={assignee} onChange={e => setAssignee(e.target.value)} className="form-input" style={{ fontSize: 12 }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px 0', fontSize: 13, justifyContent: 'center' }}>
                    Add Task
                  </button>
                  <button type="button" onClick={() => setIsCreating(false)} className="btn btn-secondary" style={{ flex: 1, padding: '10px 0', fontSize: 13, justifyContent: 'center' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
