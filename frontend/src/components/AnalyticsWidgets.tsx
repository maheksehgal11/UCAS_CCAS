type Point = {
  label: string
  value: number
}

type Segment = {
  label: string
  value: number
  color: string
}

type HeatCell = {
  label: string
  value: number
}

type DailyCount = {
  day: string
  count: number
}

export function Sparkline({
  title,
  points,
  accent = '#4d83d8',
}: {
  title: string
  points: Point[]
  accent?: string
}) {
  const width = 520
  const height = 180
  const pad = 18
  const minY = Math.min(...points.map((p) => p.value))
  const maxY = Math.max(...points.map((p) => p.value))
  const range = Math.max(maxY - minY, 1)
  const step = (width - pad * 2) / Math.max(points.length - 1, 1)

  const coords = points.map((p, idx) => {
    const x = pad + idx * step
    const y = height - pad - ((p.value - minY) / range) * (height - pad * 2)
    return { x, y, ...p }
  })

  const linePath = coords.map((c) => `${c.x},${c.y}`).join(' ')
  const areaPath = `M ${coords.map((c) => `${c.x} ${c.y}`).join(' L ')} L ${coords.at(-1)?.x ?? 0} ${height - pad} L ${coords[0]?.x ?? 0} ${height - pad} Z`

  return (
    <article className="card">
      <h3>{title}</h3>
      <svg className="spark-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <defs>
          <linearGradient id={`spark-${title.replace(/\s+/g, '-').toLowerCase()}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#spark-${title.replace(/\s+/g, '-').toLowerCase()})`} />
        <polyline points={linePath} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="spark-label-row">
        {points.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
    </article>
  )
}

export function DonutBreakdown({
  title,
  segments,
}: {
  title: string
  segments: Segment[]
}) {
  const total = Math.max(segments.reduce((acc, seg) => acc + seg.value, 0), 1)
  let current = 0
  const stops: string[] = []
  for (const seg of segments) {
    const start = (current / total) * 360
    current += seg.value
    const end = (current / total) * 360
    stops.push(`${seg.color} ${start}deg ${end}deg`)
  }

  return (
    <article className="card">
      <h3>{title}</h3>
      <div className="donut-wrap">
        <div className="donut" style={{ background: `conic-gradient(${stops.join(',')})` }}>
          <div className="donut-hole">
            <strong>{total}</strong>
            <span>Total</span>
          </div>
        </div>
        <div className="donut-legend">
          {segments.map((seg) => (
            <div key={seg.label} className="legend-row">
              <span className="legend-dot" style={{ backgroundColor: seg.color }} />
              <span>{seg.label}</span>
              <strong>{seg.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

export function DistributionBars({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: number; color?: string; suffix?: string }[]
}) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <article className="card">
      <h3>{title}</h3>
      <div className="dist-list">
        {rows.map((row) => (
          <div className="dist-row" key={row.label}>
            <div className="dist-head">
              <span>{row.label}</span>
              <strong>{row.value}{row.suffix ?? ''}</strong>
            </div>
            <div className="dist-track">
              <div
                className="dist-fill"
                style={{
                  width: `${(row.value / max) * 100}%`,
                  background: row.color ?? '#4d83d8',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

export function HeatGrid({
  title,
  cells,
}: {
  title: string
  cells: HeatCell[]
}) {
  const max = Math.max(...cells.map((c) => c.value), 1)
  return (
    <article className="card">
      <h3>{title}</h3>
      <div className="heat-grid">
        {cells.map((c) => (
          <div
            key={c.label}
            className="heat-cell"
            style={{ opacity: 0.25 + (c.value / max) * 0.75 }}
            title={`${c.label}: ${c.value}`}
          >
            <span>{c.label}</span>
            <strong>{c.value}</strong>
          </div>
        ))}
      </div>
    </article>
  )
}

function toIsoDayKey(value: string) {
  return value.slice(0, 10)
}

export function CalendarDayCounts({
  title,
  days,
  month,
  year,
}: {
  title: string
  days: DailyCount[]
  month: number // 0-11
  year: number
}) {
  const monthStart = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = monthStart.getDay() // 0=Sun
  const mondayOffset = (firstWeekday + 6) % 7

  const countsByDay = new Map<string, number>()
  for (const item of days) {
    countsByDay.set(toIsoDayKey(item.day), item.count)
  }

  const max = Math.max(...Array.from(countsByDay.values()), 1)
  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const cells: Array<
    | { kind: 'blank'; key: string }
    | { kind: 'day'; key: string; dayNumber: number; count: number }
  > = []

  for (let i = 0; i < mondayOffset; i++) {
    cells.push({ kind: 'blank', key: `b-${i}` })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      kind: 'day',
      key: iso,
      dayNumber: d,
      count: countsByDay.get(iso) ?? 0,
    })
  }

  return (
    <article className="card">
      <h3>{title}</h3>
      <div className="calendar-weekdays" aria-hidden="true">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="calendar-grid" role="grid" aria-label={title}>
        {cells.map((cell) => {
          if (cell.kind === 'blank') {
            return <div key={cell.key} className="calendar-cell blank" role="gridcell" aria-hidden="true" />
          }

          const opacity = cell.count <= 0 ? 0.25 : 0.25 + (cell.count / max) * 0.75
          return (
            <div
              key={cell.key}
              className={cell.count > 0 ? 'calendar-cell has-data' : 'calendar-cell'}
              role="gridcell"
              style={{ opacity }}
              title={`${cell.key}: ${cell.count}`}
            >
              <span className="calendar-daynum">{cell.dayNumber}</span>
              <strong className="calendar-count">{cell.count || '—'}</strong>
            </div>
          )
        })}
      </div>
    </article>
  )
}

