import { defineStore } from 'pinia'

export const useUsersInfoStore = defineStore('usersInfo', {
  state: () => ({
    usersInfo: []
  }),
  actions: {
    setUsersInfo(usersInfo) {
      this.usersInfo = usersInfo
    }
  }
})
