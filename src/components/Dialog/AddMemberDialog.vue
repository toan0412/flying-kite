<template>
  <v-dialog v-model="show" max-width="500px" class="private-room-dialog">
    <v-card>
      <v-card-title>
        Thêm thành viên vào nhóm
        <v-btn icon="mdi-close" flat @click.stop="show = false"></v-btn>
      </v-card-title>
      <v-text-field
        v-model="searchValue"
        clearable
        clear-icon="mdi-close"
        placeholder="Tìm kiếm"
        variant="underlined"
        class="create-room-search"
        @keyup.enter="handleSearchUser"
      ></v-text-field>
      <v-list height="450" v-if="searchUsersList.length > 0" lines="one">
        <v-list-item v-for="user in searchUsersList" :key="user._id" :value="user" clickable>
          <template v-slot:prepend>
            <MSAvatar width="40" height="40" :src="user.avatarUrl" />
          </template>
          <v-list-item-title class="ml-3">{{ user.fullName }}</v-list-item-title>
          <v-list-item-subtitle class="ml-3">{{
            user.username ? user.username : ''
          }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-checkbox-btn
              color="deep-orange-darken-1"
              :input-value="isSelected(user._id)"
              @change="toggleSelection(user._id)"
              width="40"
              height="40"
            />
          </template>
        </v-list-item>
      </v-list>
      <EmptyCard
        style="height: 450px"
        v-else
        title="Không tìm thấy người dùng"
        subtitle="Người dùng không tìm thấy hoặc không tồn tại, vui lòng thử lại"
      />
      <div v-if="searchUsersList.length > 0" class="d-flex justify-center pa-2">
        <MSButton
          :disabled="selectedUserIds.length == 0"
          @click="handleAddMembersToRoom"
          color="deep-orange-darken-1"
        >
          <v-progress-circular
            v-if="isCallingAPI"
            :size="20"
            :width="3"
            color="white"
            indeterminate
          >
          </v-progress-circular>
          <span v-else>Xong</span>
        </MSButton>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import MSButton from '@/components/CustomButton/MSButton.vue'
import MSAvatar from '@/components/CustomAvatar/MSAvatar.vue'
import ChatService from '@/socket/ChatService'
import { useConversationsStore } from '@/stores/ConversationsStore'
import { searchUserAPI } from '@/services/UserServices'
import EmptyCard from '@/components/Card/EmptyCard.vue'

export default {
  props: {
    visible: Boolean
  },

  data() {
    return {
      searchValue: '',
      searchUsersList: [],
      allUsersInfo: [],
      conversations: [],
      selectedUserIds: [],
      isAddingMember: false,
      isCallingAPI: false
    }
  },

  components: {
    EmptyCard,
    MSButton,
    MSAvatar
  },

  computed: {
    show: {
      get() {
        return this.visible
      },
      set(value) {
        if (!value) {
          this.$emit('close')
        } else {
          this.$emit('input', value)
        }
      }
    }
  },
  methods: {
    isSelected(userId) {
      return this.selectedUserIds.includes(userId)
    },

    toggleSelection(userId) {
      const index = this.selectedUserIds.indexOf(userId)
      if (index === -1) {
        this.selectedUserIds.push(userId)
      } else {
        this.selectedUserIds.splice(index, 1)
      }
    },

    async handleAddMembersToRoom() {
      const userId = localStorage.getItem('userId')
      const roomId = localStorage.getItem('roomId')

      this.isCallingAPI = true
      const newMembers = this.selectedUserIds
      try {
        await ChatService.updateRoom({ roomId, userId, newMembers })
      } catch (error) {
        console.error('Error adding new members to room: ', error)
      } finally {
        this.show = false
        this.isCallingAPI = false
        this.selectedUserIds = []
      }
    },

    handleSearchUser() {
      const userId = localStorage.getItem('userId')

      searchUserAPI(this.searchValue)
        .then((res) => {
          this.searchUsersList = res.data.filter((user) => user._id !== userId)
        })
        .catch((err) => console.error('Error while searching users', err))
    }
  },

  watch: {
    visible(newValue, oldValue) {
      if (newValue) {
        const conversationsStore = useConversationsStore()
        this.conversations = conversationsStore.conversations
        const mappedConversations = this.conversations
          .filter((room) => room.receiverId)
          .map((room) => ({
            userId: room.receiverId,
            fullName: room.roomName,
            avatarUrl: room.avatarUrl
          }))
        this.searchUsersList = mappedConversations
      }
    }
  }
}
</script>

<style lang="scss">
.private-room-dialog {
  .v-card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 16px;
  }

  .create-room-search {
    .v-input__control {
      background-image: var(--search-background-color);
    }

    .v-field__input {
      color: var(--ms-white);
      font-size: 16px;
      font-weight: bold;
      padding-left: 14px;
    }

    .v-field__clearable {
      color: var(--ms-white);
      font-size: 16px;
    }
  }

  .v-list-item-subtitle {
    padding-bottom: 4px;
    border-bottom: 1px solid #d5d9de;
  }
}
</style>
