import { useMemo, useRef, useState, useEffect } from 'react'
import { CERTIFICATES, formatDate, groupByYear } from '../data/certificates'
import { assetPath } from '../utils/assetPath'

/**
 * Panel de certificados que abre el libro de la repisa.
 * Estilo cyber-terminal (reusa .panel-overlay). Timeline por año a la izquierda,
 * tarjetas ordenadas por fecha a la derecha.
 */
export default function CertificatesPanel({ onClose }) {
  const groups = useMemo(() => groupByYear(CERTIFICATES), [])
  const [activeYear, setActiveYear] = useState(groups[0]?.year)
  const [expanded, setExpanded] = useState(null) // certificado abierto en grande
  const scrollRef = useRef(null)
  const groupRefs = useRef({})

  // Cerrar con ESC (primero el certificado expandido, luego el panel)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (expanded) setExpanded(null)
      else onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, expanded])

  // Scroll-spy: resalta el año visible
  const handleScroll = () => {
    const sc = scrollRef.current
    if (!sc) return
    let current = groups[0]?.year
    for (const g of groups) {
      const el = groupRefs.current[g.year]
      if (el && el.offsetTop - sc.scrollTop <= 90) current = g.year
    }
    setActiveYear(current)
  }

  const goToYear = (year) => {
    const el = groupRefs.current[year]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="cert-panel" onClick={(e) => e.stopPropagation()}>
        <span className="corner tl" /><span className="corner tr" />
        <span className="corner bl" /><span className="corner br" />

        {/* Barra terminal */}
        <div className="cert-titlebar">
          <span className="cert-dot" />
          <span className="cert-prompt">~/ certificados / melissa-garcia <span className="cursor">_</span></span>
          <button className="cert-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="cert-body">
          {/* Rail de años */}
          <nav className="cert-years">
            <div className="cert-years-lbl">AÑO</div>
            {groups.map((g) => (
              <button
                key={g.year}
                className={`cert-yr ${activeYear === g.year ? 'active' : ''}`}
                onClick={() => goToYear(g.year)}
              >
                {g.year}<span className="cert-yr-n">·{g.items.length}</span>
              </button>
            ))}
          </nav>

          {/* Lista de certificados */}
          <div className="cert-list" ref={scrollRef} onScroll={handleScroll}>
            <span className="cert-scan" />
            {groups.map((g) => (
              <section
                key={g.year}
                className="cert-group"
                ref={(el) => { groupRefs.current[g.year] = el }}
              >
                <div className="cert-yhead">
                  <h3>{g.year}</h3>
                  <span className="cert-rule" />
                  <span className="cert-cnt">{g.items.length} cert.</span>
                </div>
                <div className="cert-grid">
                  {g.items.map((c, i) => (
                    <article
                      key={i}
                      className="cert-card"
                      onClick={() => setExpanded(c)}
                    >
                      <div className="cert-thumb">
                        {c.image ? (
                          <img src={assetPath(c.image)} alt={c.title} />
                        ) : (
                          <div className="cert-ph">
                            <span className="cert-ph-ic">🎓</span>
                            <span>CERTIFICADO</span>
                          </div>
                        )}
                        <span className="cert-seal">◆</span>
                      </div>
                      <div className="cert-cbody">
                        <h4>{c.title}</h4>
                        <div className="cert-iss">
                          <span>{c.issuer}</span>
                          <span className="cert-d">{formatDate(c.date)}</span>
                        </div>
                        {c.tags && (
                          <div className="cert-tags">
                            {c.tags.map((t, j) => <span key={j} className="cert-tag">{t}</span>)}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="cert-foot">
          <span>SYS · <b>{CERTIFICATES.length}</b> certificados indexados · orden por fecha ↓</span>
          <span>ESC para cerrar</span>
        </div>

        {/* Visor expandido de un certificado (lightbox) */}
        {expanded && (
          <div className="cert-zoom" onClick={() => setExpanded(null)}>
            <div className="cert-zoom-inner" onClick={(e) => e.stopPropagation()}>
              <button className="cert-close cert-zoom-close" onClick={() => setExpanded(null)} aria-label="Cerrar">×</button>
              <div className="cert-zoom-img">
                {expanded.image ? (
                  <img src={assetPath(expanded.image)} alt={expanded.title} />
                ) : (
                  <div className="cert-ph cert-ph-big">
                    <span className="cert-ph-ic">🎓</span>
                    <span>VISTA PREVIA DEL DIPLOMA</span>
                    <small>(aquí irá la imagen real del certificado)</small>
                  </div>
                )}
                <span className="cert-scan" />
              </div>
              <div className="cert-zoom-meta">
                <h3>{expanded.title}</h3>
                <div className="cert-zoom-sub">
                  <span>{expanded.issuer}</span>
                  <span className="cert-d">{formatDate(expanded.date)}</span>
                </div>
                {expanded.tags && (
                  <div className="cert-tags">
                    {expanded.tags.map((t, j) => <span key={j} className="cert-tag">{t}</span>)}
                  </div>
                )}
                {expanded.url && (
                  <a className="cert-verify" href={expanded.url} target="_blank" rel="noreferrer">
                    Verificar certificado <span>↗</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
