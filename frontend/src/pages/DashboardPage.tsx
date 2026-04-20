import { useEffect, useState } from 'react'
import { CalendarDayCounts, DonutBreakdown, DistributionBars, Sparkline } from '../components/AnalyticsWidgets'
import { api } from '../lib/api'
import type { DailyCount, DashboardSummary } from '../types'

const defaultSummary: DashboardSummary = {
  active_customers: 0,
  active_subscriptions: 0,
  month_invoice_total: 0,
  month_collections_total: 0,
}

const revenueTrend = [
  { label: 'May', value: 2.9 },
  { label: 'Jun', value: 3.1 },
  { label: 'Jul', value: 3.4 },
  { label: 'Aug', value: 3.6 },
  { label: 'Sep', value: 3.5 },
  { label: 'Oct', value: 3.8 },
  { label: 'Nov', value: 3.7 },
  { label: 'Dec', value: 3.9 },
  { label: 'Jan', value: 4.1 },
  { label: 'Feb', value: 4.2 },
  { label: 'Mar', value: 4.4 },
  { label: 'Apr', value: 4.82 },
]

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(defaultSummary)
  const [piuCounts, setPiuCounts] = useState<DailyCount[]>([])
  const [seedMessage, setSeedMessage] = useState('')
  const [loadingSeed, setLoadingSeed] = useState(false)

  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  async function loadSummary() {
    const { data } = await api.get('/dashboard/summary')
    setSummary(data)
  }

  async function loadPiuCounts() {
    const { data } = await api.get('/dashboard/piu-counts')
    setPiuCounts(data)
  }

  useEffect(() => {
    loadSummary()
    loadPiuCounts()
  }, [])

  async function seedDemoData() {
    setLoadingSeed(true)
    setSeedMessage('')
    try {
      const { data } = await api.post('/setup/seed-demo')
      setSeedMessage(data.message)
      await loadSummary()
      await loadPiuCounts()
    } finally {
      setLoadingSeed(false)
    }
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <p className="eyebrow">April 2026 · Billing Cycle Active · Last Sync 2 min ago</p>
          <h1>Platform Overview</h1>
          <p className="muted">Commercial and operational pulse with live analytics across Front Office, BSS, and Finance.</p>
        </div>
        <button className="btn" onClick={seedDemoData} disabled={loadingSeed}>
          {loadingSeed ? 'Loading demo data...' : 'Load Demo Data'}
        </button>
      </div>

      {seedMessage ? <p className="success">{seedMessage}</p> : null}

      <section className="kpi-grid">
        <article className="card"><p className="eyebrow">Total Revenue (MTD)</p><p className="kpi">INR {summary.month_invoice_total.toFixed(2)}</p></article>
        <article className="card"><p className="eyebrow">Active Subscriptions</p><p className="kpi">{summary.active_subscriptions}</p></article>
        <article className="card"><p className="eyebrow">Outstanding A/R</p><p className="kpi">INR 1.14Cr</p></article>
        <article className="card"><p className="eyebrow">CDRs Processed (Today)</p><p className="kpi">2.4M</p></article>
      </section>

      <div className="split-grid">
        <Sparkline title="Revenue Trend (Last 12 Months)" points={revenueTrend} />
        <DistributionBars
          title="Live System Health"
          rows={[
            { label: 'Rating Engine', value: 94, color: '#2db274', suffix: '%' },
            { label: 'Billing Core', value: 100, color: '#2db274', suffix: '%' },
            { label: 'CLM Engine', value: 99, color: '#2db274', suffix: '%' },
            { label: 'Payment Gateway', value: 87, color: '#cf8b1d', suffix: '%' },
            { label: 'SAP GL Sync', value: 100, color: '#2db274', suffix: '%' },
            { label: 'Kafka Lag Health', value: 76, color: '#4d83d8', suffix: '%' },
          ]}
        />
      </div>

      <div className="split-grid">
        <DonutBreakdown
          title="Billing Mix (MTD)"
          segments={[
            { label: 'Subscription', value: 58, color: '#4d83d8' },
            { label: 'Usage', value: 27, color: '#34b495' },
            { label: 'One-time', value: 9, color: '#b58ef1' },
            { label: 'Overage', value: 6, color: '#f0a646' },
          ]}
        />
        <DistributionBars
          title="Top Tenants by Revenue"
          rows={[
            { label: 'Tata Tele', value: 340, color: '#4d83d8' },
            { label: 'SoftwareOne', value: 180, color: '#6b8ff0' },
            { label: 'Redington', value: 130, color: '#34b495' },
            { label: 'NTT India', value: 84, color: '#ef7ca9' },
            { label: 'Airtel Biz', value: 56, color: '#e3a13b' },
          ]}
        />
      </div>

      <CalendarDayCounts
        title="PIU Count Analytics (Calendar Days)"
        days={piuCounts}
        month={month}
        year={year}
      />
    </div>
  )
}

