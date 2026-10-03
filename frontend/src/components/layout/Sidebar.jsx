import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BarChart2,
  BarChart3,
  ArrowDownUp,
  GitMerge,
  Zap,
  Search,
  Scan,
  Network,
  Share2,
  GitCommit,
  Route,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react'
import { SIDEBAR_CATEGORIES, LABELS } from '../../config/siteLinks'

const ICON_MAP = {
  BarChart2,
  BarChart3,
  ArrowDownUp,
  GitMerge,
  Zap,
  Search,
  Scan,
  Network,
  Share2,
  GitCommit,
  Route,
}

const STORAGE_KEY = 'dsa.sidebar'

export default function Sidebar({ mobileOpen, onCloseMobile, isZen = false }) {
  const location = useLocation()
  const currentPath = location.pathname
  const closeButtonRef = useRef(null)

  // Persisted collapse state for desktop rail view
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : false
    } catch {
      return false
    }
  })

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const nextState = !prev
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
      } catch {
        // Fallback gracefully if localStorage is unavailable
      }
      return nextState
    })
  }

  // Handle Mobile Keyboard Escape & Trap
  useEffect(() => {
    if (!mobileOpen) return undefined

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCloseMobile()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    if (closeButtonRef.current) {
      closeButtonRef.current.focus()
    }

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen, onCloseMobile])

  return (
    <>
      {/* 1. Mobile Backdrop Scrim (<1024px) */}
      {mobileOpen && !isZen && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* 2. Sidebar Navigation Component */}
      <aside
        inert={isZen ? '' : undefined}
        aria-hidden={isZen}
        className={`fixed top-14 bottom-0 left-0 z-40 bg-surface border-r border-line flex flex-col transition-all duration-300 ease-out-custom
          ${
            isZen
              ? 'w-0 -translate-x-full opacity-0 overflow-hidden pointer-events-none'
              : `hidden lg:flex ${collapsed ? 'w-[72px]' : 'w-[264px]'} lg:static lg:translate-x-0 ${
                  mobileOpen
                    ? 'flex w-[264px] translate-x-0 shadow-e3'
                    : '-translate-x-full lg:translate-x-0'
                }`
          }
        `}
      >
        {/* Header / Collapse Toggle */}
        <div className="h-12 px-3 border-b border-line flex items-center justify-between shrink-0">
          {!collapsed && (
            <span className="text-micro font-bold uppercase tracking-wider text-ink-faint px-2">
              Algorithm Workbench
            </span>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={LABELS.SIDEBAR_TOGGLE}
            className="hidden lg:flex btn-ghost p-1.5 focus-ring text-ink-muted hover:text-ink ml-auto"
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onCloseMobile}
            aria-label="Close sidebar navigation"
            className="lg:hidden btn-ghost p-1.5 focus-ring text-ink-muted hover:text-ink ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Category List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 px-2">
          {SIDEBAR_CATEGORIES.map((category) => (
            <div key={category.id} className="space-y-1">
              {/* Category Section Label */}
              {!collapsed ? (
                <h3 className="text-micro font-bold uppercase tracking-wider text-ink-faint px-3 py-1">
                  {category.label}
                </h3>
              ) : (
                <div className="h-4" />
              )}

              {/* Items */}
              <nav className="space-y-0.5">
                {category.items.map((item) => {
                  const Icon = ICON_MAP[item.icon] || BarChart2
                  const isActive = currentPath === item.href

                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={onCloseMobile}
                      title={collapsed ? `${category.label}: ${item.label}` : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-caption font-medium transition-colors focus-ring ${
                        isActive
                          ? 'bg-accent-soft text-accent-strong font-semibold border-r-2 border-accent'
                          : 'text-ink-muted hover:bg-sunken hover:text-ink'
                      } ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : ''}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
