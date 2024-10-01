import { defineStore } from 'pinia'

export const useConversationsStore = defineStore('conversations', {
  state: () => ({
    conversations: []
  }),
  actions: {
    setConversations(conversations) {
      this.conversations = conversations
    },
    addRoom(newRoom) {
      const existingRoomIndex = this.conversations.findIndex((room) => room._id === newRoom._id)

      if (existingRoomIndex !== -1) {
        this.conversations[existingRoomIndex] = {
          ...this.conversations[existingRoomIndex],
          ...newRoom
        }
      } else {
        this.conversations.unshift(newRoom)
      }
    },

    clear() {
      this.conversations = []
    }
  }
})
