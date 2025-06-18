import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppContextProvider } from './context/AppContext.jsx'
import { Toaster } from 'react-hot-toast' // ✅ import this

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppContextProvider>
      <>
        <App />
        <Toaster position="top-right" reverseOrder={false} /> 
      </>
    </AppContextProvider>
  </BrowserRouter>
)
