export function formatLocalTime(isoString) {
  if (!isoString) return 'Just now'
  try {
    // Handle various ISO formats from Java backend
    let str = isoString.toString().trim()
    // Replace space with T if needed
    str = str.replace(' ', 'T')
    // Add Z if no timezone info
    if (!str.endsWith('Z') && !str.includes('+')) str = str + 'Z'
    const date = new Date(str)
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', isoString)
      return 'Just now'
    }
    return date.toLocaleString([], {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  } catch (e) {
    console.warn('formatLocalTime error:', e, isoString)
    return 'Just now'
  }
}