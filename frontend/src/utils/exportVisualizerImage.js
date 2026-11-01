const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 800

const BAR_COLORS = {
  comparing: '#f59e0b',
  swapping: '#ef4444',
  sorted: '#10b981',
  match: '#10b981',
  pivot: '#8b5cf6',
  eliminated: '#cbd5e1',
}

export async function exportVisualizerImage({ algorithmName, values, highlightedIndices = {} }) {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas image export is unavailable in this browser.')

  context.fillStyle = '#f8fafc'
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  context.fillStyle = '#111827'
  context.font = '600 36px sans-serif'
  context.fillText(algorithmName, 72, 88)
  context.fillStyle = '#64748b'
  context.font = '18px sans-serif'
  context.fillText('Algostreamz · Current visualization step', 72, 126)

  if (!values.length) {
    context.fillStyle = '#64748b'
    context.font = '24px sans-serif'
    context.fillText('No values in this visualization step.', 72, 400)
  } else {
    const maxMagnitude = Math.max(...values.map(Math.abs), 1)
    const chart = { left: 72, right: 1128, top: 190, bottom: 650 }
    const slotWidth = (chart.right - chart.left) / values.length
    const barWidth = Math.max(4, Math.min(72, slotWidth * 0.68))
    const zeroY = chart.top + (chart.bottom - chart.top) * 0.78
    const maxBarHeight = chart.bottom - chart.top
    values.forEach((value, index) => {
      const state = highlightedIndices[index] || 'default'
      const height = Math.max(8, (Math.abs(value) / maxMagnitude) * maxBarHeight)
      const x = chart.left + slotWidth * index + (slotWidth - barWidth) / 2
      const y = value < 0 ? zeroY : zeroY - height
      context.fillStyle = BAR_COLORS[state] || '#6366f1'
      context.fillRect(x, y, barWidth, height)
      context.fillStyle = '#111827'
      context.textAlign = 'center'
      context.font = '600 18px monospace'
      context.fillText(String(value), x + barWidth / 2, value < 0 ? y + height + 26 : y - 12)
      context.fillStyle = '#64748b'
      context.font = '14px monospace'
      context.fillText(`[${index}]`, x + barWidth / 2, 700)
    })
  }

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result)
      else reject(new Error('The visualizer image could not be encoded.'))
    }, 'image/png')
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${algorithmName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'visualizer'}.png`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
