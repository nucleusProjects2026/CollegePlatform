import StatusBadge from './StatusBadge'

const iconClassName = 'h-4 w-4 shrink-0 stroke-current'

const CabinIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={iconClassName}>
    <path d="M4 20V4h16v16" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 20v-6h8v6" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" fill="none" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

const BuildingIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={iconClassName}>
    <path d="M4 21V3h16v18" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 21v-4h8v4" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01" fill="none" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

const FloorIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={iconClassName}>
    <path d="M4 12 12 6l8 6-8 6-8-6Z" fill="none" strokeWidth="2" strokeLinejoin="round" />
    <path d="M4 16l8 6 8-6" fill="none" strokeWidth="2" strokeLinejoin="round" />
  </svg>
)

const defaultAccent = 'from-violet-600 to-indigo-500'

const getInitials = (name) => {
  if (!name) {
    return 'FM'
  }

  const segments = name.trim().split(/\s+/).filter(Boolean)

  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase()
  }

  return `${segments[0][0]}${segments[segments.length - 1][0]}`.toUpperCase()
}

const FacultyCard = ({ faculty }) => {
  const { name, department, cabin, block, floor, status, image, initials, accent } = faculty ?? {}
  const displayInitials = initials?.trim() || getInitials(name)
  const displayAccent = accent?.trim() || defaultAccent
  const hasImage = Boolean(image?.trim())

  return (
    <article className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md">
      {hasImage ? (
        <img
          src={image}
          alt={name ? `${name} profile photo` : 'Faculty profile photo'}
          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
        />
      ) : (
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${displayAccent} text-2xl font-semibold text-white`}
          aria-hidden="true"
        >
          {displayInitials}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[20px] font-semibold leading-7 text-zinc-900">{name}</h3>
            <div className="mt-2 inline-flex rounded-md bg-zinc-100 px-2.5 py-1 text-[13px] font-medium text-zinc-600">
              {department}
            </div>
          </div>

          <StatusBadge status={status} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-zinc-600">
          <span className="inline-flex items-center gap-1.5">
            <CabinIcon />
            {cabin}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BuildingIcon />
            {block}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FloorIcon />
            {floor}
          </span>
        </div>
      </div>
    </article>
  )
}

export default FacultyCard