export function formatLocalTime(isoString) {
  if (!isoString) return 'Just now'
  try {
    let str = isoString.toString().trim().replace(' ', 'T')
    if (!str.endsWith('Z') && !str.includes('+')) str = str + 'Z'
    const date = new Date(str)
    if (isNaN(date.getTime())) return 'Just now'

    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return diffMins + 'm ago'
    if (diffHours < 24) return diffHours + 'h ago'
    if (diffDays < 7) return diffDays + 'd ago'

    return date.toLocaleString([], {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  } catch {
    return 'Just now'
  }
}