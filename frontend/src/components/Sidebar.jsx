import { NavLink } from 'react-router-dom'
import { LayoutDashboard, History, Crosshair, Target, Swords, Trophy } from 'lucide-react'

const links = [
  { to: '/',            label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/fortnite',    label: 'Fortnite',       icon: Target },
  { to: '/valorant',    label: 'Valorant',       icon: Crosshair },
  { to: '/csgo',        label: 'CS:GO',          icon: Swords },
  { to: '/matches',     label: 'Match History',  icon: History },
  { to: '/tournaments', label: 'Tournaments',    icon: Trophy },
]

const gameColors = {
  '/fortnite':    'text-yellow-400',
  '/valorant':    'text-accent-red',
  '/csgo':        'text-accent-blue',
  '/tournaments': 'text-yellow-400',
}

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-dark-900 border-r border-dark-600 flex flex-col z-10">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">E-SPORTS</div>
            <div className="text-xs text-gray-500 leading-tight">STATS HUB</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="section-title px-3 mb-4">Navigation</p>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-dark-600 text-white border border-dark-500'
                  : 'text-gray-400 hover:bg-dark-700 hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={isActive ? (gameColors[to] || 'text-accent-blue') : 'text-gray-500'}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-dark-600">
        <div className="flex items-center gap-3">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamerX"
            alt="avatar"
            className="w-8 h-8 rounded-full bg-dark-600"
          />
          <div>
            <div className="text-sm font-semibold text-white">ProGamer_X</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(46,204,113,0.4)]" />
        </div>
      </div>
    </aside>
  )
}
