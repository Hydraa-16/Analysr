import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import UploadPage from './pages/UploadPage.jsx'
import AnalysisLoadingPage from './pages/AnalysisLoadingPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

// Route structure mirrors the locked screen list exactly.
// Public routes: landing, login, signup.
// Everything else sits behind ProtectedRoute, which redirects
// unauthenticated users back to /login (Risk 9 mitigation).
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysing"
        element={
          <ProtectedRoute>
            <AnalysisLoadingPage />
          </ProtectedRoute>
        }
      />
      {/* Analysis ID in the URL so refresh reloads from DB instead of losing state (Risk 16) */}
      <Route
        path="/results/:analysisId"
        element={
          <ProtectedRoute>
            <ResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App