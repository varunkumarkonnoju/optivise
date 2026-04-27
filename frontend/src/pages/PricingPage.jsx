import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Pricing.css'

export default function PricingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch current subscription
    fetch('/api/billing/subscription', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    }).then(r => r.json()).then(setSubscription).catch(() => {})
  }, [])

  const handleUpgrade = async (planId) => {
    // Free plan — just navigate to dashboard
    if (planId === 'free') {
      navigate('/dashboard')
      return
    }
    setLoading(planId); setError('')
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          planId,
          appUrl: window.location.origin
        })
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setError(data.error || 'Failed to create checkout session')
      }
    } catch (e) {
      setError('Failed to connect to billing. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handlePortal = async () => {
    setLoading('portal')
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ appUrl: window.location.origin })
      })
      const data = await res.json()
      if (data.portalUrl) window.location.href = data.portalUrl
    } finally {
      setLoading(null)
    }
  }

  const currentPlan = subscription?.plan || 'free'

  const plans = [
    {
      id: 'free', name: 'Free', price: 0,
      desc: 'Perfect for getting started',
      features: ['Up to 10 products','50 AI credits/mo','Basic analytics','AI recommendations','Community support'],
      cta: 'Current plan', disabled: true
    },
    {
      id: 'starter', name: 'Starter', price: 29,
      desc: 'For growing stores',
      features: ['Unlimited products','500 AI credits/mo','Full analytics','A/B testing (3 tests)','AI assistant','Email support'],
      cta: 'Start 14-day trial', featured: false
    },
    {
      id: 'growth', name: 'Growth', price: 79,
      desc: 'For serious store owners',
      features: ['Everything in Starter','Unlimited AI credits','Bulk description generator','Unlimited A/B tests','Priority AI assistant','Priority support'],
      cta: 'Start 14-day trial', featured: true
    },
  ]

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <div className="pricing-tag">Pricing</div>
        <h1 className="pricing-title">Simple, transparent pricing</h1>
        <p className="pricing-sub">Start free. Upgrade when you're ready. Cancel anytime.</p>
        {error && <div className="pricing-error">{error}</div>}
      </div>

      <div className="pricing-grid">
        {plans.map(plan => {
          const isCurrent = currentPlan === plan.id
          const isLoading = loading === plan.id
          return (
            <div key={plan.id} className={`pricing-card ${plan.featured ? 'pricing-featured' : ''} ${isCurrent ? 'pricing-current' : ''}`}>
              {plan.featured && <div className="pricing-popular">Most Popular</div>}
              {isCurrent && <div className="pricing-current-badge">Your plan</div>}

              <div className="pricing-plan-name">{plan.name}</div>
              <div className="pricing-amount">
                ${plan.price}<span>/mo</span>
              </div>
              <div className="pricing-desc">{plan.desc}</div>

              {plan.price > 0 && (
                <div className="pricing-trial-note">
                  ✓ 14-day free trial — no card charged today
                </div>
              )}

              <ul className="pricing-features">
                {plan.features.map((f, i) => (
                  <li key={i}><span className="pricing-check">✓</span>{f}</li>
                ))}
              </ul>

              {isCurrent && currentPlan !== 'free' ? (
                <button className="pricing-btn-manage" onClick={handlePortal} disabled={loading === 'portal'}>
                  {loading === 'portal' ? 'Loading...' : 'Manage subscription →'}
                </button>
              ) : isCurrent ? (
                <button className="pricing-btn-current" disabled>Current plan</button>
              ) : (
                <button
                  className={plan.featured ? 'pricing-btn-primary' : 'pricing-btn-ghost'}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isLoading}>
                  {isLoading ? 'Redirecting to Stripe...' : plan.cta + ' →'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="pricing-faq">
        <h3 style={{fontSize:16,fontWeight:700,color:'var(--text-primary)',marginBottom:16}}>Common questions</h3>
        {[
          ['When will I be charged?', 'Not until your 14-day trial ends. Cancel anytime before then and pay nothing.'],
          ['Can I switch plans?', 'Yes. Upgrade or downgrade anytime from the billing portal.'],
          ['What payment methods are accepted?', 'All major credit and debit cards via Stripe. Secure and encrypted.'],
          ['Is my data safe?', 'Yes. Your Shopify data is never stored on our servers — it\'s fetched live when you use the app.'],
        ].map(([q, a], i) => (
          <div key={i} className="pricing-faq-item">
            <div className="pricing-faq-q">{q}</div>
            <div className="pricing-faq-a">{a}</div>
          </div>
        ))}
      </div>
    </div>
  )
}