import { Component } from 'react'

/**
 * Captura errores de React (incluyendo el Canvas 3D) y muestra fallback amigable.
 * Útil para mobile donde WebGL puede fallar o algunos features no son soportados.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('App error captured:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-logo">
              <span className="error-bracket">[</span>
              <span className="error-text">DEVOFFICE_3D</span>
              <span className="error-bracket">]</span>
            </div>
            <h2 className="error-title">// SYSTEM ERROR</h2>
            <p className="error-message">
              Tu dispositivo no pudo cargar la experiencia 3D completa.
            </p>
            <p className="error-hint">
              Probá desde una computadora o un navegador más reciente para la experiencia completa.
            </p>
            <div className="error-contact">
              <p>Mientras tanto, contactame directo:</p>
              <div className="error-links">
                <a
                  href="https://wa.me/573225402781?text=¡Hola Melissa! Me gustaría charlar con vos sobre un proyecto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="error-link error-link-wsp"
                >
                  💬 WhatsApp
                </a>
                <a
                  href="https://github.com/DevMGcode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="error-link error-link-gh"
                >
                  ⌥ GitHub
                </a>
                <a
                  href="mailto:meli.bogar15@gmail.com"
                  className="error-link error-link-mail"
                >
                  ✉ Email
                </a>
              </div>
            </div>
            <button
              className="error-reload"
              onClick={() => window.location.reload()}
            >
              ↻ Recargar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
