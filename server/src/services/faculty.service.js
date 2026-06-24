import Faculty from '../models/Faculty.js'

const getAllFaculty = async () => {
  return Faculty.find()
    .select('name department designation block floor cabin image status')
    .sort({ name: 1 })
    .lean()
}

const searchFaculty = async (searchTerm = '') => {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()

  if (!normalizedSearchTerm) {
    return getAllFaculty()
  }

  const searchPattern = new RegExp(normalizedSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

  return Faculty.find({
    $or: [
      { name: searchPattern },
      { department: searchPattern },
      { designation: searchPattern },
      { block: searchPattern },
      { floor: searchPattern },
      { cabin: searchPattern },
      { status: searchPattern },
    ],
  })
    .select('name department designation block floor cabin image status')
    .sort({ name: 1 })
    .lean()
}

export { getAllFaculty, searchFaculty }