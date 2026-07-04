import { useScrollReveal } from '../../hooks/useScrollReveal'

const STEPS = [
  {
    title: 'Upload your report',
    description: 'A PDF or a clear photo works — blood work, ECGs, thyroid panels, scans, and more.',
  },
  {
    title: 'AI detects the report type',
    description:
      'Analysr identifies what kind of report it is, then switches to the right specialty context automatically.',
  },
  {
    title: 'Get a simple-English breakdown',
    description:
      'Every finding is explained in simple language first, with the correct medical terminology shown alongside.',
  },
  {
    title: 'Keep it, or share it',
    description: 'Your analysis is saved securely and can be downloaded as a PDF whenever you need it.',
  },
]

function Step({ index, title, description }) {
  const [ref, isVisible] = useScrollReveal()

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isVisible ? 'is-visible' : ''} flex gap-4`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-nav-bg text-white text-sm font-mono flex items-center justify-center">
        {index + 1}
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed mt-1.5 max-w-md">{description}</p>
      </div>
    </div>
  )
}

function HowItWorksSection() {
  const [headerRef, headerVisible] = useScrollReveal()

  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
      <div ref={headerRef} className={`scroll-reveal ${headerVisible ? 'is-visible' : ''} mb-12 md:mb-14`}>
        <span className="section-label font-mono">How it works</span>
        <h2 className="font-display text-3xl md:text-4xl mt-4 leading-tight">
          <span className="headline-muted block">From report</span>
          <span className="headline-strong block">to understanding.</span>
        </h2>
      </div>

      <div className="flex flex-col gap-8 md:gap-10 md:max-w-2xl">
        {STEPS.map((step, i) => (
          <Step key={step.title} index={i} title={step.title} description={step.description} />
        ))}
      </div>
    </section>
  )
}

export default HowItWorksSection
