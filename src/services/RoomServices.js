import axiosInstance from './base_axios.js'

const getConservationsAPI = () => {
  return axiosInstance.get(`v1/api/rooms`)
}

const getRoomByIdAPI = (roomId) => {
  return axiosInstance.get(`v1/api/rooms/${roomId}`)
}

const createRoomAPI = (data) => {
  return axiosInstance.post('v1/api/rooms', data)
}

export { getConservationsAPI, createRoomAPI, getRoomByIdAPI }
