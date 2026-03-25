import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Fortnite from './pages/Fortnite'
import Valorant from './pages/Valorant'
import CSGO from './pages/CSGO'
import MatchHistory from './pages/MatchHistory'
import Tournaments from './pages/Tournaments'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-dark-800">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fortnite" element={<Fortnite />} />
            <Route path="/valorant" element={<Valorant />} />
            <Route path="/csgo" element={<CSGO />} />
            <Route path="/matches" element={<MatchHistory />} />
            <Route path="/tournaments" element={<Tournaments />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
