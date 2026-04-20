import { useEffect, useState } from 'react'
import { DistributionBars, DonutBreakdown } from '../components/AnalyticsWidgets'
import { api } from '../lib/api'
import type { FormEvent } from 'react'
import type { Customer, Product, Subscription } from '../types'

const today = new Date().toISOString().slice(0, 10)

const initialState = {
  customer_id: '',
  product_id: '',
  quantity: 1,
  start_date: today,
  status: 'active',
}

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState(initialState)

  async function load() {
    const [subRes, customerRes, productRes] = await Promise.all([
      api.get('/subscriptions'),
      api.get('/customers'),
      api.get('/products'),
    ])
    setSubscriptions(subRes.data)
    setCustomers(customerRes.data)
    setProducts(productRes.data)
    if (!form.customer_id && customerRes.data[0]) setForm((prev) => ({ ...prev, customer_id: customerRes.data[0].id }))
    if (!form.product_id && productRes.data[0]) setForm((prev) => ({ ...prev, product_id: productRes.data[0].id }))
  }

  useEffect(() => {
    load()
  }, [])

  async function createSubscription(event: FormEvent) {
    event.preventDefault()
    await api.post('/subscriptions', form)
    load()
  }

  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c.legal_name]))
  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]))

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Lifecycle · Entitlements · Commercial Commitments</p>
        <h1>Subscriptions</h1>
      </div>
      <section className="kpi-grid">
        <article className="card"><p className="eyebrow">Active Lines</p><p className="kpi">{subscriptions.length}</p></article>
        <article className="card"><p className="eyebrow">Upgrade Requests</p><p className="kpi">24</p></article>
        <article className="card"><p className="eyebrow">Suspended</p><p className="kpi">7</p></article>
        <article className="card"><p className="eyebrow">Renewal at Risk</p><p className="kpi">11</p></article>
      </section>
      <div className="split-grid">
        <DonutBreakdown
          title="Lifecycle Distribution"
          segments={[
            { label: 'Active', value: 84, color: '#2db274' },
            { label: 'Suspended', value: 9, color: '#cf8b1d' },
            { label: 'Cancelled', value: 7, color: '#d36f86' },
          ]}
        />
        <DistributionBars
          title="Entitlement Consumption (Top Services)"
          rows={[
            { label: 'Voice Minutes', value: 88, color: '#4d83d8', suffix: '%' },
            { label: 'Agent Seats', value: 73, color: '#34b495', suffix: '%' },
            { label: 'API Calls', value: 65, color: '#6b8ff0', suffix: '%' },
            { label: 'Analytics Credits', value: 52, color: '#f0a646', suffix: '%' },
          ]}
        />
      </div>
      <form className="card grid-form" onSubmit={createSubscription}>
        <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} required>
          <option value="">Select customer</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.legal_name}</option>)}
        </select>
        <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required>
          <option value="">Select product</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
        <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="btn" type="submit">Create Subscription</button>
      </form>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Start Date</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((item) => (
              <tr key={item.id}>
                <td>{customerMap[item.customer_id] ?? item.customer_id}</td>
                <td>{productMap[item.product_id] ?? item.product_id}</td>
                <td>{item.quantity}</td>
                <td>{item.status}</td>
                <td>{item.start_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
