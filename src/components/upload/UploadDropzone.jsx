import { useRef, useState, useCallback } from 'react'
import { validateMimeType } from './MimeTypeValidator.js'
import { validateFileSize } from './FileSizeValidator.js'

// Accepts PDF, PNG, JPG, JPEG. Max 10 MB enforced here; PDF page count is
// checked asynchronously in UploadPage after the file is accepted here.
const ACCEPT_ATTR = '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg'

/**
 * Drag-and-drop + click-to-browse upload zone.
 *
 * Props:
 *   onFile(file)  — called with the validated File when the user selects one.
 *   disabled      — greys out the zone (e.g. while an upload is in progress).
 */
function UploadDropzone({ onFile, disabled = false }) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState(null)

  const processFile = useCallback(
    (file) => {
      setLocalError(null)

      const mimeResult = validateMimeType(file)
      if (!mimeResult.valid) {
        setLocalError(mimeResult.reason)
        return
      }

      const sizeResult = validateFileSize(file)
      if (!sizeResult.valid) {
        setLocalError(sizeResult.reason)
        return
      }

      onFile(file)
    },
    [onFile]
  )

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) setDragActive(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (disabled) return

      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [disabled, processFile]
  )

  // ── Input handler ──────────────────────────────────────────────────────────

  const handleInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
      // Reset so the same file can be re-selected after an error.
      e.target.value = ''
    },
    [processFile]
  )

  const handleClick = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleKeyDown = (e) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const borderClass = dragActive
    ? 'border-accent bg-accent/5'
    : localError
    ? 'border-flag-high bg-flag-high/5'
    : 'border-border hover:border-accent/50 bg-surface'

  return (
    <div>
      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
        aria-label="File upload input"
        tabIndex={-1}
      />

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Drop your file here or click to browse"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-card
          flex flex-col items-center justify-center text-center
          px-6 py-12 transition-all duration-200 select-none
          ${borderClass}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Upload icon */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-200 ${
            dragActive ? 'bg-accent/20' : 'bg-accent/10'
          }`}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M13 17V5M8 10l5-5 5 5"
              stroke="#0ABFA3"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 20h18"
              stroke="#0ABFA3"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Primary text */}
        <p className="text-sm font-semibold text-text-primary mb-1">
          {dragActive ? 'Drop your file here' : 'Drop your report here'}
        </p>
        <p className="text-sm text-text-secondary mb-4">
          or{' '}
          <span className="text-accent font-medium underline underline-offset-2">
            browse files
          </span>
        </p>

        {/* Accepted formats hint */}
        <div className="flex flex-wrap gap-2 justify-center">
          {['PDF', 'PNG', 'JPG', 'JPEG'].map((fmt) => (
            <span
              key={fmt}
              className="section-label text-text-secondary"
            >
              {fmt}
            </span>
          ))}
          <span className="section-label text-text-secondary">Max 10 MB</span>
        </div>
      </div>

      {/* Validation error */}
      {localError && (
        <p
          role="alert"
          className="mt-3 text-sm text-flag-high flex items-start gap-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="shrink-0 mt-0.5"
          >
            <circle cx="8" cy="8" r="7" stroke="#E84D4D" strokeWidth="1.4" />
            <path
              d="M8 5v3.5M8 10.5v.5"
              stroke="#E84D4D"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          {localError}
        </p>
      )}
    </div>
  )
}

export default UploadDropzone
