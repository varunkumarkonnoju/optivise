import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ComingSoonPage({ icon, title, description, features, color }) {
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)
  const navigate = useNavigate()

  const handleJoin = async (e) => {
    e.preventDefault()
    // Store in localStorage for now
    try {
      // Save to backend
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, feature: title })
      })
    } catch (e) {
      console.error('Waitlist save failed', e)
    }
    setJoined(true)
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 0' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20, margin: '0 auto 20px',
          background: `linear-gradient(135deg, ${color}33, ${color}11)`,
          border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36
        }}>
          {icon}
        </div>
        <div style={{
          display: 'inline-block', background: `${color}15`, border: `1px solid ${color}40`,
          borderRadius: 20, padding: '4px 14px', fontSize: 11, fontWeight: 700,
          color: color, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16
        }}>
          Coming Soon
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 14 }}>
          {title}
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
          {description}
        </p>
      </div>

      {/* Features preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 40 }}>
        {features.map((f, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start'
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: `${color}15`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 16
            }}>
              {f.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Waitlist */}
      <div style={{
        background: `linear-gradient(135deg, ${color}08, var(--bg-card))`,
        border: `1px solid ${color}30`, borderRadius: 16, padding: '28px 32px', textAlign: 'center'
      }}>
        {!joined ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              🚀 Get early access
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Join the waitlist and be the first to know when this launches. Early access users get it free for 30 days.
            </p>
            <form onSubmit={handleJoin} style={{ display: 'flex', gap: 10, maxWidth: 400, margin: '0 auto' }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required
                style={{
                  flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)',
                  fontSize: 14, outline: 'none', fontFamily: 'inherit'
                }}
              />
              <button type="submit" style={{
                background: color, color: 'white', border: 'none', borderRadius: 10,
                padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', whiteSpace: 'nowrap'
              }}>
                Join waitlist
              </button>
            </form>
          </>
        ) : (
          <div>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              You're on the list!
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              We'll email you at <strong style={{color: color}}>{email}</strong> as soon as {title} launches.
            </p>
          </div>
        )}
      </div>

      {/* Back button */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button className="btn-ghost" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export function InsightsPage() {
  return (
    <ComingSoonPage
      icon="🧠"
      title="AI Insights"
      color="#818CF8"
      description="Deep AI analysis of your entire store — revenue trends, customer behavior, product performance, and actionable growth opportunities powered by GPT-4o."
      features={[
        { icon: '📈', title: 'Revenue Forecasting', desc: 'AI predicts your next 30/60/90 day revenue based on historical patterns.' },
        { icon: '🎯', title: 'Growth Opportunities', desc: 'AI identifies your highest-impact growth levers ranked by potential revenue.' },
        { icon: '👥', title: 'Customer Segments', desc: 'Automatic customer segmentation — VIPs, at-risk, new, repeat buyers.' },
        { icon: '🔍', title: 'Competitor Analysis', desc: 'Track competitor pricing and positioning in your niche automatically.' },
        { icon: '💡', title: 'Weekly AI Reports', desc: 'Every Monday, get a full AI-written performance report in your inbox.' },
        { icon: '⚡', title: 'Real-time Alerts', desc: 'Instant alerts when revenue drops, conversion changes, or anomalies detected.' },
      ]}
    />
  )
}

export function AutomationsPage() {
  return (
    <ComingSoonPage
      icon="⚡"
      title="Automations"
      color="#34D399"
      description="Set it and forget it. Build powerful automation workflows that run 24/7 — no coding needed. Let AI handle the repetitive work while you focus on growing."
      features={[
        { icon: '🛒', title: 'Abandoned Cart Recovery', desc: 'Automatically send AI-written recovery emails to customers who left.' },
        { icon: '💰', title: 'Dynamic Pricing', desc: 'Auto-adjust prices based on demand, inventory, and competitor pricing.' },
        { icon: '📧', title: 'AI Email Campaigns', desc: 'Generate and send personalized email campaigns based on customer behavior.' },
        { icon: '📦', title: 'Inventory Alerts', desc: 'Auto-reorder reminders and low stock notifications sent to you instantly.' },
        { icon: '⭐', title: 'Review Requests', desc: 'Automatically ask happy customers for reviews at the perfect moment.' },
        { icon: '🎁', title: 'Win-back Campaigns', desc: 'Re-engage customers who haven\'t bought in 30, 60, or 90 days.' },
      ]}
    />
  )
}