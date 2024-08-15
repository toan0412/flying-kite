import axiosInstance from './base_axios.js'

const getConservationsAPI = () => {
  const userId = localStorage.getItem('userId')
  return axiosInstance.get(`v1/api/rooms/${userId}`)
}

export { getConservationsAPI }
