import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
  LogOut,
  UserRound,
  Layers,
  ListOrdered,
  Link2,
} from 'lucide-react'
import { SIDEBAR_CATEGORIES, LABELS, ROUTES } from '../../config/siteLinks'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

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
  Layers,
  ListOrdered,
  Link2,
}

const STORAGE_KEY = 'dsa.sidebar'

export default function Sidebar({ mobileOpen, onCloseMobile, isZen = false }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, initialising, signOut } = useAuth()
  const { showToast } = useToast()
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

  const handleSignOut = async () => {
    await signOut()
    showToast('Signed out', 'success')
    onCloseMobile()
    navigate(ROUTES.HOME)
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
      {/* Mobile backdrop starts below the fixed-height navbar. */}
      {mobileOpen && !isZen && (
        <div
          className="fixed inset-x-0 top-14 bottom-0 z-40 bg-ink/30 backdrop-blur-sm md:hidden transition-opacity duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* 2. Sidebar Navigation Component */}
      <aside
        inert={isZen ? '' : undefined}
        aria-hidden={isZen}
        className={`fixed top-14 bottom-0 left-0 z-40 h-[calc(100dvh-3.5rem)] bg-surface border-r border-line flex flex-col transition-all duration-300 ease-out-custom
          ${
            isZen
              ? 'w-0 -translate-x-full opacity-0 overflow-hidden pointer-events-none'
              : `${mobileOpen ? 'flex w-[264px] translate-x-0 shadow-e3' : 'hidden -translate-x-full'} md:sticky md:top-14 md:bottom-auto md:z-20 md:flex md:h-[calc(100vh-3.5rem)] md:translate-x-0 md:shrink-0 md:shadow-none ${
                  collapsed ? 'md:w-[72px]' : 'md:w-[264px]'
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
            className="hidden md:flex btn-ghost p-1.5 focus-ring text-ink-muted hover:text-ink ml-auto"
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onCloseMobile}
            aria-label="Close sidebar navigation"
            className="md:hidden btn-ghost p-1.5 focus-ring text-ink-muted hover:text-ink ml-auto"
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

        <div className="shrink-0 border-t border-line p-3 md:hidden">
          {!initialising && (isAuthenticated ? (
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-caption font-medium text-ink-muted hover:bg-sunken hover:text-ink focus-ring"
            >
              <LogOut className="h-4 w-4" />
              {LABELS.SIGN_OUT}
            </button>
          ) : (
            <Link
              to={ROUTES.LOGIN}
              onClick={onCloseMobile}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-caption font-medium text-ink-muted hover:bg-sunken hover:text-ink focus-ring"
            >
              <UserRound className="h-4 w-4" />
              {LABELS.SIGN_IN}
            </Link>
          ))}
        </div>
      </aside>
    </>
  )
}
