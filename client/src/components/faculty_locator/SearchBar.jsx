const SearchIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 stroke-current">
    <circle cx="11" cy="11" r="7" fill="none" strokeWidth="2" />
    <path d="m20 20-3.5-3.5" fill="none" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-3 shadow-sm transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100">
      <span className="text-zinc-500">
        <SearchIcon />
      </span>
      <input
        className="w-full bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400"
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  )
}

export default SearchBar