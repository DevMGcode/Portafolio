import { useState } from 'react'

export default function ProjectPanel({ project, onClose }) {
  const [hovering, setHovering] = useState(false)

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div
        className="cyber-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          '--accent': project.color,
        }}
      >
        {/* Esquinas cyberpunk */}
        <span className="corner tl" /><span className="corner tr" />
        <span className="corner bl" /><span className="corner br" />

        {/* Barra superior estilo terminal */}
        <div className="cyber-titlebar">
          <span className="cyber-dot" />
          <span className="cyber-prompt">~/ projects / {project.id} <span className="cursor">_</span></span>
          <button className="cyber-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        {/* Imagen GIGANTE con overlay info al pasar mouse */}
        <div
          className="cyber-image-wrap"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {project.image && (
            <img src={project.image} alt={project.name} className="cyber-image" />
          )}

          {/* Scanline animado */}
          <span className="scanline" />

          {/* Info que se ve siempre: título + tagline + chips */}
          <div className={`cyber-base-info ${hovering ? 'hidden' : ''}`}>
            <div className="cyber-name-row">
              <h2 style={{ color: project.color, textShadow: `0 0 14px ${project.color}` }}>
                {project.name}
              </h2>
              <span className="cyber-tag-num">// {String(idxOf(project)).padStart(2, '0')}</span>
            </div>
            {project.tagline && <p className="cyber-tagline">{project.tagline}</p>}
            {project.stack && (
              <div className="cyber-chips">
                {project.stack.map((s, i) => (
                  <span key={i} className="cyber-chip">{s}</span>
                ))}
              </div>
            )}
            <p className="cyber-hover-hint">› HOVER PARA DETALLES TÉCNICOS</p>
          </div>

          {/* Overlay con detalles técnicos en hover */}
          <div className={`cyber-tech-overlay ${hovering ? 'visible' : ''}`}>
            <div className="cyber-tech-header">
              <span className="blink">●</span> SYS::TECH_STACK · {project.name}
            </div>
            <div className="cyber-tech-desc">{project.description}</div>
            {project.techDetails && (
              <ul className="cyber-tech-list">
                {project.techDetails.map((d, i) => (
                  <li key={i}>
                    <span className="cyber-bracket">[{String(i + 1).padStart(2, '0')}]</span> {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className="cyber-footer">
          <button className="cyber-btn cyber-btn-ghost" onClick={onClose}>
            <span className="cyber-x">×</span> Cerrar
          </button>
          {project.url && project.url !== '#' && (
            <a
              className="cyber-btn cyber-btn-primary"
              href={project.url}
              target="_blank"
              rel="noreferrer"
            >
              <span>Ver proyecto</span>
              <span className="cyber-arrow">↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// Devuelve el índice del proyecto (1-based) para el "// 01, // 02" estilo terminal
function idxOf(project) {
  const ids = ['new-styles', 'bendita-joya', 'dashboard', 'paseaperros', 'blog-js', 'comandas']
  return ids.indexOf(project.id) + 1
}
