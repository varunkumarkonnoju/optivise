import { useState, useEffect } from 'react'
import { productApi } from '../utils/api'
import {
  Megaphone, Mail, Instagram, FileText, Sparkles,
  Copy, RefreshCw, ChevronDown, CheckCircle
} from 'lucide-react'

const TOOLS = [
  {
    id: 'ad',
    label: 'Ad Generator',
    icon: Megaphone,
    color: '#6366F1',
    desc: 'Facebook & Instagram ads',
    platforms: ['facebook', 'instagram', 'google'],
  },
  {
    id: 'email',
    label: 'Email Creator',
    icon: Mail,
    color: '#06B6D4',
    desc: 'Email campaigns & newsletters',
    platforms: ['email'],
  },
  {
    id: 'social',
    label: 'Social Posts',
    icon: Instagram,
    color: '#EC4899',
    desc: 'Instagram, TikTok & Twitter',
    platforms: ['instagram', 'tiktok', 'twitter'],
  },
  {
    id: 'blog',
    label: 'Blog Content',
    icon: FileText,
    color: '#10B981',
    desc: 'SEO blog posts & articles',
    platforms: ['blog'],
  },
]

const TONES = ['Professional', 'Playful', 'Luxury', 'Urgent', 'Friendly', 'Bold']
const CTAS  = ['Shop Now', 'Buy Now', 'Get Yours', 'Learn More', 'Order Today', 'Grab Yours']

// ── Format result with section highlighting ──────────────────
function FormattedResult({ text, color }) {
  if (!text) return null
  const lines = text.split('\n')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {lines.map((line, i) => {
        const isHeader = /^[A-Z\s]+:/.test(line)
        if (!line.trim()) return <div key={i} style={{ height: 4 }} />
        if (isHeader) {
          const [label, ...rest] = line.split(':')
          const content = rest.join(':').trim()
          return (
            <div key={i}>
              <div style={{
                fontSize: 10, fontWeight: 800, color,
                letterSpacing: '0.08em', marginBottom: 3,
              }}>
                {label}
              </div>
              {content && (
                <div style={{
                  fontSize: 13, color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  background: `${color}08`,
                  border: `1px solid ${color}20`,
                  borderRadius: 8, padding: '8px 12px',
                }}>
                  {content}
                </div>
              )}
            </div>
          )
        }
        // Numbered list items
        if (/^\d+\./.test(line.trim())) {
          return (
            <div key={i} style={{
              fontSize: 13, color: 'var(--text-secondary)',
              lineHeight: 1.6, paddingLeft: 12,
            }}>
              {line}
            </div>
          )
        }
        return (
          <div key={i} style={{
            fontSize: 13, color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            {line}
          </div>
        )
      })}
    </div>
  )
}

export default function MarketingPage() {
  const [activeTool, setActiveTool] = useState('ad')
  const [products, setProducts]     = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [customProduct, setCustomProduct] = useState('')
  const [customDesc, setCustomDesc]   = useState('')
  const [tone, setTone]               = useState('Professional')
  const [platform, setPlatform]       = useState('facebook')
  const [audience, setAudience]       = useState('online shoppers')
  const [cta, setCta]                 = useState('Shop Now')
  const [generating, setGenerating]   = useState(false)
  const [result, setResult]           = useState('')
  const [copied, setCopied]           = useState(false)
  const [error, setError]             = useState('')

  const token = localStorage.getItem('token')
  const tool  = TOOLS.find(t => t.id === activeTool)

  useEffect(() => {
    productApi.getAll()
      .then(r => setProducts(r.data || []))
      .catch(() => {})
  }, [])

  // Reset platform when tool changes
  useEffect(() => {
    setPlatform(tool?.platforms?.[0] || 'facebook')
    setResult('')
    setError('')
  }, [activeTool])

  const getProductName = () => {
    if (selectedProduct) return selectedProduct.title
    return customProduct
  }

  const getProductDesc = () => {
    if (selectedProduct) return selectedProduct.description || ''
    return customDesc
  }

  const generate = async () => {
    const productName = getProductName()
    if (!productName.trim()) {
      setError('Please select a product or enter a product name.')
      return
    }
    setGenerating(true)
    setResult('')
    setError('')
    try {
      const res = await fetch('/api/marketing/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          type:        activeTool,
          productName: productName,
          productDesc: getProductDesc(),
          tone:        tone.toLowerCase(),
          platform,
          audience,
          cta,
        })
      })
      const data = await res.json()
      if (data.result) {
        setResult(data.result)
      } else {
        setError('Generation failed. Please try again.')
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Marketing Studio
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          AI-powered marketing content for your Shopify store — ads, emails, posts and more.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT PANEL — Tool selector + inputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Tool tabs */}
          <div className="card" style={{ padding: 8 }}>
            {TOOLS.map(t => {
              const Icon = t.icon
              const isActive = activeTool === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id)}
                  style={{
                    width: '100%', display: 'flex',
                    alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10,
                    background: isActive ? `${t.color}15` : 'none',
                    border: isActive ? `1px solid ${t.color}30` : '1px solid transparent',
                    cursor: 'pointer', textAlign: 'left',
                    marginBottom: 4, transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: isActive ? `${t.color}20` : 'var(--bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={15} color={isActive ? t.color : 'var(--text-muted)'} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: isActive ? t.color : 'var(--text-primary)',
                    }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {t.desc}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Inputs */}
          <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Product selector */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Product
              </div>
              {products.length > 0 ? (
                <select
                  value={selectedProduct?.id || ''}
                  onChange={e => {
                    const p = products.find(p => String(p.id) === e.target.value)
                    setSelectedProduct(p || null)
                    setCustomProduct('')
                  }}
                  style={{
                    width: '100%', background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)', borderRadius: 8,
                    padding: '8px 10px', color: 'var(--text-primary)',
                    fontSize: 12, outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">— Enter manually —</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              ) : null}

              {!selectedProduct && (
                <input
                  value={customProduct}
                  onChange={e => setCustomProduct(e.target.value)}
                  placeholder="e.g. Leather Crossbody Bag"
                  style={{
                    width: '100%', marginTop: products.length > 0 ? 6 : 0,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)', borderRadius: 8,
                    padding: '8px 10px', color: 'var(--text-primary)',
                    fontSize: 12, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              )}
            </div>

            {/* Description (only if no product selected) */}
            {!selectedProduct && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Product Details (optional)
                </div>
                <textarea
                  value={customDesc}
                  onChange={e => setCustomDesc(e.target.value)}
                  placeholder="Brief description of your product..."
                  rows={3}
                  style={{
                    width: '100%', background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)', borderRadius: 8,
                    padding: '8px 10px', color: 'var(--text-primary)',
                    fontSize: 12, outline: 'none', resize: 'vertical',
                    fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Platform */}
            {tool?.platforms?.length > 1 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Platform
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {tool.platforms.map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 11,
                        fontWeight: 600, cursor: 'pointer',
                        background: platform === p ? tool.color : 'var(--bg-secondary)',
                        border: `1px solid ${platform === p ? tool.color : 'var(--border)'}`,
                        color: platform === p ? 'white' : 'var(--text-muted)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tone */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tone
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {TONES.map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 11,
                      fontWeight: 600, cursor: 'pointer',
                      background: tone === t ? tool.color : 'var(--bg-secondary)',
                      border: `1px solid ${tone === t ? tool.color : 'var(--border)'}`,
                      color: tone === t ? 'white' : 'var(--text-muted)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Target Audience
              </div>
              <input
                value={audience}
                onChange={e => setAudience(e.target.value)}
                placeholder="e.g. women 25-40, fashion lovers"
                style={{
                  width: '100%', background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  padding: '8px 10px', color: 'var(--text-primary)',
                  fontSize: 12, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* CTA (ads only) */}
            {activeTool === 'ad' && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Call to Action
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {CTAS.map(c => (
                    <button
                      key={c}
                      onClick={() => setCta(c)}
                      style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: 11,
                        fontWeight: 600, cursor: 'pointer',
                        background: cta === c ? tool.color : 'var(--bg-secondary)',
                        border: `1px solid ${cta === c ? tool.color : 'var(--border)'}`,
                        color: cta === c ? 'white' : 'var(--text-muted)',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                fontSize: 12, color: '#EF4444',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '8px 12px',
              }}>
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={generate}
              disabled={generating}
              style={{
                width: '100%', background: tool.color,
                border: 'none', borderRadius: 10,
                padding: '11px', fontSize: 13, fontWeight: 700,
                color: 'white', cursor: generating ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: generating ? 0.8 : 1, transition: 'opacity 0.2s',
              }}
            >
              <Sparkles size={14} />
              {generating ? 'Generating...' : `Generate with AI`}
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL — Result ── */}
        <div className="card" style={{ padding: 24, minHeight: 500 }}>

          {/* Panel header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20, paddingBottom: 16,
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${tool.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {(() => { const Icon = tool.icon; return <Icon size={16} color={tool.color} /> })()}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {tool.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {platform && platform !== 'email' && platform !== 'blog'
                    ? platform.charAt(0).toUpperCase() + platform.slice(1) + ' • '
                    : ''
                  }{tone} tone
                </div>
              </div>
            </div>

            {result && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={generate}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 8, padding: '6px 12px',
                    fontSize: 11, fontWeight: 600,
                    color: 'var(--text-muted)', cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={11} /> Regenerate
                </button>
                <button
                  onClick={copy}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: copied ? 'rgba(16,185,129,0.1)' : `${tool.color}15`,
                    border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : `${tool.color}30`}`,
                    borderRadius: 8, padding: '6px 12px',
                    fontSize: 11, fontWeight: 700,
                    color: copied ? '#10B981' : tool.color,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? <CheckCircle size={11} /> : <Copy size={11} />}
                  {copied ? 'Copied!' : 'Copy All'}
                </button>
              </div>
            )}
          </div>

          {/* Empty state */}
          {!result && !generating && (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              minHeight: 380, textAlign: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: `${tool.color}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                {(() => { const Icon = tool.icon; return <Icon size={28} color={tool.color} /> })()}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Ready to create your {tool.label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.6 }}>
                Select a product, choose your tone, and click
                <strong style={{ color: tool.color }}> Generate with AI</strong>
              </div>

              {/* Example tips */}
              <div style={{
                marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8,
                width: '100%', maxWidth: 380,
              }}>
                {getTips(activeTool).map((tip, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 8, padding: '10px 14px',
                    textAlign: 'left',
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{tip.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {tip.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {tip.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {generating && (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              minHeight: 380, textAlign: 'center',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${tool.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Sparkles size={22} color={tool.color} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                AI is writing your {tool.label.toLowerCase()}...
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                This takes about 5-10 seconds
              </div>
              <div style={{
                marginTop: 20, width: 200, height: 3,
                background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', background: tool.color,
                  borderRadius: 2, width: '60%',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              </div>
            </div>
          )}

          {/* Result */}
          {result && !generating && (
            <div>
              <FormattedResult text={result} color={tool.color} />

              {/* Quick copy per section */}
              <div style={{
                marginTop: 20, paddingTop: 16,
                borderTop: '1px solid var(--border)',
                display: 'flex', gap: 8, flexWrap: 'wrap',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>
                  Quick copy:
                </div>
                {getQuickCopySections(activeTool).map((section, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const lines = result.split('\n')
                      const sectionLine = lines.find(l =>
                        l.toUpperCase().startsWith(section.toUpperCase() + ':')
                      )
                      if (sectionLine) {
                        const content = sectionLine.split(':').slice(1).join(':').trim()
                        navigator.clipboard.writeText(content)
                      }
                    }}
                    style={{
                      padding: '4px 12px', borderRadius: 20,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      fontSize: 11, fontWeight: 600,
                      color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                  >
                    Copy {section}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getTips(type) {
  const tips = {
    ad: [
      { icon: '🎯', title: 'Be specific', desc: 'Add target audience details for better-converting ads' },
      { icon: '💥', title: 'Use Urgent tone', desc: 'Urgency increases click-through rates by 2-3x' },
    ],
    email: [
      { icon: '📬', title: 'Subject line matters', desc: 'AI writes subject lines optimized for open rates' },
      { icon: '🎁', title: 'Include a clear offer', desc: 'Add product details for more personalized emails' },
    ],
    social: [
      { icon: '📸', title: 'Emojis boost reach', desc: 'AI includes trending emojis for better engagement' },
      { icon: '#️⃣', title: 'Hashtag strategy', desc: 'AI picks hashtags with 10k-500k posts for best reach' },
    ],
    blog: [
      { icon: '🔍', title: 'SEO optimized', desc: 'AI writes titles and meta descriptions for Google ranking' },
      { icon: '📝', title: 'Full outline', desc: 'Get a complete blog structure ready to write from' },
    ],
  }
  return tips[type] || []
}

function getQuickCopySections(type) {
  const sections = {
    ad:     ['Headline', 'Primary Text', 'CTA'],
    email:  ['Subject Line', 'Preview Text'],
    social: ['Caption', 'Hashtags'],
    blog:   ['Title', 'Meta Description'],
  }
  return sections[type] || []
}
