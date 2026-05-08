import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, AlertTriangle, ArrowRight } from 'lucide-react'

export default function UsageBanner() {
  const [usage, setUsage] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/usage', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setUsage(data)
    } catch (e) {
      console.error('Failed to fetch usage', e)
    }
  }

  if (!usage || usage.isUnlimited) return null

  const { used, limit, remaining, percentage, plan, hasReached } = usage

  // Only show when used >= 50% of limit
  if (percentage < 0) return null
  const isWarning  = percentage >= 50 && percentage < 80
  const isDanger   = percentage >= 80 && !hasReached
  const isExhausted = hasReached

  const bgColor     = isExhausted ? 'rgba(239,68,68,0.08)'
                    : isDanger    ? 'rgba(245,158,11,0.08)'
                    :               'rgba(99,102,241,0.08)'
  const borderColor = isExhausted ? 'rgba(239,68,68,0.3)'
                    : isDanger    ? 'rgba(245,158,11,0.3)'
                    :               'rgba(99,102,241,0.3)'
  const textColor   = isExhausted ? '#EF4444'
                    : isDanger    ? '#F59E0B'
                    :               '#818CF8'
  const barColor    = isExhausted ? '#EF4444'
                    : isDanger    ? '#F59E0B'
                    :               '#6366F1'

  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: 10,
      padding: '12px 16px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      {/* Icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: borderColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {isExhausted
          ? <AlertTriangle size={16} color={textColor} />
          : <Zap size={16} color={textColor} />
        }
      </div>

      {/* Text + bar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: textColor }}>
            {isExhausted
              ? `You've used all ${limit} AI descriptions this month`
              : `${used} of ${limit} AI descriptions used`
            }
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {isExhausted ? 'Resets next month' : `${remaining} remaining`}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 5, background: 'rgba(255,255,255,0.06)',
          borderRadius: 3, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(percentage, 100)}%`,
            background: barColor,
            borderRadius: 3,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Upgrade button */}
      <button
        onClick={() => navigate('/pricing')}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: textColor,
          border: 'none', borderRadius: 8,
          padding: '7px 14px',
          fontSize: 11, fontWeight: 700,
          color: 'white', cursor: 'pointer',
          flexShrink: 0, whiteSpace: 'nowrap',
        }}
      >
        Upgrade <ArrowRight size={11} />
      </button>
    </div>
  )
}