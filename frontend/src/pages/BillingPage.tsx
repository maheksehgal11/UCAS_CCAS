import { useEffect, useState } from 'react'
import { DistributionBars, DonutBreakdown, Sparkline } from '../components/AnalyticsWidgets'
import { api } from '../lib/api'
import type { FormEvent } from 'react'
import type { Invoice } from '../types'

function firstDayOfMonth() {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [message, setMessage] = useState('')
  const [range, setRange] = useState({ cycle_start: firstDayOfMonth(), cycle_end: today() })

  async function loadInvoices() {
    const { data } = await api.get('/invoices')
    setInvoices(data)
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  async function runRating() {
    const { data } = await api.post('/rating/run')
    setMessage(data.message)
  }

  async function runBilling(event: FormEvent) {
    event.preventDefault()
    const { data } = await api.post('/billing/run', range)
    setMessage(data.message)
    loadInvoices()
  }

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Rating · Charging · Invoicing · GST</p>
        <h1>Billing Operations</h1>
      </div>
      <section className="kpi-grid">
        <article className="card"><p className="eyebrow">Invoices This Cycle</p><p className="kpi">{invoices.length}</p></article>
        <article className="card"><p className="eyebrow">Billing SLA</p><p className="kpi">99.2%</p></article>
        <article className="card"><p className="eyebrow">Supplementary Notes</p><p className="kpi">6</p></article>
        <article className="card"><p className="eyebrow">GL Posting Queue</p><p className="kpi">2</p></article>
      </section>
      <div className="split-grid">
        <Sparkline
          title="Cycle Billing Throughput"
          points={[
            { label: 'D1', value: 12 },
            { label: 'D2', value: 16 },
            { label: 'D3', value: 19 },
            { label: 'D4', value: 21 },
            { label: 'D5', value: 23 },
            { label: 'D6', value: 22 },
            { label: 'D7', value: 27 },
            { label: 'D8', value: 29 },
            { label: 'D9', value: 31 },
            { label: 'D10', value: 34 },
            { label: 'D11', value: 36 },
            { label: 'D12', value: 38 },
          ]}
        />
        <DonutBreakdown
          title="Invoice Status Mix"
          segments={[
            { label: 'Paid', value: 52, color: '#2db274' },
            { label: 'Generated', value: 31, color: '#4d83d8' },
            { label: 'Overdue', value: 11, color: '#cf8b1d' },
            { label: 'Dispute', value: 6, color: '#d36f86' },
          ]}
        />
      </div>
      <DistributionBars
        title="Tax Composition"
        rows={[
          { label: 'CGST', value: 38, color: '#4d83d8', suffix: '%' },
          { label: 'SGST', value: 37, color: '#34b495', suffix: '%' },
          { label: 'IGST', value: 25, color: '#f0a646', suffix: '%' },
        ]}
      />
      <div className="card split">
        <button className="btn" onClick={runRating}>Run Rating Engine</button>
        <form className="inline-form" onSubmit={runBilling}>
          <input type="date" value={range.cycle_start} onChange={(e) => setRange({ ...range, cycle_start: e.target.value })} required />
          <input type="date" value={range.cycle_end} onChange={(e) => setRange({ ...range, cycle_end: e.target.value })} required />
          <button className="btn" type="submit">Run Billing Cycle</button>
        </form>
      </div>
      {message ? <p className="success">{message}</p> : null}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Invoice No.</th>
              <th>Cycle</th>
              <th>Subtotal</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((item) => (
              <tr key={item.id}>
                <td>{item.invoice_number}</td>
                <td>{item.cycle_start} to {item.cycle_end}</td>
                <td>₹ {Number(item.subtotal).toFixed(2)}</td>
                <td>₹ {(Number(item.cgst_amount) + Number(item.sgst_amount) + Number(item.igst_amount)).toFixed(2)}</td>
                <td>₹ {Number(item.total_amount).toFixed(2)}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
