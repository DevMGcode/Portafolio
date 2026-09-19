// Certificados de Melissa — DATOS REALES.
// Imágenes en /public/certificados/*.webp (portada de cada diploma).
// Cada cert: { date:'YYYY-MM', title, issuer, tags[], image, url? }
//   - Se ordenan y agrupan solos por año/fecha (más reciente primero).
//   - url (opcional): enlace de verificación → muestra botón "Verificar ↗".
export const CERTIFICATES = [
  // ─────────── 2026 ───────────
  {
    date: '2026-09', title: 'Excel Avanzado: Visual Basic for Application (VBA)',
    issuer: 'DAXUS LATAM', tags: ['Excel', 'VBA', 'Macros'],
    image: '/certificados/vba-me.webp',
  },
  {
    date: '2026-09', title: 'Diseño UX: Experiencia de Usuario UX/UI + Figma',
    issuer: 'Udemy · Espacio UX', tags: ['UX/UI', 'Figma'],
    image: '/certificados/diseno-ux-experiencia-de-usuario-ux-ui-figma-202.webp',
    url: 'https://ude.my/UC-08cccce4-e05e-424c-b8ac-119c5b3233eb',
  },
  {
    date: '2026-08', title: 'Excel Avanzado: Power Pivot',
    issuer: 'DAXUS LATAM', tags: ['Excel', 'Power Pivot'],
    image: '/certificados/excel-power-pivot-me.webp',
  },
  {
    date: '2026-07', title: 'IA Aplicada: resuelve retos reales con Claude',
    issuer: 'Smart4AI · rutaN', tags: ['IA', 'Claude', 'Bootcamp'],
    image: '/certificados/certificado-bootcamp-ia-aplicada-con-claude.webp',
    url: 'https://smart4ai.io/certificadosbootcampclaude',
  },
  {
    date: '2026-07', title: 'Dashboards Profesionales con Excel',
    issuer: 'DAXUS LATAM', tags: ['Excel', 'Dashboards'],
    image: '/certificados/dashboards-profesionales-con-excel-me.webp',
  },
  {
    date: '2026-04', title: 'Comunicación Asertiva',
    issuer: 'DAXUS LATAM', tags: ['Soft skills', 'Comunicación'],
    image: '/certificados/comunicacion-asertiva-me.webp',
  },
  {
    date: '2026-03', title: 'Excel Medio: Tablas dinámicas y Power Query',
    issuer: 'DAXUS LATAM', tags: ['Excel', 'Power Query'],
    image: '/certificados/excel-intermedio-mel.webp',
  },
  {
    date: '2026-03', title: 'Liderazgo Personal',
    issuer: 'DAXUS LATAM', tags: ['Soft skills', 'Liderazgo'],
    image: '/certificados/liderazgo-personal-me.webp',
  },
  {
    date: '2026-03', title: 'Introducción a Notion',
    issuer: 'DAXUS LATAM', tags: ['Productividad', 'Notion'],
    image: '/certificados/intoduccion-a-notion-mel.webp',
  },
  {
    date: '2026-02', title: 'Excel Básico',
    issuer: 'DAXUS LATAM', tags: ['Excel'],
    image: '/certificados/excel-basico-mel.webp',
  },
  {
    date: '2026-02', title: 'Curso de Oratoria',
    issuer: 'DAXUS LATAM', tags: ['Soft skills', 'Oratoria'],
    image: '/certificados/curso-de-oratoria-me.webp',
  },
  {
    date: '2026-01', title: 'Especialización en Gestión de Proyectos',
    issuer: 'Udemy', tags: ['Gestión', 'Agile'],
    image: '/certificados/especializacion-en-gestion-de-proyectos.webp',
    url: 'https://ude.my/UC-157dbd95-872b-403a-86b8-f878178afb8f',
  },

  // ─────────── 2024 ───────────
  {
    date: '2024-07', title: 'Power BI: Análisis de Datos e Inteligencia de Negocios',
    issuer: 'Udemy', tags: ['Power BI', 'Datos'],
    image: '/certificados/powerbi-analisis-de-datos-e-inteligencia-de-nego.webp',
    url: 'https://ude.my/UC-84e07fb1-943d-40a6-835c-45f8cfddd32c',
  },

  // ─────────── 2023 ───────────
  {
    date: '2023-10', title: 'Java: Curso Profesional de Java — De cero a Master',
    issuer: 'Udemy', tags: ['Java', 'POO'],
    image: '/certificados/java-curso-profesional-de-java-de-cero-a-master.webp',
    url: 'https://ude.my/UC-cb1bd9f2-b004-493b-8ca4-332066a74ba7',
  },
  {
    date: '2023-09', title: 'SQL: Curso Completo de Bases de Datos — De 0 a Avanzado',
    issuer: 'Udemy', tags: ['SQL', 'Bases de datos'],
    image: '/certificados/sql-curso-completo-de-bases-de-datos.webp',
    url: 'https://ude.my/UC-55edb714-876b-4c07-8271-ff1bcc0d9336',
  },
  {
    date: '2023-08', title: 'Master en JavaScript: JS, jQuery, Angular, NodeJS',
    issuer: 'Udemy', tags: ['JavaScript', 'Node', 'Angular'],
    image: '/certificados/master-en-javascript.webp',
    url: 'https://ude.my/UC-36165e09-3530-4ccf-9255-42a0de8345fc',
  },
  {
    date: '2023-06', title: 'Desarrollo Web Front End (React)',
    issuer: 'Bogotá Institute of Technology', tags: ['React', 'Frontend', 'Bootcamp'],
    image: '/certificados/desarrollo-web-front-end-react.webp',
  },
  {
    date: '2023-05', title: 'Master en CSS: Responsive, SASS, Flexbox, Grid y Bootstrap',
    issuer: 'Udemy', tags: ['CSS', 'SASS', 'Bootstrap'],
    image: '/certificados/master-en-css.webp',
    url: 'https://ude.my/UC-3bf5b23c-f41d-4027-b041-5cc9ece27eb2',
  },

  // ─────────── 2021 ───────────
  {
    date: '2021-11', title: 'Desarrollo Web Full Stack',
    issuer: 'SENA · Key Code', tags: ['Full Stack', 'Bootcamp'],
    image: '/certificados/desarrollo-web-full-stack.webp',
  },
]

const MONTHS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function formatDate(s) {
  const [year, month] = s.split('-')
  return `${MONTHS[+month]} ${year}`
}

// Agrupa por año (desc) con los certificados de cada año ordenados por fecha (desc).
export function groupByYear(certs) {
  const byYear = {}
  for (const c of certs) {
    const y = c.date.slice(0, 4)
    ;(byYear[y] = byYear[y] || []).push(c)
  }
  return Object.keys(byYear)
    .sort((a, b) => b.localeCompare(a))
    .map((year) => ({
      year,
      items: byYear[year].sort((a, b) => b.date.localeCompare(a.date)),
    }))
}
