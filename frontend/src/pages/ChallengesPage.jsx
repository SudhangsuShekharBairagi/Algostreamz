import { useMemo, useState } from 'react'
import { Award, CheckCircle2, ChevronRight, RotateCcw, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { generateChallengeQuestions } from '../engine/challengeQuestions'
import progressApi from '../services/progressApi'
import { errorMessage } from '../services/api'

export default function ChallengesPage() {
  const { isAuthenticated } = useAuth()
  const [questions, setQuestions] = useState(generateChallengeQuestions)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const question = questions[questionIndex]
  const answerId = answers[question.id]
  const isCorrect = answerId === question.answerId
  const score = useMemo(
    () => questions.reduce((total, item) => total + (answers[item.id] === item.answerId ? 1 : 0), 0),
    [answers, questions],
  )
  const masteredQuestionIds = questions
    .filter((item) => answers[item.id] === item.answerId)
    .map((item) => item.id)

  const finishQuiz = async () => {
    setShowResults(true)
    setSubmitError('')
    if (!isAuthenticated || masteredQuestionIds.length === 0) return

    setSubmitting(true)
    try {
      await Promise.all(masteredQuestionIds.map((challengeId) => progressApi.completeChallenge(challengeId)))
      setSubmitted(true)
    } catch (error) {
      setSubmitError(errorMessage(error, 'Unable to submit your results. You can retry below.'))
    } finally {
      setSubmitting(false)
    }
  }

  const restartQuiz = () => {
    setQuestions(generateChallengeQuestions())
    setQuestionIndex(0)
    setAnswers({})
    setShowResults(false)
    setSubmitError('')
    setSubmitted(false)
  }

  if (showResults) {
    return (
      <div className="space-y-6">
        <header>
          <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">Practice &amp; Quizzes</span>
          <h1 className="text-h1 font-display font-semibold text-ink mt-2">Quiz results</h1>
          <p className="text-body text-ink-muted mt-1">Review your score and the concepts you practiced.</p>
        </header>

        <section className="card p-6 md:p-8 space-y-5" aria-labelledby="score-heading">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-micro font-bold uppercase tracking-wider text-ink-faint">Your score</p>
              <h2 id="score-heading" className="font-mono text-display-xl font-bold text-ink tabular-nums">
                {score} <span className="text-ink-faint">/ {questions.length}</span>
              </h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Award className="h-7 w-7" />
            </div>
          </div>

          {isAuthenticated && masteredQuestionIds.length > 0 && (
            <div role="status" className="border-t border-line pt-4 text-caption text-ink-muted">
              {submitting ? 'Submitting mastered challenges…' : submitted
                ? 'Your mastered challenges were saved to your account.'
                : submitError || 'Your mastered challenges are ready to submit.'}
              {submitError && (
                <button
                  type="button"
                  onClick={finishQuiz}
                  disabled={submitting}
                  className="ml-2 font-semibold text-accent underline focus-ring"
                >
                  Retry
                </button>
              )}
            </div>
          )}
          {!isAuthenticated && (
            <p className="border-t border-line pt-4 text-caption text-ink-muted" role="status">
              Sign in to save correctly answered challenges to your progress.
            </p>
          )}

          <div className="space-y-3 border-t border-line pt-4">
            {questions.map((item, index) => {
              const correct = answers[item.id] === item.answerId
              return (
                <div key={item.id} className="flex items-start gap-3">
                  {correct
                    ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-state-sorted" aria-label="Correct" />
                    : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-state-swap" aria-label="Incorrect" />}
                  <p className="text-caption text-ink">
                    <span className="font-semibold">{index + 1}. {item.type}:</span> {item.explanation}
                  </p>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={restartQuiz}
            className="btn-primary inline-flex min-h-11 items-center gap-2 rounded-md px-4 font-semibold focus-ring"
          >
            <RotateCcw className="h-4 w-4" />
            Try another quiz
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">
          Practice &amp; Quizzes
        </span>
        <h1 className="text-h1 font-display font-semibold text-ink mt-2">
          Algorithm Challenges &amp; Quizzes
        </h1>
        <p className="text-body text-ink-muted text-pretty max-w-[68ch] mt-1">
          Use live algorithm traces and catalog data to predict steps, identify complexity, read pseudocode, and compare input cases.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-h3 font-semibold text-ink">{question.type}</h2>
          <p className="text-caption text-ink-muted">{question.algorithm.name}</p>
        </div>
        <span className="chip font-mono text-caption tabular-nums">Question {questionIndex + 1} / {questions.length}</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-sunken" aria-label="Quiz progress">
        <div className="h-full bg-accent transition-all" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
      </div>

      <section className="card p-5 md:p-7 space-y-5" aria-labelledby="question-heading">
        <div className="space-y-3">
          <h3 id="question-heading" className="text-h3 font-display font-semibold text-ink">
            {question.prompt}
          </h3>
          <p className="rounded-md bg-sunken p-4 text-caption text-ink-muted leading-relaxed">
            {question.context}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3" role="group" aria-label="Answer choices">
          {question.options.map((option, index) => {
            const chosen = answerId === option.id
            const isAnswer = question.answerId === option.id
            const tone = answerId && isAnswer
              ? 'border-state-sorted bg-emerald-50 text-ink'
              : answerId && chosen
                ? 'border-state-swap bg-rose-50 text-ink'
                : 'border-line bg-surface text-ink hover:border-accent/60'
            return (
              <button
                key={option.id}
                type="button"
                disabled={Boolean(answerId)}
                onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                className={`flex min-h-12 items-start gap-3 rounded-md border p-3 text-left text-caption focus-ring disabled:cursor-default ${tone}`}
              >
                <span className="font-mono font-bold text-ink-faint">{String.fromCharCode(65 + index)}.</span>
                <span className="min-w-0 break-words">{option.label}</span>
              </button>
            )
          })}
        </div>

        {answerId && (
          <div
            className={`rounded-md border p-4 ${isCorrect ? 'border-state-sorted bg-emerald-50' : 'border-state-swap bg-rose-50'}`}
            role="status"
            aria-live="polite"
          >
            <p className="font-semibold text-ink">
              {isCorrect ? 'Correct!' : 'Not quite.'}
            </p>
            <p className="mt-1 text-caption text-ink-muted">{question.explanation}</p>
          </div>
        )}

        {answerId && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (questionIndex === questions.length - 1) {
                  void finishQuiz()
                } else {
                  setQuestionIndex((index) => index + 1)
                }
              }}
              className="btn-primary inline-flex min-h-11 items-center gap-2 rounded-md px-4 font-semibold focus-ring"
            >
              {questionIndex === questions.length - 1 ? 'View score' : 'Next question'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      <p className="text-caption text-ink-muted" aria-live="polite">
        Current score: <strong className="font-mono text-ink">{score} / {questionIndex + (answerId ? 1 : 0)}</strong>
      </p>
    </div>
  )
}
