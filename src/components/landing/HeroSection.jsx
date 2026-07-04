import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const PREVIEW_ROWS = [
  { parameter: 'Haemoglobin', value: '13.8 g/dL', range: '13.0 – 17.0', status: 'Normal' },
  { parameter: 'WBC Count', value: '11.2 x10⁹/L', range: '4.0 – 11.0', status: 'High' },
  { parameter: 'Platelets', value: '250 x10⁹/L', range: '150 – 410', status: 'Normal' },
]

const STATUS_STYLES = {
  Normal: 'bg-flag-normal/10 text-flag-normal',
  High: 'bg-flag-high/10 text-flag-high',
  Low: 'bg-flag-borderline/10 text-flag-borderline',
}

function ReportPreviewCard() {
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setResolved(true), 650)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="bg-surface border border-border rounded-card p-5 md:p-6 w-full max-w-sm shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="section-label font-mono">CBC · HAEMATOLOGY</span>
        <span className="text-xs font-mono text-text-secondary">Just now</span>
      </div>

      <div
        className="flex flex-col gap-3"
        style={{
          filter: resolved ? 'blur(0)' : 'blur(6px)',
          opacity: resolved ? 1 : 0.5,
          transition: 'filter 0.9s ease-out, opacity 0.9s ease-out',
        }}
      >
        {PREVIEW_ROWS.map((row) => (
          <div key={row.parameter} className="flex items-center justify-between text-sm">
            <div>
              <p className="text-text-primary font-medium">{row.parameter}</p>
              <p className="text-text-secondary text-xs">Normal range {row.range}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-text-primary">{row.value}</span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[row.status]}`}
              >
                {row.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-secondary mt-4 pt-4 border-t border-border">
        Simple English first. Medical terms alongside.
      </p>
    </div>
  )
}

function HeroSection({ ctaPath = '/signup' }) {
  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-16 md:pb-24">
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-10">
        <div className="flex-1 text-center md:text-left">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1]">
            <span className="headline-enter-1 headline-muted block">Your test results,</span>
            <span className="headline-enter-2 headline-strong block">explained clearly.</span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-text-secondary max-w-md mx-auto md:mx-0">
            Upload a medical report and Analysr breaks it down in simple English
            first, with the medical terminology alongside — so you understand
            what it says before you even talk to a doctor.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-3">
            <Link
              to={ctaPath}
              className="btn-hover w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-nav-bg text-white text-sm font-medium px-6 py-3.5"
            >
              Analyse a report
            </Link>
            <a
              href="#how-it-works"
              className="btn-hover w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border text-text-primary text-sm font-medium px-6 py-3.5"
            >
              Learn more
            </a>
          </div>

          <p className="mt-5 text-xs text-text-secondary">Free to use. No credit card required.</p>
        </div>

        <div className="flex-1 flex justify-center md:justify-end w-full">
          <ReportPreviewCard />
        </div>
      </div>
    </section>
  )
}

export default HeroSection