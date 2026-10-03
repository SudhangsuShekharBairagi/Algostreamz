import { useState, useEffect, useRef } from 'react'

export default function ScrollReveal({ children, className = '' }) {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef(null)

  useEffect(() => {
    // If IntersectionObserver is unavailable or reduced motion is enabled, reveal immediately
    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (domRef.current) observer.unobserve(domRef.current)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    const currentEl = domRef.current
    if (currentEl) observer.observe(currentEl)

    return () => {
      if (currentEl) observer.unobserve(currentEl)
    }
  }, [])

  return (
    <div
      ref={domRef}
      className={`transition-all duration-300 ease-out-custom ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-100 translate-y-0 md:opacity-0 md:translate-y-3'
      } ${className}`}
    >
      {children}
    </div>
  )
}
