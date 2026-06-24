import { useEffect, useMemo, useState } from 'react'
import FacultyCard from '../components/FacultyCard'
import SearchBar from '../components/SearchBar'
import { getFaculty, searchFaculty } from '../services/facultyApi'

const departments = ['All Departments', 'Computer Science', 'Mechanical', 'Civil', 'Electrical']

const navItems = [
  { label: 'Dashboard', icon: 'grid' },
  { label: 'Chat', icon: 'chat' },
  { label: 'Programs', icon: 'cap' },
  { label: 'Faculty', icon: 'people', active: true },
  { label: 'Rooms', icon: 'door' },
]

const Icon = ({ name, active = false }) => {
  const common = `h-7 w-7 ${active ? 'text-violet-600' : 'text-zinc-700'}`

  switch (name) {
    case 'grid':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
        </svg>
      )
    case 'chat':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4.5A4 4 0 0 1 2 15V7a4 4 0 0 1 4-4h11a4 4 0 0 1 4 4z" />
        </svg>
      )
    case 'cap':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 3 10 5-10 5L2 8l10-5Z" />
          <path d="M6 10v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
        </svg>
      )
    case 'people':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 11a4 4 0 1 0-8 0" />
          <path d="M4 20a8 8 0 0 1 16 0" />
          <path d="M19 8a3 3 0 1 1-3 3" />
        </svg>
      )
    case 'door':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h10v16H4zM14 12h6" />
          <path d="M17 9v6" />
        </svg>
      )
    default:
      return null
  }
}

const BellIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 text-zinc-800" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 10H3c0-3 3-3 3-10" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </svg>
)

const FacultyLocator = () => {
  const [query, setQuery] = useState('')
  const [activeDepartment, setActiveDepartment] = useState('All Departments')
  const [facultyList, setFacultyList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadFaculty = async () => {
      setLoading(true)
      setError('')

      try {
        const faculty = query.trim().length > 0 ? await searchFaculty(query) : await getFaculty()

        if (isMounted) {
          setFacultyList(faculty)
        }
      } catch (requestError) {
        if (isMounted) {
          setError('Unable to load faculty right now. Please try again.')
          setFacultyList([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadFaculty()

    return () => {
      isMounted = false
    }
  }, [query])

  const filteredFaculty = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return facultyList.filter((faculty) => {
      const matchesDepartment =
        activeDepartment === 'All Departments' || faculty.department.toLowerCase().includes(activeDepartment.toLowerCase())
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [faculty.name, faculty.department, faculty.cabin, faculty.block, faculty.floor, faculty.status]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesDepartment && matchesQuery
    })
  }, [activeDepartment, facultyList, query])

  const isEmpty = !loading && !error && filteredFaculty.length === 0

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-700">
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">AM</div>
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-violet-600">College Mesh</h1>
        </div>

        <button type="button" className="rounded-full p-1.5 text-zinc-800 transition hover:bg-zinc-100" aria-label="Notifications">
          <BellIcon />
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 py-6 pb-28">
        <section className="space-y-5">
          <div>
            <h2 className="text-[34px] font-semibold tracking-[-0.04em] text-zinc-950">Faculty Locator</h2>
          </div>

          <SearchBar
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search faculty, department, or cabin..."
          />

          <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1">
            {departments.map((department) => {
              const active = department === activeDepartment

              return (
                <button
                  key={department}
                  type="button"
                  onClick={() => setActiveDepartment(department)}
                  className={`whitespace-nowrap rounded-full border px-5 py-3 text-[16px] font-medium transition ${
                    active
                      ? 'border-violet-600 bg-violet-600 text-white shadow-sm'
                      : 'border-zinc-300 bg-white text-zinc-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-zinc-400'
                  }`}
                >
                  {department}
                </button>
              )
            })}
          </div>
        </section>

        <section className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-10 text-center text-[15px] text-zinc-600">
              Loading faculty...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-10 text-center text-[15px] text-rose-700">
              {error}
            </div>
          ) : isEmpty ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-10 text-center text-[15px] text-zinc-600">
              No faculty match your search.
            </div>
          ) : (
            filteredFaculty.map((faculty) => <FacultyCard key={faculty.name} faculty={faculty} />)
          )}
        </section>
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 px-3 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:mx-auto md:max-w-2xl md:left-1/2 md:-translate-x-1/2">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-[13px] transition ${
                item.active ? 'bg-violet-100 text-violet-600' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <Icon name={item.icon} active={item.active} />
              <span className={item.active ? 'font-medium' : 'font-normal'}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default FacultyLocator