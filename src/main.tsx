import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App.tsx'
import './global.css'
import ReactGA from 'react-ga4'

ReactGA.initialize('G-P63S9LQXTW', {
  testMode: import.meta.env.DEV,
  gaOptions: {
    anonymizeIp: true,
    allowGoogleSignals: false,
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
