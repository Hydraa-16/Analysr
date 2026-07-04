// ServerlessApiClient — shared HTTP utility for calling Vercel serverless functions.
// Used by aiService.js. Handles JSON serialisation, error normalisation,
// and surfaces quota / server errors as typed error objects.

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message)
    this.name = 'ApiError'
    this.code = code       // e.g. 'QUOTA_EXCEEDED', 'ANALYSIS_FAILED', 'NETWORK_ERROR'
    this.status = status   // HTTP status or null for network failures
  }
}

/**
 * POST JSON to a Vercel serverless endpoint.
 *
 * @param {string} endpoint  - e.g. '/api/analyse'
 * @param {object} payload   - JSON-serialisable body
 * @returns {Promise<object>} - parsed response body on success
 * @throws {ApiError}         - typed error on any failure
 */
export async function serverlessPost(endpoint, payload) {
  let response

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (networkError) {
    throw new ApiError(
      'Network request failed. Check your internet connection.',
      'NETWORK_ERROR',
      null
    )
  }

  let json
  try {
    json = await response.json()
  } catch {
    throw new ApiError(
      `Server returned an unreadable response (${response.status})`,
      'PARSE_ERROR',
      response.status
    )
  }

  if (!response.ok) {
    const code = json?.error || 'SERVER_ERROR'
    const message =
      json?.message || `Request failed with status ${response.status}`
    throw new ApiError(message, code, response.status)
  }

  return json
}
