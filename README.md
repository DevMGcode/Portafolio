# DevOffice 3D · Portfolio de Melissa García

Portfolio interactivo 3D estilo cyberpunk construido con React + Three.js.
Una habitación virtual habitable donde cada elemento cuenta parte de mi historia
como desarrolladora: stack, proyectos, workflow, identidad.

🔗 **Live**: https://devmgcode.github.io/Portafolio/

## ✨ Features

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

## 🛠️ Stack

| | |
|---|---|
| 🎨 **Frontend** | React 19 · Vite 8 |
| 🌐 **3D** | Three.js · @react-three/fiber · @react-three/drei |
| 🎬 **Effects** | @react-three/postprocessing |
| 📦 **Deploy** | GitHub Pages · gh-pages |

## 🚀 Desarrollo local

```bash
npm install
npm run dev
```

Abrí http://localhost:5173/ o el puerto que diga la terminal.

## 📦 Deploy

```bash
npm run deploy
```

Compila el proyecto y sube a la branch `gh-pages` automáticamente.

## 📂 Estructura

```
src/
├─ App.jsx                  # Root + intro + music + modals
├─ components/
│  ├─ Scene.jsx             # Layout principal de la escena
│  ├─ EditableModel.jsx     # Wrapper editable para modelos GLB
│  ├─ EditableProp.jsx      # Wrapper editable para props procedurales
│  ├─ Avatar / Modal        # AboutMePanel, CyberCityWindow, etc.
│  └─ ...                   # ~30 componentes especializados
├─ data/
│  └─ projects.js           # Metadata de los proyectos
└─ App.css                  # Estilos cyberpunk
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
