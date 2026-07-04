// Validates file size (max 10 MB) and, for PDFs, page count (max 10 pages).
// Page count is read by parsing the raw PDF bytes for the /Type /Page pattern —
// no external library needed for this lightweight check.

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_PDF_PAGES = 10

/**
 * Validates that the file does not exceed 10 MB.
 * Returns { valid: true } or { valid: false, reason: string }.
 *
 * @param {File} file
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateFileSize(file) {
  if (!file) return { valid: false, reason: 'No file provided.' }

  if (file.size > MAX_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      reason: `File is too large (${sizeMB} MB). Maximum allowed size is 10 MB.`,
    }
  }

  return { valid: true }
}

/**
 * Reads a PDF File and counts its pages by scanning for page-count markers.
 * Resolves to { valid: true, pageCount } or { valid: false, reason, pageCount }.
 * This is intentionally async — FileReader is callback-based.
 *
 * @param {File} file  Must be a PDF (caller is responsible for type check).
 * @returns {Promise<{ valid: boolean, pageCount: number, reason?: string }>}
 */
export function validatePdfPageCount(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = new Uint8Array(e.target.result)

        // Convert first 64 KB of the PDF to a string for the pattern match.
        // Full PDFs can be large; the page count header is always near the start.
        const sample = new TextDecoder('latin1').decode(text.slice(0, 65536))

        // Look for /Count N in the Pages dictionary — the canonical page count.
        const match = sample.match(/\/Count\s+(\d+)/)
        const pageCount = match ? parseInt(match[1], 10) : null

        if (pageCount === null) {
          // Could not determine page count — allow upload and let Gemini handle it.
          resolve({ valid: true, pageCount: 0 })
          return
        }

        if (pageCount > MAX_PDF_PAGES) {
          resolve({
            valid: false,
            pageCount,
            reason: `PDF has ${pageCount} pages. Maximum allowed is ${MAX_PDF_PAGES} pages. Please upload an extract or the relevant pages only.`,
          })
          return
        }

        resolve({ valid: true, pageCount })
      } catch {
        // Parsing failed — allow upload rather than blocking on a false negative.
        resolve({ valid: true, pageCount: 0 })
      }
    }

    reader.onerror = () => {
      // File couldn't be read — allow upload; Gemini will handle malformed input.
      resolve({ valid: true, pageCount: 0 })
    }

    // Read only the first 64 KB — enough to find the page count.
    reader.readAsArrayBuffer(file.slice(0, 65536))
  })
}

/**
 * Returns a human-readable file size string (e.g. "3.2 MB", "450 KB").
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  return `${bytes} B`
}
