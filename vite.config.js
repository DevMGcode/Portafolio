import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const SCENE_FILE = path.resolve(__dirname, 'src/components/Scene.jsx')
const START_MARKER = '// __LAYOUT_START__'
const END_MARKER = '// __LAYOUT_END__'

/**
 * Plugin custom: expone POST /api/save-layout
 * Recibe { code: "export const INITIAL_LAYOUT = {...}" } y lo escribe
 * entre los marcadores __LAYOUT_START__ y __LAYOUT_END__ en Scene.jsx.
 * Solo funciona en dev (cuando vite corre en local).
 */
function layoutWriterPlugin() {
  return {
    name: 'layout-writer',
    configureServer(server) {
      server.middlewares.use('/api/save-layout', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        try {
          let body = ''
          for await (const chunk of req) body += chunk
          const { code } = JSON.parse(body)
          if (typeof code !== 'string' || !code.includes('INITIAL_LAYOUT')) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ ok: false, error: 'Código inválido' }))
          }
          const original = fs.readFileSync(SCENE_FILE, 'utf-8')
          const startIdx = original.indexOf(START_MARKER)
          const endIdx = original.indexOf(END_MARKER)
          if (startIdx === -1 || endIdx === -1) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ ok: false, error: 'Faltan marcadores en Scene.jsx' }))
          }
          const before = original.slice(0, startIdx + START_MARKER.length)
          const after = original.slice(endIdx)
          const updated = `${before}\n${code.trim()}\n${after}`
          fs.writeFileSync(SCENE_FILE, updated, 'utf-8')
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true, bytes: updated.length }))
        } catch (e) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, error: String(e) }))
        }
      })
    },
  }
}

// Para GitHub Pages: el sitio se sirve desde /Portafolio/ (nombre del repo).
// Usamos la función de defineConfig que recibe { command } para detectar dev vs build
// de forma 100% confiable (sin depender de NODE_ENV).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Portafolio/' : '/',
  plugins: [react(), layoutWriterPlugin()],
}))
