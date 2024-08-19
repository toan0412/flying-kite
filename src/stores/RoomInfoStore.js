import { defineStore } from 'pinia'

export const useRoomInfoStore = defineStore('roomInfo', {
  state: () => ({
    roomInfo: null
  }),
  actions: {
    setRoomInfo(roomInfo) {
      this.roomInfo = roomInfo
    }
  }
})
