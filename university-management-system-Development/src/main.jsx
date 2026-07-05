import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <DataProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </DataProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
)
