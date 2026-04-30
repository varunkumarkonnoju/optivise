import { useNavigate } from 'react-router-dom'

export default function ConnectStorePrompt() {
  const navigate = useNavigate()
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.05))',
      border: '1px solid rgba(99,102,241,0.25)', borderRadius: 16,
      padding: 40, textAlign: 'center', marginBottom: 24
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
        Connect your Shopify store
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
        Connect your store to see real analytics, AI recommendations, and growth insights tailored to your business.
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/profile')} style={{
          background: 'linear-gradient(135deg, #6366F1, #06B6D4)', border: 'none',
          borderRadius: 10, padding: '12px 24px', color: 'white',
          fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
        }}>
          🔗 Connect Shopify Store
        </button>
        <button onClick={() => navigate('/assistant')} style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '12px 24px', color: 'var(--text-primary)',
          fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
        }}>
          💬 Ask AI Assistant first
        </button>
      </div>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
        {['🔒 Secure OAuth', '⚡ Takes 30 seconds', '🆓 Free to connect'].map((f, i) => (
          <div key={i} style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {f}
          </div>
        ))}
      </div>
    </div>
  )
}