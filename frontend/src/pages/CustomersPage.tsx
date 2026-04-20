import { useEffect, useState } from 'react'
import { DistributionBars, DonutBreakdown } from '../components/AnalyticsWidgets'
import { api } from '../lib/api'
import type { FormEvent } from 'react'
import type { Customer } from '../types'

const initialState = {
  customer_code: '',
  legal_name: '',
  email: '',
  gstin: '',
  state_code: 'MH',
  credit_limit: 0,
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [form, setForm] = useState(initialState)

  async function load() {
    const { data } = await api.get('/customers')
    setCustomers(data)
  }

  useEffect(() => {
    load()
  }, [])

  async function createCustomer(event: FormEvent) {
    event.preventDefault()
    await api.post('/customers', form)
    setForm(initialState)
    load()
  }

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Customer 360 · KYC · Credit Governance</p>
        <h1>Customers</h1>
      </div>
      <section className="kpi-grid">
        <article className="card"><p className="eyebrow">Accounts</p><p className="kpi">{customers.length}</p></article>
        <article className="card"><p className="eyebrow">Enterprise Mix</p><p className="kpi">72%</p></article>
        <article className="card"><p className="eyebrow">KYC Pending</p><p className="kpi">14</p></article>
        <article className="card"><p className="eyebrow">Credit Watchlist</p><p className="kpi">9</p></article>
      </section>
      <div className="split-grid">
        <DonutBreakdown
          title="Customer Segment Mix"
          segments={[
            { label: 'Enterprise', value: 72, color: '#4d83d8' },
            { label: 'Mid-Market', value: 20, color: '#34b495' },
            { label: 'SME', value: 8, color: '#f0a646' },
          ]}
        />
        <DistributionBars
          title="Credit Exposure by Region"
          rows={[
            { label: 'Maharashtra', value: 34, color: '#4d83d8', suffix: '%' },
            { label: 'Karnataka', value: 22, color: '#34b495', suffix: '%' },
            { label: 'Tamil Nadu', value: 18, color: '#6b8ff0', suffix: '%' },
            { label: 'Delhi NCR', value: 16, color: '#9aa6bb', suffix: '%' },
            { label: 'Others', value: 10, color: '#f0a646', suffix: '%' },
          ]}
        />
      </div>
      <form className="card grid-form" onSubmit={createCustomer}>
        <input placeholder="Customer code" value={form.customer_code} onChange={(e) => setForm({ ...form, customer_code: e.target.value })} required />
        <input placeholder="Legal name" value={form.legal_name} onChange={(e) => setForm({ ...form, legal_name: e.target.value })} required />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="GSTIN" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
        <input placeholder="State code" value={form.state_code} onChange={(e) => setForm({ ...form, state_code: e.target.value })} required />
        <input
          type="number"
          placeholder="Credit limit"
          value={form.credit_limit}
          onChange={(e) => setForm({ ...form, credit_limit: Number(e.target.value) })}
          required
        />
        <button className="btn" type="submit">Create Customer</button>
      </form>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>State</th>
              <th>GSTIN</th>
              <th>Credit Limit</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((item) => (
              <tr key={item.id}>
                <td>{item.customer_code}</td>
                <td>{item.legal_name}</td>
                <td>{item.state_code}</td>
                <td>{item.gstin ?? '-'}</td>
                <td>₹ {Number(item.credit_limit).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
