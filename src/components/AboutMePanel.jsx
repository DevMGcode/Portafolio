import { useEffect } from 'react'

/**
 * Modal "Sobre Mí" — info personal/profesional de Melissa García.
 * Estética cyberpunk acorde al portafolio.
 */
export default function AboutMePanel({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="aboutme-overlay" onClick={onClose}>
      <div className="aboutme-modal" onClick={(e) => e.stopPropagation()}>
        {/* HUD corners */}
        <span className="hud-corner hud-tl" />
        <span className="hud-corner hud-tr" />
        <span className="hud-corner hud-bl" />
        <span className="hud-corner hud-br" />

        <button className="aboutme-close" onClick={onClose} aria-label="Cerrar">×</button>

        <div className="aboutme-grid">
          {/* Identidad */}
          <div className="aboutme-identity">
            <div className="aboutme-glow-circle" />
            <h2 className="aboutme-name">
              <span className="aboutme-name-main">Melissa García</span>
              <span className="aboutme-name-sub">// DevMGcode</span>
            </h2>
            <p className="aboutme-role">Systems Engineer · Frontend · IT PM · UI/UX</p>
            <div className="aboutme-location">
              <span className="dot dot-cyan" /> Colombia · Disponible remoto 🌎
            </div>
          </div>

          {/* Bio */}
          <section className="aboutme-section">
            <h3 className="aboutme-h3">▶ SOBRE MÍ</h3>
            <p className="aboutme-text">
              <strong>Systems Engineer</strong> especializada en <strong>Frontend Development</strong>,
              <strong> IT Project Management</strong> y <strong>UI/UX Design</strong>.
              Construyo <strong>productos digitales elegantes</strong> combinando
              tecnología, estrategia y diseño.
            </p>
            <p className="aboutme-text">
              Mi enfoque: experiencias frontend modernas con propósito.
              <em>Always building and learning</em> — siempre construyendo,
              siempre aprendiendo.
            </p>
          </section>

          {/* Skills reales del GitHub */}
          <section className="aboutme-section">
            <h3 className="aboutme-h3">▶ STACK PRINCIPAL</h3>
            <div className="aboutme-tags">
              <span className="tag tag-cyan">React</span>
              <span className="tag tag-cyan">Next.js</span>
              <span className="tag tag-red">Angular</span>
              <span className="tag tag-yellow">JavaScript</span>
              <span className="tag tag-blue">TypeScript</span>
              <span className="tag tag-orange">HTML</span>
              <span className="tag tag-blue">CSS</span>
              <span className="tag tag-cyan">Tailwind</span>
              <span className="tag tag-blue">Bootstrap</span>
              <span className="tag tag-green">Node.js</span>
              <span className="tag tag-green">Express</span>
              <span className="tag tag-green">Spring · Java</span>
              <span className="tag tag-yellow">Python</span>
              <span className="tag tag-orange">Git · GitHub</span>
            </div>
          </section>

          {/* Workflow real */}
          <section className="aboutme-section">
            <h3 className="aboutme-h3">▶ WORKFLOW & MÉTODOS</h3>
            <ul className="aboutme-list">
              <li><span className="bullet">▸</span> <strong>Agile Development</strong> · Iteraciones cortas, entrega continua</li>
              <li><span className="bullet">▸</span> <strong>Scrum Framework</strong> · Sprints, dailies, retros</li>
              <li><span className="bullet">▸</span> <strong>Kanban</strong> · Flujo visual de tareas</li>
              <li><span className="bullet">▸</span> <strong>UI/UX Design Principles</strong> · Usuario primero</li>
              <li><span className="bullet">▸</span> <strong>Product Strategy</strong> · Construir con propósito</li>
            </ul>
          </section>

          {/* Tools reales */}
          <section className="aboutme-section">
            <h3 className="aboutme-h3">▶ HERRAMIENTAS</h3>
            <div className="aboutme-tags">
              <span className="tag tag-cyan">VS Code</span>
              <span className="tag tag-orange">Git · GitHub</span>
              <span className="tag tag-red">Figma</span>
              <span className="tag tag-cyan">Vercel</span>
            </div>
          </section>

          {/* Contacto */}
          <section className="aboutme-section aboutme-contact">
            <h3 className="aboutme-h3">▶ CONTACTO</h3>
            <div className="aboutme-links">
              <a
                href="https://wa.me/573225402781?text=¡Hola Melissa! Me gustaría charlar con vos sobre un proyecto"
                target="_blank"
                rel="noopener noreferrer"
                className="aboutme-link aboutme-link-wsp"
              >
                💬 WhatsApp
              </a>
              <a
                href="https://github.com/DevMGcode"
                target="_blank"
                rel="noopener noreferrer"
                className="aboutme-link aboutme-link-gh"
              >
                ⌥ GitHub
              </a>
              <a
                href="mailto:meli.bogar15@gmail.com"
                className="aboutme-link aboutme-link-mail"
              >
                ✉ Email
              </a>
            </div>
          </section>
        </div>

        <div className="aboutme-footer">
          <span className="aboutme-foot-dot" />
          <span>DEVOFFICE_3D · v1.0 · ID: MG-DEV-0001</span>
          <span className="aboutme-foot-dot" />
        </div>
      </div>
    </div>
  )
}
