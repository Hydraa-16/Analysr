// ResultsTable — values table: parameter | your value | normal range | status.
// Renders one ParameterRow per item in the parameters array, each resolving
// into focus with a small stagger to reinforce the "coming into focus" motif.

import ParameterRow from './ParameterRow.jsx'

function ResultsTable({ parameters = [], blurred = false }) {
  if (!parameters.length) {
    return (
      <div className="bg-surface border border-border rounded-card p-6 text-center text-sm text-text-secondary">
        No parameters were returned for this report.
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Parameter
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Your value
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Normal range
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {parameters.map((p, index) => (
              <ParameterRow
                key={`${p.parameter}-${index}`}
                parameter={p.parameter}
                value={p.value}
                normalRange={p.normal_range}
                status={p.status}
                blurred={blurred}
                delay={index * 80}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ResultsTable
