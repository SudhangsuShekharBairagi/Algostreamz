import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import DesignSystemPage from './pages/DesignSystemPage.jsx'
import { useAuth } from './context/AuthContext'
import { ROUTES } from './config/siteLinks'

/** Bounces signed-out visitors to /login, remembering where they were headed. */
function RequireAuth({ children }) {
  const { isAuthenticated, initialising } = useAuth()
  if (initialising) return null
  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />
}

function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
      <Route path={ROUTES.DESIGN_SYSTEM} element={<DesignSystemPage />} />
      <Route
        path={ROUTES.PROGRESS}
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}

export default App
