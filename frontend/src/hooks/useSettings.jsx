import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext({})

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    weeklyReport: true,
    lowStockAlerts: true,
    newOrderAlerts: true,
    aiSuggestions: true,
    theme: 'dark',
    language: 'en',
    currency: 'USD',
    timezone: 'America/Chicago',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/settings', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(r => r.ok ? r.json() : null)
    .then(data => { if (data) setSettings(s => ({ ...s, ...data })) })
    .catch(() => {})
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', INR: '₹' }
    const symbol = symbols[settings.currency] || '$'
    return symbol + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Format date with timezone
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { timeZone: settings.timezone })
    } catch { return dateStr }
  }

  return (
    <SettingsContext.Provider value={{ settings, setSettings, formatCurrency, formatDate }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)