import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'

import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ZenProvider } from './context/ZenContext'
import { ToastProvider } from './context/ToastContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <ZenProvider>
            <ToastProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </ToastProvider>
          </ZenProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
)
