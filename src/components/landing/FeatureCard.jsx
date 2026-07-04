import { useScrollReveal } from '../../hooks/useScrollReveal'

function FeatureCard({ index, title, description }) {
  const [ref, isVisible] = useScrollReveal()

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isVisible ? 'is-visible' : ''} bg-surface border border-border rounded-card p-6 md:p-7`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <span className="font-mono text-sm text-accent">[{String(index + 1).padStart(2, '0')}]</span>
      <h3 className="font-display text-xl font-semibold text-text-primary mt-3">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed mt-2">{description}</p>
    </div>
  )
}

export default FeatureCard
