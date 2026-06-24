import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
})

const getFaculty = async () => {
  const response = await apiClient.get('/faculty')
  return response.data.data ?? []
}

const searchFaculty = async (searchTerm = '') => {
  const response = await apiClient.get('/faculty/search', {
    params: {
      q: searchTerm,
    },
  })

  return response.data.data ?? []
}

export { getFaculty, searchFaculty }