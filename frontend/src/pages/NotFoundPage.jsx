import { Link } from 'react-router-dom'
import { FileQuestion, ArrowLeft } from 'lucide-react'
import { ROUTES, LABELS } from '../config/siteLinks'

export default function NotFoundPage({
  title = '404 - Page Not Found',
  message = `The requested route does not exist or has been relocated within the ${LABELS.SITE_NAME} algorithm workbench.`,
}) {
  return (
    <div className="card p-12 text-center space-y-6 my-12 max-w-[540px] mx-auto">
      <div className="w-16 h-16 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
        <FileQuestion className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-h1 font-display font-semibold text-ink">
          {title}
        </h1>
        <p className="text-body text-ink-muted text-pretty">
          {message}
        </p>
      </div>

      <div className="pt-2">
        <div className="flex flex-wrap justify-center gap-3">
          <Link to={ROUTES.HOME} className="btn-primary inline-flex items-center gap-2 text-caption focus-ring">
            <ArrowLeft className="w-4 h-4" />
            {LABELS.BACK_TO_HOME}
          </Link>
          <Link to={ROUTES.ALGORITHMS} className="btn-ghost inline-flex items-center gap-2 border border-line px-4 text-caption focus-ring">
            Browse algorithms
          </Link>
        </div>
      </div>
    </div>
  )
}
