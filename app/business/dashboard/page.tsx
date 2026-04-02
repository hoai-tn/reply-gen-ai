export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-foreground">Dashboard</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Overview of your forms and submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Forms", value: "0" },
          { label: "Total Submissions", value: "0" },
          { label: "Documents Uploaded", value: "0" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-4"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
