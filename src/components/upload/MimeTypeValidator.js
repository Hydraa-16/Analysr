// Validates that an uploaded file is one of the four accepted types:
// PDF, PNG, JPG, JPEG. Checks both the MIME type and file extension
// as a defence-in-depth measure against renamed/spoofed files.

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg', // covers both .jpg and .jpeg
])

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg'])

/**
 * Returns { valid: true } if the file passes MIME + extension checks,
 * or { valid: false, reason: string } with a user-facing error message.
 *
 * @param {File} file
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateMimeType(file) {
  if (!file) {
    return { valid: false, reason: 'No file provided.' }
  }

  const ext = '.' + file.name.split('.').pop().toLowerCase()

  const mimeOk = ALLOWED_MIME_TYPES.has(file.type)
  const extOk = ALLOWED_EXTENSIONS.has(ext)

  if (!mimeOk || !extOk) {
    return {
      valid: false,
      reason: `Unsupported file type. Please upload a PDF, PNG, JPG, or JPEG.`,
    }
  }

  return { valid: true }
}

/**
 * Returns a display-friendly label for the file type.
 * @param {File} file
 * @returns {string}
 */
export function getFileTypeLabel(file) {
  if (!file) return 'Unknown'
  if (file.type === 'application/pdf') return 'PDF'
  if (file.type === 'image/png') return 'PNG'
  if (file.type === 'image/jpeg') return 'JPEG'
  return file.name.split('.').pop().toUpperCase()
}

/**
 * Returns true if the file is a PDF.
 * @param {File} file
 * @returns {boolean}
 */
export function isPdf(file) {
  return file?.type === 'application/pdf'
}

/**
 * Returns true if the file is an image (PNG / JPG).
 * @param {File} file
 * @returns {boolean}
 */
export function isImage(file) {
  return file?.type === 'image/png' || file?.type === 'image/jpeg'
}
