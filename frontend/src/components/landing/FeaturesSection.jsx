import { Link } from 'react-router-dom'
import {
  Sliders,
  Code2,
  Sparkles,
  Zap,
  Layers,
  Network,
  TestTube,
  Award,
  ArrowRight,
} from 'lucide-react'
import ZenSpotlight from './ZenSpotlight'
import { ROUTES } from '../../config/siteLinks'

const BENTO_TILES = [
  {
    title: 'Step-by-step tracing',
    desc: 'Step forward and backward through every array swap, compare, and pivot operation with full control.',
    href: '/visualizer/bubble-sort',
    icon: Sliders,
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Synchronized pseudocode',
    desc: 'Live code highlighting tracks the exact executing line alongside the visual stage.',
    href: '/visualizer/insertion-sort',
    icon: Code2,
    colSpan: 'lg:col-span-1',
  },
  {
    title: 'Predict the next step',
    desc: 'Test your algorithm intuition by predicting array indices before stepping.',
    href: '/visualizer/selection-sort',
    icon: Sparkles,
    colSpan: 'lg:col-span-1',
  },
  {
    title: 'Race Mode',
    desc: 'Benchmark two algorithms side-by-side on identical input datasets with real-time operation counts.',
    href: ROUTES.RACE,
    icon: Zap,
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Playgrounds (stack, queue, linked list)',
    desc: 'Experiment with custom array inputs, stacks, queues, and linked list nodes.',
    href: ROUTES.PLAYGROUND,
    icon: Layers,
    colSpan: 'lg:col-span-1',
  },
  {
    title: 'Trees and graphs',
    desc: 'Visualize binary search trees, BFS, DFS, and Dijkstra shortest path graphs.',
    href: `${ROUTES.ALGORITHMS}?cat=Trees`,
    icon: Network,
    colSpan: 'lg:col-span-1',
  },
  {
    title: 'Experiments with charts',
    desc: 'Analyze loop invariants, recursion stack depth, and Big-O operation metrics.',
    href: ROUTES.EXPERIMENT,
    icon: TestTube,
    colSpan: 'lg:col-span-1',
  },
  {
    title: 'Challenges and bug spotter',
    desc: 'Solve interactive visual quizzes and spot logical bugs in broken algorithm implementations.',
    href: ROUTES.CHALLENGES,
    icon: Award,
    colSpan: 'lg:col-span-1',
  },
]

export default function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="space-y-12 scroll-mt-24 font-sans"
    >
      {/* Header */}
      <div className="space-y-3 max-w-[72ch]">
        <div className="inline-flex items-center gap-2 chip border-accent/20 bg-accent-soft text-accent font-semibold text-micro uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          PLATFORM CAPABILITIES
        </div>
        <h2 id="features-heading" className="text-h1 font-display font-semibold text-ink">
          Everything you need to learn it properly
        </h2>
        <p className="text-body text-ink-muted text-pretty">
          From step-by-step tracing to side-by-side algorithm racing, master DSA mechanics with interactive tools.
        </p>
      </div>

      {/* Bento Grid (3 Columns Desktop, 1 Column Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
        {BENTO_TILES.map((tile, idx) => {
          const IconComp = tile.icon
          return (
            <Link
              key={idx}
              to={tile.href}
              className={`card p-6 flex flex-col justify-between space-y-4 border border-line hover:-translate-y-0.5 hover:shadow-e2 hover:border-accent/40 transition-all duration-200 ease-out-custom group focus-ring ${tile.colSpan}`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-md bg-sunken text-ink-muted group-hover:bg-accent-soft group-hover:text-accent flex items-center justify-center transition-colors">
                  <IconComp className="w-5 h-5" />
                </div>
                <h3 className="text-h3 font-semibold text-ink group-hover:text-accent transition-colors">
                  {tile.title}
                </h3>
                <p className="text-caption text-ink-muted leading-relaxed">
                  {tile.desc}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1 text-caption font-semibold text-ink-muted group-hover:text-accent transition-colors">
                <span>Try it</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* ZenSpotlight Component Band */}
      <ZenSpotlight />
    </section>
  )
}
