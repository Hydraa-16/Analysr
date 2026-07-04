import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProfileProvider } from './context/ProfileContext.jsx'
import './styles/tokens.css'

// Provider order matters: AuthProvider must wrap ProfileProvider
// because profile data fetching depends on knowing who the logged-in user is.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)