import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ROUTE_METADATA } from '../config/siteLinks'
import { SITE_NAME, TAGLINE } from '../config'

/**
 * Dynamic SEO Manager Hook.
 * Updates document.title, meta description, canonical link, and Open Graph / Twitter tags per route.
 */
export function useDocumentTitle() {
  const location = useLocation()

  useEffect(() => {
    const currentPath = location.pathname
    let meta = ROUTE_METADATA[currentPath]

    if (!meta && currentPath.startsWith('/visualizer/')) {
      const algoName = currentPath.split('/')[2]?.replace(/-/g, ' ') || 'Visualizer'
      const formatted = algoName.charAt(0).toUpperCase() + algoName.slice(1)
      meta = {
        title: `${formatted} Visualizer — ${SITE_NAME}`,
        description: `Step-by-step interactive trace visualization for ${formatted} algorithm.`,
      }
    }

    const title = meta?.title || `${SITE_NAME} — ${TAGLINE}`
    const description = meta?.description || 'Interactive data structures and algorithms visualization platform.'
    const canonicalUrl = `https://algostreamz.com${currentPath}`

    // 1. Set Document Title
    document.title = title

    // 2. Set Meta Description
    updateMeta('name', 'description', description)

    // 3. Set Open Graph Meta Tags
    updateMeta('property', 'og:title', title)
    updateMeta('property', 'og:description', description)
    updateMeta('property', 'og:url', canonicalUrl)

    // 4. Set Twitter Meta Tags
    updateMeta('name', 'twitter:title', title)
    updateMeta('name', 'twitter:description', description)
    updateMeta('name', 'twitter:url', canonicalUrl)

    // 5. Update Canonical Link
    let canonicalEl = document.querySelector('link[rel="canonical"]')
    if (!canonicalEl) {
      canonicalEl = document.createElement('link')
      canonicalEl.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalEl)
    }
    canonicalEl.setAttribute('href', canonicalUrl)
  }, [location.pathname])
}

function updateMeta(attributeName, attributeValue, content) {
  let el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attributeName, attributeValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default useDocumentTitle
