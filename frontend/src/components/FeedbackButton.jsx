import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function FeedbackButton() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('suggestion')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await fetch('/api/support/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          email: user?.email || 'anonymous',
          name: user?.name || 'User',
          type,
          message
        })
      })
      setSent(true)
      setTimeout(() => {
        setSent(false)
        setOpen(false)
        setMessage('')
        setType('suggestion')
      }, 2500)
    } catch {
      setSent(true)
      setTimeout(() => { setSent(false); setOpen(false) }, 2500)
    } finally {
      setSending(false)
    }
  }

  const types = [
    { value: 'suggestion', label: '💡 Suggestion', color: '#6366F1' },
    { value: 'bug', label: '🐛 Bug Report', color: '#EF4444' },
    { value: 'feature', label: '✨ Feature Request', color: '#F59E0B' },
    { value: 'love', label: '❤️ I love this!', color: '#34D399' },
  ]

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9000,
          background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
          border: 'none', borderRadius: 50, padding: '10px 16px',
          color: 'white', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          fontFamily: 'inherit'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.5)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)' }}
      >
        <span style={{ fontSize: 16 }}>{open ? '✕' : '💬'}</span>
        {!open && <span>Feedback</span>}
      </button>

      {/* Feedback Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 76, right: 24, zIndex: 9001,
          width: 320, background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 16,
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          overflow: 'hidden', animation: 'fadeIn 0.2s ease'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Share your feedback 💬</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Help us make Optivise better for you</div>
          </div>

          {sent ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)' }}>Thank you!</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Your feedback has been sent to our team.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              {/* Type selector */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>FEEDBACK TYPE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {types.map(t => (
                    <button key={t.value} type="button" onClick={() => setType(t.value)}
                      style={{
                        padding: '8px 10px', borderRadius: 8, border: '1px solid',
                        borderColor: type === t.value ? t.color : 'var(--border)',
                        background: type === t.value ? t.color + '20' : 'var(--bg-secondary)',
                        color: type === t.value ? t.color : 'var(--text-muted)',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s'
                      }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>YOUR MESSAGE</div>
                <textarea
                  placeholder={
                    type === 'bug' ? "Describe the bug — what happened and what you expected..." :
                    type === 'feature' ? "What feature would make Optivise more useful for you?" :
                    type === 'love' ? "Tell us what you love about Optivise! 😊" :
                    "Share your suggestion to improve Optivise..."
                  }
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required rows={4}
                  style={{
                    width: '100%', background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)', borderRadius: 8,
                    padding: '10px 12px', color: 'var(--text-primary)',
                    fontSize: 13, fontFamily: 'inherit', resize: 'none',
                    outline: 'none', boxSizing: 'border-box', lineHeight: 1.5
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366F1'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Submit */}
              <button type="submit" disabled={sending || !message.trim()}
                style={{
                  width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                  background: message.trim() ? 'linear-gradient(135deg, #6366F1, #06B6D4)' : 'var(--bg-secondary)',
                  color: message.trim() ? 'white' : 'var(--text-muted)',
                  fontSize: 13, fontWeight: 700, cursor: message.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit', transition: 'all 0.2s'
                }}>
                {sending ? 'Sending...' : 'Send Feedback →'}
              </button>

              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                Logged in as {user?.email}
              </div>
            </form>
          )}
        </div>
      )}
    </>
  )
}