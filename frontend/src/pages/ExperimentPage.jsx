import { useMemo, useState } from 'react'
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ALGORITHMS } from '../data/algorithmsData'
import { benchmarkAlgorithms, BENCHMARK_SIZES } from '../engine/benchmarks'

const SORTING_ALGORITHMS = ALGORITHMS.filter((algorithm) => algorithm.category === 'Sorting')
const DEFAULT_SELECTED = ['bubble-sort', 'merge-sort', 'quick-sort']
const COLORS = ['#6d28d9', '#0f766e', '#c2410c', '#2563eb', '#be123c']

export default function ExperimentPage() {
  const [selectedIds, setSelectedIds] = useState(DEFAULT_SELECTED)
  const { results, chartData } = useMemo(() => benchmarkAlgorithms(selectedIds), [selectedIds])

  const toggleAlgorithm = (id) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((algorithmId) => algorithmId !== id)
      : [...current, id])
  }

  return (
    <div className="space-y-6 pb-10">
      <header>
        <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">Experimental Lab</span>
        <h1 className="text-h1 font-display font-semibold text-ink mt-2">Algorithm Experiments &amp; Invariants</h1>
        <p className="text-body text-ink-muted text-pretty max-w-[68ch] mt-1">
          Compare deterministic operation counts across input sizes and see how measured growth follows each algorithm’s worst-case complexity.
        </p>
      </header>

      <section className="card p-5 space-y-4" aria-labelledby="benchmark-select-heading">
        <div>
          <h2 id="benchmark-select-heading" className="text-h3 font-semibold text-ink">Select algorithms</h2>
          <p className="mt-1 text-caption text-ink-muted">
            Sizes: {BENCHMARK_SIZES.join(', ')}. Each algorithm receives the same deterministic input values at each size.
          </p>
        </div>
        <fieldset>
          <legend className="sr-only">Algorithms to benchmark</legend>
          <div className="flex flex-wrap gap-2">
            {SORTING_ALGORITHMS.map((algorithm) => (
              <label key={algorithm.id} className={`flex min-h-10 items-center gap-2 rounded-md border px-3 text-caption ${
                selectedIds.includes(algorithm.id) ? 'border-accent bg-accent-soft text-ink' : 'border-line text-ink-muted'
              }`}>
                <input type="checkbox" checked={selectedIds.includes(algorithm.id)}
                  onChange={() => toggleAlgorithm(algorithm.id)} className="accent-accent" />
                {algorithm.name}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {results.length === 0 ? (
        <div className="card p-8 text-center text-caption text-ink-muted" role="status">
          Select at least one algorithm to run the benchmark.
        </div>
      ) : (
        <>
          <section className="card p-4 md:p-6 space-y-4" aria-labelledby="benchmark-chart-heading">
            <div>
              <h2 id="benchmark-chart-heading" className="text-h3 font-semibold text-ink">Operation growth</h2>
              <p className="mt-1 text-caption text-ink-muted">
                Solid lines show measured comparisons plus swaps/writes. Dashed lines show the normalized theoretical worst-case growth model.
              </p>
            </div>
            <div className="h-[340px] w-full" role="img" aria-label="Line chart of measured and theoretical operations by input size">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 24, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
                  <XAxis dataKey="size" type="number" scale="linear" domain={[10, 500]}
                    ticks={BENCHMARK_SIZES} tick={{ fill: '#57534e', fontSize: 12 }}
                    label={{ value: 'Input size (n)', position: 'insideBottom', offset: -4, fill: '#57534e' }} />
                  <YAxis tick={{ fill: '#57534e', fontSize: 12 }} width={72}
                    label={{ value: 'Operations', angle: -90, position: 'insideLeft', fill: '#57534e' }} />
                  <Tooltip formatter={(value, name) => [Number(value).toLocaleString(), name]}
                    labelFormatter={(size) => `Input size: ${size}`} />
                  <Legend verticalAlign="top" height={52} />
                  {results.map(({ algorithm }, index) => (
                    <Line key={`${algorithm.id}-measured`} type="monotone"
                      dataKey={`${algorithm.id}-measured`} name={`${algorithm.name} · measured`}
                      stroke={COLORS[index % COLORS.length]} strokeWidth={2.5} dot={{ r: 4 }} />
                  ))}
                  {results.map(({ algorithm }, index) => (
                    <Line key={`${algorithm.id}-theoretical`} type="monotone"
                      dataKey={`${algorithm.id}-theoretical`} name={`${algorithm.name} · ${algorithm.complexity.worst} model`}
                      stroke={COLORS[index % COLORS.length]} strokeWidth={1.5} strokeDasharray="6 4"
                      dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card p-5 space-y-3" aria-labelledby="operation-table-heading">
            <div>
              <h2 id="operation-table-heading" className="text-h3 font-semibold text-ink">Measured operations</h2>
              <p className="mt-1 text-caption text-ink-muted">Counts are computed in the benchmark engine, not elapsed runtime.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-caption">
                <thead className="border-b border-line text-micro uppercase text-ink-faint">
                  <tr>
                    <th className="py-2 pr-3">Algorithm</th>
                    <th className="py-2 pr-3">Worst case</th>
                    {BENCHMARK_SIZES.map((size) => <th key={size} className="py-2 px-2 text-right">n={size}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {results.map(({ algorithm, samples }) => (
                    <tr key={algorithm.id} className="border-b border-line last:border-0">
                      <th scope="row" className="py-3 pr-3 font-semibold text-ink">{algorithm.name}</th>
                      <td className="py-3 pr-3 font-mono text-ink-muted">{algorithm.complexity.worst}</td>
                      {samples.map((sample) => (
                        <td key={sample.size} className="py-3 px-2 text-right font-mono tabular-nums text-ink">
                          <span title={`${sample.comparisons.toLocaleString()} comparisons; ${sample.swaps.toLocaleString()} swaps/writes`}>
                            {sample.operations.toLocaleString()}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-micro text-ink-faint">
              Operations = comparisons + the engine's swaps/writes counter. Theoretical curves are scaled to the measured count at n={BENCHMARK_SIZES.at(-1)} for shape comparison.
            </p>
          </section>
        </>
      )}
    </div>
  )
}
