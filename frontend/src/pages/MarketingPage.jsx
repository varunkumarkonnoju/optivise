import { useState, useEffect, useRef } from 'react'
import { productApi } from '../utils/api'
import {
  Megaphone, Mail, Instagram, FileText, Sparkles, Copy,
  RefreshCw, CheckCircle, Download, Image, Wand2, Palette,
  Monitor, Smartphone, Square, ChevronRight, Zap, Eye,
  LayoutTemplate, Star, TrendingUp
} from 'lucide-react'

// ── CONSTANTS ────────────────────────────────────────────────
const TOOLS = [
  { id: 'ad',     label: 'Ad Generator',  icon: Megaphone, color: '#6366F1', desc: 'FB, IG & Google ads'    },
  { id: 'email',  label: 'Email Creator', icon: Mail,      color: '#06B6D4', desc: 'Campaigns & newsletters' },
  { id: 'social', label: 'Social Posts',  icon: Instagram, color: '#EC4899', desc: 'IG, TikTok & Twitter'   },
  { id: 'blog',   label: 'Blog Content',  icon: FileText,  color: '#10B981', desc: 'SEO articles'            },
  { id: 'image',  label: 'AI Images',     icon: Image,     color: '#F59E0B', desc: 'DALL-E 3 visuals'        },
]

const TONES     = ['Professional', 'Playful', 'Luxury', 'Urgent', 'Friendly', 'Bold']
const CTAS      = ['Shop Now', 'Buy Now', 'Get Yours', 'Learn More', 'Order Today']
const PLATFORMS = {
  ad:     ['facebook', 'instagram', 'google'],
  email:  ['email'],
  social: ['instagram', 'tiktok', 'twitter'],
  blog:   ['blog'],
  image:  ['instagram', 'facebook', 'product', 'banner'],
}
const IMAGE_STYLES = [
  { id: 'lifestyle',      label: 'Lifestyle',      icon: '🌿', desc: 'Real-world context' },
  { id: 'minimalist',     label: 'Minimalist',     icon: '⬜', desc: 'Clean & elegant'    },
  { id: 'bold',           label: 'Bold & Vibrant', icon: '🔥', desc: 'Eye-catching'        },
  { id: 'photorealistic', label: 'Photorealistic', icon: '📸', desc: 'Studio quality'      },
  { id: 'artistic',       label: 'Artistic',       icon: '🎨', desc: 'Creative & unique'   },
]
const IMAGE_MOODS   = ['vibrant', 'moody', 'bright', 'warm', 'cool', 'dramatic', 'soft']
const IMAGE_SIZES   = [
  { label: 'Square 1:1',    value: '1024x1024', icon: Square,      platform: 'Instagram Feed'   },
  { label: 'Portrait 4:5',  value: '1024x1024', icon: Smartphone,  platform: 'Instagram Story'  },
  { label: 'Landscape 16:9',value: '1792x1024', icon: Monitor,     platform: 'Facebook Cover'   },
  { label: 'Banner',        value: '1792x1024', icon: LayoutTemplate, platform: 'Website Banner' },
]
const BG_COLORS = [
  { label: 'White',        value: 'pure white'       },
  { label: 'Light Gray',   value: 'light gray'       },
  { label: 'Cream',        value: 'cream beige'      },
  { label: 'Black',        value: 'pure black'       },
  { label: 'Gradient',     value: 'soft gradient'    },
  { label: 'Transparent',  value: 'transparent'      },
]

// ── AD PREVIEW ───────────────────────────────────────────────
function AdPreview({ headline, primaryText, cta, imageUrl, platform, productName }) {
  if (!headline && !primaryText) return null
  if (platform === 'instagram') {
    return (
      <div style={{
        border: '1px solid #dbdbdb', borderRadius: 3,
        background: 'white', maxWidth: 320, margin: '0 auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>
            {productName?.charAt(0) || 'O'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>{productName || 'your_store'}</div>
            <div style={{ fontSize: 11, color: '#8e8e8e' }}>Sponsored</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 18, color: '#000' }}>···</div>
        </div>
        {/* Image */}
        <div style={{ aspectRatio: '1/1', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {imageUrl
            ? <img src={imageUrl} alt="ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
                <Image size={32} style={{ marginBottom: 6, opacity: 0.3 }} /><br/>Generate image above
              </div>
          }
        </div>
        {/* CTA bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderTop: '1px solid #dbdbdb' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#000' }}>{headline || 'Your headline here'}</div>
            <div style={{ fontSize: 11, color: '#8e8e8e' }}>optiviseai.io</div>
          </div>
          <div style={{ background: '#efefef', border: '1px solid #ced0d4', borderRadius: 3, padding: '5px 12px', fontSize: 13, fontWeight: 700, color: '#000', whiteSpace: 'nowrap' }}>
            {cta || 'Shop Now'}
          </div>
        </div>
        {/* Caption */}
        {primaryText && (
          <div style={{ padding: '0 12px 12px', fontSize: 13, color: '#000', lineHeight: 1.5 }}>
            <strong>{productName || 'your_store'}</strong> {primaryText.substring(0, 120)}{primaryText.length > 120 ? '...' : ''}
          </div>
        )}
      </div>
    )
  }

  // Facebook preview
  return (
    <div style={{
      border: '1px solid #dddfe2', borderRadius: 8,
      background: 'white', maxWidth: 320, margin: '0 auto',
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    }}>
      {/* Image area */}
      <div style={{ aspectRatio: '1.91/1', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {imageUrl
          ? <img src={imageUrl} alt="ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
              <Image size={32} style={{ marginBottom: 6, opacity: 0.3 }} /><br/>Generate image above
            </div>
        }
      </div>
      {/* Content */}
      <div style={{ padding: '10px 12px', background: '#f2f3f5' }}>
        <div style={{ fontSize: 11, color: '#606770', marginBottom: 4 }}>optiviseai.io</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1c1e21', marginBottom: 2, lineHeight: 1.3 }}>
          {headline || 'Your headline will appear here'}
        </div>
        <div style={{ fontSize: 12, color: '#606770', lineHeight: 1.4 }}>
          {primaryText?.substring(0, 80) || 'Primary text will appear here'}
          {primaryText?.length > 80 ? '...' : ''}
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ background: '#e4e6eb', border: '1px solid #ccd0d5', borderRadius: 4, padding: '6px 16px', fontSize: 14, fontWeight: 700, color: '#4b4f56', textAlign: 'center' }}>
            {cta || 'Shop Now'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── RESULT FORMATTER ─────────────────────────────────────────
function FormattedResult({ text, color, onCopySection }) {
  if (!text) return null
  const sections = []
  let currentSection = null
  text.split('\n').forEach(line => {
    const headerMatch = line.match(/^([A-Z][A-Z\s0-9]+):\s*(.*)/)
    if (headerMatch) {
      if (currentSection) sections.push(currentSection)
      currentSection = { label: headerMatch[1], content: headerMatch[2], lines: [] }
    } else if (currentSection && line.trim()) {
      currentSection.lines.push(line)
    } else if (!currentSection && line.trim()) {
      sections.push({ label: '', content: line, lines: [] })
    }
  })
  if (currentSection) sections.push(currentSection)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sections.map((sec, i) => {
        const fullContent = [sec.content, ...sec.lines].join('\n').trim()
        if (!fullContent) return null
        return (
          <div key={i} style={{
            background: 'var(--bg-secondary)',
            border: `1px solid ${sec.label ? `${color}20` : 'var(--border)'}`,
            borderRadius: 10, overflow: 'hidden',
          }}>
            {sec.label && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 12px',
                background: `${color}10`,
                borderBottom: `1px solid ${color}20`,
              }}>
                <span style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: '0.08em' }}>
                  {sec.label}
                </span>
                <button
                  onClick={() => { navigator.clipboard.writeText(fullContent); onCopySection?.(sec.label) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color, fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}
                >
                  <Copy size={10} /> copy
                </button>
              </div>
            )}
            <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {fullContent}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── MAIN PAGE ────────────────────────────────────────────────
export default function MarketingPage() {
  const [activeTool,  setActiveTool]  = useState('ad')
  const [activeTab,   setActiveTab]   = useState('create') // create | preview
  const [products,    setProducts]    = useState([])
  const [selProduct,  setSelProduct]  = useState(null)
  const [customName,  setCustomName]  = useState('')
  const [customDesc,  setCustomDesc]  = useState('')
  const [tone,        setTone]        = useState('Professional')
  const [platform,    setPlatform]    = useState('facebook')
  const [audience,    setAudience]    = useState('online shoppers')
  const [cta,         setCta]         = useState('Shop Now')
  const [generating,  setGenerating]  = useState(false)
  const [result,      setResult]      = useState('')
  const [copied,      setCopied]      = useState(false)
  const [copiedSec,   setCopiedSec]   = useState('')
  const [error,       setError]       = useState('')

  // Image states
  const [imgStyle,    setImgStyle]    = useState('lifestyle')
  const [imgMood,     setImgMood]     = useState('vibrant')
  const [imgSize,     setImgSize]     = useState('1024x1024')
  const [bgColor,     setBgColor]     = useState('pure white')
  const [generatingImg, setGeneratingImg] = useState(false)
  const [generatedImg,  setGeneratedImg]  = useState(null)
  const [imgError,    setImgError]    = useState('')

  // Ad preview extracted data
  const [adHeadline, setAdHeadline] = useState('')
  const [adBody,     setAdBody]     = useState('')

  const token = localStorage.getItem('token')
  const tool  = TOOLS.find(t => t.id === activeTool)

  useEffect(() => {
    productApi.getAll().then(r => setProducts(r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setPlatform(PLATFORMS[activeTool]?.[0] || 'facebook')
    setResult(''); setError(''); setGeneratedImg(null)
    setAdHeadline(''); setAdBody('')
  }, [activeTool])

  // Extract headline and body from result for preview
  useEffect(() => {
    if (!result) return
    const lines = result.split('\n')
    const headlineLine = lines.find(l => l.toUpperCase().startsWith('HEADLINE:'))
    const bodyLine     = lines.find(l => l.toUpperCase().startsWith('PRIMARY TEXT:') || l.toUpperCase().startsWith('BODY:'))
    if (headlineLine) setAdHeadline(headlineLine.split(':').slice(1).join(':').trim())
    if (bodyLine)     setAdBody(bodyLine.split(':').slice(1).join(':').trim())
  }, [result])

  const getProductName = () => selProduct ? selProduct.title : customName
  const getProductDesc = () => selProduct ? (selProduct.description || '') : customDesc

  const generate = async () => {
    if (!getProductName().trim()) { setError('Please select or enter a product.'); return }
    setGenerating(true); setResult(''); setError('')
    try {
      const res = await fetch('/api/marketing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          type: activeTool, productName: getProductName(),
          productDesc: getProductDesc(), tone: tone.toLowerCase(),
          platform, audience, cta,
        })
      })
      const data = await res.json()
      if (data.result) { setResult(data.result); setActiveTab('create') }
      else setError('Generation failed. Try again.')
    } catch { setError('Something went wrong.') }
    finally { setGenerating(false) }
  }

  const generateImage = async () => {
  if (!getProductName().trim()) {
    setImgError('Please enter a product name.')
    return
  }
  setGeneratingImg(true)
  setGeneratedImg(null)
  setImgError('')
  try {
    const res = await fetch('/api/marketing/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({
        productName: getProductName(),
        style: imgStyle,
        platform,
        mood: imgMood,
        bgColor,
        size: imgSize,
      })
    })
    const data = await res.json()
    if (res.status === 403) {
      setImgError('🔒 AI Images require the Growth plan. Upgrade to unlock.')
      return
    }
    if (data.imageUrl) {
      setGeneratedImg(data)
    } else {
      setImgError(data.error || 'Image generation failed.')
    }
  } catch {
    setImgError('Image generation failed. Try again.')
  } finally {
    setGeneratingImg(false)
  }
}

  const downloadImage = async () => {
    if (!generatedImg?.imageUrl) return
    const a = document.createElement('a')
    a.href = generatedImg.imageUrl
    a.download = `${getProductName().replace(/\s+/g, '_')}_marketing.png`
    a.target = '_blank'
    a.click()
  }

  const copyAll = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopySection = (label) => {
    setCopiedSec(label)
    setTimeout(() => setCopiedSec(''), 2000)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Marketing Studio
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          AI-powered ads, emails, social posts, blog content and marketing images — all in one place.
        </p>
      </div>

      {/* Tool tabs row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {TOOLS.map(t => {
          const Icon = t.icon
          const isActive = activeTool === t.id
          return (
            <button key={t.id} onClick={() => setActiveTool(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
              background: isActive ? `${t.color}15` : 'var(--bg-secondary)',
              border: `1px solid ${isActive ? t.color : 'var(--border)'}`,
              color: isActive ? t.color : 'var(--text-muted)',
              fontWeight: isActive ? 700 : 500, fontSize: 13,
              whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0,
            }}>
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT PANEL ── */}
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Product */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Product
            </div>
            {products.length > 0 && (
              <select
                value={selProduct?.id || ''}
                onChange={e => { setSelProduct(products.find(p => String(p.id) === e.target.value) || null); setCustomName('') }}
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none', marginBottom: 6, cursor: 'pointer' }}
              >
                <option value="">— Type manually below —</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            )}
            {!selProduct && (
              <input
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Product name..."
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
              />
            )}
          </div>

          {/* Image-specific controls */}
          {activeTool === 'image' ? (
            <>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Visual Style
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {IMAGE_STYLES.map(s => (
                    <button key={s.id} onClick={() => setImgStyle(s.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                      background: imgStyle === s.id ? `${tool.color}15` : 'var(--bg-secondary)',
                      border: `1px solid ${imgStyle === s.id ? tool.color : 'var(--border)'}`,
                      textAlign: 'left',
                    }}>
                      <span style={{ fontSize: 16 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: imgStyle === s.id ? tool.color : 'var(--text-primary)' }}>{s.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Mood
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {IMAGE_MOODS.map(m => (
                    <button key={m} onClick={() => setImgMood(m)} style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                      background: imgMood === m ? tool.color : 'var(--bg-secondary)',
                      border: `1px solid ${imgMood === m ? tool.color : 'var(--border)'}`,
                      color: imgMood === m ? 'white' : 'var(--text-muted)',
                    }}>{m}</button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Background
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                  {BG_COLORS.map(c => (
                    <button key={c.value} onClick={() => setBgColor(c.value)} style={{
                      padding: '5px 6px', borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      background: bgColor === c.value ? `${tool.color}15` : 'var(--bg-secondary)',
                      border: `1px solid ${bgColor === c.value ? tool.color : 'var(--border)'}`,
                      color: bgColor === c.value ? tool.color : 'var(--text-muted)',
                    }}>{c.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Format & Size
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {IMAGE_SIZES.map(s => {
                    const Icon = s.icon
                    return (
                      <button key={s.value + s.label} onClick={() => setImgSize(s.value)} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                        background: imgSize === s.value && s.label.startsWith(imgSize === '1792x1024' ? 'L' : 'S') ? `${tool.color}15` : 'var(--bg-secondary)',
                        border: `1px solid var(--border)`,
                      }}>
                        <Icon size={13} color="var(--text-muted)" />
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.platform}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {imgError && <div style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px' }}>{imgError}</div>}

              <button onClick={generateImage} disabled={generatingImg} style={{
  width: '100%', background: tool.color, border: 'none', borderRadius: 10,
  padding: '12px', fontSize: 13, fontWeight: 700, color: 'white',
  cursor: generatingImg ? 'not-allowed' : 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  opacity: generatingImg ? 0.8 : 1,
}}>
  <Wand2 size={14} />
  {generatingImg ? 'Generating Image...' : 'Generate with DALL-E 3'}
</button>

{/* Growth plan badge */}
<div style={{
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  fontSize: 11, color: '#F59E0B', marginTop: 6,
}}>
  <span>⚡</span>
  <span>Growth plan feature — $79/mo</span>
  <a href="/pricing" style={{ color: '#F59E0B', fontWeight: 700 }}>Upgrade →</a>
</div>
            </>
          ) : (
            <>
              {/* Platform */}
              {PLATFORMS[activeTool]?.length > 1 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Platform</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {PLATFORMS[activeTool].map(p => (
                      <button key={p} onClick={() => setPlatform(p)} style={{
                        padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                        background: platform === p ? tool.color : 'var(--bg-secondary)',
                        border: `1px solid ${platform === p ? tool.color : 'var(--border)'}`,
                        color: platform === p ? 'white' : 'var(--text-muted)',
                      }}>{p}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tone */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tone</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {TONES.map(t => (
                    <button key={t} onClick={() => setTone(t)} style={{
                      padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      background: tone === t ? tool.color : 'var(--bg-secondary)',
                      border: `1px solid ${tone === t ? tool.color : 'var(--border)'}`,
                      color: tone === t ? 'white' : 'var(--text-muted)',
                    }}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Audience */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target Audience</div>
                <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. women 25-40, fashion lovers"
                  style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* CTA for ads */}
              {activeTool === 'ad' && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Call to Action</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {CTAS.map(c => (
                      <button key={c} onClick={() => setCta(c)} style={{
                        padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        background: cta === c ? tool.color : 'var(--bg-secondary)',
                        border: `1px solid ${cta === c ? tool.color : 'var(--border)'}`,
                        color: cta === c ? 'white' : 'var(--text-muted)',
                      }}>{c}</button>
                    ))}
                  </div>
                </div>
              )}

              {error && <div style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px' }}>{error}</div>}

              <button onClick={generate} disabled={generating} style={{
                width: '100%', background: tool.color, border: 'none', borderRadius: 10,
                padding: '12px', fontSize: 13, fontWeight: 700, color: 'white',
                cursor: generating ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: generating ? 0.8 : 1,
              }}>
                <Sparkles size={14} />
                {generating ? 'Writing...' : 'Generate with AI'}
              </button>
            </>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div>
          {/* Tab bar */}
          {activeTool !== 'image' && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
              {[
                { id: 'create',  label: 'Generated Copy', icon: Sparkles },
                { id: 'preview', label: 'Ad Preview',     icon: Eye      },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 7, cursor: 'pointer',
                  background: activeTab === tab.id ? 'var(--purple)' : 'none',
                  border: 'none',
                  color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                  fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 500,
                }}>
                  <tab.icon size={12} /> {tab.label}
                </button>
              ))}
            </div>
          )}

          <div className="card" style={{ padding: 24, minHeight: 520 }}>

            {/* IMAGE TOOL */}
            {activeTool === 'image' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>AI Image Generator</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Powered by DALL-E 3 — HD quality</div>
                  </div>
                  {generatedImg && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setGeneratedImg(null) }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <RefreshCw size={11} /> Regenerate
                      </button>
                      <button onClick={downloadImage} style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${tool.color}15`, border: `1px solid ${tool.color}30`, borderRadius: 8, padding: '7px 12px', fontSize: 11, fontWeight: 700, color: tool.color, cursor: 'pointer' }}>
                        <Download size={11} /> Download
                      </button>
                    </div>
                  )}
                </div>

                {/* Loading */}
                {generatingImg && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: 20, background: `${tool.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                      <Wand2 size={36} color={tool.color} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                      DALL-E 3 is creating your image...
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                      HD quality generation takes 15-20 seconds
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['Analyzing product', 'Composing scene', 'Rendering HD', 'Finalizing'].map((step, i) => (
                        <div key={i} style={{ fontSize: 10, color: tool.color, background: `${tool.color}10`, border: `1px solid ${tool.color}20`, borderRadius: 20, padding: '3px 10px' }}>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generated image */}
                {generatedImg && !generatingImg && (
                  <div>
                    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 16 }}>
                      <img src={generatedImg.imageUrl} alt="Generated" style={{ width: '100%', display: 'block', maxHeight: 500, objectFit: 'contain', background: '#000' }} />
                    </div>

                    {/* Image info */}
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>DALL-E PROMPT USED</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {generatedImg.revisedPrompt}
                      </div>
                    </div>

                    {/* Export options */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {['Instagram Post', 'Facebook Ad', 'Story'].map(format => (
                        <button key={format} onClick={downloadImage} style={{ padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <Download size={14} />
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!generatedImg && !generatingImg && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: 20, background: `${tool.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Wand2 size={36} color={tool.color} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                      Generate Marketing Images with AI
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 340, lineHeight: 1.6, marginBottom: 24 }}>
                      Select a product, choose your visual style and click <strong style={{ color: tool.color }}>Generate with DALL-E 3</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, width: '100%', maxWidth: 400 }}>
                      {[
                        { icon: '🎨', title: 'DALL-E 3 HD', desc: 'Latest OpenAI model' },
                        { icon: '📱', title: 'Platform Ready', desc: 'Perfect dimensions' },
                        { icon: '⚡', title: '15-20 seconds', desc: 'Fast generation' },
                        { icon: '💾', title: 'Download Free', desc: 'Use anywhere' },
                      ].map((f, i) => (
                        <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 18 }}>{f.icon}</span>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{f.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COPY TOOLS */}
            {activeTool !== 'image' && activeTab === 'create' && (
              <>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${tool.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(() => { const Icon = tool.icon; return <Icon size={16} color={tool.color} /> })()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{tool.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {platform} · {tone} tone · {audience}
                      </div>
                    </div>
                  </div>
                  {result && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={generate} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <RefreshCw size={11} /> Regenerate
                      </button>
                      <button onClick={copyAll} style={{ display: 'flex', alignItems: 'center', gap: 6, background: copied ? 'rgba(16,185,129,0.1)' : `${tool.color}15`, border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : `${tool.color}30`}`, borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: copied ? '#10B981' : tool.color, cursor: 'pointer' }}>
                        {copied ? <CheckCircle size={11} /> : <Copy size={11} />}
                        {copied ? 'Copied!' : 'Copy All'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Loading */}
                {generating && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: `${tool.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Sparkles size={24} color={tool.color} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Writing your {tool.label.toLowerCase()}...</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>GPT-4o is crafting high-converting copy</div>
                  </div>
                )}

                {/* Empty */}
                {!result && !generating && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: `${tool.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      {(() => { const Icon = tool.icon; return <Icon size={28} color={tool.color} /> })()}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Ready to create {tool.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 300, lineHeight: 1.6 }}>
                      Configure your options on the left and click <strong style={{ color: tool.color }}>Generate with AI</strong>
                    </div>
                  </div>
                )}

                {/* Result */}
                {result && !generating && (
                  <FormattedResult text={result} color={tool.color} onCopySection={handleCopySection} />
                )}
              </>
            )}

            {/* AD PREVIEW TAB */}
            {activeTool !== 'image' && activeTab === 'preview' && (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                  {['facebook', 'instagram'].map(p => (
                    <button key={p} onClick={() => setPlatform(p)} style={{ padding: '6px 14px', borderRadius: 8, cursor: 'pointer', background: platform === p ? 'var(--purple)' : 'var(--bg-secondary)', border: `1px solid ${platform === p ? 'var(--purple)' : 'var(--border)'}`, color: platform === p ? 'white' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                      {p}
                    </button>
                  ))}
                </div>

                {result ? (
                  <AdPreview
                    headline={adHeadline}
                    primaryText={adBody}
                    cta={cta}
                    imageUrl={generatedImg?.imageUrl}
                    platform={platform}
                    productName={getProductName()}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, textAlign: 'center' }}>
                    <Eye size={32} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.4 }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>No preview yet</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Generate copy first to see the ad preview</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}