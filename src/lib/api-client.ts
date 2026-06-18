import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    original._retry = true

    const { refreshToken, setTokens, clearAuth } = useAuthStore.getState()
    if (!refreshToken) {
      clearAuth()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(original))
        })
      })
    }

    isRefreshing = true

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
      const newAccess: string = data.data.accessToken
      const newRefresh: string = data.data.refreshToken ?? refreshToken

      setTokens(newAccess, newRefresh)
      original.headers.Authorization = `Bearer ${newAccess}`
      refreshQueue.forEach((cb) => cb(newAccess))
      refreshQueue = []

      return apiClient(original)
    } catch {
      clearAuth()
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)
