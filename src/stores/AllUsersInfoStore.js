import { defineStore } from 'pinia'

export const useAllUsersInfoStore = defineStore('allUsersInfo', {
  state: () => ({
    allUsersInfo: []
  }),
  actions: {
    setAllUsersInfo(allUsersInfo) {
      this.allUsersInfo = allUsersInfo
    }
  }
})
