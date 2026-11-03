import { useEffect, useRef, useState } from 'react'
import { Check, ChevronRight, Clipboard, Code } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

/**
 * Editorial Pseudocode Panel Component.
 * Displays step-synchronized algorithm pseudocode with line gutter, active highlight, and smooth internal scroll.
 *
 * @param {Object} props
 * @param {Array<{line: number, indent: number, text: string}>} [props.pseudocode=[]] - Pseudocode lines array
 * @param {number} [props.activeLine=1] - 1-based line number of current execution step
 * @param {'card' | 'flat'} [props.variant='card'] - Container variant ('card' for standard, 'flat' for Zen)
 */
export default function PseudocodePanel({
  pseudocode = [],
  activeLine = 1,
  variant = 'card',
  codeSnippets,
}) {
  const isFlat = variant === 'flat'
  const scrollContainerRef = useRef(null)
  const activeLineRef = useRef(null)
  const [language, setLanguage] = useState('java')
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  // Scroll active line into view inside container without triggering window layout shifts
  useEffect(() => {
    if (scrollContainerRef.current && activeLineRef.current) {
      try {
        const container = scrollContainerRef.current
        const activeEl = activeLineRef.current
        const containerHeight = container.clientHeight
        const activeTop = activeEl.offsetTop
        const activeHeight = activeEl.offsetHeight

        const targetScrollTop = activeTop - containerHeight / 2 + activeHeight / 2
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: prefersReduced ? 'auto' : 'smooth',
        })
      } catch {
        // Fallback
      }
    }
  }, [activeLine])

  const containerClasses = isFlat
    ? 'p-4 bg-transparent space-y-3'
    : 'card p-4 bg-surface border border-line rounded-lg shadow-e1 space-y-3'
  const selectedSnippet = codeSnippets?.[language]
  const codeLines = selectedSnippet?.code.split('\n') ?? []
  const activeCodeLine = selectedSnippet?.lineMap?.[activeLine - 1]
  const tabLanguages = ['pseudocode', 'java', 'python', 'cpp']

  const handleTabKeyDown = (event) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const tabs = [...event.currentTarget.parentElement.querySelectorAll('[role="tab"]')]
    const currentIndex = tabs.indexOf(event.currentTarget)
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : (currentIndex + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length
    tabs[nextIndex].focus()
    setLanguage(tabs[nextIndex].dataset.language)
  }

  const handleCopyCode = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable in this browser.')
      }
      await navigator.clipboard.writeText(selectedSnippet.code)
      setCopied(true)
      showToast(`${language === 'cpp' ? 'C++' : language[0].toUpperCase() + language.slice(1)} code copied`, 'success')
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      showToast('Unable to copy the code snippet', 'error')
    }
  }

  const pseudocodeContent = (
    <div
      ref={scrollContainerRef}
      className="font-mono text-[13px] leading-[1.7] bg-code-bg p-3 rounded-lg border border-line/50 max-h-[320px] overflow-y-auto overflow-x-auto select-text"
    >
      {pseudocode.map((item) => {
        const { line, indent = 0, text } = item
        const isActive = line === activeLine
        const indentPadding = `${indent * 1.25}rem`

        return (
          <div
            key={`pseudocode-line-${line}`}
            ref={isActive ? activeLineRef : null}
            aria-current={isActive ? 'step' : undefined}
            className={`flex items-center py-0.5 px-2 rounded text-[13px] leading-[1.7] transition-colors duration-fast ${
              isActive
                ? 'bg-accent-soft border-l-4 border-accent text-ink font-medium shadow-e1'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <span className="w-6 text-right text-ink-faint font-mono text-xs tabular-nums border-r border-line pr-3 mr-3 select-none shrink-0">
              {line}
            </span>
            <div className="w-4 flex items-center justify-center shrink-0">
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-accent animate-pulse" />}
            </div>
            <span style={{ paddingLeft: indentPadding }} className="whitespace-pre flex-1">
              {text}
            </span>
          </div>
        )
      })}
    </div>
  )

  const sourceContent = (
    <pre className="max-h-[320px] overflow-auto rounded-lg border border-line/50 bg-code-bg p-3 font-mono text-xs leading-[1.7] text-console-text select-text">
      <code>
        {codeLines.map((text, index) => {
          const line = index + 1
          const isActive = line === activeCodeLine
          return (
            <span
              key={`${language}-code-line-${line}`}
              aria-current={isActive ? 'step' : undefined}
              className={`block whitespace-pre px-2 rounded ${
                isActive ? 'bg-code-line-active text-ink font-medium' : 'text-console-text'
              }`}
            >
              <span className="mr-3 inline-block w-6 select-none text-right text-ink-faint">{line}</span>
              {text || ' '}
            </span>
          )
        })}
      </code>
    </pre>
  )

  return (
    <div className={containerClasses}>
      {codeSnippets && !isFlat ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
            <div className="flex min-w-0 flex-wrap items-center gap-1" role="tablist" aria-label="Algorithm code">
              {tabLanguages.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  id={`algorithm-code-tab-${option}`}
                  data-language={option}
                  aria-selected={language === option}
                  aria-controls="algorithm-code-panel"
                  tabIndex={language === option ? 0 : -1}
                  onClick={() => setLanguage(option)}
                  onKeyDown={handleTabKeyDown}
                  className={`rounded px-2.5 py-1.5 text-xs font-medium focus-ring ${
                    language === option ? 'bg-accent-soft text-ink' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {option === 'pseudocode'
                    ? 'Pseudocode'
                    : option === 'cpp'
                      ? 'C++'
                      : option[0].toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
            {language !== 'pseudocode' && (
              <button
                type="button"
                onClick={handleCopyCode}
                className="btn-ghost inline-flex shrink-0 items-center gap-1.5 rounded px-2 py-1 text-xs text-ink-muted hover:text-ink focus-ring"
                aria-label={`Copy ${language === 'cpp' ? 'C++' : language} code`}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy code'}
              </button>
            )}
          </div>
          <section
            id="algorithm-code-panel"
            role="tabpanel"
            aria-labelledby={`algorithm-code-tab-${language}`}
            className="min-w-0"
          >
            {language === 'pseudocode' ? pseudocodeContent : sourceContent}
          </section>
        </>
      ) : (
        <>
          {!isFlat && (
            <div className="flex items-center gap-2 border-b border-line pb-2.5">
              <Code className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-body text-ink">Pseudocode</h3>
            </div>
          )}
          <div className={codeSnippets ? 'grid grid-cols-1 2xl:grid-cols-2 gap-4' : ''}>
            {pseudocodeContent}
            {codeSnippets && (
              <section className="min-w-0 rounded-lg border border-line/50 bg-sunken/60 overflow-hidden" aria-label="Source code">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 px-3 py-2">
                  <div className="flex items-center gap-1" role="tablist" aria-label="Code language">
                    {['java', 'python', 'cpp'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        role="tab"
                        aria-selected={language === option}
                        onClick={() => setLanguage(option)}
                        className={`rounded px-2.5 py-1 text-xs font-medium focus-ring ${
                          language === option ? 'bg-accent-soft text-ink' : 'text-ink-muted hover:text-ink'
                        }`}
                      >
                        {option === 'cpp' ? 'C++' : option[0].toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="btn-ghost inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-ink-muted hover:text-ink focus-ring"
                    aria-label={`Copy ${language === 'cpp' ? 'C++' : language} code`}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
                    {copied ? 'Copied' : 'Copy code'}
                  </button>
                </div>
                {sourceContent}
              </section>
            )}
          </div>
        </>
      )}
    </div>
  )
}
