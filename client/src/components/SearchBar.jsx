const SearchBar = ({ value, onChange }) => {
  return (
    <div className="search-bar">
      <label className="search-label" htmlFor="faculty-search">
        Search by name, department, or cabin number
      </label>
      <input
        id="faculty-search"
        className="search-input"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search faculty..."
      />
    </div>
  )
}

export default SearchBar