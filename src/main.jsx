import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
// Design System v2 base reset + tokens (src/styles/base.css imports
// src/styles/tokens.css). Imported after index.css so tokens.css's --accent
// (hex) wins at :root by default; routes/LegacyAccentScope.jsx re-pins
// --accent back to the legacy HSL value for the pre-existing shadcn UI —
// see src/routes/legacy-accent-scope.css.
import '@/styles/base.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
