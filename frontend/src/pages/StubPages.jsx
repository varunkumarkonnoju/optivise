import { Sparkles, Zap, Construction } from 'lucide-react'

function ComingSoon({ icon: Icon, title, description }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--purple-dim)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={28} style={{ color: 'var(--purple-light)' }} />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800 }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 380, fontSize: 14, lineHeight: 1.7 }}>{description}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 16px' }}>
        <Construction size={13} style={{ color: 'var(--amber)' }} />
        <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>Coming soon — connect your backend</span>
      </div>
    </div>
  )
}

export function InsightsPage() {
  return <ComingSoon icon={Sparkles} title="AI Insights" description="Deep AI analysis of your store performance, customer behavior patterns, and growth opportunities. Connect your Claude API key to enable." />
}

export function AutomationsPage() {
  return <ComingSoon icon={Zap} title="Automations" description="Set up automated workflows powered by AI — auto-optimize prices, trigger campaigns, restock alerts, and more." />
}
