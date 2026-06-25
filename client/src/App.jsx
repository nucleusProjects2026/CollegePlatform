import { Route, Routes } from 'react-router-dom'
import FacultyLocator from './pages/FacultyLocator'

const App = () => {
  return (
    <Routes>
      <Route
        path="/faculty-locator"
        element={<FacultyLocator />}
      />
    </Routes>
  )
}

export default App