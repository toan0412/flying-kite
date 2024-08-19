import { defineStore } from 'pinia'

export const useRoomInfoStore = defineStore('roomInfo', {
  state: () => ({
    roomInfo: {}
  }),
  actions: {
    setRoomInfo(roomInfo) {
      this.roomInfo = roomInfo
    }
  }
})
