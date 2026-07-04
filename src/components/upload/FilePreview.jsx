import { useEffect, useState } from 'react'
import { getFileTypeLabel, isImage, isPdf } from './MimeTypeValidator.js'
import { formatFileSize } from './FileSizeValidator.js'

// PDF icon — displayed when the selected file is a PDF (can't thumbnail it).
function PdfIcon() {
  return (
    <div className="w-12 h-12 rounded-xl bg-flag-high/10 flex items-center justify-center shrink-0">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <rect x="3" y="1" width="13" height="18" rx="2" stroke="#E84D4D" strokeWidth="1.5" />
        <path d="M3 6h13" stroke="#E84D4D" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M7 10h8M7 13h5"
          stroke="#E84D4D"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path d="M16 4l3 3-3 3" stroke="#E84D4D" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// Image thumbnail — loads the file as an object URL and displays it.
function ImageThumb({ file }) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  if (!src) {
    return (
      <div className="w-12 h-12 rounded-xl bg-border animate-pulse shrink-0" />
    )
  }

  return (
    <img
      src={src}
      alt="Preview"
      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-border"
    />
  )
}

/**
 * Displays a summary card for the selected file:
 * thumbnail (or PDF icon), filename, type, size, page count.
 *
 * Props:
 *   file       — the File object
 *   pageCount  — number of PDF pages (0 if not a PDF or not yet counted)
 *   warning    — optional warning string (e.g. low image resolution)
 *   onRemove() — called when the user clicks the × to deselect the file
 */
function FilePreview({ file, pageCount = 0, warning = null, onRemove }) {
  if (!file) return null

  const label = getFileTypeLabel(file)
  const size = formatFileSize(file.size)

  // Truncate very long filenames for display
  const displayName =
    file.name.length > 48 ? file.name.slice(0, 45) + '…' : file.name

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-surface border border-border rounded-card px-4 py-3 flex items-center gap-4">
        {/* Thumbnail / icon */}
        {isImage(file) ? (
          <ImageThumb file={file} />
        ) : (
          <PdfIcon />
        )}

        {/* File metadata */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate" title={file.name}>
            {displayName}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {label} · {size}
            {isPdf(file) && pageCount > 0 && ` · ${pageCount} page${pageCount !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove file"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-flag-high hover:bg-flag-high/10 transition-colors duration-150"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M2 2l10 10M12 2L2 12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Low-quality warning (non-blocking) */}
      {warning && (
        <div className="flex items-start gap-2 bg-flag-borderline/10 border border-flag-borderline/30 rounded-card px-4 py-3">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            aria-hidden="true"
            className="shrink-0 mt-0.5"
          >
            <path
              d="M7.5 1.5L13.5 13H1.5L7.5 1.5Z"
              stroke="#F5A623"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M7.5 6v3M7.5 10.5v.5"
              stroke="#F5A623"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-xs text-flag-borderline leading-relaxed">{warning}</p>
        </div>
      )}
    </div>
  )
}

export default FilePreview
