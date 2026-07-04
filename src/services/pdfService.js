// pdfService.js — Milestone 7
// Generates the dual-language analysis PDF entirely client-side via
// jsPDF + jsPDF-AutoTable. No backend call, no API key involved.
//
// Structure (per spec, do not reorder):
// header (logo/title/date/disclaimer/report identity/urgency)
//   -> tabulated values (color-coded status column)
//   -> findings (plain + medical)
//   -> next steps
//   -> sources
//   -> footer disclaimer
// Multi-page support: jsPDF + autoTable paginate automatically; we also
// watch the cursor position ourselves before free-text blocks and add
// pages manually so long plain/medical text never overflows past the
// footer zone (Risk mitigation: large PDF export freezing/garbling).

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const DISCLAIMER_TEXT =
  'Analysr provides AI-generated preliminary medical report analysis. This tool is informational only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a licensed physician.'

const MAY_INDICATE_DISCLAIMER =
  'This reflects possibilities based on the values above, not a diagnosis. Only a licensed physician can confirm what these results mean for you.'

// Design system colors (RGB, since jsPDF does not accept hex directly)
const COLORS = {
  navBg: [17, 17, 16], // #111110
  textPrimary: [17, 17, 16],
  textSecondary: [107, 122, 141], // #6B7A8D
  border: [232, 232, 230], // #E8E8E6
  accent: [10, 191, 163], // #0ABFA3
  high: [232, 77, 77], // #E84D4D
  borderline: [245, 166, 35], // #F5A623
  normal: [39, 174, 143], // #27AE8F
  background: [245, 245, 243], // #F5F5F3
}

const PAGE_MARGIN = 14
const FOOTER_ZONE = 18 // mm reserved at bottom of every page for footer disclaimer

function statusColor(status) {
  const key = (status || '').trim().toLowerCase()
  if (key === 'high' || key === 'low') return COLORS.high
  if (key === 'borderline') return COLORS.borderline
  return COLORS.normal
}

function urgencyColor(urgency) {
  const key = (urgency || '').trim().toLowerCase()
  if (key === 'seek care promptly') return COLORS.high
  if (key === 'follow up soon') return COLORS.borderline
  return COLORS.normal
}

// Adds the standard footer disclaimer + page number to every page.
// Called once at the very end, after all content/pages exist.
function applyFooters(doc) {
  const pageCount = doc.internal.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    doc.setDrawColor(...COLORS.border)
    doc.line(PAGE_MARGIN, pageHeight - 16, pageWidth - PAGE_MARGIN, pageHeight - 16)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.textSecondary)
    const footerLines = doc.splitTextToSize(DISCLAIMER_TEXT, pageWidth - PAGE_MARGIN * 2)
    doc.text(footerLines, PAGE_MARGIN, pageHeight - 11)

    doc.text(`Page ${i} of ${pageCount}`, pageWidth - PAGE_MARGIN, pageHeight - 6, {
      align: 'right',
    })
    doc.text('analysr.app', PAGE_MARGIN, pageHeight - 6)
  }
}

// Ensures there's room for `neededHeight` mm before the footer zone;
// otherwise starts a new page and returns the updated cursor y.
function ensureSpace(doc, cursorY, neededHeight) {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (cursorY + neededHeight > pageHeight - FOOTER_ZONE) {
    doc.addPage()
    return PAGE_MARGIN
  }
  return cursorY
}

// Renders a section label (small uppercase pill-style text, no box —
// PDF keeps the visual language simple/printable).
function renderSectionLabel(doc, text, x, y) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.textSecondary)
  doc.text(text.toUpperCase(), x, y)
  return y + 5
}

// Renders a plain-then-medical findings block (Key findings, What this
// may indicate, Recommended next steps). Returns the new cursor y.
function renderFindingsSection(doc, { label, plain, medical, disclaimer }, cursorY) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - PAGE_MARGIN * 2

  if (!plain && !medical) return cursorY

  cursorY = ensureSpace(doc, cursorY, 20)
  cursorY = renderSectionLabel(doc, label, PAGE_MARGIN, cursorY)

  if (plain) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...COLORS.textPrimary)
    const plainLines = doc.splitTextToSize(plain, contentWidth)
    cursorY = ensureSpace(doc, cursorY, plainLines.length * 5 + 4)
    doc.text(plainLines, PAGE_MARGIN, cursorY)
    cursorY += plainLines.length * 5 + 3
  }

  if (medical) {
    cursorY = ensureSpace(doc, cursorY, 12)
    doc.setDrawColor(...COLORS.border)
    doc.line(PAGE_MARGIN, cursorY, PAGE_MARGIN + contentWidth, cursorY)
    cursorY += 5

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9.5)
    doc.setTextColor(...COLORS.textSecondary)
    const medicalLines = doc.splitTextToSize(`Medical detail: ${medical}`, contentWidth)
    cursorY = ensureSpace(doc, cursorY, medicalLines.length * 4.5 + 4)
    doc.text(medicalLines, PAGE_MARGIN, cursorY)
    cursorY += medicalLines.length * 4.5 + 3
  }

  if (disclaimer) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.textSecondary)
    const discLines = doc.splitTextToSize(disclaimer, contentWidth)
    cursorY = ensureSpace(doc, cursorY, discLines.length * 4 + 4)
    doc.text(discLines, PAGE_MARGIN, cursorY)
    cursorY += discLines.length * 4 + 3
  }

  return cursorY + 6
}

/**
 * Generates and triggers a download of the analysis PDF.
 * @param {object} result - the Gemini result_json object (locked schema).
 * @param {object} meta - { originalFilename, createdAt }
 * @returns {{ success: boolean, error?: string }}
 */
export function generateAnalysisPdf(result, meta = {}) {
  if (!result || typeof result !== 'object') {
    return { success: false, error: 'No analysis data available to export.' }
  }

  try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const contentWidth = pageWidth - PAGE_MARGIN * 2
    let cursorY = PAGE_MARGIN

    // ── Header ──────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(...COLORS.navBg)
    doc.text('Analysr', PAGE_MARGIN, cursorY + 4)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.textSecondary)
    const dateLabel = meta.createdAt
      ? new Date(meta.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    doc.text(dateLabel, pageWidth - PAGE_MARGIN, cursorY + 4, { align: 'right' })

    cursorY += 12
    doc.setDrawColor(...COLORS.border)
    doc.line(PAGE_MARGIN, cursorY, pageWidth - PAGE_MARGIN, cursorY)
    cursorY += 8

    // Report identity
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...COLORS.textPrimary)
    doc.text(result.report_type || 'Report', PAGE_MARGIN, cursorY)
    cursorY += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...COLORS.textSecondary)
    const identityLine = [result.specialty, meta.originalFilename].filter(Boolean).join(' · ')
    if (identityLine) {
      doc.text(identityLine, PAGE_MARGIN, cursorY)
      cursorY += 7
    } else {
      cursorY += 2
    }

    // Urgency
    const uColor = urgencyColor(result.urgency)
    doc.setFillColor(...uColor)
    doc.circle(PAGE_MARGIN + 1.2, cursorY - 1.2, 1.2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...uColor)
    doc.text(result.urgency || 'Routine', PAGE_MARGIN + 5, cursorY)
    cursorY += 8

    // Privacy/medical disclaimer banner near top, per spec (mandatory on PDF export)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.textSecondary)
    const topDisclaimerLines = doc.splitTextToSize(DISCLAIMER_TEXT, contentWidth)
    doc.text(topDisclaimerLines, PAGE_MARGIN, cursorY)
    cursorY += topDisclaimerLines.length * 4 + 6

    // ── Values table ────────────────────────────────────────────────────
    const parameters = Array.isArray(result.parameters) ? result.parameters : []
    if (parameters.length) {
      cursorY = renderSectionLabel(doc, 'Your values', PAGE_MARGIN, cursorY)
      cursorY += 1

      autoTable(doc, {
        startY: cursorY,
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: FOOTER_ZONE },
        head: [['Parameter', 'Your value', 'Normal range', 'Status']],
        body: parameters.map((p) => [
          p.parameter || '',
          p.value || '',
          p.normal_range || '',
          p.status || '',
        ]),
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 2.5,
          textColor: COLORS.textPrimary,
          lineColor: COLORS.border,
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: COLORS.background,
          textColor: COLORS.textSecondary,
          fontStyle: 'bold',
          fontSize: 8,
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 3) {
            data.cell.styles.textColor = statusColor(data.cell.raw)
            data.cell.styles.fontStyle = 'bold'
          }
        },
      })

      cursorY = doc.lastAutoTable.finalY + 8
    } else {
      cursorY = ensureSpace(doc, cursorY, 10)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...COLORS.textSecondary)
      doc.text('No parameters were returned for this report.', PAGE_MARGIN, cursorY)
      cursorY += 10
    }

    // ── Findings sections (locked order) ───────────────────────────────
    cursorY = renderFindingsSection(
      doc,
      {
        label: 'Key findings',
        plain: result.key_findings?.plain,
        medical: result.key_findings?.medical,
      },
      cursorY
    )

    cursorY = renderFindingsSection(
      doc,
      {
        label: 'What this may indicate',
        plain: result.what_this_may_indicate?.plain,
        medical: result.what_this_may_indicate?.medical,
        disclaimer: MAY_INDICATE_DISCLAIMER,
      },
      cursorY
    )

    cursorY = renderFindingsSection(
      doc,
      {
        label: 'Recommended next steps',
        plain: result.next_steps?.plain,
        medical: result.next_steps?.medical,
      },
      cursorY
    )

    // ── Sources ─────────────────────────────────────────────────────────
    const sources = Array.isArray(result.sources) ? result.sources : []
    if (sources.length) {
      cursorY = ensureSpace(doc, cursorY, 14)
      cursorY = renderSectionLabel(doc, 'Sources referenced', PAGE_MARGIN, cursorY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...COLORS.textSecondary)
      sources.forEach((source) => {
        const lines = doc.splitTextToSize(`•  ${source}`, contentWidth)
        cursorY = ensureSpace(doc, cursorY, lines.length * 4.5 + 2)
        doc.text(lines, PAGE_MARGIN, cursorY)
        cursorY += lines.length * 4.5 + 1
      })
    }

    // ── Footer disclaimer + page numbers on every page ────────────────
    applyFooters(doc)

    const safeName = (meta.originalFilename || result.report_type || 'analysr-report')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9-_]+/gi, '-')
    doc.save(`analysr-${safeName}.pdf`)

    return { success: true }
  } catch (err) {
    console.error('PDF generation failed:', err)
    return { success: false, error: 'Could not generate the PDF. Please try again.' }
  }
}
