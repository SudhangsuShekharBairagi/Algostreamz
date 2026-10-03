import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  ArrowRight,
  Check,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Sliders,
  Layers,
  BarChart2,
  X,
} from 'lucide-react'
import { LABELS } from '../config/siteLinks'

// Comprehensive fallback dataset until metadata module is wired
const ALGORITHM_DATASET = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    tagline: 'Repeatedly steps through list, swapping adjacent elements out of order.',
    best: 'O(N)',
    avg: 'O(N²)',
    worst: 'O(N²)',
    space: 'O(1)',
    stable: true,
    inPlace: true,
    href: '/visualizer/bubble-sort',
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'Sorting',
    tagline: 'Finds minimum element from unsorted portion and moves it to start.',
    best: 'O(N²)',
    avg: 'O(N²)',
    worst: 'O(N²)',
    space: 'O(1)',
    stable: false,
    inPlace: true,
    href: '/visualizer/selection-sort',
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'Sorting',
    tagline: 'Builds sorted array one element at a time by shifting larger items.',
    best: 'O(N)',
    avg: 'O(N²)',
    worst: 'O(N²)',
    space: 'O(1)',
    stable: true,
    inPlace: true,
    href: '/visualizer/insertion-sort',
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'Sorting',
    tagline: 'Divide-and-conquer algorithm that recursively splits and merges sub-lists.',
    best: 'O(N log N)',
    avg: 'O(N log N)',
    worst: 'O(N log N)',
    space: 'O(N)',
    stable: true,
    inPlace: false,
    href: '/visualizer/merge-sort',
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'Sorting',
    tagline: 'Picks a pivot and partitions elements into sub-arrays around it.',
    best: 'O(N log N)',
    avg: 'O(N log N)',
    worst: 'O(N²)',
    space: 'O(log N)',
    stable: false,
    inPlace: true,
    href: '/visualizer/quick-sort',
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    tagline: 'Halves sorted search interval iteratively or recursively.',
    best: 'O(1)',
    avg: 'O(log N)',
    worst: 'O(log N)',
    space: 'O(1)',
    stable: true,
    inPlace: true,
    href: '/visualizer/binary-search',
  },
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'Searching',
    tagline: 'Checks each element sequentially until target value is found.',
    best: 'O(1)',
    avg: 'O(N)',
    worst: 'O(N)',
    space: 'O(1)',
    stable: true,
    inPlace: true,
    href: '/visualizer/linear-search',
  },
  {
    id: 'binary-search-tree',
    name: 'Binary Search Tree',
    category: 'Trees',
    tagline: 'Node-based structure maintaining left-child smaller, right-child larger invariant.',
    best: 'O(log N)',
    avg: 'O(log N)',
    worst: 'O(N)',
    space: 'O(N)',
    stable: true,
    inPlace: true,
    href: '/visualizer/binary-search-tree',
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    category: 'Graphs',
    tagline: 'Explores graph level-by-level using a FIFO queue structure.',
    best: 'O(V + E)',
    avg: 'O(V + E)',
    worst: 'O(V + E)',
    space: 'O(V)',
    stable: true,
    inPlace: false,
    href: '/visualizer/bfs',
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    category: 'Graphs',
    tagline: 'Traverses graph branches as deep as possible before backtracking.',
    best: 'O(V + E)',
    avg: 'O(V + E)',
    worst: 'O(V + E)',
    space: 'O(V)',
    stable: true,
    inPlace: false,
    href: '/visualizer/dfs',
  },
  {
    id: 'dijkstra',
    name: 'Dijkstra Algorithm',
    category: 'Graphs',
    tagline: 'Calculates shortest paths from single source vertex using priority queue.',
    best: 'O((V + E) log V)',
    avg: 'O((V + E) log V)',
    worst: 'O((V + E) log V)',
    space: 'O(V)',
    stable: true,
    inPlace: false,
    href: '/visualizer/dijkstra',
  },
]

const CATEGORIES = ['All', 'Sorting', 'Searching', 'Trees', 'Graphs']

export default function AlgorithmsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInputRef = useRef(null)
  const [loading, setLoading] = useState(true)

  // Read search & category filters directly from URL query parameters
  const query = searchParams.get('q') || ''
  const selectedCat = searchParams.get('cat') || 'All'

  // Simulate fast initial load for smooth skeleton transition
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 250)
    return () => clearTimeout(timer)
  }, [])

  // Global '/' keyboard shortcut listener to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Sync state changes back to URL search params
  const updateFilters = (newQuery, newCat) => {
    const params = new URLSearchParams()
    if (newQuery) params.set('q', newQuery)
    if (newCat && newCat !== 'All') params.set('cat', newCat)
    setSearchParams(params, { replace: true })
  }

  // Filter dataset dynamically based on query and category
  const filteredAlgorithms = useMemo(() => {
    return ALGORITHM_DATASET.filter((algo) => {
      const matchesCategory = selectedCat === 'All' || algo.category === selectedCat
      const matchesSearch =
        algo.name.toLowerCase().includes(query.toLowerCase()) ||
        algo.tagline.toLowerCase().includes(query.toLowerCase()) ||
        algo.category.toLowerCase().includes(query.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [query, selectedCat])

  // Computed summary metrics for header chips
  const metrics = useMemo(() => {
    const categoriesSet = new Set(ALGORITHM_DATASET.map((a) => a.category))
    const inPlaceCount = ALGORITHM_DATASET.filter((a) => a.inPlace).length
    return {
      total: ALGORITHM_DATASET.length,
      categories: categoriesSet.size,
      inPlace: inPlaceCount,
    }
  }, [])

  return (
    <div className="space-y-10 font-sans pb-12">
      {/* 1. Header Section */}
      <section className="space-y-4 max-w-[72ch]">
        <div className="space-y-2">
          <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">
            Module Directory
          </span>
          <h1 className="text-display-xl font-display font-semibold text-ink tracking-tight">
            Algorithm Catalog & Workbench
          </h1>
          <p className="text-body text-ink-muted text-pretty">
            Browse interactive step-by-step algorithms. Filter by complexity, stability, or domain category.
          </p>
        </div>

        {/* Dynamic Computed Summary Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="chip font-medium text-ink">
            <strong>{metrics.total}</strong> Algorithms
          </span>
          <span className="chip font-medium text-ink">
            <strong>{metrics.categories}</strong> Categories
          </span>
          <span className="chip text-accent font-medium bg-accent-soft border-accent/20">
            Step-by-step tracing
          </span>
          <span className="chip font-medium text-ink-muted">
            <strong>{metrics.inPlace}</strong> In-Place
          </span>
        </div>
      </section>

      {/* 2. Search & Filter Bar */}
      <section className="space-y-4 bg-surface p-4 card border border-line shadow-e1">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => updateFilters(e.target.value, selectedCat)}
              placeholder="Search algorithms by name, keyword, or concept... (Press '/')"
              className="w-full h-11 pl-11 pr-20 bg-surface border border-line-strong rounded-md text-body text-ink placeholder:text-ink-faint focus-ring shadow-sm"
              aria-label="Search algorithms"
            />
            {query ? (
              <button
                type="button"
                onClick={() => updateFilters('', selectedCat)}
                className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-1 text-ink-muted hover:text-ink focus-ring"
                aria-label="Clear search text"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 kbd hidden sm:inline-block pointer-events-none">
                /
              </span>
            )}
          </div>

          {/* Segmented Category Pill Tabs */}
          <div className="segmented overflow-x-auto shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => updateFilters(query, cat)}
                data-selected={selectedCat === cat}
                className={`segmented-option focus-ring whitespace-nowrap ${
                  selectedCat === cat ? 'selected' : ''
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Algorithm Grid / Loading Skeleton / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="card p-5 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-6 w-32 bg-sunken rounded" />
                <div className="h-5 w-16 bg-sunken rounded-full" />
              </div>
              <div className="h-10 w-full bg-sunken rounded" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-8 bg-sunken rounded" />
                <div className="h-8 bg-sunken rounded" />
              </div>
              <div className="h-9 w-full bg-sunken rounded" />
            </div>
          ))}
        </div>
      ) : filteredAlgorithms.length === 0 ? (
        /* Empty State */
        <div className="card p-12 text-center space-y-4 max-w-[500px] mx-auto border-dashed">
          <div className="w-12 h-12 rounded-full bg-sunken text-ink-faint flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-h3 font-semibold text-ink">No algorithms match your search</h2>
            <p className="text-caption text-ink-muted">
              We couldn&apos;t find any algorithms matching &quot;{query}&quot; in the &quot;{selectedCat}&quot; category.
            </p>
          </div>
          <button
            onClick={() => updateFilters('', 'All')}
            className="btn-ghost border border-line bg-surface text-caption font-semibold inline-flex items-center gap-1.5 focus-ring"
          >
            <RotateCcw className="w-4 h-4 text-accent" />
            Clear all filters
          </button>
        </div>
      ) : (
        /* Algorithm Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
          {filteredAlgorithms.map((algo) => (
            <div
              key={algo.id}
              className="card p-5 flex flex-col justify-between space-y-5 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-e2 transition-all duration-200 ease-out-custom group"
            >
              <div className="space-y-3">
                {/* Header: Title & Category Chip */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-h3 font-semibold text-ink group-hover:text-accent transition-colors">
                    {algo.name}
                  </h3>
                  <span className="chip text-micro font-mono shrink-0">{algo.category}</span>
                </div>

                {/* Tagline */}
                <p className="text-caption text-ink-muted line-clamp-2 leading-relaxed">
                  {algo.tagline}
                </p>

                {/* Micro Badges (Stable / In-Place) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {algo.stable && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50/60 text-emerald-800 text-[11px] font-medium">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                      Stable
                    </span>
                  )}
                  {algo.inPlace && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-accent/20 bg-accent-soft text-accent-strong text-[11px] font-medium">
                      <ShieldCheck className="w-3 h-3 text-accent stroke-[2.5]" />
                      In-Place
                    </span>
                  )}
                </div>

                {/* Complexity Matrix Pills */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-micro font-mono">
                  <div className={`p-1.5 rounded border ${getComplexityStyle(algo.avg)} flex flex-col`}>
                    <span className="text-[10px] text-ink-faint uppercase font-sans font-semibold">
                      Avg Time
                    </span>
                    <span className="font-bold tabular-nums">{algo.avg}</span>
                  </div>
                  <div className={`p-1.5 rounded border ${getComplexityStyle(algo.space)} flex flex-col`}>
                    <span className="text-[10px] text-ink-faint uppercase font-sans font-semibold">
                      Space
                    </span>
                    <span className="font-bold tabular-nums">{algo.space}</span>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <Link
                  to={algo.href}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-caption font-semibold focus-ring group/btn shadow-e1"
                >
                  <span>Launch Visualizer</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Returns exact semantic color styling based on Big-O notation
 * - O(1) & O(log n): emerald-50 bg, emerald-700 text, emerald-200 border
 * - O(n) & O(n log n): sky-50 bg, sky-700 text, sky-200 border
 * - O(n^2) & worse: amber-50 bg, amber-800 text, amber-200 border
 */
function getComplexityStyle(notation) {
  if (!notation) return 'bg-sunken text-ink-muted border-line'
  const clean = notation.toLowerCase().replace(/\s+/g, '')

  if (clean.includes('o(1)') || clean.includes('o(logn)')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
  if (clean.includes('o(nlogn)') || clean.includes('o(n)') || clean.includes('o(v+e)')) {
    return 'bg-sky-50 text-sky-700 border-sky-200'
  }
  return 'bg-amber-50 text-amber-800 border-amber-200'
}
