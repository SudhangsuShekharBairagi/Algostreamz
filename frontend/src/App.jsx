import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* TODO: add routes for Explorer, Compare, Progress pages */}
    </Routes>
  )
}

export default App
