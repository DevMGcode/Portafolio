import { useState } from 'react'

const MODES = [
  { key: 'translate', label: 'Mover',   icon: '✥', short: 'T' },
  { key: 'scale',     label: 'Escalar', icon: '⤢', short: 'S' },
  { key: 'rotate',    label: 'Rotar',   icon: '↻', short: 'R' },
]

// Serializa un item del layout, manejando 'sound' kind aparte de modelos GLB
function serializeItem(name, item) {
  if (item.kind === 'sound') {
    const parts = [
      `kind: 'sound'`,
      `pos: [${item.pos.join(', ')}]`,
      item.rot ? `rot: [${item.rot.join(', ')}]` : null,
      item.colorA ? `colorA: '${item.colorA}'` : null,
      item.colorB ? `colorB: '${item.colorB}'` : null,
      item.maxRadius !== undefined ? `maxRadius: ${item.maxRadius}` : null,
      item.speed !== undefined ? `speed: ${item.speed}` : null,
      item.count !== undefined ? `count: ${item.count}` : null,
      item.emitTowards ? `emitTowards: '${item.emitTowards}'` : null,
    ].filter(Boolean).join(', ')
    return `  ${name.padEnd(16)}: { ${parts} },`
  }
  if (item.kind === 'dashboard') {
    const parts = [
      `kind: 'dashboard'`,
      `pos: [${item.pos.join(', ')}]`,
      item.rot ? `rot: [${item.rot.join(', ')}]` : null,
      item.size !== undefined ? `size: ${item.size}` : null,
    ].filter(Boolean).join(', ')
    return `  ${name.padEnd(16)}: { ${parts} },`
  }
  if (item.kind === 'techstack') {
    const parts = [
      `kind: 'techstack'`,
      `pos: [${item.pos.join(', ')}]`,
      item.rot ? `rot: [${item.rot.join(', ')}]` : null,
      item.size !== undefined ? `size: ${item.size}` : null,
    ].filter(Boolean).join(', ')
    return `  ${name.padEnd(16)}: { ${parts} },`
  }
  if (item.kind === 'prop') {
    const parts = [
      `kind: 'prop'`,
      item.type ? `type: '${item.type}'` : null,
      `pos: [${item.pos.join(', ')}]`,
      item.rot ? `rot: [${item.rot.join(', ')}]` : null,
      item.size !== undefined ? `size: ${item.size}` : null,
      item.color ? `color: '${item.color}'` : null,
      item.accentColor ? `accentColor: '${item.accentColor}'` : null,
    ].filter(Boolean).join(', ')
    return `  ${name.padEnd(16)}: { ${parts} },`
  }
  if (item.kind === 'eq') {
    const parts = [
      `kind: 'eq'`,
      `pos: [${item.pos.join(', ')}]`,
      item.rot ? `rot: [${item.rot.join(', ')}]` : null,
      item.bars !== undefined ? `bars: ${item.bars}` : null,
      item.width !== undefined ? `width: ${item.width}` : null,
      item.height !== undefined ? `height: ${item.height}` : null,
      item.colorLow ? `colorLow: '${item.colorLow}'` : null,
      item.colorHigh ? `colorHigh: '${item.colorHigh}'` : null,
      item.speed !== undefined ? `speed: ${item.speed}` : null,
    ].filter(Boolean).join(', ')
    return `  ${name.padEnd(16)}: { ${parts} },`
  }
  const parts = [
    `url: '${item.url}'`,
    item.projectId ? `projectId: '${item.projectId}'` : null,
    `pivot: '${item.pivot}'`,
    `pos: [${item.pos.join(', ')}]`,
    `size: ${item.size}`,
    item.rot ? `rot: [${item.rot.join(', ')}]` : null,
    item.animate ? `animate: '${item.animate}'` : null,
  ].filter(Boolean).join(', ')
  return `  ${name.padEnd(16)}: { ${parts} },`
}

// Genera el snippet completo para pegar en Scene.jsx
function buildLayoutCode(layout) {
  const lines = Object.entries(layout).map(([name, item]) => serializeItem(name, item))
  return `// === LAYOUT GUARDADO el ${new Date().toLocaleString('es-AR')} ===\n// Pegá este bloque sobre INITIAL_LAYOUT en src/components/Scene.jsx\n\nexport const INITIAL_LAYOUT = {\n${lines.join('\n')}\n}\n`
}

// Sólo el bloque export const INITIAL_LAYOUT (sin header) para escribir en archivo
function buildLayoutOnly(layout) {
  const lines = Object.entries(layout).map(([name, item]) => serializeItem(name, item))
  return `export const INITIAL_LAYOUT = {\n${lines.join('\n')}\n}`
}

export default function EditorPanel({ layout, selectedItem, onSelectItem, onReset, onDelete, gizmoMode, onChangeMode }) {
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)   // 'ok' | 'error' | null

  const copyAll = () => {
    const code = buildLayoutCode(layout)
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadAsFile = () => {
    const code = buildLayoutCode(layout)
    const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    a.href = url
    a.download = `INITIAL_LAYOUT-${ts}.js`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2500)
  }

  const saveToCode = async () => {
    setSaving(true)
    setSaveStatus(null)
    try {
      const res = await fetch('/api/save-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: buildLayoutOnly(layout) }),
      })
      const data = await res.json()
      if (data.ok) {
        setSaveStatus('ok')
      } else {
        setSaveStatus('error')
        console.warn('Error guardando:', data.error)
      }
    } catch (e) {
      setSaveStatus('error')
      console.warn(e)
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const sel = selectedItem ? layout[selectedItem] : null

  return (
    <div className="editor-panel">
      <h3>🛠 Editor de escena</h3>

      <div className="mode-buttons">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={`mode-btn ${gizmoMode === m.key ? 'active' : ''}`}
            onClick={() => onChangeMode(m.key)}
            title={`Atajo: ${m.short}`}
          >
            <span className="mode-icon">{m.icon}</span>
            <span>{m.label}</span>
            <span className="mode-short">{m.short}</span>
          </button>
        ))}
      </div>

      <div className="autosave-badge">💾 Auto-guardado en el navegador (sólo para vos)</div>

      {sel ? (
        <div className="selected-info">
          <strong style={{ color: '#ff00ff' }}>{selectedItem}</strong>
          <div className="coords">
            pos: [{sel.pos.join(', ')}]<br />
            size: {sel.size}<br />
            {sel.rot && <>rot: [{sel.rot.map(r => r.toFixed(2)).join(', ')}]</>}
          </div>
          {onDelete && (
            <button
              type="button"
              className="btn btn-delete"
              onClick={() => onDelete(selectedItem)}
              title="Eliminar este elemento de la escena (Delete)"
              style={{ marginTop: 10, width: '100%' }}
            >
              🗑️ Eliminar de la escena
            </button>
          )}
        </div>
      ) : (
        <p className="hint">Clic en un objeto para seleccionarlo. Luego usá los botones de arriba o las teclas T/S/R · <code>Del</code> elimina.</p>
      )}

      <div className="positions-list">
        {Object.entries(layout).map(([name, item]) => (
          <div key={name} className="pos-group">
            <div className={`pos-row ${selectedItem === name ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                type="button"
                className="pos-row-main"
                onClick={() => onSelectItem && onSelectItem(name)}
                title={`Seleccionar ${name}`}
                style={{ flex: 1, background: 'transparent', border: 'none', textAlign: 'left', padding: '6px 8px', color: 'inherit', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
              >
                <span className="pos-name">{name}</span>
                <span className="pos-vals">
                  {item.size !== undefined ? `size:${item.size}` : item.kind || ''}
                </span>
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(name) }}
                  title={`Eliminar ${name}`}
                  style={{ background: 'transparent', border: 'none', color: '#ff66aa', cursor: 'pointer', fontSize: 14, padding: '4px 8px' }}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="permanent-save-section">
        <div className="perm-title">📦 Guardar DEFINITIVO en código</div>
        <p className="perm-hint">
          Escribe tu layout directo en <code>Scene.jsx</code> (vía el dev server de Vite).
          Funciona solo mientras tengas <code>npm run dev</code> corriendo.
        </p>
        <button
          className={`btn btn-save-disk ${saveStatus === 'ok' ? 'btn-save-success' : ''}`}
          onClick={saveToCode}
          disabled={saving}
          style={{ width: '100%', marginBottom: 8 }}
        >
          {saving ? '⏳ Guardando...' : saveStatus === 'ok' ? '✓ Guardado en Scene.jsx!' : saveStatus === 'error' ? '✗ Error — revisá consola' : '💾 Guardar en código (Scene.jsx)'}
        </button>
        <div className="editor-actions">
          <button className="btn btn-save-perm" onClick={downloadAsFile} title="Descarga un archivo .js con tu layout">
            {downloaded ? '✓ Descargado!' : '📥 Bajar archivo'}
          </button>
          <button className="btn" onClick={copyAll} title="Copia al portapapeles para pegar manualmente">
            {copied ? '✓ Copiado!' : '📋 Copiar'}
          </button>
        </div>
      </div>

      <div className="editor-actions" style={{ marginTop: 10 }}>
        <button className="btn btn-magenta" onClick={onReset}>↺ Reset al default</button>
      </div>

      <p className="footer-hint">
        Teclas: <code>T</code> mover · <code>S</code> escalar · <code>R</code> rotar · <code>Esc</code> deseleccionar
      </p>
    </div>
  )
}
