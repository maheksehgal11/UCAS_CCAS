import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
})

export const authStore = {
  get token() {
    return localStorage.getItem('token')
  },
  get tenantId() {
    return localStorage.getItem('tenantId')
  },
  setSession(token: string, tenantId: string) {
    localStorage.setItem('token', token)
    localStorage.setItem('tenantId', tenantId)
  },
  clear() {
    localStorage.removeItem('token')
    localStorage.removeItem('tenantId')
  },
}

api.interceptors.request.use((config) => {
  const token = authStore.token
  const tenantId = authStore.tenantId
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (tenantId) config.headers['X-Tenant-Id'] = tenantId
  return config
})

