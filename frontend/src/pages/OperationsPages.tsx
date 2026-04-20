import { DistributionBars, DonutBreakdown, HeatGrid, Sparkline } from '../components/AnalyticsWidgets'

function Snapshot({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle: string
  items: { label: string; value: string; note?: string }[]
}) {
  return (
    <div className="stack">
      <div>
        <p className="eyebrow">{subtitle}</p>
        <h1>{title}</h1>
      </div>
      <section className="kpi-grid">
        {items.map((item) => (
          <article className="card" key={item.label}>
            <p className="eyebrow">{item.label}</p>
            <p className="kpi">{item.value}</p>
            {item.note ? <p className="muted">{item.note}</p> : null}
          </article>
        ))}
      </section>
    </div>
  )
}

export function OrdersPage() {
  return (
    <div className="stack">
      <Snapshot
        title="Order Lifecycle Management"
        subtitle="COM + SOM orchestration across credit, provisioning, and activation"
        items={[
          { label: 'Open Orders', value: '128', note: '12 approval bottlenecks' },
          { label: 'Avg Provision Time', value: '1.8h' },
          { label: 'Fulfillment SLA', value: '97.4%' },
          { label: 'At-Risk Orders', value: '9', note: 'Capacity checks pending' },
        ]}
      />
      <div className="split-grid">
        <Sparkline
          title="Order Intake Trend"
          points={[
            { label: 'W1', value: 21 }, { label: 'W2', value: 25 }, { label: 'W3', value: 24 }, { label: 'W4', value: 29 },
            { label: 'W5', value: 31 }, { label: 'W6', value: 34 }, { label: 'W7', value: 37 }, { label: 'W8', value: 40 },
          ]}
        />
        <DistributionBars
          title="Stage Load"
          rows={[
            { label: 'Validation', value: 27, suffix: '%' },
            { label: 'Credit Check', value: 21, suffix: '%' },
            { label: 'Provisioning', value: 32, suffix: '%' },
            { label: 'Activation', value: 20, suffix: '%' },
          ]}
        />
      </div>
    </div>
  )
}

export function CpqPage() {
  return (
    <div className="stack">
      <Snapshot
        title="CPQ Governance"
        subtitle="Commercial controls for quote-to-order conversions"
        items={[
          { label: 'Open Quotes', value: '38' },
          { label: 'Win Rate', value: '64%' },
          { label: 'Avg Deal Size', value: 'INR 18.4L' },
          { label: 'Pending Approvals', value: '6', note: 'Discount >15%' },
        ]}
      />
      <div className="split-grid">
        <DonutBreakdown
          title="Quote Outcome Mix"
          segments={[
            { label: 'Won', value: 44, color: '#2db274' },
            { label: 'Pending', value: 32, color: '#4d83d8' },
            { label: 'Negotiation', value: 16, color: '#f0a646' },
            { label: 'Dropped', value: 8, color: '#d36f86' },
          ]}
        />
        <DistributionBars
          title="Discount Band Distribution"
          rows={[
            { label: '0-5%', value: 26 },
            { label: '6-10%', value: 31 },
            { label: '11-15%', value: 24 },
            { label: '16%+', value: 19, color: '#cf8b1d' },
          ]}
        />
      </div>
    </div>
  )
}

export function RatingPage() {
  return (
    <div className="stack">
      <Snapshot
        title="Rating & CDR Mediation"
        subtitle="Hybrid rating across tariff pulse and API usage events"
        items={[
          { label: 'CDRs Processed Today', value: '2.4M' },
          { label: 'Success Rate', value: '99.97%' },
          { label: 'Rejected Queue', value: '624', note: 'ILD mismatch batch' },
          { label: 'Re-rate ETA', value: '14m' },
        ]}
      />
      <div className="split-grid">
        <HeatGrid
          title="CDR Rejections by Circle"
          cells={[
            { label: 'MH', value: 52 }, { label: 'KA', value: 47 }, { label: 'TN', value: 33 }, { label: 'DL', value: 28 },
            { label: 'UP', value: 23 }, { label: 'GJ', value: 30 }, { label: 'WB', value: 19 }, { label: 'AP', value: 24 },
          ]}
        />
        <DistributionBars
          title="Pipeline Throughput"
          rows={[
            { label: 'Ingestion', value: 100, suffix: '%' },
            { label: 'Normalization', value: 98, suffix: '%' },
            { label: 'Tariff Resolve', value: 96, suffix: '%' },
            { label: 'Rating', value: 94, suffix: '%' },
          ]}
        />
      </div>
    </div>
  )
}

export function PaymentsPage() {
  return (
    <div className="stack">
      <Snapshot
        title="Payments Operations"
        subtitle="Gateway, bank transfer, and reconciliation command center"
        items={[
          { label: 'Collections (MTD)', value: 'INR 3.68Cr' },
          { label: 'Success Rate', value: '97.9%' },
          { label: 'Gateway Latency', value: '2.4s', note: 'HDFC degraded' },
          { label: 'Unreconciled Txns', value: '41' },
        ]}
      />
      <div className="split-grid">
        <Sparkline
          title="Daily Collections Trend"
          points={[
            { label: 'D1', value: 12 }, { label: 'D2', value: 14 }, { label: 'D3', value: 18 }, { label: 'D4', value: 17 },
            { label: 'D5', value: 20 }, { label: 'D6', value: 22 }, { label: 'D7', value: 23 }, { label: 'D8', value: 25 },
          ]}
          accent="#34b495"
        />
        <DonutBreakdown
          title="Payment Method Split"
          segments={[
            { label: 'Razorpay', value: 46, color: '#4d83d8' },
            { label: 'Net Banking', value: 34, color: '#34b495' },
            { label: 'NEFT/RTGS', value: 20, color: '#f0a646' },
          ]}
        />
      </div>
    </div>
  )
}

export function CollectionsPage() {
  return (
    <div className="stack">
      <Snapshot
        title="Collections & Dunning"
        subtitle="Aging control and automated recovery journeys"
        items={[
          { label: 'Outstanding A/R', value: 'INR 1.14Cr' },
          { label: 'Invoices Overdue', value: '84' },
          { label: 'Dunning Active', value: '31 accounts' },
          { label: 'Recovery Rate', value: '68%' },
        ]}
      />
      <DistributionBars
        title="Aging Buckets"
        rows={[
          { label: '0-30 days', value: 38, color: '#34b495', suffix: '%' },
          { label: '31-60 days', value: 27, color: '#4d83d8', suffix: '%' },
          { label: '61-90 days', value: 21, color: '#f0a646', suffix: '%' },
          { label: '90+ days', value: 14, color: '#d36f86', suffix: '%' },
        ]}
      />
    </div>
  )
}

export function PartnersPage() {
  return (
    <div className="stack">
      <Snapshot
        title="Partner & PRM Management"
        subtitle="Multi-tier reseller performance and commission oversight"
        items={[
          { label: 'Active Partners', value: '312' },
          { label: 'Monthly Partner MRR', value: 'INR 1.22Cr' },
          { label: 'Commission Run', value: 'INR 22.4L' },
          { label: 'Dispute Cases', value: '7' },
        ]}
      />
      <DonutBreakdown
        title="Partner Tier Mix"
        segments={[
          { label: 'Master', value: 18, color: '#4d83d8' },
          { label: 'Reseller', value: 44, color: '#34b495' },
          { label: 'Agent', value: 38, color: '#f0a646' },
        ]}
      />
    </div>
  )
}

export function RevenuePage() {
  return (
    <div className="stack">
      <Snapshot
        title="Revenue & GL Control"
        subtitle="Ledger integrity, postings, and month-end close posture"
        items={[
          { label: 'MRR', value: 'INR 4.82Cr' },
          { label: 'ARR Run Rate', value: 'INR 57.8Cr' },
          { label: 'GL Posting Success', value: '99.8%' },
          { label: 'Close Variance', value: 'INR 0.84L' },
        ]}
      />
      <div className="split-grid">
        <Sparkline
          title="Monthly Ledger Closure Variance"
          points={[
            { label: 'May', value: 2.4 }, { label: 'Jun', value: 2.1 }, { label: 'Jul', value: 1.8 }, { label: 'Aug', value: 1.6 },
            { label: 'Sep', value: 1.2 }, { label: 'Oct', value: 1.4 }, { label: 'Nov', value: 1.1 }, { label: 'Dec', value: 1.0 },
            { label: 'Jan', value: 0.9 }, { label: 'Feb', value: 0.9 }, { label: 'Mar', value: 0.86 }, { label: 'Apr', value: 0.84 },
          ]}
          accent="#34b495"
        />
        <DistributionBars
          title="GL Posting Outcomes"
          rows={[
            { label: 'Posted', value: 99.8, suffix: '%' },
            { label: 'Retry Queue', value: 0.2, color: '#cf8b1d', suffix: '%' },
          ]}
        />
      </div>
    </div>
  )
}

export function AnalyticsPage() {
  return (
    <div className="stack">
      <Snapshot
        title="Commercial Analytics"
        subtitle="Revenue intelligence and consumption insights"
        items={[
          { label: 'ARPU', value: 'INR 3.74L' },
          { label: 'Gross Margin', value: '61%' },
          { label: 'Churn Risk Accounts', value: '14' },
          { label: 'Expansion Pipeline', value: 'INR 2.8Cr' },
        ]}
      />
      <div className="split-grid">
        <DonutBreakdown
          title="Revenue by Product Family"
          segments={[
            { label: 'uCaaS', value: 48, color: '#4d83d8' },
            { label: 'CCaaS', value: 32, color: '#34b495' },
            { label: 'Analytics', value: 12, color: '#6b8ff0' },
            { label: 'Integrations', value: 8, color: '#f0a646' },
          ]}
        />
        <DistributionBars
          title="Risk Signals"
          rows={[
            { label: 'Churn Risk', value: 14 },
            { label: 'Credit Risk', value: 11 },
            { label: 'Usage Drop', value: 8 },
            { label: 'Renewal Delay', value: 6 },
          ]}
        />
      </div>
    </div>
  )
}

export function TenantsPage() {
  return (
    <div className="stack">
      <Snapshot
        title="Tenant Control Tower"
        subtitle="Isolation strategy, growth, and service posture by tenant"
        items={[
          { label: 'Active Tenants', value: '6' },
          { label: 'Dedicated Schemas', value: '1' },
          { label: 'Shared + RLS', value: '5' },
          { label: 'Platform Uptime', value: '99.96%' },
        ]}
      />
      <DistributionBars
        title="Tenant Revenue Index"
        rows={[
          { label: 'Tata Tele', value: 100 },
          { label: 'SoftwareOne', value: 53 },
          { label: 'Redington', value: 38 },
          { label: 'NTT India', value: 25 },
        ]}
      />
    </div>
  )
}

export function SettingsPage() {
  return (
    <div className="stack">
      <Snapshot
        title="Platform Settings"
        subtitle="Configuration, integrations, and policy controls"
        items={[
          { label: 'Billing Cycle', value: 'Monthly' },
          { label: 'Currency', value: 'INR' },
          { label: 'GST Reg', value: '27AABCT1332L1ZN' },
          { label: 'Auto GL Post', value: 'Enabled' },
        ]}
      />
      <DistributionBars
        title="Integration Uptime"
        rows={[
          { label: 'SAP ERP', value: 100, suffix: '%' },
          { label: 'Razorpay', value: 100, suffix: '%' },
          { label: 'GSTN', value: 99.8, suffix: '%' },
          { label: 'HDFC Gateway', value: 87, color: '#cf8b1d', suffix: '%' },
        ]}
      />
    </div>
  )
}

