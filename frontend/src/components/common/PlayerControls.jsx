export default function PlayerControls({ onNext, onPrev, onReset, playing, onTogglePlay }) {
  return (
    <div className="flex gap-2">
      <button onClick={onPrev}>⏮</button>
      <button onClick={onTogglePlay}>{playing ? '⏸' : '▶'}</button>
      <button onClick={onNext}>⏭</button>
      <button onClick={onReset}>⟳</button>
    </div>
  )
}
