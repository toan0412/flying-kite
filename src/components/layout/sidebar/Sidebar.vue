<template>
  <!-- Sidebar -->
  <div class="sidebar">
    <div class="sidebar-search pt-3 pl-3">
      <MSTextField
        v-model="searchValue"
        width="298"
        append-inner-icon="mdi-magnify"
        density="compact"
        variant="solo"
        hide-details
        single-line
        placeholder="Tìm kiếm"
        clear-icon="mdi-close-circle-outline"
        clearable
      >
      </MSTextField>
    </div>
    <!-- Status bar -->
    <div class="sidebar__statusbar">
      <div v-if="skeletonLoadingUserInfo" class="sidebar__statusbar__item">
        <v-skeleton-loader width="240" type="list-item-avatar"></v-skeleton-loader>
      </div>

      <div v-if="!skeletonLoadingUserInfo" class="sidebar__statusbar__item">
        <v-avatar size="54">
          <MSAvatar :alt="userInfo.username" :src="userInfo.avatarUrl"></MSAvatar>
        </v-avatar>
        <div class="pl-3">
          <div class="statusbar__item__username">
            {{ userInfo.fullname }}
          </div>
          <div class="statusbar__item__status">
            {{ userInfo.status }}
          </div>
        </div>
      </div>
      <div v-if="!skeletonLoadingUserInfo" class="sidebar__statusbar__item">
        <v-menu transition="slide-x-transition" offset-y>
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" class="mr-2">mdi-cog</v-icon>
          </template>

          <v-list>
            <v-list-item @click="showSettingDialog = true">
              <span>Cài đặt</span>
            </v-list-item>
            <v-list-item @click="logout">
              <span class="text-red-lighten-1">Đăng xuất</span>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
    <!--Sidebar-content -->
    <div class="sidebar__main">
      <div class="sidebar__main__header">
        <div @click.stop="showPrivateRoomDialog = true" class="sidebar__main__header__item">
          <v-icon icon="mdi-account-plus-outline"></v-icon>
          <span class="sidebar__main__header__item--title">Tin nhắn riêng mới</span>
        </div>

        <div @click.stop="showPublicRoomDialog = true" class="sidebar__main__header__item">
          <v-icon icon="mdi-account-multiple-plus-outline"></v-icon>
          <span class="sidebar__main__header__item--title">Tin nhắn nhóm mới</span>
        </div>
      </div>
      <div class="sidebar__main__filter">
        Cuộc trò chuyện gần đây
        <v-icon size="14" icon="mdi-chevron-down" />
      </div>
      <ul class="sidebar__main__content">
        <div v-if="skeletonLoadingConversations">
          <SidebarSkeletonLoading />
        </div>
        <div v-else-if="!skeletonLoadingConversations && !rooms.length">
          <EmptyCard
            image-width="300"
            title="Bạn chưa có cuộc trò chuyện nào"
            subtitle="Hãy bắt đầu tạo cuộc trò chuyện riêng mới hoặc tạo nhóm mới"
          />
        </div>
        <div v-else>
          <li
            @click="handleChangeRoom(conservation)"
            v-for="conservation in searchRoomsList.length ? searchRoomsList : rooms"
            :key="conservation.id"
            class="sidebar__main__content__item"
          >
            <div class="main__content_item__avatar">
              <MSAvatar
                @click.stop="openUserInfoDialog(conservation)"
                width="40"
                height="40"
                cover
                alt="John"
                :src="conservation.avatarUrl"
              ></MSAvatar>
            </div>
            <div class="main__content_item--wrap">
              <div class="main__content_item__fullname">
                {{ conservation.roomName }}
              </div>
              <div class="main__content_item__message--recently">
                {{ conservation.lastMessage }}
              </div>
            </div>
            <div class="d-flex position-absolute align-center right-0 top-0 pt-2 pr-2">
              <p class="texting-time pr-1">
                {{
                  conservation.lastMessageAt ? convertToDayOfWeek(conservation.lastMessageAt) : ''
                }}
              </p>
            </div>
          </li>
        </div>
      </ul>
    </div>

    <!-- Dialogs -->
    <CreatePublicRoomDialog
      v-model:visible="showPublicRoomDialog"
      @close="showPublicRoomDialog = false"
    />

    <CreatePrivateRoomDialog
      v-model:visible="showPrivateRoomDialog"
      @close="showPrivateRoomDialog = false"
    />

    <SettingDialog v-model:visible="showSettingDialog" @close="showSettingDialog = false" />

    <UserInfoDialog
      :userId="idSelected"
      :visible="showUserInfoDialog"
      @close="showUserInfoDialog = false"
    ></UserInfoDialog>
  </div>
</template>
<script>
import MSTextField from '@/components/CustomTextField/MSTextField.vue'
import MSAvatar from '@/components/CustomAvatar/MSAvatar.vue'
import SidebarSkeletonLoading from '@/components/SkeletonLoading/SidebarConversationsSkeletonLoading.vue'
import EmptyCard from '@/components/Card/EmptyCard.vue'
import { getConservationsAPI } from '@/services/RoomServices'
import { getUserAPI, getAllUsersAPI, logoutAPI } from '@/services/UserServices'
import { convertToDayOfWeek } from '@/helper/ConvertDate'
import { useRoomInfoStore } from '@/stores/RoomInfoStore'
import { useAllUsersInfoStore } from '@/stores/AllUsersInfoStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useConversationsStore } from '@/stores/ConversationsStore'
import ChatService from '@/socket/ChatService.js'
import lodash from 'lodash'
import { defineAsyncComponent } from 'vue'

export default {
  data() {
    return {
      userInfo: {},
      rooms: [],
      conversations: [],
      searchValue: '',
      skeletonLoadingUserInfo: true,
      skeletonLoadingConversations: true,
      noneConversations: true,
      showPrivateRoomDialog: false,
      showPublicRoomDialog: false,
      showSettingDialog: false,
      searchRoomsList: [],
      allUsersInfo: null,
      showUserInfoDialog: false,
      idSelected: null
    }
  },
  components: {
    MSTextField,
    MSAvatar,
    SidebarSkeletonLoading,
    EmptyCard,
    CreatePrivateRoomDialog: defineAsyncComponent(() =>
      import('@/components/Dialog/CreatePrivateRoomDialog.vue')
    ),
    CreatePublicRoomDialog: defineAsyncComponent(() =>
      import('@/components/Dialog/CreatePublicRoomDialog.vue')
    ),
    SettingDialog: defineAsyncComponent(() => import('@/components/Dialog/SettingDialog.vue')),
    UserInfoDialog: defineAsyncComponent(() => import('@/components/Dialog/UserInfoDialog.vue'))
  },
  methods: {
    //Láy thông tin người dùng
    async fetchUserInfo() {
      await getUserAPI().then((res) => {
        this.userInfo = res.data.user
        this.skeletonLoadingUserInfo = false
        const userInfoStore = useUserInfoStore()
        userInfoStore.setUserInfo(res.data)
      })
    },

    async getAllUsers() {
      await getAllUsersAPI().then((res) => {
        const allUsersInfoStore = useAllUsersInfoStore()
        allUsersInfoStore.setAllUsersInfo(res.data)
        this.allUsersInfo = allUsersInfoStore.allUsersInfo
      })
    },

    //Lấy các cuộc trò chuyện
    async fetchConservations() {
      try {
        this.skeletonLoadingConversations = true
        const res = await getConservationsAPI()

        this.rooms = this.generateConversationWithUsersInfo(res.data)
      } catch (err) {
        console.log('Error fetching rooms: ', err)
      } finally {
        this.skeletonLoadingConversations = false
      }
    },

    convertToDayOfWeek(dateString) {
      return convertToDayOfWeek(dateString)
    },

    //Hàm tìm kiếm phòng
    debounceSearch: lodash.debounce(function (searchValue) {
      this.handleSearchRoom(searchValue)
    }, 300),

    handleSearchRoom(searchValue) {
      searchValue = searchValue.trim()

      if (!searchValue) {
        this.searchRoomsList = this.rooms
        return
      }

      this.searchRoomsList = this.rooms.filter((roomInfo) => {
        return (roomInfo?.roomName || '').toLowerCase().includes((searchValue || '').toLowerCase())
      })
    },

    //Xử lý onclick vào thẻ li trong sidebar
    async handleChangeRoom(room) {
      const roomId = localStorage.getItem('roomId')
      if (roomId == room._id) return
      const roomInfoStore = useRoomInfoStore()
      roomInfoStore.setRoomInfo(room)
      this.selectedRoomId = room._id
    },

    generateConversationWithUsersInfo(rooms) {
      let conversations = []

      if (!Array.isArray(rooms)) {
        rooms = [rooms]
      }

      // Tạo một Map để tra cứu nhanh userInfo theo userId
      const allUsersInfoMap = new Map(this.allUsersInfo.map((user) => [user._id, user]))

      rooms.forEach((room) => {
        if (room.type == 'private') {
          // Tìm người dùng còn lại trong phòng (khác với người dùng hiện tại)
          const remainUser = room.members.find((member) => member.userId !== this.userInfo._id)
          if (!remainUser) return

          // Lấy thông tin người dùng từ Map
          const userInfo = allUsersInfoMap.get(remainUser.userId)
          if (userInfo) {
            // Thêm thông tin vào danh sách cuộc trò chuyện
            conversations.push({
              _id: room._id,
              type: room.type,
              receiverId: userInfo._id,
              createdBy: room.createdBy,
              members: room.members,
              roomName: userInfo.fullname,
              avatarUrl: userInfo.avatarUrl,
              lastMessage: room.lastMessage || '',
              lastMessageAt: room.lastMessageAt,
              updatedAt: room.updatedAt
            })
          }
        } else {
          conversations.push({
            _id: room._id,
            type: room.type,
            roomName: room.roomName,
            createdBy: room.createdBy,
            members: room.members,
            avatarUrl: room.avatarUrl,
            lastMessage: room.lastMessage || '',
            lastMessageAt: room.lastMessageAt,
            updatedAt: room.updatedAt
          })
        }
      })
      return conversations
    },

    openUserInfoDialog(room) {
      if (room.type !== 'private') return
      this.idSelected = room.receiverId
      this.showUserInfoDialog = true
    },

    logout() {
      logoutAPI()
        .then((res) => {
          if (res.status === 200) {
            this.$router.push('/login')
            this.$emit('is-auth', false)
            localStorage.clear()
          }
        })
        .catch((error) => {
          console.error('Đăng xuất thất bại:', error)
        })
    },

    openSettings() {
      //open setting
      console.log('open settings')
    }
  },

  async created() {
    // Đợi lấy tất cả người dùng
    await this.getAllUsers()

    // Chạy fetchUserInfo và fetchConservations đồng thời
    await Promise.all([this.fetchUserInfo(), this.fetchConservations()])

    // Sau khi cả hai phương thức hoàn tất, tham gia phòng
    ChatService.joinRoom(this.userInfo._id)
  },

  mounted() {
    //Client nhận tin nhắn
    ChatService.onUpdatedRoomReceived((updatedRoom) => {
      // Tìm chỉ mục của phòng trong danh sách phòng hiện tại
      const roomIndex = this.rooms.findIndex((room) => room._id === updatedRoom._id)

      if (roomIndex !== -1) {
        // Nếu phòng tồn tại, cập nhật tin nhắn cuối cùng và thời gian
        if (updatedRoom.avatarUrl) {
          this.rooms[roomIndex].lastMessage = updatedRoom.avatarUrl
        }
        this.rooms[roomIndex].lastMessage = updatedRoom.lastMessage
        this.rooms[roomIndex].lastMessageAt = updatedRoom.lastMessageAt

        // Di chuyển phòng đã cập nhật lên đầu danh sách
        const updatedRoomData = this.rooms.splice(roomIndex, 1)[0]
        this.rooms.unshift(updatedRoomData)
      } else {
        const newRoom = this.generateConversationWithUsersInfo(updatedRoom)
        this.rooms.unshift(newRoom[0])
      }
    })

    ChatService.onLeavedRoomReceived((updatedRoom) => {
      const roomIndex = this.rooms.findIndex((room) => room._id === updatedRoom._id)
      if (roomIndex !== -1) {
        this.rooms.splice(roomIndex, 1)
      }
    })
  },

  computed: {
    currentUser() {
      const userInfoStore = useUserInfoStore()
      return userInfoStore.userInfo
    }
  },

  watch: {
    currentUser: {
      async handler(newVal) {
        if (newVal) {
          this.userInfo = newVal
        }
      }
    },

    searchValue(newVal) {
      this.debounceSearch(newVal)
    },

    rooms(newVal) {
      if (newVal) {
        const conversationsStore = useConversationsStore()
        conversationsStore.setConversations(newVal)
      }
    }
  }
}
</script>

<style lang="scss">
.sidebar {
  position: relative;
  width: 322px;
  height: 100vh;
}

.sidebar__statusbar {
  position: absolute;
  bottom: 0;
  height: 86px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--background-sidebar-color);
  color: var(--primary-text-color);
}

.sidebar__statusbar__item {
  width: fit-content;
  display: flex;
  margin: 0 16px;
  align-items: center;
  background-color: var(--background-sidebar-color);

  .v-skeleton-loader {
    background-color: inherit;
  }

  .statusbar__item__username {
    font-size: 16px;
    font-weight: bold;
  }

  .statusbar__item__status {
    font-size: 12px;
    font-weight: 300;
  }
}

.sidebar__main {
  color: #212121;
  padding: 8px;
}

.sidebar__main__header {
  display: flex;
  justify-content: center;
  padding: 8px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  height: 68px;
  width: 100%;
}

.sidebar__main__header__item {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 48%;
  border: 1px solid var(--border-color);
  padding: 4px;
  margin: 0 4px;
  border-radius: 8px;
}

.sidebar__main__header__item:hover {
  background-color: var(--background-sidebar-color);
}

.sidebar__main__header__item--title {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.sidebar__main__filter {
  padding: 8px;
  display: flex;
  height: 44px;
  align-items: center;
  font-weight: bold;
  color: var(--lighter-text-color);
  font-size: 14px;

  i {
    color: var(--ms-lighter-color);
  }
}

.sidebar__main__content {
  height: calc(100vh - 268px);
  overflow-y: hidden;

  .main__content_item__avatar {
    height: 40px;
    width: 40px;
  }

  .main__content_item--wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 1;
    overflow: hidden;
    align-items: flex-start;
    align-self: stretch;
    justify-content: center;
    margin-left: 10px;
  }

  .sidebar__main__content__item {
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    position: relative;
    height: 60px;
    border-radius: 8px;

    &:hover {
      background-color: var(--background-sidebar-color);
    }
  }

  .main__content_item__fullname {
    height: 22px;
    display: inline;
    flex-grow: 0;
    flex-shrink: 1;
    overflow: hidden;
    white-space: pre;
    text-overflow: ellipsis;
    font-size: 16px;
    line-height: 22px;
    cursor: inherit;
  }

  .main__content_item__message--recently {
    height: 22px;
    display: inline;
    flex-grow: 0;
    flex-shrink: 1;
    overflow: hidden;
    white-space: pre;
    text-overflow: ellipsis;
    font-size: 14px;
    color: rgb(43, 44, 51);
    cursor: inherit;
  }
}

.sidebar__main__content:hover {
  z-index: 1;
  overflow-y: auto;
}

.sidebar-search {
  .v-field__input {
    font-size: 16px;
  }
}

.texting-time {
  font-size: 12px;
  color: var(--lighter-text-color);
}
</style>
