import axiosInstance from './base_axios.js'

const getConservationByRoomIdAPI = (roomId, limit, offset) => {
  return axiosInstance.get(`v1/api/messages/${roomId}`, {
    params: {
      limit,
      offset
    }
  })
}

const sendMessageAPI = (req) => {
  const { roomId, senderId, content } = req
  return axiosInstance.post(`v1/api/messages/${roomId}`, { senderId, content })
}

const searchMessageByRoomAPI = (roomId, searchString) => {
  return axiosInstance.get(`v1/api/messages/search`, {
    params: {
      roomId,
      searchString
    }
  })
}


export { getConservationByRoomIdAPI, sendMessageAPI, searchMessageByRoomAPI }
