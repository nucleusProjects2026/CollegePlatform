import { useMemo, useState } from 'react'
import SearchBar from '../components/SearchBar.jsx'
import FacultyCard from '../components/FacultyCard.jsx'

const facultyData = [
  { id: 1, name: 'Dr. Sharma', department: 'CSE', cabin: 'A-201' },
  { id: 2, name: 'Dr. Patil', department: 'ECE', cabin: 'B-105' },
  { id: 3, name: 'Dr. Rao', department: 'AIML', cabin: 'C-302' },
  { id: 4, name: 'Dr. Kumar', department: 'ISE', cabin: 'D-101' },
]

const FacultyLocator = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFaculty = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return facultyData
    }

    return facultyData.filter((faculty) => {
      return (
        faculty.name.toLowerCase().includes(normalizedSearch) ||
        faculty.department.toLowerCase().includes(normalizedSearch) ||
        faculty.cabin.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [searchTerm])

  return (
    <main className="faculty-page">
      <section className="faculty-shell">
        <h1 className="faculty-title">Faculty Cabin Locator</h1>

        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        {filteredFaculty.length > 0 ? (
          <div className="faculty-grid">
            {filteredFaculty.map((faculty) => (
              <FacultyCard key={faculty.id} faculty={faculty} />
            ))}
          </div>
        ) : (
          <p className="faculty-empty">No faculty found for this search.</p>
        )}
      </section>
    </main>
  )
}

export default FacultyLocator