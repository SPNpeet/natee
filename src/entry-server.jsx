import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export function render(lang = 'th') {
  return renderToString(<App lang={lang} />)
}
