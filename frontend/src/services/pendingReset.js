const EMAIL_KEY = 'dsaviz.pendingResetEmail'

/**
 * The reset screen needs to know which address the code was sent to. Router state is
 * lost on a reload or when the tab is reopened, which stranded users on the email step
 * with a code in their inbox and nowhere to type it. sessionStorage keeps it for the
 * lifetime of the tab, and it is cleared as soon as the reset succeeds.
 */
export const pendingReset = {
  get: () => {
    try {
      return sessionStorage.getItem(EMAIL_KEY) ?? ''
    } catch {
      return ''
    }
  },
  set: (email) => {
    try {
      sessionStorage.setItem(EMAIL_KEY, email)
    } catch {
      // Private-mode or blocked storage: the in-memory router state still works.
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(EMAIL_KEY)
    } catch {
      // Nothing to clean up.
    }
  },
}

export default pendingReset
