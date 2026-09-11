import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export function render(lang = 'th', content, page = 'home') {
  return renderToString(<App lang={lang} content={content} page={page} />)
}
