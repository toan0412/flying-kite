import { defineStore } from 'pinia'

export const useUserInfoStore = defineStore('userInfo', {
  state: () => ({
    userInfo: []
  }),
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    }
  }
})
