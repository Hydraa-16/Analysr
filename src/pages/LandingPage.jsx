import Navbar from '../components/landing/Navbar.jsx'
import HeroSection from '../components/landing/HeroSection.jsx'
import LiveActivityStrip from '../components/landing/LiveActivityStrip.jsx'
import FeatureCard from '../components/landing/FeatureCard.jsx'
import HowItWorksSection from '../components/landing/HowItWorksSection.jsx'
import CTASection from '../components/landing/CTASection.jsx'
import Footer from '../components/landing/Footer.jsx'
import Disclaimer from '../components/common/Disclaimer.jsx'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { useAuth } from '../context/AuthContext.jsx'

const FEATURES = [
  {
    title: 'Dual-language results',
    description:
      'Every finding is explained in plain English first, with the correct medical terminology shown right alongside it.',
  },
  {
    title: 'Automatic specialty detection',
    description:
      'Analysr identifies the report type — CBC, ECG, thyroid panel, and more — and switches its analysis context to match.',
  },
  {
    title: 'Private by design',
    description:
      'Your reports and profile data are protected with row-level security in the database, and never shared without your say.',
  },
]

function FeaturesSection() {
  const [headerRef, headerVisible] = useScrollReveal()

  return (
    <section id="features" className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
      <div
        ref={headerRef}
        className={`scroll-reveal ${headerVisible ? 'is-visible' : ''} mb-10 md:mb-14 max-w-lg`}
      >
        <span className="section-label font-mono">Ai analysis</span>
        <h2 className="font-display text-3xl md:text-4xl mt-4 leading-tight">
          <span className="headline-muted block">Built for clarity,</span>
          <span className="headline-strong block">not jargon.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {FEATURES.map((feature, i) => (
          <FeatureCard
            key={feature.title}
            index={i}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  )
}

function DisclaimerSection() {
  const [ref, isVisible] = useScrollReveal()

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-10">
      <div ref={ref} className={`scroll-reveal ${isVisible ? 'is-visible' : ''}`}>
        <Disclaimer variant="band" />
      </div>
    </section>
  )
}

function LandingPage() {
  const { user } = useAuth()
  // If the user is already logged in, all CTAs point to /dashboard.
  // If not, they point to /signup so they go through auth first.
  const ctaPath = user ? '/dashboard' : '/signup'

  return (
    <div className="min-h-screen bg-background">
      <Navbar ctaPath={ctaPath} />
      <HeroSection ctaPath={ctaPath} />
      <LiveActivityStrip />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection ctaPath={ctaPath} />
      <DisclaimerSection />
      <Footer />
    </div>
  )
}

export default LandingPage
