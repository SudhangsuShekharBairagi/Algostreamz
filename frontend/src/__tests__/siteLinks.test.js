import { describe, it, expect } from 'vitest'
import { ROUTES, SITE_LINKS } from '../config/siteLinks'

describe('Link Registry Audit', () => {
  it('every internal path in ROUTES is defined and non-empty', () => {
    Object.values(ROUTES).forEach((path) => {
      expect(path).toBeDefined()
      expect(typeof path).toBe('string')
      expect(path.startsWith('/')).toBe(true)
    })
  })

  it('every primary navigation link references a valid route', () => {
    const validRoutes = Object.values(ROUTES)
    SITE_LINKS.primary.forEach((link) => {
      expect(link.href).toBeDefined()
      // Either direct route or parameterized route (e.g. /visualizer/bubble-sort)
      const matches = validRoutes.some(
        (r) => r === link.href || link.href.startsWith('/visualizer')
      )
      expect(matches).toBe(true)
    })
  })

  it('every landing anchor has a valid target ID matching a landing section', () => {
    const expectedSectionIds = ['why', 'how', 'features', 'algorithms', 'contact-section', 'faq']
    SITE_LINKS.anchors.forEach((anchor) => {
      expect(anchor.href.startsWith('#')).toBe(true)
      expect(expectedSectionIds).includes(anchor.targetId)
    })
  })

  it('external links reference valid HTTP/HTTPS URLs', () => {
    expect(SITE_LINKS.external.github).toMatch(/^https?:\/\//)
  })
})
