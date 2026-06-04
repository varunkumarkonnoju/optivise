import { useEffect, useState, useRef } from 'react'
import { productApi } from '../utils/api'
import {
  Package, AlertTriangle, CheckCircle, XCircle,
  Sparkles, Copy, Save, ChevronDown, ChevronUp, Zap, X, Eye
} from 'lucide-react'
import DescriptionHistory from '../components/DescriptionHistory'
import UsageBanner from '../components/UsageBanner'
import { useNavigate } from 'react-router-dom'
import './Products.css'

const statusConfig = {
  'optimized':       { icon: CheckCircle,   color: 'var(--green)',  label: 'Optimized',      bg: 'var(--green-dim)' },
  'needs-attention': { icon: AlertTriangle, color: 'var(--amber)',  label: 'Needs Attention', bg: 'var(--amber-dim)' },
  'critical':        { icon: XCircle,       color: 'var(--red)',    label: 'Critical',        bg: 'var(--red-dim)'   },
}

const TONES = [
  { id: 'professional', label: '💼 Professional' },
  { id: 'playful',      label: '🎉 Playful'      },
  { id: 'luxury',       label: '✨ Luxury'        },
  { id: 'minimal',      label: '◻ Minimal'       },
  { id: 'storytelling', label: '📖 Story'         },
]

async function generateOne(product, tone, keywords, token) {
  const res = await fetch('/api/products/generate-description', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ productId: product.id, productTitle: product.title, price: product.price, tone, keywords })
  })
  const data = await res.json()
  return data.description || ''
}

async function saveOne(productId, description, token) {
  const res = await fetch(`/api/products/${productId}/description`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ description })
  })
  return res.ok
}

// CHANGE 2: saveBackup — saves original BEFORE overwriting with AI description
async function saveBackup(product, aiDescription, token) {
  try {
    await fetch('/api/descriptions/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        productId:           String(product.id),
        productTitle:        product.title,
        originalDescription: product.description || product.body_html || '',
        aiDescription:       aiDescription
      })
    })
  } catch (e) {
    console.warn('Backup save failed (non-critical):', e)
    // Non-critical — don't block the save if backup fails
  }
}

export default function ProductsPage() {
  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')

  // Single generate
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [tone, setTone]               = useState('professional')
  const [keywords, setKeywords]       = useState('')
  const [generating, setGenerating]   = useState(false)
  const [generated, setGenerated]     = useState('')
  const [saving, setSaving]           = useState(false)
  const [savedMsg, setSavedMsg]       = useState('')
  const [tab, setTab]                 = useState('preview')

  // Bulk
  const [bulkOpen, setBulkOpen]       = useState(false)
  const [bulkTone, setBulkTone]       = useState('professional')
  const [bulkRunning, setBulkRunning] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(0)
  const [bulkTotal, setBulkTotal]     = useState(0)
  const [bulkResults, setBulkResults] = useState({})
  const [bulkStatus, setBulkStatus]   = useState('')
  const [bulkDone, setBulkDone]       = useState(false)
  const [bulkSaving, setBulkSaving]   = useState(false)
  const [bulkSaveMsg, setBulkSaveMsg] = useState('')
  const [previewId, setPreviewId]     = useState(null)
  const [savedIds, setSavedIds]       = useState(new Set())
  const [limitReached, setLimitReached] = useState(false)
const [limitMessage, setLimitMessage] = useState('')
  const stopRef = useRef(false)

  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    productApi.getAll().then(r => setProducts(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? products : products.filter(p => p.optimizationStatus === filter)

  // ── Single generate ───────────────────────────────────
  const openGenerator = (product) => {
    setSelectedProduct(product); setGenerated(''); setSavedMsg('')
    setKeywords(''); setTone('professional'); setTab('preview')
  }
  const closeGenerator = () => { setSelectedProduct(null); setGenerated('') }

  const generate = async () => {
  if (!selectedProduct) return
  setGenerating(true); setGenerated(''); setSavedMsg('')
  setLimitReached(false); setLimitMessage('')
  try {
    const res = await fetch('/api/products/generate-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        productId: selectedProduct.id,
        productTitle: selectedProduct.title,
        price: selectedProduct.price,
        tone, keywords
      })
    })
    if (res.status === 429) {
      const data = await res.json()
      setLimitReached(true)
      setLimitMessage(data.message || "You've reached your monthly limit.")
      setGenerating(false)
      return
    }
    const data = await res.json()
    setGenerated(data.description || '')
    const userKey = localStorage.getItem('user_email') || 'user'
    localStorage.setItem('used_ai_description_' + userKey, '1')
    window.dispatchEvent(new Event('onboarding-updated'))
  } catch { setGenerated('Error. Check your OpenAI key.') }
  finally { setGenerating(false) }
}

  // CHANGE 3: saveToShopify — backup original first, then save AI description
  const saveToShopify = async () => {
    if (!generated || !selectedProduct) return
    setSaving(true)
    await saveBackup(selectedProduct, generated, token)        // ← backup first
    const ok = await saveOne(selectedProduct.id, generated, token)
    if (ok) {
  const shopDomain = JSON.parse(localStorage.getItem('user') || '{}')?.shopDomain || ''
  const shopUrl = shopDomain ? `https://${shopDomain}/admin/products/${selectedProduct.id}` : null
  setSavedMsg(shopUrl
    ? `✓ Saved! <a href="${shopUrl}" target="_blank" style="color:#818cf8">View in Shopify →</a>`
    : '✓ Saved to Shopify! Original backed up.')
} else {
  setSavedMsg('Failed to save. Try again.')
}
    setSaving(false)
  }

  const copyHtml = () => {
    navigator.clipboard.writeText(generated)
    setSavedMsg('✓ Copied!'); setTimeout(() => setSavedMsg(''), 2000)
  }

  // CHANGE 4: handleDescriptionRestored — updates local state after user restores
  const handleDescriptionRestored = (productId, originalDescription) => {
    setProducts(prev => prev.map(p =>
      String(p.id) === String(productId)
        ? { ...p, description: originalDescription, optimizationStatus: 'needs-attention' }
        : p
    ))
    setGenerated('')
    setSavedMsg('')
  }

  // ── Bulk generate ─────────────────────────────────────
  const startBulk = async () => {
    stopRef.current = false
    setBulkRunning(true); setBulkDone(false)
    setBulkResults({}); setBulkSaveMsg('')
    setBulkProgress(0); setBulkTotal(products.length)
    setSavedIds(new Set()); setPreviewId(null)

    const results = {}
    for (let i = 0; i < products.length; i++) {
      if (stopRef.current) break
      const p = products[i]
      setBulkStatus(`Generating: "${p.title}" (${i + 1}/${products.length})`)
      try {
        const desc = await generateOne(p, bulkTone, '', token)
        results[p.id] = desc
      } catch { results[p.id] = null }
      setBulkProgress(i + 1)
      setBulkResults({ ...results })
      await new Promise(r => setTimeout(r, 800))
    }
    setBulkRunning(false); setBulkDone(true)
    const count = Object.values(results).filter(Boolean).length
    setBulkStatus(`✓ Done! ${count} of ${products.length} descriptions generated.`)
  }

  const stopBulk = () => { stopRef.current = true }

  // CHANGE 5: saveAllToShopify — backup each product before saving
  const saveAllToShopify = async () => {
    setBulkSaving(true); setBulkSaveMsg('')
    let saved = 0
    const newSaved = new Set(savedIds)
    for (const [id, desc] of Object.entries(bulkResults)) {
      if (desc) {
        const product = products.find(p => String(p.id) === String(id))
        if (product) await saveBackup(product, desc, token)    // ← backup first
        const ok = await saveOne(id, desc, token)
        if (ok) { saved++; newSaved.add(id) }
        await new Promise(r => setTimeout(r, 300))
      }
    }
    setSavedIds(newSaved)
    setBulkSaveMsg(`✓ Saved ${saved} to Shopify! Originals backed up — restore from Description History.`)
    setBulkSaving(false)
  }

  // CHANGE 6: saveSingleBulk — backup before saving individual product
  const saveSingleBulk = async (productId) => {
    const desc = bulkResults[productId]
    if (!desc) return
    const product = products.find(p => String(p.id) === String(productId))
    if (product) await saveBackup(product, desc, token)        // ← backup first
    const ok = await saveOne(productId, desc, token)
    if (ok) setSavedIds(prev => new Set([...prev, productId]))
  }

  const progressPct = bulkTotal > 0 ? Math.round((bulkProgress / bulkTotal) * 100) : 0

  if (loading) return <div className="spinner" />

  return (
    <div className="products-page">
  <UsageBanner />
  <div className="page-header">
        <div>
          <h1 className="page-title">Product Optimizer</h1>
          <p className="page-sub">AI-powered description generator for your Shopify store</p>
        </div>
        <button className="bulk-btn" onClick={() => setBulkOpen(!bulkOpen)}>
          <Zap size={14} />
          Bulk Generate All
          {bulkOpen ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
        </button>
      </div>

      {/* ── Bulk Panel ── */}
      {bulkOpen && (
        <div className="bulk-panel card">
          <div className="bulk-header">
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Bulk AI Description Generator</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Generate descriptions for all {products.length} products at once, then preview and save each one.{' '}
                <span style={{ color: 'var(--amber)', fontWeight: 600 }}>
                  ↩ Originals auto-saved — restore anytime from Description History.
                </span>
              </div>
            </div>
            <button className="icon-btn" onClick={() => setBulkOpen(false)}><X size={14}/></button>
          </div>

          {!bulkRunning && !bulkDone && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Tone for all products</div>
                <div className="tone-row">
                  {TONES.map(t => (
                    <button key={t.id} className={`tone-chip ${bulkTone === t.id ? 'active' : ''}`}
                      onClick={() => setBulkTone(t.id)}>{t.label}</button>
                  ))}
                </div>
              </div>
              <button className="gen-go-btn" style={{ width: 'auto', padding: '10px 24px', flexShrink: 0 }} onClick={startBulk}>
                <Zap size={14} /> Generate All {products.length} Products
              </button>
            </div>
          )}

          {/* Progress bar */}
          {(bulkRunning || bulkDone) && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: bulkDone ? 'var(--green)' : 'var(--text-secondary)' }}>{bulkStatus}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple-light)' }}>{progressPct}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ height: '100%', width: progressPct + '%', background: bulkDone ? 'var(--green)' : 'var(--purple)', borderRadius: 4, transition: 'width 0.4s ease' }} />
              </div>

              {bulkRunning && (
                <button className="btn-ghost" onClick={stopBulk} style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>
                  Stop generation
                </button>
              )}

              {bulkDone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {bulkSaveMsg
                    ? <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>{bulkSaveMsg}</span>
                    : (
                      <button className="gen-go-btn" style={{ width: 'auto', padding: '10px 24px' }}
                        onClick={saveAllToShopify} disabled={bulkSaving}>
                        <Save size={14} />
                        {bulkSaving ? 'Saving...' : `Save All ${Object.values(bulkResults).filter(Boolean).length} to Shopify`}
                      </button>
                    )
                  }
                  <button className="btn-ghost" onClick={() => { setBulkDone(false); setBulkProgress(0); setBulkResults({}); setBulkSaveMsg(''); setSavedIds(new Set()); setPreviewId(null) }}>
                    Generate again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Per-product preview cards ── */}
          {Object.keys(bulkResults).length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>
                Generated Descriptions — Click to Preview
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {products.filter(p => bulkResults[p.id]).map(p => {
                  const isPreviewOpen = previewId === p.id
                  const isSaved = savedIds.has(String(p.id)) || savedIds.has(p.id)
                  return (
                    <div key={p.id} className="bulk-result-card">
                      {/* Card header */}
                      <div className="bulk-result-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {p.imageUrl
                            ? <img src={p.imageUrl} alt={p.title} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                            : <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={14} style={{ color: 'var(--text-muted)' }}/></div>
                          }
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                            <div style={{ fontSize: 10, color: isSaved ? 'var(--green)' : 'var(--text-muted)', fontWeight: 600 }}>
                              {isSaved ? '✓ Saved to Shopify' : '● Ready to save'}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="icon-btn" title="Preview" onClick={() => setPreviewId(isPreviewOpen ? null : p.id)}>
                            <Eye size={13}/>
                          </button>
                          <button className="icon-btn" title="Copy HTML" onClick={() => navigator.clipboard.writeText(bulkResults[p.id])}>
                            <Copy size={13}/>
                          </button>
                          {!isSaved && (
                            <button className="icon-btn save" title="Save to Shopify" onClick={() => saveSingleBulk(p.id)}>
                              <Save size={13}/>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Preview panel */}
                      {isPreviewOpen && (
                        <div className="bulk-preview-body">
                          <div className="gen-tabs" style={{ marginBottom: 10 }}>
                            <button className="gen-tab active">Preview</button>
                          </div>
                          <div className="gen-preview" style={{ maxHeight: 160 }}
                            dangerouslySetInnerHTML={{ __html: bulkResults[p.id] }} />
                          <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
                            <button className="gen-action-btn" onClick={() => navigator.clipboard.writeText(bulkResults[p.id])}>
                              <Copy size={11}/> Copy HTML
                            </button>
                            {!isSaved && (
                              <button className="gen-action-btn primary" onClick={() => saveSingleBulk(p.id)}>
                                <Save size={11}/> Save to Shopify
                              </button>
                            )}
                            {isSaved && <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, alignSelf: 'center' }}>✓ Saved!</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status cards */}
      <div className="status-grid">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const Icon = cfg.icon
          const count = products.filter(p => p.optimizationStatus === key).length
          return (
            <button key={key} className={`card status-card ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(filter === key ? 'all' : key)}
              style={filter === key ? { borderColor: cfg.color, background: cfg.bg } : {}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon size={15} style={{ color: cfg.color }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cfg.label}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: cfg.color }}>{count}</div>
            </button>
          )
        })}
      </div>

      {/* Products table */}
      <div className="card products-table">
        <div className="table-header-7">
          <div>Product</div><div>Price</div>
          <div>Revenue</div>
          <div>Status</div><div>AI Description</div>
        </div>

        {filtered.map(p => {
          const cfg = statusConfig[p.optimizationStatus] || statusConfig['needs-attention']
          const Icon = cfg.icon
          const isOpen = selectedProduct?.id === p.id
          const hasBulk = !!bulkResults[p.id]
          return (
            <div key={p.id}>
              <div className="table-row-7" style={{ background: isOpen ? 'rgba(99,102,241,0.04)' : '' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.title} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display='none'} />
                    : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={16} style={{ color: 'var(--text-muted)' }}/></div>
                  }
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.title}</div>
                    {hasBulk && <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>✓ Bulk generated</div>}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>${p.price?.toFixed(2)}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>${Math.round(p.revenue || 0)?.toLocaleString()}</div>
                <div className="status-pill" style={{ background: cfg.bg, color: cfg.color }}><Icon size={11}/> {cfg.label}</div>
                <button className="gen-btn" onClick={() => isOpen ? closeGenerator() : openGenerator(p)}>
                  <Sparkles size={12} />
                  {isOpen ? 'Close' : 'Generate'}
                  {isOpen ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
                </button>
              </div>

              {/* Inline single generator */}
              {isOpen && (
                <div className="gen-panel">
                  <div className="gen-left">
                    <div className="gen-section-title">Tone of voice</div>
                    <div className="tone-row">
                      {TONES.map(t => (
                        <button key={t.id} className={`tone-chip ${tone === t.id ? 'active' : ''}`} onClick={() => setTone(t.id)}>{t.label}</button>
                      ))}
                    </div>
                    <div className="gen-section-title" style={{ marginTop: 14 }}>Keywords</div>
                    <input className="gen-input" placeholder="e.g. durable, eco-friendly" value={keywords} onChange={e => setKeywords(e.target.value)} />
                    <button className="gen-go-btn" onClick={generate} disabled={generating}>
                      <Sparkles size={14} />{generating ? 'Generating...' : 'Generate with AI'}
                    </button>

                    {/* CHANGE 7: Restore original button — shown only after first save */}
                    <DescriptionHistory
                      productId={String(p.id)}
                      productTitle={p.title}
                      onRestored={handleDescriptionRestored}
                    />
                  </div>
                  <div className="gen-right">
                    {limitReached && (
  <div className="gen-empty">
    <AlertTriangle size={28}
      style={{ color: 'var(--red)', marginBottom: 10 }} />
    <div style={{
      fontSize: 13, fontWeight: 700,
      color: 'var(--red)', marginBottom: 6
    }}>
      Monthly limit reached!
    </div>
    <div style={{
      fontSize: 12, color: 'var(--text-muted)',
      marginBottom: 16
    }}>
      {limitMessage}
    </div>
    <button
      onClick={() => navigate('/pricing')}
      style={{
        background: 'var(--purple)', border: 'none',
        borderRadius: 8, padding: '8px 20px',
        fontSize: 12, fontWeight: 700,
        color: 'white', cursor: 'pointer',
      }}
    >
      Upgrade Plan →
    </button>
  </div>
)}
                    {!generated && !generating && !limitReached && (
                      <div className="gen-empty">
                        <Sparkles size={28} style={{ color: 'var(--purple)', marginBottom: 10 }} />
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Pick a tone and click Generate</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 12px', textAlign: 'left', lineHeight: 1.6 }}>
                          💡 <strong>How it works:</strong> AI writes a description → you preview it → click <strong>"Save to Shopify"</strong> to publish it live on your store.
                          <br/><br/>
                          ↩ <strong>Changed your mind?</strong> Your original is auto-saved when you click Save. Restore it anytime using the button on the left.
                        </div>
                      </div>
                    )}
                    {generating && (
                      <div className="gen-empty">
                        <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 10px' }} />
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI is writing...</div>
                      </div>
                    )}
                    {generated && !generating && (
                      <>
                        <div className="gen-tabs">
                          <button className={`gen-tab ${tab === 'preview' ? 'active' : ''}`} onClick={() => setTab('preview')}>Preview</button>
                          <button className={`gen-tab ${tab === 'html' ? 'active' : ''}`} onClick={() => setTab('html')}>HTML</button>
                        </div>
                        {tab === 'preview'
                          ? <div className="gen-preview" dangerouslySetInnerHTML={{ __html: generated }} />
                          : <pre className="gen-code">{generated}</pre>}
                        <div className="gen-actions">
                          {savedMsg && <span style={{ fontSize: 12, color: savedMsg.includes('Failed') ? 'var(--red)' : 'var(--green)', fontWeight: 600 }} dangerouslySetInnerHTML={{ __html: savedMsg }} />}
                          <button className="gen-action-btn" onClick={copyHtml}><Copy size={12}/> Copy</button>
                          <button className="gen-action-btn primary" onClick={saveToShopify} disabled={saving}>
                            <Save size={12}/> {saving ? 'Saving...' : 'Save to Shopify'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Footer note */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
          Revenue is calculated from your real Shopify order history.
        </div>
      </div>
    </div>
  )
}