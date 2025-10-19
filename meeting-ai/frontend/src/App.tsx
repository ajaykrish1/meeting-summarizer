import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import MeetingDetail from './pages/MeetingDetail'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/m/:id" element={<MeetingDetail />} />
      </Routes>
    </div>
  )
}

export default App
