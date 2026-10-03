import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import LandingPage from './pages/LandingPage'
import AlgorithmsPage from './pages/AlgorithmsPage'
import VisualizerPage from './pages/VisualizerPage'
import PlaygroundPage from './pages/PlaygroundPage'
import RaceModePage from './pages/RaceModePage'
import ExperimentPage from './pages/ExperimentPage'
import ChallengesPage from './pages/ChallengesPage'
import ProgressPage from './pages/ProgressPage'
import ContactPage from './pages/ContactPage'
import DesignSystemPage from './pages/DesignSystemPage'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import NotFoundPage from './pages/NotFoundPage'
import { useAuth } from './context/AuthContext'
import { ROUTES } from './config/siteLinks'

/** RequireAuth wrapper to guard protected routes */
function RequireAuth({ children }) {
  const { isAuthenticated, initialising } = useAuth()
  if (initialising) return null
  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />
}

function App() {
  return (
    <Routes>
      {/* Standalone Auth Pages */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />

      {/* Main Application Layout Shell */}
      <Route element={<AppShell />}>
        <Route path={ROUTES.HOME} element={<LandingPage />} />
        <Route path={ROUTES.ALGORITHMS} element={<AlgorithmsPage />} />
        <Route path={ROUTES.VISUALIZER} element={<VisualizerPage />} />
        <Route path={ROUTES.PLAYGROUND} element={<PlaygroundPage />} />
        <Route path={ROUTES.RACE} element={<RaceModePage />} />
        <Route path={ROUTES.EXPERIMENT} element={<ExperimentPage />} />
        <Route path={ROUTES.CHALLENGES} element={<ChallengesPage />} />
        <Route
          path={ROUTES.PROGRESS}
          element={
            <RequireAuth>
              <ProgressPage />
            </RequireAuth>
          }
        />
        <Route path={ROUTES.CONTACT} element={<ContactPage />} />
        <Route path={ROUTES.DESIGN_SYSTEM} element={<DesignSystemPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
