import { defineStore } from 'pinia'

export const useConversationsStore = defineStore('conversations', {
  state: () => ({
    conversations: {}
  }),
  actions: {
    setConversations(conversations) {
      this.conversations = conversations
    }
  }
})
