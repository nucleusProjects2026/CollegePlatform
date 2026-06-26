import { getAllFaculty, searchFaculty } from '../services/faculty.service.js'

const fetchFaculty = async (req, res) => {
  try {
    const faculty = await getAllFaculty()

    return res.status(200).json({
      success: true,
      data: faculty,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty list',
    })
  }
}

const searchFacultyController = async (req, res) => {
  try {
    const searchTerm = req.query.q || req.query.search || ''
    const faculty = await searchFaculty(searchTerm)

    return res.status(200).json({
      success: true,
      data: faculty,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to search faculty',
    })
  }
}

export { fetchFaculty, searchFacultyController }