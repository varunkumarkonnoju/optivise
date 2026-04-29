export function formatLocalTime(isoString) {
  if (!isoString) return 'Just now'
  try {
    let str = isoString.toString().trim()
    
    // Already formatted like "Apr 29, 4:11 PM"
    if (str.includes('AM') || str.includes('PM')) return str
    
    // Truncate nanoseconds to milliseconds (Java sends 6 decimal places, JS needs 3)
    // "2026-04-29T17:33:41.517204" -> "2026-04-29T17:33:41.517"
    str = str.replace(/(\.\d{3})\d+/, '$1')
    
    // Add Z for UTC
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
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return diffDays + 'd ago'

    return date.toLocaleString([], {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  } catch {
    return 'Just now'
  }
}