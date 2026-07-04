import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-nav-bg text-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-xs">
            <Link to="/" className="font-display text-xl font-semibold">
              Analysr
            </Link>
            <p className="text-sm text-white/60 mt-3 leading-relaxed">
              Simple-English breakdowns of your medical reports, free to use.
            </p>
          </div>

          <div className="flex gap-10">
            <div className="flex flex-col gap-2.5">
              <span className="text-label uppercase text-white/40 font-mono mb-1">
                Product
              </span>
              <a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-white/70 hover:text-white transition-colors">
                How it works
              </a>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-label uppercase text-white/40 font-mono mb-1">
                Account
              </span>
              <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="text-sm text-white/70 hover:text-white transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-9 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} Analysr. Not a substitute for professional medical advice.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
