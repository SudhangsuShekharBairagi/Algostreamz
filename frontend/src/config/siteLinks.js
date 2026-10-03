/**
 * Central route, link label, and anchor registry for Algostreamz.
 * No link strings or route paths should ever be hard-coded in components.
 */

export const NAV_LINKS = [
  { label: 'Home', href: '/', id: 'nav-home' },
  { label: 'Progress', href: '/progress', id: 'nav-progress' },
  { label: 'Design System', href: '/_design', id: 'nav-design' },
]

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  VERIFY_EMAIL: '/verify-email',
  PROGRESS: '/progress',
  DESIGN_SYSTEM: '/_design',
}

export const LABELS = {
  SITE_NAME: 'Algostreamz',
  SIGN_IN: 'Sign in',
  SIGN_OUT: 'Sign out',
  CREATE_ACCOUNT: 'Create account',
  BACK_TO_HOME: 'Back to home',
  ZEN_MODE: 'Zen Mode',
  EXIT_ZEN: 'Exit Zen Mode',
  PLAY: 'Play',
  PAUSE: 'Pause',
  STEP_FORWARD: 'Step Forward',
  STEP_BACKWARD: 'Step Backward',
  RESET: 'Reset',
}

export default {
  NAV_LINKS,
  ROUTES,
  LABELS,
}
