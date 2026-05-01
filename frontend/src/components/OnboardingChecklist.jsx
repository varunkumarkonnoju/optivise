import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function OnboardingChecklist() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)
  const [steps, setSteps] = useState({
    account: true,
    shopify: false,
    description: false,
    recommendation: false,
  })

  const checkSteps = () => {
    const userKey = localStorage.getItem('user_email') || ''
    const usedAI = userKey 
      ? localStorage.getItem('used_ai_description_' + userKey)
      : false
    if (usedAI) setSteps(s => ({ ...s, description: true }))
    const viewedRecs = userKey
      ? localStorage.getItem('viewed_recommendations_' + userKey)
      : false
    if (viewedRecs) setSteps(s => ({ ...s, recommendation: true }))
  }

  useEffect(() => {
    // Listen for onboarding updates from other pages
    window.addEventListener('onboarding-updated', checkSteps)
    return () => window.removeEventListener('onboarding-updated', checkSteps)
  }, [])

  useEffect(() => {
    // Check if already dismissed
    const isDismissed = localStorage.getItem('onboarding_dismissed')
    if (isDismissed) { setDismissed(true); return }

    // Check Shopify connected via profile API
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + token } })
        .then(r => r.json())
        .then(data => {
          if (data.shopDomain && data.shopDomain.includes('.myshopify.com')) {
            setSteps(s => ({ ...s, shopify: true }))
          }
        })
        .catch(() => {})
    }

    checkSteps()
  }, [user])

  const completedCount = Object.values(steps).filter(Boolean).length
  const totalCount = Object.keys(steps).length
  const allDone = completedCount === totalCount

  if (dismissed) return null

  const checklistItems = [
    {
      key: 'account',
      label: 'Create your account',
      desc: 'You\'re in! Welcome to Optivise 🎉',
      action: null,
      actionLabel: null,
      done: steps.account
    },
    {
      key: 'shopify',
      label: 'Connect your Shopify store',
      desc: 'See real analytics and AI recommendations',
      action: () => navigate('/profile'),
      actionLabel: 'Connect Store →',
      done: steps.shopify
    },
    {
      key: 'description',
      label: 'Generate your first AI description',
      desc: 'Boost conversions by up to 30%',
      action: () => navigate('/products'),
      actionLabel: 'Try it now →',
      done: steps.description
    },
    {
      key: 'recommendation',
      label: 'Review your AI recommendations',
      desc: 'See personalized growth tips for your store',
      action: () => { localStorage.setItem('viewed_recommendations', '1'); navigate('/recommendations') },
      actionLabel: 'View recommendations →',
      done: steps.recommendation
    },
  ]

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.05))',
      border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12,
      padding: 20, marginBottom: 24
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
            {allDone ? '🎉 You\'re all set!' : `🚀 Get started with Optivise`}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {allDone ? 'You\'ve completed all setup steps!' : `${completedCount} of ${totalCount} steps completed`}
          </div>
        </div>
        <button onClick={() => { setDismissed(true); localStorage.setItem('onboarding_dismissed', '1') }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, padding: 0, lineHeight: 1 }}>
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          width: (completedCount / totalCount * 100) + '%',
          background: 'linear-gradient(90deg, #6366F1, #06B6D4)',
          transition: 'width 0.5s ease'
        }}/>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {checklistItems.map((item) => (
          <div key={item.key} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 8,
            background: item.done ? 'rgba(52,211,153,0.08)' : 'var(--bg-secondary)',
            border: '1px solid', borderColor: item.done ? 'rgba(52,211,153,0.2)' : 'var(--border)',
            transition: 'all 0.2s'
          }}>
            {/* Checkbox */}
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: item.done ? '#34D399' : 'var(--bg-card)',
              border: item.done ? '2px solid #34D399' : '2px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: 'white', fontWeight: 700
            }}>
              {item.done ? '✓' : ''}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: item.done ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: item.done ? 'line-through' : 'none'
              }}>
                {item.label}
              </div>
              {!item.done && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{item.desc}</div>
              )}
            </div>

            {/* Action button */}
            {!item.done && item.action && (
              <button onClick={item.action} style={{
                background: 'var(--purple-dim)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 6, padding: '5px 10px', color: 'var(--purple-light)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap', flexShrink: 0
              }}>
                {item.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}