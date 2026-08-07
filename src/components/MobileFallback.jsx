import { useState, useEffect, useRef, useCallback } from 'react'
import { PROJECTS } from '../data/projects'
import { assetPath } from '../utils/assetPath'
import './MobileFallback.css'

/**
 * Versión mobile del portfolio — experiencia HTML de alta gama.
 * Se muestra cuando el dispositivo no puede correr la escena 3D fluida.
 * Mismo lenguaje visual cyberpunk que el desktop, pero optimizada para el
 * pulgar: reveal animado al scroll, rol rotativo, stats con count-up,
 * micro-interacciones táctiles y CTAs claros. Todo con animaciones GPU
 * (transform/opacity) para volar en gama baja.
 */

const ROLES = [
  'Systems Engineer',
  'Frontend Developer',
  'IT Project Manager',
  'UI/UX Designer',
]

const TECHS = [
  { name: 'React', color: '#61dafb' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'Angular', color: '#dd0031' },
  { name: 'JavaScript', color: '#f7df1e' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'HTML', color: '#e34f26' },
  { name: 'CSS', color: '#1572b6' },
  { name: 'Tailwind', color: '#06b6d4' },
  { name: 'Bootstrap', color: '#7952b3' },
  { name: 'Node.js', color: '#7cc242' },
  { name: 'Express', color: '#cccccc' },
  { name: 'Spring', color: '#6db33f' },
  { name: 'Java', color: '#f89820' },
  { name: 'Python', color: '#3776ab' },
  { name: 'Git', color: '#f05032' },
]

const TOOLS = ['VS Code', 'Git · GitHub', 'Figma', 'Vercel']

const WORKFLOW = [
  { title: 'Agile Development', desc: 'Iteraciones cortas, entrega continua' },
  { title: 'Scrum Framework', desc: 'Sprints, dailies, retros' },
  { title: 'Kanban', desc: 'Flujo visual de tareas' },
  { title: 'UI/UX Design Principles', desc: 'El usuario primero, siempre' },
  { title: 'Product Strategy', desc: 'Construir con propósito' },
]

const STATS = [
  { value: 6, suffix: '+', label: 'Proyectos' },
  { value: 15, suffix: '+', label: 'Tecnologías' },
  { value: 100, suffix: '%', label: 'Compromiso' },
]

/* ── Hook: revela elementos [data-reveal] cuando entran en viewport ── */
function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = root.querySelectorAll('[data-reveal]')

    // Fallback: si no hay IntersectionObserver, mostramos todo.
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('in'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        })
      },
      { root, threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    els.forEach((el) => io.observe(el))

    // Red de seguridad: garantizar visibilidad tras 2.5s pase lo que pase.
    const safety = setTimeout(() => els.forEach((el) => el.classList.add('in')), 2500)
    return () => {
      io.disconnect()
      clearTimeout(safety)
    }
  }, [rootRef])
}

/* ── Stat con contador animado al entrar en viewport ── */
function StatTile({ value, suffix, label }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setDisplay(value)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        const duration = 1100
        const start = performance.now()
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
          setDisplay(Math.round(eased * value))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value])
  return (
    <div className="m3-stat" ref={ref}>
      <div className="m3-stat-num">
        {display}
        <span className="m3-stat-suffix">{suffix}</span>
      </div>
      <div className="m3-stat-label">{label}</div>
    </div>
  )
}

export default function MobileFallback() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [roleIndex, setRoleIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const rootRef = useRef(null)

  useReveal(rootRef)

  // Rol rotativo
  useEffect(() => {
    const id = setInterval(() => {
      setRoleIndex((i) => (i + 1) % ROLES.length)
    }, 2400)
    return () => clearInterval(id)
  }, [])

  // Barra de progreso de scroll
  const onScroll = useCallback((e) => {
    const el = e.currentTarget
    const max = el.scrollHeight - el.clientHeight
    setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0)
  }, [])

  // Scroll suave hacia una sección
  const scrollTo = useCallback((id) => {
    const target = rootRef.current?.querySelector(id)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // Bloquea el scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (selectedProject) document.body.classList.add('m3-noscroll')
    else document.body.classList.remove('m3-noscroll')
    return () => document.body.classList.remove('m3-noscroll')
  }, [selectedProject])

  return (
    <div className="m3-root" ref={rootRef} onScroll={onScroll}>
      {/* Fondo animado */}
      <div className="m3-bg" aria-hidden="true">
        <div className="m3-grid" />
        <span className="m3-orb m3-orb-a" />
        <span className="m3-orb m3-orb-b" />
        <span className="m3-orb m3-orb-c" />
      </div>

      {/* Progreso de scroll */}
      <div className="m3-progress" style={{ transform: `scaleX(${progress / 100})` }} />

      {/* ═══ HERO ═══ */}
      <header className="m3-hero">
        <span className="m3-badge">
          <span className="m3-badge-dot" />
          Disponible para proyectos
        </span>

        <div className="m3-logo">
          <span className="m3-brk">[</span>
          <span className="m3-logo-txt">DEVOFFICE_3D</span>
          <span className="m3-brk">]</span>
        </div>

        <h1 className="m3-name">Melissa García</h1>
        <div className="m3-handle">// DevMGcode</div>

        <div className="m3-roles" aria-live="polite">
          <span className="m3-roles-prefix">&gt;</span>
          <span key={roleIndex} className="m3-role-word">
            {ROLES[roleIndex]}
          </span>
          <span className="m3-caret" />
        </div>

        <p className="m3-loc">📍 Colombia · Disponible remoto</p>

        <div className="m3-cta-row">
          <button className="m3-cta m3-cta-primary" onClick={() => scrollTo('#m3-projects')}>
            Ver proyectos
          </button>
          <button className="m3-cta m3-cta-ghost" onClick={() => scrollTo('#m3-contact')}>
            Contáctame
          </button>
        </div>

        <button
          className="m3-scrollhint"
          onClick={() => scrollTo('#m3-stats')}
          aria-label="Desliza para ver más"
        >
          <span>Desliza</span>
          <span className="m3-chevrons">
            <i /><i /><i />
          </span>
        </button>
      </header>

      {/* ═══ STATS ═══ */}
      <section id="m3-stats" className="m3-stats" data-reveal>
        {STATS.map((s) => (
          <StatTile key={s.label} {...s} />
        ))}
      </section>

      {/* ═══ SOBRE MÍ ═══ */}
      <section className="m3-section" data-reveal>
        <h2 className="m3-h2"><span className="m3-h2-idx">01</span> Sobre mí</h2>
        <div className="m3-panel">
          <p className="m3-text">
            <strong>Systems Engineer</strong> especializada en{' '}
            <strong>Frontend Development</strong>, <strong>IT Project Management</strong> y{' '}
            <strong>UI/UX Design</strong>. Construyo{' '}
            <strong>productos digitales elegantes</strong> combinando tecnología, estrategia y diseño.
          </p>
          <p className="m3-quote">
            <em>"Technology with purpose"</em>
            <span>Always building &amp; learning</span>
          </p>
        </div>
      </section>

      {/* ═══ TECH STACK ═══ */}
      <section className="m3-section" data-reveal>
        <h2 className="m3-h2"><span className="m3-h2-idx">02</span> Tech Stack</h2>
        <div className="m3-chips">
          {TECHS.map((tech, i) => (
            <span
              key={tech.name}
              className="m3-chip"
              style={{ '--c': tech.color, '--d': `${i * 45}ms` }}
            >
              <span className="m3-chip-dot" style={{ background: tech.color }} />
              {tech.name}
            </span>
          ))}
        </div>
        <div className="m3-tools">
          {TOOLS.map((t) => (
            <span key={t} className="m3-tool">{t}</span>
          ))}
        </div>
      </section>

      {/* ═══ WORKFLOW ═══ */}
      <section className="m3-section" data-reveal>
        <h2 className="m3-h2"><span className="m3-h2-idx">03</span> Workflow</h2>
        <ul className="m3-timeline">
          {WORKFLOW.map((w, i) => (
            <li key={w.title} style={{ '--d': `${i * 90}ms` }}>
              <span className="m3-tl-dot" />
              <div className="m3-tl-body">
                <strong>{w.title}</strong>
                <span>{w.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ═══ PROYECTOS ═══ */}
      <section id="m3-projects" className="m3-section" data-reveal>
        <h2 className="m3-h2"><span className="m3-h2-idx">04</span> Proyectos</h2>
        <p className="m3-hint-text">Toca cualquier proyecto para ver el caso completo 👇</p>
        <div className="m3-proj-grid">
          {PROJECTS.map((p, i) => (
            <button
              key={p.id}
              className="m3-proj"
              style={{ '--accent': p.color, '--d': `${i * 70}ms` }}
              onClick={() => setSelectedProject(p)}
            >
              <div className="m3-proj-media">
                <img
                  src={assetPath(p.image)}
                  alt={p.name}
                  loading="lazy"
                  onError={(e) => { e.target.style.opacity = 0 }}
                />
                <span className="m3-proj-shine" />
              </div>
              <div className="m3-proj-info">
                <h3>{p.name}</h3>
                <p>{p.tagline}</p>
                <div className="m3-proj-stack">
                  {p.stack.slice(0, 3).map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                  {p.stack.length > 3 && <span className="m3-proj-more">+{p.stack.length - 3}</span>}
                </div>
                <span className="m3-proj-cta">Ver detalle →</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ═══ CONTACTO ═══ */}
      <section id="m3-contact" className="m3-section" data-reveal>
        <h2 className="m3-h2"><span className="m3-h2-idx">05</span> Hablemos</h2>
        <p className="m3-hint-text">¿Tienes un proyecto en mente? Escríbeme por donde prefieras.</p>
        <div className="m3-contacts">
          <a
            href="https://wa.me/573225402781?text=¡Hola Melissa! Me gustaría charlar contigo sobre un proyecto"
            target="_blank"
            rel="noopener noreferrer"
            className="m3-contact-btn m3-c-wsp"
          >
            <span className="m3-c-ico">💬</span>
            <span className="m3-c-body"><strong>WhatsApp</strong><small>Respuesta rápida</small></span>
            <span className="m3-c-arrow">→</span>
          </a>
          <a
            href="https://github.com/DevMGcode"
            target="_blank"
            rel="noopener noreferrer"
            className="m3-contact-btn m3-c-gh"
          >
            <span className="m3-c-ico">⌥</span>
            <span className="m3-c-body"><strong>GitHub</strong><small>Mira mi código</small></span>
            <span className="m3-c-arrow">→</span>
          </a>
          <a href="mailto:meli.bogar15@gmail.com" className="m3-contact-btn m3-c-mail">
            <span className="m3-c-ico">✉</span>
            <span className="m3-c-body"><strong>Email</strong><small>Escríbeme un correo</small></span>
            <span className="m3-c-arrow">→</span>
          </a>
        </div>
      </section>

      <footer className="m3-footer">
        <div className="m3-foot-brand">DEVOFFICE_3D · v2.0</div>
        <p className="m3-foot-hint">💻 Ábrelo desde una computadora para vivir la experiencia 3D completa</p>
      </footer>

      {/* FAB WhatsApp */}
      <a
        href="https://wa.me/573225402781?text=¡Hola Melissa!"
        target="_blank"
        rel="noopener noreferrer"
        className="m3-fab"
        aria-label="Contactar por WhatsApp"
      >
        <span className="m3-fab-ring" />
        💬
      </a>

      {/* ═══ MODAL PROYECTO ═══ */}
      {selectedProject && (
        <div className="m3-modal-overlay" onClick={() => setSelectedProject(null)}>
          <div
            className="m3-modal"
            style={{ '--accent': selectedProject.color }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="m3-modal-close"
              onClick={() => setSelectedProject(null)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="m3-modal-media">
              <img
                src={assetPath(selectedProject.image)}
                alt={selectedProject.name}
                onError={(e) => { e.target.style.opacity = 0 }}
              />
              <div className="m3-modal-media-fade" />
              <h2>{selectedProject.name}</h2>
            </div>
            <div className="m3-modal-body">
              <p className="m3-modal-tagline">{selectedProject.tagline}</p>
              <p className="m3-modal-desc">{selectedProject.description}</p>

              <h4>Tech stack</h4>
              <div className="m3-chips">
                {selectedProject.stack.map((s) => (
                  <span
                    key={s}
                    className="m3-chip"
                    style={{ '--c': selectedProject.color, '--d': '0ms' }}
                  >
                    <span className="m3-chip-dot" style={{ background: selectedProject.color }} />
                    {s}
                  </span>
                ))}
              </div>

              <h4>Detalles técnicos</h4>
              <ul className="m3-modal-list">
                {selectedProject.techDetails.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>

              <a
                href={selectedProject.url}
                target="_blank"
                rel="noopener noreferrer"
                className="m3-modal-cta"
              >
                Ver proyecto en vivo ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
