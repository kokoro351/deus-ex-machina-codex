export default function StatusGrid({ status }) {
  const rows = [
    ["安定性", status.stability],
    ["人間性", status.humanity],
    ["資源", status.resource],
    ["AI依存", status.ai],
    ["神性", `${status.god}%`],
    ["崩壊度", `${status.collapse} / 50`],
  ]

  return (
    <section className="status-grid">
      {rows.map(([label, value]) => (
        <div key={label} className="status-cell">
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  )
}
