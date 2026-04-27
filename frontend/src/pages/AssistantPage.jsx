import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi } from '../utils/api'
import { Send, Sparkles, Bot } from 'lucide-react'
import './Assistant.css'

const QUICK = [
  "Why did my sales drop last week?",
  "Which products need optimization?",
  "How can I improve my conversion rate?",
  "What A/B tests should I run?",
]

export default function AssistantPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    chatApi.getHistory()
      .then(r => {
        if (r.data.length === 0) {
          setMessages([{ role: 'assistant', content: "Hi! I'm your Optivise AI assistant. I have access to your store data and can help you understand performance, identify growth opportunities, and take action. What would you like to know?" }])
        } else {
          setMessages(r.data)
        }
      })
      .finally(() => setFetching(false))
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const { data } = await chatApi.send(msg)
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="assistant-page">
      <div className="assistant-layout">
        {/* Header */}
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="chat-avatar-ai"><Sparkles size={16} /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>AI Assistant</div>
                <div style={{ fontSize: 11, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                  Online — connected to your store
                </div>
              </div>
            </div>
            <button onClick={() => navigate(-1)} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: 12, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              ← Back
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {fetching ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`chat-bubble-wrap ${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="chat-avatar-ai sm"><Bot size={12} /></div>
                )}
                <div className={`chat-bubble ${m.role}`}>
                  {m.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="chat-bubble-wrap assistant">
              <div className="chat-avatar-ai sm"><Bot size={12} /></div>
              <div className="chat-bubble assistant typing">
                <div className="typing-dots"><span/><span/><span/></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="quick-prompts">
            {QUICK.map((q, i) => (
              <button key={i} className="quick-btn" onClick={() => send(q)}>{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chat-input-row">
          <div className="chat-input-wrap">
            <input
              className="chat-input"
              placeholder="Ask anything about your store..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={loading}
            />
            <button className="send-btn" onClick={() => send()} disabled={!input.trim() || loading}>
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}