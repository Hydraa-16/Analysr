// aiService.js — frontend service for triggering AI analysis.
// Converts the uploaded file to base64, attaches optional profile context,
// and POSTs to the /api/analyse serverless function.
// Never calls Gemini directly — API key lives only in api/analyse.js.
//
// To switch AI provider in future: change api/analyse.js only.
// This file is provider-agnostic.

import { serverlessPost, ApiError } from '../components/common/ServerlessApiClient.jsx'

/**
 * Read a File object and return its base64 data string (without the data URL prefix).
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // reader.result is "data:<mimeType>;base64,<data>"
      // We only want the base64 portion after the comma
      const base64 = reader.result.split(',')[1]
      if (!base64) {
        reject(new Error('FileReader returned empty result'))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Normalise a File's MIME type to the subset Gemini accepts.
 * Handles edge cases like 'image/jpg' → 'image/jpeg'.
 * @param {File} file
 * @returns {string}
 */
function normaliseMimeType(file) {
  const raw = file.type || ''
  if (raw === 'image/jpg') return 'image/jpeg'
  return raw
}

/**
 * Run AI analysis on a medical report file.
 *
 * @param {File}   file    - The uploaded PDF or image file
 * @param {string} notes   - Optional context notes from the user
 * @param {object|null} profile - User profile from ProfileContext (passed silently)
 *
 * @returns {Promise<object>} - Validated Gemini JSON response (per the locked schema)
 * @throws {ApiError}         - Typed error from ServerlessApiClient
 */
export async function analyseReport(file, notes = '', profile = null) {
  if (!file) {
    throw new ApiError('No file provided for analysis', 'NO_FILE', null)
  }

  // Convert to base64 for transmission to serverless function
  const base64Data = await fileToBase64(file)
  const mimeType = normaliseMimeType(file)

  const payload = {
    base64Data,
    mimeType,
    notes: notes.trim(),
    profile,
  }

  // POST to serverless function — throws ApiError on any failure
  const response = await serverlessPost('/api/analyse', payload)

  // Serverless function wraps successful data in { success: true, data: {...} }
  if (!response.data) {
    throw new ApiError('Invalid response shape from analysis server', 'INVALID_RESPONSE', null)
  }

  return response.data
}
