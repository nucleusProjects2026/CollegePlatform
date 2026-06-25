const statusStyles = {
  available: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  'in class': 'border-rose-300 bg-rose-50 text-rose-700',
  meeting: 'border-amber-300 bg-amber-50 text-amber-700',
  'on leave': 'border-zinc-200 bg-zinc-100 text-zinc-500',
}

const StatusBadge = ({ status }) => {
  const key = status.toLowerCase()
  const styles = statusStyles[key] ?? 'border-slate-200 bg-slate-100 text-slate-600'

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${styles}`}
    >
      {status}
    </span>
  )
}

export default StatusBadge