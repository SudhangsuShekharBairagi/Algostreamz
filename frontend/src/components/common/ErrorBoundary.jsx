import { Component } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../config/siteLinks'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Page rendering failed.', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="card mx-auto my-8 max-w-2xl space-y-4 p-8" role="alert">
          <h1 className="text-h2 font-display font-semibold text-ink">This page could not be displayed</h1>
          <p className="text-body text-ink-muted">
            An unexpected error interrupted this page. You can retry or return to the home page.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="btn-ghost min-h-10 border border-line px-4 text-caption font-semibold text-ink focus-ring"
            >
              Try again
            </button>
            <Link to={ROUTES.HOME} className="btn-primary inline-flex min-h-10 items-center px-4 text-caption focus-ring">
              Go home
            </Link>
          </div>
        </section>
      )
    }

    return this.props.children
  }
}
