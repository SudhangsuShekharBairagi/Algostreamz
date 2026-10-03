import { Sliders, Code } from 'lucide-react'

export default function PlaygroundPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">
          Custom Playground
        </span>
        <h1 className="text-h1 font-display font-semibold text-ink mt-2">
          Algorithm Sandbox & Input Editor
        </h1>
        <p className="text-body text-ink-muted text-pretty max-w-[68ch] mt-1">
          Supply custom array inputs, graph adjacency matrices, or tree nodes to test edge cases live in the step trace player.
        </p>
      </div>

      <div className="card p-8 space-y-4 text-center py-16">
        <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
          <Code className="w-6 h-6" />
        </div>
        <h2 className="text-h2 font-display text-ink">Playground Environment Ready</h2>
        <p className="text-caption text-ink-muted max-w-[50ch] mx-auto">
          Custom array input parsing and step generator trace binding will be active here.
        </p>
      </div>
    </div>
  )
}
