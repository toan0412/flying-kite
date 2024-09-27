<template>
  <v-dialog v-model="show" max-width="500px" class="private-room-dialog">
    <v-card>
      <v-card-actions class="justify-sm-center">
        <div class="text-h6 font-weight-bold">Thêm thành viên mới</div>
        <v-icon
          class="position-absolute right-0 ma-3"
          icon="mdi-close"
          @click.stop="show = false"
        ></v-icon>
      </v-card-actions>

      <v-text-field
        v-model="searchValue"
        clearable
        clear-icon="mdi-close"
        placeholder="Tìm kiếm"
        variant="underlined"
        class="create-room-search"
        @keyup.enter="handleSearchUser"
      ></v-text-field>

      <v-list height="450" lines="one">
        <!-- Thành viên trong phòng-->
        <v-list-item
          ><div class="text-subtitle-2 font-weight-bold opacity-70">Thành viên trong phòng</div>
        </v-list-item>

        <v-list-item v-for="user in membersInRoom" :key="user.userId" :value="user.username">
          <template v-slot:prepend>
            <MSAvatar width="40" height="40" :src="user.avatarUrl" />
          </template>
          <v-list-item-title class="ml-3">{{ user.fullName }}</v-list-item-title>
          <v-list-item-subtitle class="ml-3">{{
            user.username ? user.username : ''
          }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-checkbox-btn width="40" height="40" :model-value="true" disabled readonly />
          </template>
        </v-list-item>

        <!-- Mọi người-->
        <v-list-item
          ><div class="text-subtitle-2 font-weight-bold opacity-70">Mọi người</div>
        </v-list-item>

        <v-list-item
          v-for="user in searchUsersList"
          :key="user.userId"
          :value="user.username"
          clickable
        >
          <template v-slot:prepend>
            <MSAvatar width="40" height="40" :src="user.avatarUrl" />
          </template>
          <v-list-item-title class="ml-3">{{ user.fullName }}</v-list-item-title>
          <v-list-item-subtitle class="ml-3">{{
            user.username ? user.username : ''
          }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-checkbox-btn
              :input-value="isSelected(user)"
              @change="toggleSelection(user)"
              width="40"
              height="40"
            />
          </template>
        </v-list-item>
      </v-list>

      <div v-if="searchUsersList.length > 0" class="d-flex justify-center pa-2">
        <MSButton :disabled="this.selectedUser.length == 0" @click="handleAddMembersToRoom">
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
import { useRoomInfoStore } from '@/stores/RoomInfoStore'

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
      selectedUser: [],
      isAddingMember: false,
      isCallingAPI: false,
      membersInRoom: []
    }
  },

  components: {
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
    isSelected(user) {
      return this.selectedUser.includes(user)
    },

    toggleSelection(user) {
      const index = this.selectedUser.indexOf(user)
      if (index === -1) {
        this.selectedUser.push(user)
      } else {
        this.selectedUser.splice(index, 1)
      }
    },

    async handleAddMembersToRoom() {
      const userId = localStorage.getItem('userId')
      const roomId = localStorage.getItem('roomId')

      this.isCallingAPI = true
      const selectedUserIds = this.selectedUser.map((user) => {
        return user._id
      })
      try {
        await ChatService.updateRoom({ roomId, userId, newMembers: selectedUserIds })

        //Tạo tin nhắn thông báo
        this.selectedUser.forEach(async (user) => {
          let content = `đã thêm ${user.fullName} vào phòng`
          await ChatService.sendMessage({
            roomId,
            senderId: userId,
            content,
            isSystemMessage: true
          })
        })
      } catch (error) {
        console.error('Error adding new members to room: ', error)
      } finally {
        this.show = false
        this.isCallingAPI = false
        this.selectedUser = []
      }
    },

    handleSearchUser() {
      const userId = localStorage.getItem('userId')

      searchUserAPI(this.searchValue)
        .then((res) => {
          this.searchUsersList = res.data.filter(
            (user) =>
              user._id !== userId &&
              !this.membersInRoom.some((member) => member.userId === user._id)
          )
        })
        .catch((err) => console.error('Error while searching users', err))
    }
  },

  watch: {
    visible(newValue, oldValue) {
      if (newValue) {
        const conversationsStore = useConversationsStore()
        const roomInfoStore = useRoomInfoStore()

        this.membersInRoom = roomInfoStore.roomInfo.members.filter(
          (member) => member.role !== 'left'
        )
        const conversations = conversationsStore.conversations

        // Lọc ra những người dùng không có trong phòng hiện tại
        this.searchUsersList = conversations
          .filter(
            (room) =>
              room.receiverId &&
              !this.membersInRoom.some((member) => member.userId === room.receiverId)
          )
          .map((room) => ({
            _id: room.receiverId,
            fullName: room.roomName,
            avatarUrl: room.avatarUrl
          }))
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
      background-image: linear-gradient(
        to right,
        rgb(var(--v-theme-secondary-lighten-1)),
        rgb(var(--v-theme-primary-darken-1)),
        rgb(var(--v-theme-primary))
      );
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

  .v-list-item--active {
    .v-list-item__overlay {
      opacity: 0;
    }
  }

  .v-selection-control__input {
    i {
      color: rgb(var(--v-theme-secondary));
    }
  }

  .v-btn {
    background: rgb(var(--v-theme-secondary)) !important;
    color: white;
  }
}
</style>
