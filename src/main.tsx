import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// The one typeface, self-hosted, for every surface
import '@fontsource-variable/schibsted-grotesk'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register the PWA service worker so Chrome recognizes the app as purely installable
registerSW({ immediate: true })

createRoot(document.getElementById("root")!).render(<App />);
