import { useEffect, useState } from 'react'
import { DistributionBars, Sparkline } from '../components/AnalyticsWidgets'
import { api } from '../lib/api'
import type { FormEvent } from 'react'
import type { Product } from '../types'

const initialState = {
  sku: '',
  name: '',
  billing_model: 'hybrid',
  recurring_fee: 0,
  unit_rate: 0,
  pulse_seconds: 60,
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState(initialState)

  async function load() {
    const { data } = await api.get('/products')
    setProducts(data)
  }

  useEffect(() => {
    load()
  }, [])

  async function createProduct(event: FormEvent) {
    event.preventDefault()
    await api.post('/products', form)
    setForm(initialState)
    load()
  }

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Catalog · Bundles · Tariff Configuration</p>
        <h1>Product Catalog</h1>
      </div>
      <section className="kpi-grid">
        <article className="card"><p className="eyebrow">Active SKUs</p><p className="kpi">{products.length}</p></article>
        <article className="card"><p className="eyebrow">Hybrid Plans</p><p className="kpi">68%</p></article>
        <article className="card"><p className="eyebrow">Avg Gross Margin</p><p className="kpi">61%</p></article>
        <article className="card"><p className="eyebrow">Planned Launches</p><p className="kpi">5</p></article>
      </section>
      <div className="split-grid">
        <DistributionBars
          title="Catalog Revenue Contribution"
          rows={[
            { label: 'uCaaS Business 500', value: 41, color: '#4d83d8', suffix: '%' },
            { label: 'CCaaS Pro Suite', value: 29, color: '#34b495', suffix: '%' },
            { label: 'Analytics Plus', value: 18, color: '#6b8ff0', suffix: '%' },
            { label: 'WhatsApp API Usage', value: 12, color: '#f0a646', suffix: '%' },
          ]}
        />
        <Sparkline
          title="Catalog Margin Trend"
          points={[
            { label: 'May', value: 53 },
            { label: 'Jun', value: 55 },
            { label: 'Jul', value: 56 },
            { label: 'Aug', value: 57 },
            { label: 'Sep', value: 58 },
            { label: 'Oct', value: 59 },
            { label: 'Nov', value: 60 },
            { label: 'Dec', value: 60 },
            { label: 'Jan', value: 61 },
            { label: 'Feb', value: 61 },
            { label: 'Mar', value: 61 },
            { label: 'Apr', value: 62 },
          ]}
          accent="#34b495"
        />
      </div>
      <form className="card grid-form" onSubmit={createProduct}>
        <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select value={form.billing_model} onChange={(e) => setForm({ ...form, billing_model: e.target.value })}>
          <option value="recurring">Recurring</option>
          <option value="usage">Usage</option>
          <option value="hybrid">Hybrid</option>
        </select>
        <input type="number" placeholder="Recurring fee" value={form.recurring_fee} onChange={(e) => setForm({ ...form, recurring_fee: Number(e.target.value) })} />
        <input type="number" placeholder="Unit rate" value={form.unit_rate} onChange={(e) => setForm({ ...form, unit_rate: Number(e.target.value) })} />
        <input type="number" placeholder="Pulse seconds" value={form.pulse_seconds} onChange={(e) => setForm({ ...form, pulse_seconds: Number(e.target.value) })} />
        <button className="btn" type="submit">Create Product</button>
      </form>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Model</th>
              <th>Recurring Fee</th>
              <th>Unit Rate</th>
              <th>Pulse</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id}>
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>{item.billing_model}</td>
                <td>₹ {Number(item.recurring_fee).toFixed(2)}</td>
                <td>₹ {Number(item.unit_rate).toFixed(4)}</td>
                <td>{item.pulse_seconds}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
