import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function BillingSuccess() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')

  useEffect(() => {
    const timer = setTimeout(() => navigate('/dashboard'), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#020817', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 20, animation: 'bounceIn .6s' }}>🎉</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 12, letterSpacing: '-0.5px' }}>
          You're all set!
        </h1>
        <p style={{ color: '#64748B', fontSize: 16, marginBottom: 8 }}>
          Your 7-day free trial has started.
        </p>
        <p style={{ color: '#334155', fontSize: 13, marginBottom: 32 }}>
          No charge until your trial ends. Cancel anytime.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#475569', fontSize: 13 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981', animation: 'pulse 1.5s infinite' }}/>
          Redirecting to your dashboard...
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ marginTop: 20, background: '#6366F1', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Go to dashboard →
        </button>
      </div>
    </div>
  )
}