import { createRoot } from 'react-dom/client'

try {
  const root = createRoot(document.getElementById('root')!)
  root.render(
    <div style={{background: '#e354ff', padding: 50, color: 'white', minHeight: '100vh'}}>
      <h1>HELLO FROM REACT</h1>
      <p>If you see this in Telegram, React works.</p>
      <p>User agent: {navigator.userAgent}</p>
    </div>
  )
} catch (e: any) {
  document.body.innerHTML = '<pre style="color:red;padding:20px;background:white">ERROR: ' + e.message + '\n' + e.stack + '</pre>'
}
