// api/analyse.js — Vercel serverless function.
// THE ONLY place GEMINI_API_KEY is read. Never imported into frontend code.
// Called by src/services/aiService.js via POST /api/analyse.

const GEMINI_MODEL = 'gemini-2.5-flash'

// ── Fixed specialty mapping (per brief — never dynamically guessed) ─────────
const SPECIALTY_MAP = {
  CBC: 'Haematology',
  'Blood Count': 'Haematology',
  'Complete Blood Count': 'Haematology',
  ECG: 'Cardiology',
  Electrocardiogram: 'Cardiology',
  Thyroid: 'Endocrinology',
  'Thyroid Panel': 'Endocrinology',
  LFT: 'Hepatology',
  'Liver Function': 'Hepatology',
  KFT: 'Nephrology',
  'Kidney Function': 'Nephrology',
  'Renal Function': 'Nephrology',
  MRI: 'Radiology',
  'X-Ray': 'Radiology',
  'CT Scan': 'Radiology',
  Ultrasound: 'Radiology',
}

// ── Required JSON response schema ────────────────────────────────────────────
const REQUIRED_FIELDS = [
  'report_type',
  'specialty',
  'urgency',
  'parameters',
  'key_findings',
  'what_this_may_indicate',
  'next_steps',
  'sources',
]

// ── System prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt() {
  return `You are a medical report analysis assistant. Your task is to analyse medical reports and return structured JSON.

CRITICAL RULES:
1. Return ONLY valid JSON. No markdown, no code fences, no text before or after the JSON object.
2. Never diagnose. Use possibility language only: "may indicate", "could suggest", "might reflect". Never "you have", "this confirms", "you definitely".
3. Every finding must have both a plain English explanation (for someone with zero medical background) and a medical terminology version.
4. The "plain" field must be written clearly for a layperson — avoid jargon entirely.
5. The "medical" field should use correct clinical terminology.

SPECIALTY MAPPING — use ONLY these fixed mappings, never guess:
- CBC / Blood Count / Complete Blood Count → Haematology
- ECG / Electrocardiogram → Cardiology
- Thyroid / Thyroid Panel → Endocrinology
- LFT / Liver Function → Hepatology
- KFT / Kidney Function / Renal Function → Nephrology
- MRI / X-Ray / CT Scan / Ultrasound → Radiology
- If none match, set specialty to "General Medicine"

URGENCY LEVELS — pick exactly one:
- "Routine" — values within or near normal range, no immediate concern
- "Follow up soon" — some values outside range, warrants a doctor visit within days/weeks
- "Seek care promptly" — significantly abnormal values or findings requiring urgent attention

PARAMETER STATUS — use exactly one of: "Normal", "High", "Low", "Borderline"

RESPONSE SCHEMA — return exactly this shape:
{
  "report_type": "string — detected report type e.g. Complete Blood Count",
  "specialty": "string — from the fixed mapping above",
  "urgency": "string — one of: Routine | Follow up soon | Seek care promptly",
  "parameters": [
    {
      "parameter": "string — parameter name",
      "value": "string — patient value with unit",
      "normal_range": "string — reference range with unit",
      "status": "string — Normal | High | Low | Borderline",
      "medical": "string — clinical interpretation using correct medical terminology",
      "plain": "string — plain English explanation for a layperson"
    }
  ],
  "key_findings": {
    "medical": "string — summary using clinical terminology",
    "plain": "string — plain English summary of what was found"
  },
  "what_this_may_indicate": {
    "medical": "string — possible clinical implications using medical terminology, with possibility language",
    "plain": "string — plain English explanation of what the results might mean, with possibility language"
  },
  "next_steps": {
    "medical": "string — clinical recommendations",
    "plain": "string — plain English recommended actions"
  },
  "sources": ["array of strings — any medical guidelines or references you drew from, or empty array"]
}`
}

// ── Build the user message for Gemini ────────────────────────────────────────
function buildUserMessage(base64Data, mimeType, notes, profile) {
  const profileContext = profile
    ? `
PATIENT PROFILE CONTEXT (use to improve contextual accuracy of your analysis):
- Age/DOB: ${profile.date_of_birth || 'Not provided'}
- Biological sex: ${profile.biological_sex || 'Not provided'}
- Blood group: ${profile.blood_group || 'Not provided'}
- Known conditions: ${Array.isArray(profile.known_conditions) ? profile.known_conditions.join(', ') || 'None listed' : 'None listed'}
- Current medications: ${Array.isArray(profile.current_medications) ? profile.current_medications.map(m => `${m.name} ${m.dosage}`).join(', ') || 'None listed' : 'None listed'}
- Known allergies: ${Array.isArray(profile.known_allergies) ? profile.known_allergies.join(', ') || 'None listed' : 'None listed'}
- Previous surgeries: ${profile.previous_surgeries || 'None listed'}
- Family history: ${profile.family_history || 'None listed'}
- Smoking: ${profile.smoking_status || 'Not provided'}
- Alcohol: ${profile.alcohol_consumption || 'Not provided'}
- Activity level: ${profile.activity_level || 'Not provided'}
`.trim()
    : 'PATIENT PROFILE CONTEXT: Not provided.'

  const notesSection = notes
    ? `\nADDITIONAL CONTEXT FROM PATIENT: ${notes}`
    : ''

  const parts = [
    {
      text: `Please analyse the attached medical report and return your analysis as a JSON object matching the exact schema in your instructions.\n\n${profileContext}${notesSection}\n\nIMPORTANT: Return ONLY the JSON object. No preamble, no markdown fences, no text after the JSON.`,
    },
  ]

  // Attach the report file (image or PDF extracted text handled client-side)
  if (base64Data && mimeType) {
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: base64Data,
      },
    })
  }

  return parts
}

// ── Validate the parsed JSON against required schema ─────────────────────────
function validateSchema(obj) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in obj)) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  if (!Array.isArray(obj.parameters)) {
    throw new Error('parameters must be an array')
  }

  const validUrgency = ['Routine', 'Follow up soon', 'Seek care promptly']
  if (!validUrgency.includes(obj.urgency)) {
    // Coerce closest match rather than hard fail
    obj.urgency = 'Follow up soon'
  }

  // Coerce specialty via fixed map if Gemini hallucinated one
  const reportTypeLower = (obj.report_type || '').toLowerCase()
  for (const [key, value] of Object.entries(SPECIALTY_MAP)) {
    if (reportTypeLower.includes(key.toLowerCase())) {
      obj.specialty = value
      break
    }
  }
  if (!obj.specialty) obj.specialty = 'General Medicine'

  // Normalise parameter status values
  const validStatus = ['Normal', 'High', 'Low', 'Borderline']
  obj.parameters = obj.parameters.map((p) => ({
    ...p,
    status: validStatus.includes(p.status) ? p.status : 'Normal',
  }))

  return obj
}

// ── Resilience config ──────────────────────────────────────────────────────
const FALLBACK_GEMINI_MODEL = 'gemini-2.0-flash'
const RETRY_DELAY_MS = 2000

const STRICT_JSON_SUFFIX = `

IMPORTANT — YOUR PREVIOUS RESPONSE WAS NOT VALID JSON.
Return ONLY valid JSON.
No markdown.
No explanation.
No extra text.
Ensure syntactically valid JSON.`

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Single, non-recursive request to a given Gemini model. Throws on network/HTTP
// failure (with .status503 / .isQuota flags); returns { parsed, cleaned } or
// throws a ParseError-flagged error if JSON.parse fails.
async function requestGemini(apiKey, model, parts, useStrictPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const systemPrompt = useStrictPrompt
    ? buildSystemPrompt() + STRICT_JSON_SUFFIX
    : buildSystemPrompt()

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 16384,
    },
  }

  const response = await fetch(`${url}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (response.status === 429) {
    const err = new Error('QUOTA_EXCEEDED')
    err.isQuota = true
    throw err
  }

  if (response.status === 503) {
    const err = new Error(`Gemini ${model} overloaded (503)`)
    err.is503 = true
    throw err
  }

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

  if (!rawText) {
    throw new Error('Empty response from Gemini')
  }

  // Strip any markdown fences Gemini occasionally adds despite instructions
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    const err = new Error(`JSON parse failed: ${cleaned.slice(0, 200)}`)
    err.isParseError = true
    throw err
  }

  return validateSchema(parsed)
}

// One model attempt with its own malformed-JSON retry (stricter prompt, once).
async function attemptModel(apiKey, model, parts) {
  try {
    return await requestGemini(apiKey, model, parts, false)
  } catch (err) {
    if (err.isParseError) {
      console.error(`JSON parse failed for ${model}, retrying with stricter prompt`)
      return await requestGemini(apiKey, model, parts, true)
    }
    throw err
  }
}

// ── Call Gemini with full failsafe chain ─────────────────────────────────────
// gemini-2.5-flash → (503 → wait 2s → retry same model) → (still fails → gemini-2.0-flash)
// Each model attempt gets one malformed-JSON retry with a stricter prompt.
// If everything fails, throws an error the handler converts into the
// structured { error: "AI analysis temporarily unavailable" } response.
async function callGemini(apiKey, parts) {
  try {
    return await attemptModel(apiKey, GEMINI_MODEL, parts)
  } catch (err) {
    if (err.isQuota) throw err

    if (err.is503) {
      console.error(`${GEMINI_MODEL} returned 503, waiting ${RETRY_DELAY_MS}ms then retrying`)
      await sleep(RETRY_DELAY_MS)
      try {
        return await attemptModel(apiKey, GEMINI_MODEL, parts)
      } catch (retryErr) {
        if (retryErr.isQuota) throw retryErr
        console.error(`${GEMINI_MODEL} still failing after retry, falling back to ${FALLBACK_GEMINI_MODEL}`)
        return await attemptModel(apiKey, FALLBACK_GEMINI_MODEL, parts)
      }
    }

    // Non-503 failure (e.g. exhausted parse retries) — still try the fallback
    // model once before giving up entirely.
    console.error(`${GEMINI_MODEL} failed (${err.message}), falling back to ${FALLBACK_GEMINI_MODEL}`)
    return await attemptModel(apiKey, FALLBACK_GEMINI_MODEL, parts)
  }
}

// ── Handler ────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server misconfigured: missing API key',
    })
  }
  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }
  const { base64Data, mimeType, notes, profile } = body || {}

  if (!base64Data || !mimeType) {
    return res.status(400).json({ error: 'base64Data and mimeType are required' })
  }

  // Validate mimeType is an allowed type
  const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
  if (!allowedMimeTypes.includes(mimeType)) {
    return res.status(400).json({ error: `Unsupported file type: ${mimeType}` })
  }

  const parts = buildUserMessage(base64Data, mimeType, notes || '', profile || null)

  try {
    const result = await callGemini(apiKey, parts)
    return res.status(200).json({ success: true, data: result })
  } catch (err) {
    if (err.isQuota) {
      return res.status(429).json({
        error: 'QUOTA_EXCEEDED',
        message: 'Analysis temporarily unavailable — daily API limit reached. Please try again tomorrow.',
      })
    }

    console.error('ERROR MESSAGE:', err.message)
    return res.status(500).json({
      success: false,
      error: 'AI analysis temporarily unavailable',
      message: 'Analysis temporarily unavailable. Please try again.',
    })
  }
}
