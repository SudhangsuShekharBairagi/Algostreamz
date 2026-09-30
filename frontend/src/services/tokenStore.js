const TOKEN_KEY = 'dsaviz.token'

/**
 * Centralised so switching to httpOnly cookies later is a change to this file only.
 *
 * localStorage is readable by any script on the page, so an XSS bug becomes a session
 * theft bug. That trade-off buys instant revocation-free reloads; revisit it if the app
 * ever renders untrusted HTML.
 */
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export default tokenStore
