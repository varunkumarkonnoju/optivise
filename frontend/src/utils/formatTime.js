export function formatLocalTime(isoString) {
  if (!isoString) return 'Just now'
  try {
    const str = isoString.toString().trim()
    
    // If already formatted like "Apr 29, 4:11 PM" — return as is
    if (str.includes('AM') || str.includes('PM')) return str
    
    // If ISO format — convert to local time
    let utc = str.replace(' ', 'T')
    if (!utc.endsWith('Z') && !utc.includes('+')) utc = utc + 'Z'
    const date = new Date(utc)
    if (isNaN(date.getTime())) return str
    return date.toLocaleString([], {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  } catch {
    return isoString
  }
}