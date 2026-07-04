// SectionToggle — small show/hide control for the medical terminology block.
// Plain language stays visible by default (primary); this lets users reveal
// the clinical detail below it without it visually competing for attention.

import { useState } from 'react'

function SectionToggle({ children, label = 'Show medical terminology' }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs font-medium text-accent hover:opacity-80 transition-opacity"
        aria-expanded={open}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          aria-hidden="true"
        >
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {open ? 'Hide medical terminology' : label}
      </button>

      {open && <div className="mt-2">{children}</div>}
    </div>
  )
}

export default SectionToggle
