import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const TOOLTIP_STYLE = {
  backgroundColor: '#162030',
  border: '1px solid #243548',
  borderRadius: '8px',
  color: '#e5e7eb',
  fontSize: 12,
}

export function KillsLineChart({ data, dataKey = 'kills', color = '#00b4d8', title }) {
  return (
    <div className="stat-card">
      {title && <p className="section-title">{title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1d2d3e" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickFormatter={d => d?.slice(5)}
          />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#243548' }} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function KDLineChart({ data, color = '#00b4d8', title }) {
  return (
    <div className="stat-card">
      {title && <p className="section-title">{title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1d2d3e" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickFormatter={d => d?.slice(5)}
          />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#243548' }} />
          <Line type="monotone" dataKey="kills"  stroke={color}   strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="deaths" stroke="#ff4655" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#9ca3af', paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function KillsBarChart({ data, dataKey = 'kills', color = '#00b4d8', xKey = 'map', title }) {
  return (
    <div className="stat-card">
      {title && <p className="section-title">{title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1d2d3e" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#1d2d3e' }} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function WinRateBarChart({ data, title }) {
  return (
    <div className="stat-card">
      {title && <p className="section-title">{title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1d2d3e" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#1d2d3e' }} formatter={v => `${v}%`} />
          <Bar dataKey="win_rate" fill="#2ecc71" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PlacementLineChart({ data, title }) {
  return (
    <div className="stat-card">
      {title && <p className="section-title">{title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1d2d3e" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickFormatter={d => d?.slice(5)}
          />
          <YAxis
            reversed
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#243548' }} />
          <Line
            type="monotone"
            dataKey="placement"
            stroke="#f39c12"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#f39c12' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
