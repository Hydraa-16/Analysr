const ACTIVITY_ITEMS = [
  { label: 'CBC Panel analysed', specialty: 'Haematology' },
  { label: 'ECG analysed', specialty: 'Cardiology' },
  { label: 'Thyroid Panel analysed', specialty: 'Endocrinology' },
  { label: 'LFT analysed', specialty: 'Hepatology' },
  { label: 'KFT analysed', specialty: 'Nephrology' },
  { label: 'Chest X-Ray analysed', specialty: 'Radiology' },
]

function ActivityItem({ label, specialty }) {
  return (
    <div className="flex items-center gap-2.5 px-6 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
      <span className="font-mono text-xs text-text-primary">{label}</span>
      <span className="font-mono text-xs text-text-secondary">· {specialty}</span>
    </div>
  )
}

function LiveActivityStrip() {
  return (
    <div className="border-y border-border bg-surface overflow-hidden">
      <div className="flex items-center py-3.5 animate-marquee" aria-hidden="true">
        {/* Content duplicated once so the loop is seamless at -50% translate */}
        {[...ACTIVITY_ITEMS, ...ACTIVITY_ITEMS].map((item, i) => (
          <ActivityItem key={`${item.label}-${i}`} label={item.label} specialty={item.specialty} />
        ))}
      </div>
      <span className="sr-only">
        Live example of report types Analysr detects: CBC, ECG, Thyroid Panel, LFT, KFT, and X-Ray
        reports, each automatically routed to the right medical specialty.
      </span>
    </div>
  )
}

export default LiveActivityStrip
