import axiosInstance from './base_axios.js'

const getConservationByRoomIdAPI = (roomId, limit, offset) => {
  return axiosInstance.get(`v1/api/messages/${roomId}`, {
    params: {
      limit,
      offset,
    },
  });
};


const sendMessageAPI = (req) => {
  const { roomId, senderId, content } = req
  return axiosInstance.post(`v1/api/messages/${roomId}`, { senderId, content })
}

export { getConservationByRoomIdAPI, sendMessageAPI }
