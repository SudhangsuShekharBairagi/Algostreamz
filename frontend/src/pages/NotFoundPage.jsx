import { Link } from 'react-router-dom'
import { FileQuestion, ArrowLeft } from 'lucide-react'
import { ROUTES, LABELS } from '../config/siteLinks'

export default function NotFoundPage() {
  return (
    <div className="card p-12 text-center space-y-6 my-12 max-w-[540px] mx-auto">
      <div className="w-16 h-16 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
        <FileQuestion className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-h1 font-display font-semibold text-ink">
          404 - Page Not Found
        </h1>
        <p className="text-body text-ink-muted text-pretty">
          The requested route does not exist or has been relocated within the {LABELS.SITE_NAME} algorithm workbench.
        </p>
      </div>

      <div className="pt-2">
        <Link
          to={ROUTES.HOME}
          className="btn-primary inline-flex items-center gap-2 text-caption focus-ring"
        >
          <ArrowLeft className="w-4 h-4" />
          {LABELS.BACK_TO_HOME}
        </Link>
      </div>
    </div>
  )
}
