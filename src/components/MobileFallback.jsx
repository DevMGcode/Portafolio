import { useState } from 'react'
import { PROJECTS } from '../data/projects'
import { assetPath } from '../utils/assetPath'

/**
 * Versión mobile HTML del portfolio.
 * Se muestra cuando el dispositivo no puede correr la experiencia 3D fluida.
 * Mismo contenido, mismo look cyberpunk, pero como cards estáticos.
 */

const TECHS = [
  { name: 'React',      color: '#61dafb' },
  { name: 'Next.js',    color: '#ffffff' },
  { name: 'Angular',    color: '#dd0031' },
  { name: 'JavaScript', color: '#f7df1e' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'HTML',       color: '#e34f26' },
  { name: 'CSS',        color: '#1572b6' },
  { name: 'Tailwind',   color: '#06b6d4' },
  { name: 'Bootstrap',  color: '#7952b3' },
  { name: 'Node.js',    color: '#7cc242' },
  { name: 'Express',    color: '#cccccc' },
  { name: 'Spring',     color: '#6db33f' },
  { name: 'Java',       color: '#f89820' },
  { name: 'Python',     color: '#3776ab' },
  { name: 'Git',        color: '#f05032' },
]

const TOOLS = ['VS Code', 'Git · GitHub', 'Figma', 'Vercel']

const WORKFLOW = [
  { title: 'Agile Development', desc: 'Iteraciones cortas, entrega continua' },
  { title: 'Scrum Framework', desc: 'Sprints, dailies, retros' },
  { title: 'Kanban', desc: 'Flujo visual de tareas' },
  { title: 'UI/UX Design Principles', desc: 'Usuario primero' },
  { title: 'Product Strategy', desc: 'Construir con propósito' },
]

export default function MobileFallback() {
  const [selectedProject, setSelectedProject] = useState(null)

  return (
    <div className="mobile-fallback">
      {/* HERO */}
      <header className="mb-hero">
        <div className="mb-logo">
          <span className="mb-bracket">[</span>
          <span className="mb-logo-text">DEVOFFICE_3D</span>
          <span className="mb-bracket">]</span>
        </div>
        <h1 className="mb-name">Melissa García <span className="mb-sub">// DevMGcode</span></h1>
        <p className="mb-role">Systems Engineer · Frontend · IT PM · UI/UX</p>
        <p className="mb-location">📍 Colombia · Disponible remoto</p>
      </header>

      {/* SOBRE MÍ */}
      <section className="mb-card">
        <h2 className="mb-h2">▶ SOBRE MÍ</h2>
        <p className="mb-text">
          <strong>Systems Engineer</strong> especializada en <strong>Frontend Development</strong>,
          <strong> IT Project Management</strong> y <strong>UI/UX Design</strong>.
          Construyo <strong>productos digitales elegantes</strong> combinando
          tecnología, estrategia y diseño.
        </p>
        <p className="mb-text">
          <em>"Technology with purpose"</em><br />
          <em>Always building and learning</em>
        </p>
      </section>

      {/* STACK */}
      <section className="mb-card">
        <h2 className="mb-h2">▶ TECH STACK</h2>
        <div className="mb-tags">
          {TECHS.map((tech) => (
            <span
              key={tech.name}
              className="mb-tag"
              style={{ borderColor: tech.color, color: tech.color }}
            >
              {tech.name}
            </span>
          ))}
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="mb-card">
        <h2 className="mb-h2">▶ WORKFLOW</h2>
        <ul className="mb-list">
          {WORKFLOW.map((w) => (
            <li key={w.title}>
              <strong>{w.title}</strong> · {w.desc}
            </li>
          ))}
        </ul>
      </section>

      {/* TOOLS */}
      <section className="mb-card">
        <h2 className="mb-h2">▶ HERRAMIENTAS</h2>
        <div className="mb-tags">
          {TOOLS.map((t) => (
            <span key={t} className="mb-tag mb-tag-tool">{t}</span>
          ))}
        </div>
      </section>

      {/* PROYECTOS */}
      <section className="mb-card mb-projects">
        <h2 className="mb-h2">▶ PROYECTOS</h2>
        <div className="mb-project-grid">
          {PROJECTS.map((p) => (
            <button
              key={p.id}
              className="mb-project"
              style={{ '--accent': p.color }}
              onClick={() => setSelectedProject(p)}
            >
              <div className="mb-project-img-wrap">
                <img
                  src={assetPath(p.image)}
                  alt={p.name}
                  className="mb-project-img"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
              <div className="mb-project-info">
                <h3>{p.name}</h3>
                <p>{p.tagline}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CONTACTO */}
      <section className="mb-card mb-contact">
        <h2 className="mb-h2">▶ CONTACTO</h2>
        <div className="mb-links">
          <a
            href="https://wa.me/573225402781?text=¡Hola Melissa! Me gustaría charlar con vos sobre un proyecto"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-link mb-link-wsp"
          >
            💬 WhatsApp
          </a>
          <a
            href="https://github.com/DevMGcode"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-link mb-link-gh"
          >
            ⌥ GitHub
          </a>
          <a
            href="mailto:meli.bogar15@gmail.com"
            className="mb-link mb-link-mail"
          >
            ✉ Email
          </a>
        </div>
      </section>

      <footer className="mb-footer">
        <p>DEVOFFICE_3D · v1.0</p>
        <p className="mb-foot-hint">💻 Abrí desde una computadora para ver la experiencia 3D completa</p>
      </footer>

      {/* MODAL DE PROYECTO */}
      {selectedProject && (
        <div className="mb-modal-overlay" onClick={() => setSelectedProject(null)}>
          <div
            className="mb-modal"
            style={{ '--accent': selectedProject.color }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="mb-modal-close" onClick={() => setSelectedProject(null)}>×</button>
            <img
              src={assetPath(selectedProject.image)}
              alt={selectedProject.name}
              className="mb-modal-img"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <div className="mb-modal-body">
              <h2>{selectedProject.name}</h2>
              <p className="mb-modal-tagline">{selectedProject.tagline}</p>
              <p className="mb-modal-desc">{selectedProject.description}</p>
              <h4>Tech stack</h4>
              <div className="mb-tags">
                {selectedProject.stack.map((s) => (
                  <span key={s} className="mb-tag" style={{ borderColor: selectedProject.color, color: selectedProject.color }}>
                    {s}
                  </span>
                ))}
              </div>
              <h4>Detalles técnicos</h4>
              <ul className="mb-list">
                {selectedProject.techDetails.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
              <a
                href={selectedProject.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-modal-cta"
                style={{ background: selectedProject.color }}
              >
                Ver proyecto ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
