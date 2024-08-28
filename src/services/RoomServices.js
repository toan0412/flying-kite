import axiosInstance from './base_axios.js'

const getConservationsAPI = () => {
  const userId = localStorage.getItem('userId')
  return axiosInstance.get(`v1/api/rooms/${userId}`)
}

const createRoomAPI = (members, roomName, type, avatarUrl) => {
  return axiosInstance.post('v1/api/rooms', { members, roomName, type, avatarUrl })
}

export { getConservationsAPI, createRoomAPI }
