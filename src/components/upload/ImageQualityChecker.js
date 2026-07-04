// Checks that an uploaded image meets minimum quality requirements so that
// Gemini Vision can read the content reliably. Warns (but does not block)
// when an image is very low resolution — the user may still proceed.

const MIN_WIDTH = 400
const MIN_HEIGHT = 400

/**
 * Loads an image File via a temporary object URL and inspects its natural
 * dimensions. Resolves to a quality report object.
 *
 * @param {File} file  Must be an image (caller responsible for type check).
 * @returns {Promise<{
 *   width: number,
 *   height: number,
 *   acceptable: boolean,
 *   warning: string | null
 * }>}
 */
export function checkImageQuality(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = img
      URL.revokeObjectURL(url)

      const tooSmall = width < MIN_WIDTH || height < MIN_HEIGHT

      resolve({
        width,
        height,
        acceptable: !tooSmall,
        warning: tooSmall
          ? `Image resolution is low (${width}×${height}px). For best results, use a scan or photo of at least ${MIN_WIDTH}×${MIN_HEIGHT}px. You can still proceed, but results may be less accurate.`
          : null,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      // Could not load — allow upload and let the backend attempt processing.
      resolve({ width: 0, height: 0, acceptable: true, warning: null })
    }

    img.src = url
  })
}
