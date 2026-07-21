'use client';

import { useState, useEffect } from 'react';
import { Mail, MailOpen, Check, Trash2, Search, Filter, Loader2, ArrowRight, CornerUpLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  body: string;
  isRead: boolean;
  isFromAgency: boolean;
  senderName: string | null;
  createdAt: string;
  client: {
    id: string;
    name: string;
    domain: string;
    logo: string | null;
    contactEmail: string | null;
  };
}

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [replyBody, setReplyBody] = useState<string>('');
  const [activeReplyMsgId, setActiveReplyMsgId] = useState<string | null>(null);
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        toast.error('Failed to load messages');
      }
    } catch {
      toast.error('Network error loading messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, isRead: boolean) => {
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, isRead } : m));
    try {
      await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead })
      });
    } catch {
      toast.error('Failed to update message status');
      fetchMessages(); // revert
    }
  };

  const handleSendReply = async (msg: Message) => {
    if (!replyBody.trim()) return;
    setSendingReply(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: msg.client.id,
          body: replyBody,
          subject: 'Reply from Support'
        })
      });

      if (res.ok) {
        toast.success('Reply sent successfully!');
        setReplyBody('');
        setActiveReplyMsgId(null);
        fetchMessages();
      } else {
        toast.error('Failed to send reply');
      }
    } catch {
      toast.error('Network error sending reply');
    } finally {
      setSendingReply(false);
    }
  };

  const filteredMessages = messages.filter(m => filter === 'all' || !m.isRead);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Client Inbox</h1>
          <p className="page-subtitle">Messages and inquiries from your clients via the portal.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All Messages
          </button>
          <button 
            className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('unread')}
          >
            Unread
            {messages.filter(m => !m.isRead).length > 0 && (
              <span style={{ 
                background: filter === 'unread' ? '#fff' : '#EF4444',
                color: filter === 'unread' ? '#4F8EF7' : '#fff',
                padding: '2px 6px', borderRadius: 10, fontSize: 11, marginLeft: 6 
              }}>
                {messages.filter(m => !m.isRead).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: '#94A3B8' }}>
          <Loader2 className="spinner" size={24} />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
          <MailOpen size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
          <h3>No {filter === 'unread' ? 'unread ' : ''}messages found</h3>
          <p>You're all caught up! Messages sent by clients will appear here.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filteredMessages.map(msg => (
            <div key={msg.id} style={{
              padding: '20px 24px',
              borderBottom: '1px solid #F1F5F9',
              background: msg.isRead ? '#fff' : '#F8FAFC',
              display: 'flex', gap: 20, alignItems: 'flex-start'
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: msg.isFromAgency ? '#FEF3C7' : msg.isRead ? '#F1F5F9' : '#DBEAFE',
                color: msg.isFromAgency ? '#D97706' : msg.isRead ? '#94A3B8' : '#3B82F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {msg.isFromAgency ? '🏢' : msg.isRead ? <MailOpen size={18} /> : <Mail size={18} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: msg.isRead ? 500 : 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {msg.isFromAgency ? `${msg.senderName || 'Agency'} (Reply)` : msg.client.name}
                      {msg.isFromAgency && <span className="badge badge-warning" style={{ fontSize: '10px', padding: '2px 6px' }}>Sent to Client</span>}
                    </h4>
                    <span style={{ fontSize: 13, color: '#64748B' }}>
                      {msg.isFromAgency ? `Recipient: ${msg.client.name}` : (msg.client.contactEmail || msg.client.domain)}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>
                    {new Date(msg.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
                
                <div style={{
                  background: msg.isFromAgency ? '#FFFDF5' : '#fff',
                  padding: 16,
                  borderRadius: 8,
                  border: msg.isFromAgency ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                  color: '#334155',
                  fontSize: 14,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.body}
                </div>
                
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  {!msg.isFromAgency && (
                    <>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => {
                          setActiveReplyMsgId(activeReplyMsgId === msg.id ? null : msg.id);
                          setReplyBody('');
                        }}
                      >
                        <CornerUpLeft size={14} /> Reply
                      </button>

                      {!msg.isRead ? (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => markAsRead(msg.id, true)}
                        >
                          <Check size={14} /> Mark as Read
                        </button>
                      ) : (
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#94A3B8', border: 'none', background: 'transparent' }}
                          onClick={() => markAsRead(msg.id, false)}
                        >
                          Mark as Unread
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Reply Form */}
                {activeReplyMsgId === msg.id && (
                  <div style={{ 
                    marginTop: 16, 
                    padding: 16, 
                    background: '#F8FAFC', 
                    borderRadius: 8, 
                    border: '1px solid #E2E8F0' 
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#1E293B' }}>
                      Compose Reply to {msg.client.name}
                    </div>
                    <textarea
                      value={replyBody}
                      onChange={e => setReplyBody(e.target.value)}
                      placeholder="Type your response to the client here..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: 10,
                        border: '1.5px solid #E2E8F0',
                        borderRadius: 6,
                        fontSize: 13,
                        outline: 'none',
                        resize: 'vertical',
                        marginBottom: 10,
                        fontFamily: 'inherit'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => { setActiveReplyMsgId(null); setReplyBody(''); }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn-primary btn-sm" 
                        disabled={sendingReply}
                        onClick={() => handleSendReply(msg)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <Send size={12} /> {sendingReply ? 'Sending...' : 'Send Response'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
