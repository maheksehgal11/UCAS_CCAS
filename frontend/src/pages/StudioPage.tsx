import { DistributionBars, DonutBreakdown, Sparkline } from '../components/AnalyticsWidgets'

const orders = [
  { id: 'ORD-2026-4421', customer: 'Tata Tele Mumbai Branch', stage: 'Provisioning', mrr: 'INR 2,10,000', status: 'In Progress' },
  { id: 'ORD-2026-4415', customer: 'SoftwareOne Delhi', stage: 'Credit Check', mrr: 'INR 1,28,000', status: 'Awaiting Approval' },
  { id: 'ORD-2026-4384', customer: 'Redington Chennai', stage: 'Completed', mrr: 'INR 98,000', status: 'Activated' },
]

const invoices = [
  { no: 'INV-202604-00121', customer: 'Tata Tele Business HQ', amount: 'INR 18,74,920', due: '2026-04-24', status: 'Due' },
  { no: 'INV-202604-00117', customer: 'SoftwareOne India Delhi', amount: 'INR 8,42,110', due: '2026-04-22', status: 'Paid' },
  { no: 'INV-202604-00113', customer: 'Redington Chennai', amount: 'INR 6,10,430', due: '2026-04-25', status: 'Partially Paid' },
]

const tenants = [
  { name: 'Tata Tele Business', tier: 'Enterprise', customers: 284, subscriptions: 4821, mrr: 'INR 3.4Cr' },
  { name: 'SoftwareOne India', tier: 'Enterprise', customers: 48, subscriptions: 1240, mrr: 'INR 1.8Cr' },
  { name: 'Redington India', tier: 'Enterprise', customers: 120, subscriptions: 2180, mrr: 'INR 1.3Cr' },
  { name: 'NTT India', tier: 'Mid-Market', customers: 32, subscriptions: 840, mrr: 'INR 84L' },
]

const cpqQuotes = [
  { quote: 'QT-26-1182', customer: 'Zomato India', net: 'INR 15.1L/mo', discount: '18%', approval: 'VP Approval', state: 'Pending' },
  { quote: 'QT-26-1178', customer: 'ICICI Securities', net: 'INR 7.51L/mo', discount: '8%', approval: 'Auto Approved', state: 'Sent' },
  { quote: 'QT-26-1172', customer: 'Infosys BPO', net: 'INR 11.4L/mo', discount: '5%', approval: 'Auto Approved', state: 'Won' },
]

export function StudioPage() {
  return (
    <div className="stack">
      <div className="card hero">
        <p className="eyebrow">Enterprise Workspace</p>
        <h1>UCaaS + CCaaS Platform Studio</h1>
        <p className="muted">Operational command center with layered analytics spanning order lifecycle, rating, billing, collections, and revenue.</p>
      </div>

      <section className="studio-grid">
        <article className="card metric"><p className="eyebrow">Platform MRR</p><h2>INR 4.82Cr</h2><span className="chip success">+6.8% vs last month</span></article>
        <article className="card metric"><p className="eyebrow">CDRs Rated</p><h2>82.4M</h2><span className="chip info">Pipeline healthy</span></article>
        <article className="card metric"><p className="eyebrow">Invoices Due</p><h2>3</h2><span className="chip warn">Collections in progress</span></article>
        <article className="card metric"><p className="eyebrow">Active Tenants</p><h2>6</h2><span className="chip neutral">Enterprise + Mid-Market</span></article>
      </section>

      <div className="split-grid">
        <Sparkline
          title="Platform Revenue Velocity"
          points={[
            { label: 'May', value: 3.1 }, { label: 'Jun', value: 3.4 }, { label: 'Jul', value: 3.8 }, { label: 'Aug', value: 4.0 },
            { label: 'Sep', value: 3.9 }, { label: 'Oct', value: 4.2 }, { label: 'Nov', value: 4.1 }, { label: 'Dec', value: 4.4 },
            { label: 'Jan', value: 4.5 }, { label: 'Feb', value: 4.6 }, { label: 'Mar', value: 4.7 }, { label: 'Apr', value: 4.82 },
          ]}
        />
        <DonutBreakdown
          title="Revenue Composition"
          segments={[
            { label: 'uCaaS', value: 48, color: '#4d83d8' },
            { label: 'CCaaS', value: 32, color: '#34b495' },
            { label: 'Usage Overage', value: 14, color: '#f0a646' },
            { label: 'One-time', value: 6, color: '#d36f86' },
          ]}
        />
      </div>

      <div className="card">
        <div className="page-head"><h3>Orders & CLM</h3><span className="chip">Camunda Journeys</span></div>
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Stage</th><th>MRR Impact</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map((row) => (
              <tr key={row.id}><td>{row.id}</td><td>{row.customer}</td><td>{row.stage}</td><td>{row.mrr}</td><td>{row.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="page-head"><h3>Billing & Invoices</h3><span className="chip">GST + SAP GL Sync</span></div>
        <table>
          <thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
          <tbody>
            {invoices.map((row) => (
              <tr key={row.no}><td>{row.no}</td><td>{row.customer}</td><td>{row.amount}</td><td>{row.due}</td><td>{row.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="split-grid">
        <article className="card">
          <div className="page-head"><h3>Tenant Management</h3></div>
          <table>
            <thead><tr><th>Tenant</th><th>Tier</th><th>Customers</th><th>Subscriptions</th><th>MRR</th></tr></thead>
            <tbody>
              {tenants.map((row) => (
                <tr key={row.name}><td>{row.name}</td><td>{row.tier}</td><td>{row.customers}</td><td>{row.subscriptions}</td><td>{row.mrr}</td></tr>
              ))}
            </tbody>
          </table>
        </article>
        <article className="card">
          <div className="page-head"><h3>CPQ / Quoting</h3></div>
          <table>
            <thead><tr><th>Quote</th><th>Customer</th><th>Net</th><th>Discount</th><th>Approval</th><th>State</th></tr></thead>
            <tbody>
              {cpqQuotes.map((row) => (
                <tr key={row.quote}><td>{row.quote}</td><td>{row.customer}</td><td>{row.net}</td><td>{row.discount}</td><td>{row.approval}</td><td>{row.state}</td></tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>

      <DistributionBars
        title="Tenant Growth Index"
        rows={[
          { label: 'Tata Tele Business', value: 100 },
          { label: 'SoftwareOne India', value: 63 },
          { label: 'Redington India', value: 49 },
          { label: 'NTT India', value: 31 },
        ]}
      />
    </div>
  )
}

