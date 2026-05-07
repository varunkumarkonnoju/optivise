import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../hooks/useAuth'
import { RotateCcw, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function DescriptionHistoryPage() {
  const { token } = useAuth()
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
      await axios.post(
        `${API}/api/descriptions/restore/${productId}`,
        {},
        { headers }
      )
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
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const activeBackups = backups.filter(b => !b.restored)
  const restoredBackups = backups.filter(b => b.restored)

  return (
    <div className="page-content">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Description History
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          View and restore original product descriptions before AI generation.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 16,
          background: message.type === 'success'
            ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: message.type === 'success' ? '#10B981' : '#EF4444',
          border: `1px solid ${message.type === 'success'
            ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          fontSize: 13, fontWeight: 600,
        }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          Loading description history...
        </div>
      ) : backups.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 60,
          background: 'var(--bg-secondary)', borderRadius: 12,
          border: '1px solid var(--border)',
        }}>
          <Clock size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            No description history yet
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            When you generate AI descriptions and save them to Shopify,<br/>
            the original descriptions will be saved here for easy restoration.
          </div>
        </div>
      ) : (
        <>
          {/* Active backups */}
          {activeBackups.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
                letterSpacing: '0.5px', marginBottom: 10
              }}>
                AI DESCRIPTIONS — CAN RESTORE ({activeBackups.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeBackups.map(backup => (
                  <div key={backup.id} style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 12, overflow: 'hidden',
                  }}>
                    {/* Header */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      cursor: 'pointer',
                    }}
                      onClick={() => setExpandedId(
                        expandedId === backup.id ? null : backup.id
                      )}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 700,
                          color: 'var(--text-primary)', marginBottom: 2
                        }}>
                          {backup.productTitle}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          AI generated {formatDate(backup.savedAt)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 8px',
                          borderRadius: 20, background: 'rgba(99,102,241,0.1)',
                          color: 'var(--purple-light)',
                          border: '1px solid rgba(99,102,241,0.2)',
                        }}>
                          AI ACTIVE
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRestore(backup.productId, backup.productTitle)
                          }}
                          disabled={restoring === backup.productId}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'rgba(245,158,11,0.1)',
                            border: '1px solid rgba(245,158,11,0.3)',
                            borderRadius: 8, padding: '6px 12px',
                            fontSize: 11, fontWeight: 700,
                            color: '#F59E0B', cursor: 'pointer',
                            opacity: restoring === backup.productId ? 0.7 : 1,
                          }}
                        >
                          <RotateCcw size={12} />
                          {restoring === backup.productId ? 'Restoring...' : 'Restore Original'}
                        </button>
                      </div>
                    </div>

                    {/* Expanded view */}
                    {expandedId === backup.id && (
                      <div style={{
                        borderTop: '1px solid var(--border)',
                        padding: '12px 16px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 12,
                      }}>
                        {/* Original */}
                        <div>
                          <div style={{
                            fontSize: 11, fontWeight: 700,
                            color: '#F59E0B', marginBottom: 6,
                            display: 'flex', alignItems: 'center', gap: 4
                          }}>
                            <AlertCircle size={11} /> ORIGINAL
                          </div>
                          <div style={{
                            background: 'rgba(0,0,0,0.2)', borderRadius: 8,
                            padding: '8px 10px', fontSize: 11,
                            color: 'var(--text-muted)', lineHeight: 1.6,
                            minHeight: 60, fontStyle: 'italic',
                          }}>
                            {backup.originalDescription
                              ? backup.originalDescription.substring(0, 300) +
                                (backup.originalDescription.length > 300 ? '...' : '')
                              : '(No original description)'}
                          </div>
                        </div>

                        {/* AI Version */}
                        <div>
                          <div style={{
                            fontSize: 11, fontWeight: 700,
                            color: 'var(--purple-light)', marginBottom: 6,
                            display: 'flex', alignItems: 'center', gap: 4
                          }}>
                            ✨ AI GENERATED
                          </div>
                          <div style={{
                            background: 'rgba(99,102,241,0.05)',
                            border: '1px solid rgba(99,102,241,0.15)',
                            borderRadius: 8, padding: '8px 10px',
                            fontSize: 11, color: 'var(--text-muted)',
                            lineHeight: 1.6, minHeight: 60,
                          }}>
                            {backup.aiDescription
                              ? backup.aiDescription.substring(0, 300) +
                                (backup.aiDescription.length > 300 ? '...' : '')
                              : '(No AI description saved)'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Restored backups */}
          {restoredBackups.length > 0 && (
            <div>
              <div style={{
                fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
                letterSpacing: '0.5px', marginBottom: 10
              }}>
                RESTORED TO ORIGINAL ({restoredBackups.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {restoredBackups.map(backup => (
                  <div key={backup.id} style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 10, padding: '10px 16px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: 0.65,
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {backup.productTitle}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        Restored {formatDate(backup.savedAt)}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 10, fontWeight: 700, color: '#10B981',
                    }}>
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
