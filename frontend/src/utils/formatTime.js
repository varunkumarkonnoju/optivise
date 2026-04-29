// Format ISO timestamp to user's local timezone
export function formatLocalTime(isoString) {
  if (!isoString) return 'Just now'
  try {
    // Add Z suffix to tell JavaScript this is UTC time
    const utcString = isoString.endsWith('Z') ? isoString : isoString + 'Z'
    const date = new Date(utcString)
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