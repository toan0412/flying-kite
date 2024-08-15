import { defineStore } from 'pinia'

export const useConversationStore = defineStore('conversation', {
  state: () => ({
    conversation: null
  }),
  actions: {
    setConversation(conversation) {
      this.conversation = conversation
    }
  }
})
