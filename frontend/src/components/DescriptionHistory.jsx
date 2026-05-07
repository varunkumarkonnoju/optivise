import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../hooks/useAuth'

export default function DescriptionHistory({ productId, productTitle, onRestored }) {
  const { token } = useAuth()
  const [backup, setBackup] = useState(null)
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState(null)

  const headers = { Authorization: `Bearer ${token}` }
  const API = import.meta.env.VITE_API_URL || ''

  useEffect(() => {
    if (productId) fetchBackup()
  }, [productId])

  const fetchBackup = async () => {
    try {
      const res = await axios.get(
        `${API}/api/descriptions/backup/${productId}`,
        { headers }
      )
      setBackup(res.data)
    } catch {
      setBackup(null)
    }
  }

  const handleRestore = async () => {
    setRestoring(true)
    setShowConfirm(false)
    try {
      const res = await axios.post(
        `${API}/api/descriptions/restore/${productId}`,
        {},
        { headers }
      )
      setMessage({ type: 'success', text: 'Original description restored! ✅' })
      setBackup(prev => ({ ...prev, restored: true }))
      if (onRestored) onRestored(productId, res.data.originalDescription)
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage({ type: 'error', text: 'Failed to restore. Please try again.' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setRestoring(false)
    }
  }

  // No backup = product never had AI description
  if (!backup) return null

  return (
    <div style={{ marginTop: 8 }}>

      {/* Message */}
      {message && (
        <div style={{
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 6,
          background: message.type === 'success'
            ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: message.type === 'success' ? '#10B981' : '#EF4444',
          border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Restore button or restored status */}
      {backup.restored ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, color: '#64748B',
          padding: '4px 10px',
          background: 'rgba(100,116,139,0.08)',
          borderRadius: 6, width: 'fit-content'
        }}>
          <span>↩</span>
          <span>Original restored</span>
          {/* Allow re-generating */}
        </div>
      ) : (
        <>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 6, padding: '5px 12px',
                fontSize: 11, fontWeight: 600,
                color: '#F59E0B', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(245,158,11,0.15)'}
              onMouseLeave={e => e.target.style.background = 'rgba(245,158,11,0.08)'}
            >
              ↩ Restore original description
            </button>
          ) : (
            <div style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 8, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600, marginBottom: 6 }}>
                ⚠️ Restore original description?
              </div>
              <div style={{ fontSize: 10, color: '#64748B', marginBottom: 8 }}>
                This will replace the AI description on Shopify with your original text.
              </div>

              {/* Show original preview */}
              {backup.originalDescription && (
                <div style={{
                  background: 'rgba(0,0,0,0.2)', borderRadius: 6,
                  padding: '6px 10px', marginBottom: 8,
                  fontSize: 10, color: '#94A3B8',
                  maxHeight: 60, overflow: 'hidden',
                }}>
                  "{backup.originalDescription.substring(0, 120)}
                  {backup.originalDescription.length > 120 ? '...' : ''}"
                </div>
              )}

              {!backup.originalDescription && (
                <div style={{
                  background: 'rgba(0,0,0,0.2)', borderRadius: 6,
                  padding: '6px 10px', marginBottom: 8,
                  fontSize: 10, color: '#64748B', fontStyle: 'italic',
                }}>
                  This product had no description before AI generation.
                  Restoring will clear the current description.
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleRestore}
                  disabled={restoring}
                  style={{
                    background: '#F59E0B', border: 'none',
                    borderRadius: 6, padding: '6px 14px',
                    fontSize: 11, fontWeight: 700,
                    color: 'white', cursor: 'pointer',
                    opacity: restoring ? 0.7 : 1,
                  }}
                >
                  {restoring ? 'Restoring...' : 'Yes, restore'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(100,116,139,0.3)',
                    borderRadius: 6, padding: '6px 14px',
                    fontSize: 11, fontWeight: 600,
                    color: '#64748B', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}