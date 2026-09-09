import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = document.getElementById('root')
const lang = document.documentElement.lang === 'en' ? 'en' : 'th'
const content = document.getElementById('natee-content')
const initialContent = content ? JSON.parse(content.textContent) : undefined
const tree = (
  <StrictMode>
    <App lang={lang} content={initialContent} />
  </StrictMode>
)

if (root.hasChildNodes()) hydrateRoot(root, tree)
else createRoot(root).render(tree)
