export type DashboardSummary = {
  active_customers: number
  active_subscriptions: number
  month_invoice_total: number
  month_collections_total: number
}

export type DailyCount = {
  day: string
  count: number
}

export type Customer = {
  id: string
  customer_code: string
  legal_name: string
  email?: string
  gstin?: string
  state_code: string
  credit_limit: number
  created_at: string
}

export type Product = {
  id: string
  sku: string
  name: string
  billing_model: 'recurring' | 'usage' | 'hybrid'
  recurring_fee: number
  unit_rate: number
  pulse_seconds: number
  created_at: string
}

export type Subscription = {
  id: string
  customer_id: string
  product_id: string
  quantity: number
  start_date: string
  end_date?: string
  status: 'active' | 'suspended' | 'cancelled'
  created_at: string
}

export type InvoiceLine = {
  line_type: string
  description: string
  quantity: number
  unit_price: number
  line_amount: number
}

export type Invoice = {
  id: string
  invoice_number: string
  customer_id: string
  cycle_start: string
  cycle_end: string
  subtotal: number
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
  total_amount: number
  status: string
  created_at: string
  lines: InvoiceLine[]
}

