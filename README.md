# DevOffice 3D · Portfolio de Melissa García

> Portfolio interactivo 3D estilo cyberpunk construido con **React + Three.js**.
> Una habitación virtual habitable donde cada elemento cuenta parte de mi historia
> como desarrolladora: stack, proyectos, workflow e identidad.

### 🔗 [**Ver en vivo → melissa-garcia.netlify.app**](https://melissa-garcia.netlify.app)

<sub>💻 En escritorio → experiencia 3D completa · 📱 En móvil → versión HTML de alto rendimiento</sub>

---

## ✨ Features

### 🖥️ Experiencia 3D (escritorio)
- 🎬 **Loading intro cyberpunk** con typewriter, scanlines y progress bar
- 🏠 **Habitación 3D completa** con paredes hex tech, piso reflejante, lámpara LED
- 👤 **Avatar 3D** clickeable con modal *Sobre mí* completo (bio, stack, workflow)
- 📊 **Live Metrics curvo** rotando entre Analytics y Workflow cada 10s
- 🛠️ **Tech Stack wall** con placas neón hexagonales
- 🪩 **Wall Display** con vinilo girando, clock RGB, quote, certificaciones
- 🌃 **Ventana cyberpunk** con skyline animado + lluvia
- 🚪 **Cyber door** con LEDs + fade dinámico
- ☕ **Taza humeante** con efectos procedurales
- ✨ **Partículas de polvo** cinemáticas en el aire
- 🎬 **Recorrido narrativo** de 11 escenas con labels Netflix-style
- 🎵 **Música ambient** auto-start
- 📞 **Teléfono interactivo** que abre WhatsApp
- 🎨 **Post-processing** Bloom + Vignette + Chromatic Aberration sutil

### 📱 Versión móvil (rediseño premium)
- 🚀 **Hero animado** con rol rotativo tipo terminal y badge de disponibilidad
- 🎞️ **Reveal al scroll** con slide + desenfoque en cada sección
- 📈 **Stats con contador** animado (count-up)
- 🧩 **Tech stack en cascada** — chips que entran escalonados
- 🗂️ **Cards de proyecto** con barrido de luz y modal tipo *bottom-sheet*
- 💬 **Botón flotante de WhatsApp** siempre accesible
- ⚡ Animaciones 100% GPU (transform / opacity) — vuela en gama baja
- ♿ Respeta `prefers-reduced-motion`

## 🛠️ Stack

| | |
|---|---|
| 🎨 **Frontend** | React 19 · Vite 8 |
| 🌐 **3D** | Three.js · @react-three/fiber · @react-three/drei |
| 🎬 **Effects** | @react-three/postprocessing |
| 📦 **Deploy** | Netlify (CI automático desde `main`) |

## 🚀 Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:5173/ (o el puerto que indique la terminal).

> 💡 **Tip:** añade `?mobile` a la URL (`localhost:5173/?mobile`) para previsualizar
> la versión móvil desde el escritorio.

## 📦 Deploy

El sitio se despliega en **Netlify** de forma automática: cada `git push` a la rama
`main` dispara un nuevo build (`npm run build`) y publica la carpeta `dist`.

```bash
git add -A
git commit -m "mensaje"
git push origin main   # → Netlify redespliega solo
```

<details>
<summary>Deploy legacy en GitHub Pages (opcional)</summary>

El proyecto conserva el script `gh-pages` por si se quiere publicar también en
GitHub Pages. Usa `base: '/Portafolio/'` automáticamente cuando no corre en Netlify.

```bash
npm run deploy   # compila y sube a la branch gh-pages
```
</details>

## 📂 Estructura

```
src/
├─ App.jsx                  # Root + intro + music + modals
├─ components/
│  ├─ Scene.jsx             # Layout principal de la escena
│  ├─ MobileFallback.jsx    # Experiencia móvil (HTML premium)
│  ├─ MobileFallback.css    # Estilos + animaciones de la versión móvil
│  ├─ EditableModel.jsx     # Wrapper editable para modelos GLB
│  ├─ EditableProp.jsx      # Wrapper editable para props procedurales
│  ├─ Avatar / Modal        # AboutMePanel, CyberCityWindow, etc.
│  └─ ...                   # ~30 componentes especializados
├─ data/
│  └─ projects.js           # Metadata de los proyectos
└─ App.css                  # Estilos cyberpunk (escritorio)
public/
└─ models/                  # GLBs de muebles, avatar, proyectos
```

## 👤 Sobre mí

**Melissa García** · Systems Engineer especializada en Frontend Development,
IT Project Management y UI/UX Design.

- 🌐 GitHub · [@DevMGcode](https://github.com/DevMGcode)
- 💬 WhatsApp · [+57 322 540 2781](https://wa.me/573225402781)
- ✉️ Email · meli.bogar15@gmail.com

---

*"Technology with purpose · Always building and learning"*
