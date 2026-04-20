import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { authStore } from '../lib/api'

type NavItem = { to: string; label: string; badge?: string }
type NavSection = { title: string; items: NavItem[] }

const sections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { to: '/', label: 'Dashboard' },
      { to: '/studio', label: 'Platform Studio' },
    ],
  },
  {
    title: 'Front Office',
    items: [
      { to: '/customers', label: 'Customers', badge: '1,284' },
      { to: '/orders', label: 'Orders & CLM', badge: '12' },
      { to: '/products', label: 'Product Catalog' },
      { to: '/subscriptions', label: 'Subscriptions' },
      { to: '/cpq', label: 'CPQ / Quoting' },
    ],
  },
  {
    title: 'BSS Core',
    items: [
      { to: '/billing', label: 'Billing & Invoices', badge: '3 due' },
      { to: '/rating', label: 'Rating & CDR' },
      { to: '/payments', label: 'Payments' },
      { to: '/collections', label: 'Collections & Dunning' },
    ],
  },
  {
    title: 'Channel',
    items: [{ to: '/partners', label: 'Partners / PRM' }],
  },
  {
    title: 'Finance',
    items: [
      { to: '/revenue', label: 'Revenue & GL' },
      { to: '/analytics', label: 'Analytics' },
    ],
  },
  {
    title: 'Platform',
    items: [
      { to: '/tenants', label: 'Tenants' },
      { to: '/settings', label: 'Settings' },
    ],
  },
]

const titleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/studio': 'Platform Studio',
  '/customers': 'Customers',
  '/orders': 'Orders & CLM',
  '/products': 'Product Catalog',
  '/cpq': 'CPQ / Quoting',
  '/subscriptions': 'Subscriptions',
  '/billing': 'Billing & Invoices',
  '/rating': 'Rating & CDR',
  '/payments': 'Payments',
  '/collections': 'Collections & Dunning',
  '/partners': 'Partners / PRM',
  '/revenue': 'Revenue & GL',
  '/analytics': 'Analytics',
  '/tenants': 'Tenants',
  '/settings': 'Settings',
}

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const title = titleMap[location.pathname] ?? 'Platform'

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="logo">
          UCaaS CCaaS Platform
        </Link>
        <p className="muted">v2.5.0 Enterprise</p>
        <nav className="nav-stack">
          {sections.map((section) => (
            <section key={section.title} className="nav-group">
              <p className="nav-title">{section.title}</p>
              <div className="nav">
                {section.items.map((item) => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span>{item.label}</span>
                    {item.badge ? <small>{item.badge}</small> : null}
                  </NavLink>
                ))}
              </div>
            </section>
          ))}
        </nav>
        <button
          className="btn ghost"
          onClick={() => {
            authStore.clear()
            navigate('/login')
          }}
        >
          Logout
        </button>
      </aside>
      <section className="main-panel">
        <header className="topbar">
          <h2>{title}</h2>
          <div className="top-actions">
            <input placeholder="Search customers, invoices, CDR..." />
            <button className="chip warn">Alerts · 3</button>
            <button className="btn">+ New Invoice</button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </section>
    </div>
  )
}
