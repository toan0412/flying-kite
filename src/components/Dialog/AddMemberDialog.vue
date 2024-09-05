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
      ></v-text-field>
      <v-list height="450" v-if="searchUsersList.length > 0" lines="one">
        <v-list-item v-for="user in searchUsersList" :key="user._id" :value="user" clickable>
          <template v-slot:prepend>
            <MSAvatar width="40" height="40" :src="user.avatarUrl" />
          </template>
          <v-list-item-title class="ml-3">{{ user.fullname }}</v-list-item-title>
          <v-list-item-subtitle class="ml-3">@{{ user.username }}</v-list-item-subtitle>
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
import { useAllUsersInfoStore } from '@/stores/AllUsersInfoStore'
import { useRoomInfoStore } from '@/stores/RoomInfoStore'
import EmptyCard from '@/components/Card/EmptyCard.vue'
import lodash from 'lodash'

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
    debounceSearch: lodash.debounce(function (searchValue) {
      this.handleSearchUser(searchValue)
    }, 300),

    handleSearchUser(searchValue) {
      this.searchUsersList = this.allUsersInfo.filter(
        (userInfo) =>
          userInfo.username.includes(searchValue) || userInfo.fullname.includes(searchValue)
      )
    },

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
      this.isCallingAPI = true
      const roomId = localStorage.getItem('roomId')
      const newMembers = this.selectedUserIds
      try {
        await ChatService.updateRoom({ roomId, newMembers })
      } catch (error) {
        console.error('Error adding new members to room: ', error)
      } finally {
        this.show = false
        this.isCallingAPI = false
        this.selectedUserIds = []
      }
    }
  },

  watch: {
    visible(newValue) {
      if (newValue) {
        const allUsersInfo = useAllUsersInfoStore().allUsersInfo
        const roomInfo = useRoomInfoStore().roomInfo
        const membersInRoom = roomInfo.members

        const usersNotInRoom = allUsersInfo.filter(
          (user) => !membersInRoom.some((member) => member.userId === user._id)
        )

        this.searchUsersList = usersNotInRoom
        this.allUsersInfo = this.searchUsersList
      }
    },

    searchValue(newVal) {
      if (newVal) {
        this.debounceSearch(newVal)
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
