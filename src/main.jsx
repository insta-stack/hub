import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
createRoot(document.getElementById('root')).render(

  <StrictMode>
 <ClerkProvider publishableKey={`pk_test_d2FybS1raXR0ZW4tMy5jbGVyay5hY2NvdW50cy5kZXYk`} afterSignOutUrl="/">
    <App />
    </ClerkProvider>
  </StrictMode>,
)
