import api from './api'

/**
 * Thin bindings over the backend auth contract (see docs/auth-api.md).
 *
 * Nothing here knows about tokens - AuthContext owns that.
 */
export const authApi = {
  register: (payload) => api.post('/auth/register', payload),

  verifyEmail: (payload) => api.post('/auth/verify-email', payload),

  resendVerification: (email) => api.post('/auth/resend-verification', { email }),

  login: (payload) => api.post('/auth/login', payload),

  requestLoginOtp: (email) => api.post('/auth/otp/request', { email }),

  verifyLoginOtp: (payload) => api.post('/auth/otp/verify', payload),

  me: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),
}

export default authApi
