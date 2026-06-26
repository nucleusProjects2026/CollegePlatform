import { Router } from 'express'
import { fetchFaculty, searchFacultyController } from '../controllers/faculty.controller.js'

const facultyRouter = Router()

facultyRouter.get('/', fetchFaculty)
facultyRouter.get('/search', searchFacultyController)

export default facultyRouter