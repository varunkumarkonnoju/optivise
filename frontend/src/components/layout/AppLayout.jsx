import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './Layout.css'
import FeedbackButton from '../FeedbackButton'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar className={sidebarOpen ? 'open' : ''} />
      <div className="main-content">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-body">{children}</div>
      </div>
      <FeedbackButton />
    </div>
  )
}