import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, CheckCircle, ArrowRight, Gift } from 'lucide-react'

export default function WaitlistPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [struggle, setStruggle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [alreadyJoined, setAlreadyJoined] = useState(false)
  const [error, setError] = useState('')
  const [count, setCount] = useState(null)

  useEffect(() => {
    fetch('/api/waitlist/count')
      .then(r => r.json())
      .then(d => { if (typeof d.count === 'number') setCount(d.count) })
      .catch(() => {})
  }, [])

  const submit = async () => {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Please enter a valid email address.')
      return
    }
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, struggle: struggle.trim() })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setAlreadyJoined(!!data.alreadyJoined)
        setDone(true)
      }
    } catch {
      setError('Could not connect. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        @keyframes wl-fade { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes wl-pop { 0% { transform: scale(0.8); opacity: 0 } 60% { transform: scale(1.05) } 100% { transform: scale(1); opacity: 1 } }
        .wl-fade { animation: wl-fade 0.6s cubic-bezier(0.16,1,0.3,1) both }
        .wl-fade-2 { animation: wl-fade 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both }
        .wl-fade-3 { animation: wl-fade 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both }
        .wl-instrument { font-family: 'Instrument Serif', Georgia, serif }
        .wl-dm { font-family: 'DM Sans', sans-serif }
        .wl-input:focus { border-color: rgba(99,102,241,0.6) !important }
      `}</style>

      {/* Top bar */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div onClick={() => navigate('/home')} style={{ fontSize: 18, fontWeight: 900, color: '#fff', cursor: 'pointer', letterSpacing: '-0.5px' }}>
          Optivise
        </div>
        <button onClick={() => navigate('/home')} className="wl-dm" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>
          ← Back home
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          {!done ? (
            <>
              <div className="wl-fade" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 24, padding: '5px 14px', fontSize: 12, color: '#a5b4fc', marginBottom: 20 }}>
                <Sparkles size={12} /> Early access
              </div>

              <h1 className="wl-fade wl-instrument" style={{ fontSize: 44, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-1px', color: '#fff', marginBottom: 14 }}>
                Be the first to use<br /><span style={{ fontStyle: 'italic', color: '#818cf8' }}>Optivise</span>.
              </h1>

              <p className="wl-fade-2 wl-dm" style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7, marginBottom: 28 }}>
                AI that writes your Shopify product descriptions and shows you honest, real opportunities to grow — no fake numbers, ever. Join the waitlist for early access.
              </p>

              {/* Reward */}
              <div className="wl-fade-2" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
                <Gift size={18} color="#34d399" style={{ flexShrink: 0, marginTop: 1 }} />
                <div className="wl-dm" style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                  <strong style={{ color: '#fff' }}>The first 50 people — and anyone who shares honest feedback about what they need — get extended free access</strong> when we launch. Help us build the right thing, and we'll take care of you first.
                </div>
              </div>

              {/* Form */}
              <div className="wl-fade-3" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !submitting && submit()}
                  placeholder="you@email.com"
                  className="wl-input wl-dm"
                  style={{ background: 'rgba(15,25,50,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
                />
                <textarea
                  value={struggle}
                  onChange={e => setStruggle(e.target.value)}
                  placeholder="Optional: What's your biggest struggle running your Shopify store? (helps us build the right thing)"
                  rows={3}
                  className="wl-input wl-dm"
                  style={{ background: 'rgba(15,25,50,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '13px 16px', color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                />

                {error && (
                  <div className="wl-dm" style={{ fontSize: 13, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '9px 12px' }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={submit}
                  disabled={submitting}
                  className="wl-dm"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: submitting ? 'rgba(99,102,241,0.5)' : '#6366f1', border: 'none', borderRadius: 10, padding: '14px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                >
                  {submitting ? 'Joining...' : <>Join the waitlist <ArrowRight size={16} /></>}
                </button>

                <div className="wl-dm" style={{ fontSize: 12, color: '#475569', textAlign: 'center', marginTop: 4 }}>
                  {count !== null && count > 0
                    ? `Join ${count} other${count === 1 ? '' : 's'} on the waitlist · No spam, ever`
                    : 'No spam, ever · Unsubscribe anytime'}
                </div>
              </div>
            </>
          ) : (
            // Success state
            <div style={{ textAlign: 'center' }}>
              <div style={{ animation: 'wl-pop 0.5s ease both', width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={36} color="#34d399" />
              </div>
              <h1 className="wl-instrument" style={{ fontSize: 38, fontWeight: 400, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
                {alreadyJoined ? "You're already in! 🎉" : "You're on the list! 🎉"}
              </h1>
              <p className="wl-dm" style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7, marginBottom: 28, maxWidth: 380, margin: '0 auto 28px' }}>
                {alreadyJoined
                  ? "Looks like you already joined — no need to sign up again. We'll email you the moment we launch."
                  : "We'll email you the moment Optivise is ready. Keep an eye on your inbox — and thanks for being an early believer."}
              </p>
              <button onClick={() => navigate('/home')} className="wl-dm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 24px', color: '#e2e8f0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Back to home
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="wl-dm" style={{ padding: '20px 24px', textAlign: 'center', fontSize: 11, color: '#1e3a5f' }}>
        © 2026 Growyn AI LLC · Built by Varun Kumar Konnoju · Wisconsin
      </div>
    </div>
  )
}