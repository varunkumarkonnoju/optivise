import { useState, useEffect } from 'react'
import axios from 'axios'
import { RotateCcw, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

export default function DescriptionHistoryPage() {
  const token = localStorage.getItem('token')
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(null)
  const [message, setMessage] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const headers = { Authorization: `Bearer ${token}` }
  const API = import.meta.env.VITE_API_URL || ''

  useEffect(() => { fetchBackups() }, [])

  const fetchBackups = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/descriptions/backups`, { headers })
      setBackups(res.data)
    } catch (e) {
      console.error('Failed to fetch backups', e)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (productId, productTitle) => {
    setRestoring(productId)
    try {
      await axios.post(`${API}/api/descriptions/restore/${productId}`, {}, { headers })
      setMessage({ type: 'success', text: `✅ "${productTitle}" restored to original!` })
      fetchBackups()
      setTimeout(() => setMessage(null), 4000)
    } catch {
      setMessage({ type: 'error', text: '❌ Failed to restore. Try again.' })
      setTimeout(() => setMessage(null), 4000)
    } finally {
      setRestoring(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // Strip HTML tags for text preview
  const stripHtml = (html) => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  }

  // Get first ~120 chars as preview
  const getPreview = (text, maxLen = 120) => {
    const stripped = stripHtml(text)
    if (!stripped) return '(empty)'
    return stripped.length > maxLen ? stripped.substring(0, maxLen) + '...' : stripped
  }

  const activeBackups   = backups.filter(b => !b.restored)
  const restoredBackups = backups.filter(b => b.restored)

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Description History</h1>
        <p className="page-sub">Every original description is saved here. Restore any product to its original copy in one click.</p>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: message.type === 'success' ? '#10B981' : '#EF4444', border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, fontSize: 13, fontWeight: 600 }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading description history...</div>
      ) : backups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <Clock size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>No description history yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>When you generate and save AI descriptions, the originals are automatically backed up here.</div>
        </div>
      ) : (
        <>
          {/* Active backups */}
          {activeBackups.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: 12, textTransform: 'uppercase' }}>
                AI Descriptions Active — {activeBackups.length} product{activeBackups.length > 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeBackups.map(backup => {
                  const isExpanded = expandedId === backup.id
                  const origPreview  = getPreview(backup.originalDescription)
                  const aiPreview    = getPreview(backup.aiDescription)
                  return (
                    <div key={backup.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>

                      {/* Header row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 16px', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{backup.productTitle}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>AI generated {formatDate(backup.savedAt)}</div>

                          {/* ── INLINE PREVIEW (visible without expanding) ── */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 8, padding: '8px 10px' }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#F59E0B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Original</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>{origPreview}</div>
                            </div>
                            <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 8, padding: '8px 10px' }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--purple-light)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>✨ AI Version</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{aiPreview}</div>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: 'var(--purple-light)', border: '1px solid rgba(99,102,241,0.2)', whiteSpace: 'nowrap' }}>
                            AI ACTIVE
                          </span>
                          <button
                            onClick={() => handleRestore(backup.productId, backup.productTitle)}
                            disabled={restoring === backup.productId}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '7px 12px', fontSize: 11, fontWeight: 700, color: '#F59E0B', cursor: 'pointer', opacity: restoring === backup.productId ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                            <RotateCcw size={11} />
                            {restoring === backup.productId ? 'Restoring...' : 'Restore Original'}
                          </button>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : backup.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {isExpanded ? 'Less' : 'Full text'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded full text */}
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', marginBottom: 6 }}>Full original description</div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 10px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic', maxHeight: 200, overflow: 'auto' }}>
                              {backup.originalDescription ? stripHtml(backup.originalDescription) : '(No original description)'}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple-light)', marginBottom: 6 }}>Full AI description</div>
                            <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '8px 10px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, maxHeight: 200, overflow: 'auto' }}>
                              {backup.aiDescription ? stripHtml(backup.aiDescription) : '(No AI description saved)'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Restored */}
          {restoredBackups.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: 10, textTransform: 'uppercase' }}>
                Restored to Original — {restoredBackups.length}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {restoredBackups.map(backup => (
                  <div key={backup.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.65 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{backup.productTitle}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Restored {formatDate(backup.savedAt)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#10B981' }}>
                      <CheckCircle size={11} /> Restored
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}