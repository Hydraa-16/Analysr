// Reusable section wrapper for the Profile screen.
// Every section (Personal info, Medical history, Lifestyle, Account) uses
// the same card shell — white surface, hairline border, section-label pill —
// matching the pattern already used on DashboardPage / HistoryPage.
//
// Props:
//   label       — small uppercase pill text (e.g. "PERSONAL INFO")
//   title       — section heading
//   description — optional helper text below the heading
//   children    — section body (form fields)
function ProfileSection({ label, title, description, children }) {
  return (
    <section className="bg-surface border border-border rounded-card p-5 lg:p-6 mb-5">
      <div className="mb-5">
        <span className="section-label mb-3 inline-block">{label}</span>
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {description && (
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">{description}</p>
        )}
      </div>

      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}

export default ProfileSection
