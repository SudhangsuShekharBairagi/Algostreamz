import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Award, Activity, Play } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROUTES, SIDEBAR_CATEGORIES } from '../../config/siteLinks'

// Fallback algorithm dataset for landing preview
const SAMPLE_ALGORITHMS = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    tagline: 'Repeatedly steps through list, swapping adjacent elements out of order.',
    worst: 'O(N²)',
    href: '/visualizer/bubble-sort',
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'Sorting',
    tagline: 'Partitioning divide-and-conquer algorithm with O(N log N) average efficiency.',
    worst: 'O(N²)',
    href: '/visualizer/quick-sort',
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    tagline: 'Halves search interval iteratively on sorted array data.',
    worst: 'O(log N)',
    href: '/visualizer/binary-search',
  },
  {
    id: 'binary-search-tree',
    name: 'Binary Search Tree',
    category: 'Trees',
    tagline: 'Dynamic node structure maintaining left-less and right-greater invariants.',
    worst: 'O(N)',
    href: '/visualizer/binary-search-tree',
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    category: 'Graphs',
    tagline: 'Explores graph vertices level-by-level using a FIFO queue.',
    worst: 'O(V + E)',
    href: '/visualizer/bfs',
  },
  {
    id: 'dijkstra',
    name: 'Dijkstra Algorithm',
    category: 'Graphs',
    tagline: 'Calculates single-source shortest path using priority queue.',
    worst: 'O((V + E) log V)',
    href: '/visualizer/dijkstra',
  },
]

const CATEGORY_TABS = ['All', 'Sorting', 'Searching', 'Trees', 'Graphs']

export default function AlgorithmsPreview() {
  const { isAuthenticated } = useAuth()
  const [selectedCat, setSelectedCat] = useState('All')
  const [loading, setLoading] = useState(true)

  // Simulate skeleton transition
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(timer)
  }, [])

  // Filter 6 compact cards by category
  const filteredList = useMemo(() => {
    if (selectedCat === 'All') return SAMPLE_ALGORITHMS
    return SAMPLE_ALGORITHMS.filter((item) => item.category === selectedCat)
  }, [selectedCat])

  // Total algorithms count calculated dynamically across categories
  const totalAlgorithmCount = useMemo(() => {
    return SIDEBAR_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0)
  }, [])

  return (
    <section
      id="algorithms"
      aria-labelledby="algorithms-heading"
      className="space-y-10 scroll-mt-24 font-sans"
    >
      {/* Header & Segmented Filter Control */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3 max-w-[68ch]">
          <div className="inline-flex items-center gap-2 chip border-accent/20 bg-accent-soft text-accent font-semibold text-micro uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            START WITH A CLASSIC
          </div>
          <h2 id="algorithms-heading" className="text-h1 font-display font-semibold text-ink">
            Start with a classic
          </h2>
          <p className="text-body text-ink-muted">
            Launch any core module to view visual execution snapshots and pseudocode.
          </p>
        </div>

        {/* Category Segmented Control */}
        <div className="segmented overflow-x-auto shrink-0">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
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

      {/* 6 Compact Cards Grid / Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-5 space-y-3 animate-pulse">
              <div className="h-5 w-24 bg-sunken rounded" />
              <div className="h-10 w-full bg-sunken rounded" />
              <div className="h-8 w-20 bg-sunken rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
          {filteredList.map((algo) => (
            <div
              key={algo.id}
              className="card p-5 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-e2 transition-all duration-200 ease-out-custom group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-h3 font-semibold text-ink group-hover:text-accent transition-colors">
                    {algo.name}
                  </h3>
                  <span className="chip text-micro font-mono shrink-0">{algo.category}</span>
                </div>

                <p className="text-caption text-ink-muted line-clamp-2 leading-relaxed">
                  {algo.tagline}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-line/60">
                {/* Worst-Case Complexity Pill */}
                <div className="flex items-center gap-1.5 text-micro font-mono">
                  <span className="text-[10px] text-ink-faint uppercase font-sans font-semibold">Worst:</span>
                  <span className={`px-2 py-0.5 rounded border ${getWorstComplexityStyle(algo.worst)} font-bold tabular-nums`}>
                    {algo.worst}
                  </span>
                </div>

                {/* Launch Action Link */}
                <Link
                  to={algo.href}
                  className="btn-ghost text-caption font-semibold text-accent hover:text-accent-hover flex items-center gap-1 focus-ring p-1"
                >
                  <Play className="w-3.5 h-3.5 fill-accent" />
                  <span>Launch</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Browse All Link */}
      <div className="text-center pt-2">
        <Link
          to={ROUTES.ALGORITHMS}
          className="btn-ghost border border-line bg-surface text-caption font-semibold text-ink hover:text-accent inline-flex items-center gap-2 focus-ring shadow-e1"
        >
          <span>Browse all {totalAlgorithmCount} algorithms</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Two-Card Teaser Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-line">
        {/* Teaser Card 1: Challenges */}
        <Link
          to={ROUTES.CHALLENGES}
          className="card p-6 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-e2 transition-all duration-200 ease-out-custom group focus-ring"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-h3 font-semibold text-ink group-hover:text-accent transition-colors">
              Challenges
            </h3>
            <p className="text-caption text-ink-muted leading-relaxed">
              Test what you learned: predict output, match complexity, spot the bug.
            </p>
          </div>

          <div className="flex items-center gap-1 text-caption font-semibold text-accent">
            <span>Start a challenge</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Teaser Card 2: Your Progress */}
        <Link
          to={isAuthenticated ? ROUTES.PROGRESS : ROUTES.LOGIN}
          className="card p-6 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-e2 transition-all duration-200 ease-out-custom group focus-ring"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-h3 font-semibold text-ink group-hover:text-accent transition-colors">
              Your progress
            </h3>
            <p className="text-caption text-ink-muted leading-relaxed">
              Track completed algorithms, test accuracy, and mastery metrics.
            </p>
          </div>

          <div className="flex items-center gap-1 text-caption font-semibold text-accent">
            <span>{isAuthenticated ? 'View your progress dashboard' : 'Sign in to save progress'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </section>
  )
}

/**
 * Helper to style worst-case complexity pills:
 * - O(1) & O(log n): emerald-50 bg, emerald-700 text, emerald-200 border
 * - O(n) & O(n log n): sky-50 bg, sky-700 text, sky-200 border
 * - O(n^2) & worse: amber-50 bg, amber-800 text, amber-200 border
 */
function getWorstComplexityStyle(notation) {
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
