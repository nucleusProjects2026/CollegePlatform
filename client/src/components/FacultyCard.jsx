const FacultyCard = ({ faculty }) => {
  return (
    <article className="faculty-card">
      <h2 className="faculty-name">{faculty.name}</h2>
      <p className="faculty-info">
        <span>Department:</span> {faculty.department}
      </p>
      <p className="faculty-info">
        <span>Cabin Number:</span> {faculty.cabin}
      </p>
    </article>
  )
}

export default FacultyCard