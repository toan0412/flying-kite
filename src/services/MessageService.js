import axiosInstance from './base_axios.js'

const getConservationByRoomIdAPI = (roomId) => {
  return axiosInstance.get(`v1/api/messages/${roomId}`)
}

const sendMessageAPI = (req) => {
  const { roomId, senderId, content } = req
  console.log(roomId, senderId, content)
  return axiosInstance.post(`v1/api/messages/${roomId}`, { senderId, content })
}

export { getConservationByRoomIdAPI, sendMessageAPI }
