import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

window.addEventListener('error', e => {
  document.body.innerHTML = '<pre style="color:red;padding:20px;background:white;white-space:pre-wrap">ERROR: ' + e.message + '\n' + e.filename + ':' + e.lineno + '</pre>'
})

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
} catch (e: any) {
  document.body.innerHTML = '<pre style="color:red;padding:20px;background:white;white-space:pre-wrap">RENDER ERROR: ' + e.message + '\n\n' + e.stack + '</pre>'
}
