import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Wraps any page that requires login. Redirects to /login if there's no
// active session, and shows nothing while the auth check is still loading
// (prevents a flash of protected content before redirect, Risk 9).
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute