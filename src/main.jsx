import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
// Design System v2 base reset + tokens (src/styles/base.css imports
// src/styles/tokens.css). Imported after index.css so tokens.css's --accent
// (hex) wins at :root; the pre-existing shadcn UI reads --ui-accent (HSL
// triplet, src/index.css) instead, so the two no longer collide.
import '@/styles/base.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
