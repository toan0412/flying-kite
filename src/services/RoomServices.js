import axiosInstance from './base_axios.js'

const getConservationsAPI = () => {
  const userId = localStorage.getItem('userId')
  return axiosInstance.get(`v1/api/rooms/${userId}`)
}

const getOrCreatePrivateRoomAPI = (members) => {
  return axiosInstance.post('v1/api/rooms', { members: members })
}

export { getConservationsAPI, getOrCreatePrivateRoomAPI }
