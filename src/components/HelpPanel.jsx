export default function HelpPanel({ onClose }) {
  return (
    <div className="help-overlay" onClick={onClose}>
      <div className="help-panel" onClick={(e) => e.stopPropagation()}>
        {/* Esquinas HUD cyberpunk */}
        <span className="help-corner tl" /><span className="help-corner tr" />
        <span className="help-corner bl" /><span className="help-corner br" />

        <button className="help-close" onClick={onClose} aria-label="Cerrar">×</button>

        <div className="help-header">
          <div className="help-dot" />
          <h2>Guía rápida · DevOffice 3D</h2>
        </div>

        <p className="help-intro">
          Explorá libremente el cuarto cyberpunk. Cada objeto cuenta una historia
          de mis proyectos como desarrolladora.
        </p>

        {/* GRID con secciones */}
        <div className="help-grid">
          {/* Cámara */}
          <section className="help-section">
            <h3>🎥 Cámara</h3>
            <ul>
              <li><kbd>Mouse</kbd> arrastrá para <em>rotar</em></li>
              <li><kbd>Rueda</kbd> para <em>zoom</em></li>
              <li><kbd>Click der</kbd> + arrastrar para <em>desplazar</em></li>
            </ul>
          </section>

          {/* Teclado */}
          <section className="help-section">
            <h3>⌨ Movimiento</h3>
            <ul>
              <li><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> caminar</li>
              <li><kbd>↑</kbd><kbd>↓</kbd> acercar / alejar</li>
              <li><kbd>←</kbd><kbd>→</kbd> strafe</li>
              <li><kbd>Q</kbd><kbd>E</kbd> subir / bajar</li>
            </ul>
          </section>

          {/* Vistas guiadas */}
          <section className="help-section">
            <h3>📍 Vistas guiadas</h3>
            <ul>
              <li><strong>Libre</strong> · explorás vos</li>
              <li><strong>Vista general</strong> · panorámica isométrica</li>
              <li><strong>Escritorio</strong> · enfoca setup gamer</li>
              <li><strong>Repisa</strong> · trofeo + libros + joya</li>
              <li><strong>Recorrido</strong> · tour automático 🎬</li>
            </ul>
          </section>

          {/* Interacciones */}
          <section className="help-section">
            <h3>✨ Interacciones</h3>
            <ul>
              <li>🎯 Los objetos con <em>aura pulsante</em> son <strong>clickeables</strong></li>
              <li>🪞 Click en un proyecto → ficha técnica con detalles</li>
              <li>📞 Click en el <em>teléfono</em> → me escribís por WhatsApp</li>
              <li>♪ Click en <em>Música suave</em> para ambiente cyberpunk</li>
            </ul>
          </section>

          {/* Tips */}
          <section className="help-section help-section-wide">
            <h3>💡 Tips para una mejor experiencia</h3>
            <ul>
              <li>Usá <kbd>F11</kbd> para <strong>pantalla completa</strong> — la inmersión es total</li>
              <li>Activá la música — el ambiente cyberpunk sube de nivel</li>
              <li>Probá el <strong>Recorrido</strong> automático mientras tomás un café ☕</li>
              <li>Pasá el mouse sobre los proyectos para <strong>previsualizar detalles técnicos</strong></li>
            </ul>
          </section>
        </div>

        <div className="help-footer">
          <span>DevOffice 3D · React Three Fiber · Hecho con 💜 por Melissa García</span>
        </div>
      </div>
    </div>
  )
}
