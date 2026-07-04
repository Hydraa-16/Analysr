import { Link } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'

function CTASection({ ctaPath = '/signup' }) {
  const [ref, isVisible] = useScrollReveal()

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-12">
      <div
        ref={ref}
        className={`scroll-reveal ${isVisible ? 'is-visible' : ''} bg-surface border border-border rounded-card px-6 py-12 md:px-16 md:py-16 text-center`}
      >
        <h2 className="font-display text-3xl md:text-4xl leading-tight">
          <span className="headline-muted block">Stop guessing what</span>
          <span className="headline-strong block">your report means.</span>
        </h2>

        <p className="mt-5 text-base text-text-secondary max-w-md mx-auto">
          Upload your first report and see it broken down in simple English, free.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={ctaPath}
            className="btn-hover w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-nav-bg text-white text-sm font-medium px-6 py-3.5"
          >
            Analyse a report
          </Link>
          <a
            href="#features"
            className="btn-hover w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border text-text-primary text-sm font-medium px-6 py-3.5"
          >
            Learn more
          </a>
        </div>
      </div>
    </section>
  )
}

export default CTASection