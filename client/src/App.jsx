import { Navigate, Route, Routes } from 'react-router-dom'
import FacultyLocator from './pages/FacultyLocator'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/faculty-locator" replace />} />
      <Route path="/faculty-locator" element={<FacultyLocator />} />
    </Routes>
  )
}

export default App
