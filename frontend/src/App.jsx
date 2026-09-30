import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import { useAuth } from './context/AuthContext'

/** Bounces signed-out visitors to /login, remembering where they were headed. */
function RequireAuth({ children }) {
  const { isAuthenticated, initialising } = useAuth()
  // Hold the render until the stored token has been checked, so a reload does not
  // bounce an authenticated user to the login screen.
  if (initialising) return null
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/progress"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      {/* TODO: add routes for Explorer, Compare pages */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
