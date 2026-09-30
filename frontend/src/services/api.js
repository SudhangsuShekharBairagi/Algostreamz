import axios from 'axios'
import tokenStore from './tokenStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// A rejected or expired token must not leave the app in a half-authenticated state.
// Handlers surface `error.response.data.message`, so keep that intact.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isAuthCall = error.config?.url?.startsWith('/auth/')

    if (status === 401 && !isAuthCall) {
      tokenStore.clear()
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }
    return Promise.reject(error)
  },
)

/** Pulls the human-readable reason out of the backend's single error envelope. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || error?.message || fallback
}

/** Per-field messages from a 400, for form-level display. */
export function fieldErrors(error) {
  return error?.response?.data?.fieldErrors ?? null
}

export default api
