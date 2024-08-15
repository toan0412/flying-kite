import axiosInstance from './base_axios.js'

const getConservationByRoomIdAPI = (roomId) => {
  return axiosInstance.get(`v1/api/messages/${roomId}`)
}

export { getConservationByRoomIdAPI }
