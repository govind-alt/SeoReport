'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { inviteTeamMember, removeTeamMember, cancelTeamInvite } from '@/app/actions';

export default function TeamClient({ initialData, domain, currentUserId }: { initialData: any[], domain: string, currentUserId: string }) {
  const [members, setMembers] = useState(initialData);
  const [activeTab, setActiveTab] = useState('members');
  const [search, setSearch] = useState('');
  
  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  const filteredMembers = members.filter(m => {
    return (m.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
           (m.email?.toLowerCase() || '').includes(search.toLowerCase());
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setInviting(true);
    const t = toast.loading('Sending invitation...');
    
    try {
      await inviteTeamMember(domain, inviteEmail, inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`, { id: t });
      setIsInviteModalOpen(false);
      setInviteEmail('');
      
      // Optimistic update
      setMembers([...members, {
        id: 'temp-' + Date.now(),
        email: inviteEmail,
        role: inviteRole,
        status: 'Pending',
        expires: 'In 7 days'
      }]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invitation', { id: t });
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>Team Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage access, roles, and permissions for your agency members.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsInviteModalOpen(true)}>＋ Invite Member</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('members')}
          style={{
            background: 'none', border: 'none', borderBottom: activeTab === 'members' ? '2px solid var(--primary)' : '2px solid transparent',
            padding: '0 0 16px 0', color: activeTab === 'members' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'members' ? 700 : 500, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Active Members
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          style={{
            background: 'none', border: 'none', borderBottom: activeTab === 'roles' ? '2px solid var(--primary)' : '2px solid transparent',
            padding: '0 0 16px 0', color: activeTab === 'roles' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'roles' ? 700 : 500, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Roles & Permissions
        </button>
      </div>

      {activeTab === 'members' && (
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '8px', color: 'var(--text-muted)' }}>🔍</span>
              <input className="form-input" style={{ width: '100%', padding: '8px 12px 8px 36px', fontSize: '13px', background: 'var(--surface-opaque)', border: '1px solid var(--border)' }} placeholder="Search team members..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="table-wrapper" style={{ margin: 0, border: 'none' }}>
            <table style={{ background: 'transparent' }}>
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member: any, i: number) => (
                  <tr key={member.id} style={{ background: 'transparent' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${i * 60}, 70%, 25%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '12px' }}>
                          {(member.name || member.email || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 600, color: member.status === 'Pending' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          {member.name || 'Pending Invite'}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{member.email}</td>
                    <td>
                      <span style={{ 
                        background: member.role === 'admin' ? 'rgba(59, 130, 246, 0.15)' : member.role === 'editor' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: member.role === 'admin' ? '#3B82F6' : member.role === 'editor' ? '#F59E0B' : '#10B981',
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize'
                      }}>
                        {member.role}
                      </span>
                    </td>
                    <td>
                      {member.status === 'Pending' ? (
                        <span style={{ color: '#F59E0B', fontSize: '12px', fontWeight: 600 }}>Pending</span>
                      ) : (
                        <span style={{ color: '#10B981', fontSize: '12px', fontWeight: 600 }}>Active</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', fontSize: '11px', border: '1px solid var(--border)' }}>Edit</button>
                        {member.id !== currentUserId && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '4px 10px', fontSize: '11px' }}
                            onClick={async () => {
                              try {
                                if (member.status === 'Pending') {
                                  await cancelTeamInvite(domain, member.id);
                                  toast.success('Invitation revoked');
                                } else {
                                  await removeTeamMember(domain, member.id);
                                  toast.success('Member removed');
                                }
                                setMembers(prev => prev.filter(m => m.id !== member.id));
                              } catch (err: any) {
                                toast.error(err.message || 'Action failed');
                              }
                            }}
                          >
                            {member.status === 'Pending' ? 'Revoke' : 'Remove'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No members found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Role Capabilities</h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface-opaque)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>Admin</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Full access</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Admins can manage billing, invite other members, edit agency branding, delete clients, and have full access to all report generation tools.</p>
            </div>

            <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface-opaque)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>Editor</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Client management</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Editors can add new clients, generate reports, and edit client settings. They cannot access billing, agency settings, or invite other members.</p>
            </div>

            <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface-opaque)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>Viewer</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Read-only</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Viewers can only view client dashboards and download existing reports. They cannot make any changes or trigger new data syncs.</p>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10, 15, 28, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Invite Team Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} style={{ fontSize: '20px', color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleInvite}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" placeholder="colleague@agency.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label className="form-label">Role</label>
                <select className="form-input" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  <option value="admin">Admin (Full Access)</option>
                  <option value="editor">Editor (Manage Clients)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsInviteModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={inviting}>
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
