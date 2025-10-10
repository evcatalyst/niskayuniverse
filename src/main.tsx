import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

// Handle GitHub Pages SPA routing
// https://github.com/rafgraph/spa-github-pages
const getPathFromUrl = (url: string) => {
  return url.split('?')[1]?.split('&')[0]?.replace('/', '') || ''
}

// Redirect from ?/path to /path
if (window.location.search.startsWith('?/')) {
  const path = getPathFromUrl(window.location.href)
  window.history.replaceState(null, '', path)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)