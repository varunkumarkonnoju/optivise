import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const SettingsContext = createContext({})

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    // Load from localStorage immediately for fast render
    try {
      const saved = localStorage.getItem('optivise_settings')
      return saved ? JSON.parse(saved) : {
        emailNotifications: true,
        weeklyReport: true,
        lowStockAlerts: true,
        newOrderAlerts: true,
        aiSuggestions: true,
        theme: 'dark',
        language: 'en',
        currency: 'USD',
        timezone: 'America/Chicago',
      }
    } catch { return { currency: 'USD', timezone: 'America/Chicago' } }
  })

  const loadSettings = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/settings', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data) {
        setSettings(data)
        localStorage.setItem('optivise_settings', JSON.stringify(data))
      }
    })
    .catch(() => {})
  }, [])

  useEffect(() => {
    loadSettings()
    // Listen for settings changes from SettingsPage
    window.addEventListener('settings-updated', loadSettings)
    return () => window.removeEventListener('settings-updated', loadSettings)
  }, [loadSettings])

  const currencySymbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', INR: '₹' }

  const formatCurrency = useCallback((amount) => {
    const symbol = currencySymbols[settings.currency] || '$'
    const num = Number(amount) || 0
    if (num >= 1000000) return symbol + (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return symbol + (num / 1000).toFixed(1) + 'k'
    return symbol + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [settings.currency])

  const formatDate = useCallback((dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { timeZone: settings.timezone })
    } catch { return dateStr }
  }, [settings.timezone])

  return (
    <SettingsContext.Provider value={{ settings, setSettings, formatCurrency, formatDate, loadSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)