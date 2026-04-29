// Format ISO timestamp to user's local timezone
export function formatLocalTime(isoString) {
  if (!isoString) return 'Just now'
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return 'Just now'
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return 'Just now'
  }
}