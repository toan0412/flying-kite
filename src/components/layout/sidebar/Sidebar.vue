<template>
  <div class="sidebar">
    <div class="sidebar-search pt-3 pl-3">
      <MSTextField v-model="searchValue" width="298" append-inner-icon="mdi-magnify" density="compact" variant="solo"
        hide-details single-line placeholder="Tìm kiếm"></MSTextField>
    </div>
    <div class="sidebar__statusbar">
      <div v-if="skeletonLoadingUserInfo" class="sidebar__statusbar__item">
        <v-skeleton-loader width="240" type="list-item-avatar"></v-skeleton-loader>
      </div>
      <div v-else class="sidebar__statusbar__item">
        <v-avatar size="54">
          <v-img :alt="userInfo.username" :src="userInfo.avatarUrl"></v-img>
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
      <div class="sidebar__statusbar__item">
        <v-icon icon="mdi-cog"></v-icon>
      </div>
    </div>
    <!--Sidebar-content -->
    <div class="sidebar__main">
      <div class="sidebar__main__filter">
        Cuộc trò chuyện gần đây
        <v-icon size="14" icon="mdi-chevron-down" />
      </div>
      <ul class="sidebar__main__content">
        <div v-if="skeletonLoadingConversations">
          <v-skeleton-loader width="270" type="list-item-avatar"></v-skeleton-loader>
          <v-skeleton-loader width="270" type="list-item-avatar"></v-skeleton-loader>
          <v-skeleton-loader width="270" type="list-item-avatar"></v-skeleton-loader>
          <v-skeleton-loader width="270" type="list-item-avatar"></v-skeleton-loader>
          <v-skeleton-loader width="270" type="list-item-avatar"></v-skeleton-loader>
        </div>
        <div v-else>
          <li @click="handleChangeRoom(conservation)" v-for="(conservation, index) in rooms" :key="index"
            class="sidebar__main__content__item">
            <div class="main__content_item__avatar">
              <v-img alt="John" :src="conservation.avatarUrl"></v-img>
            </div>
            <div class="main__content_item--wrap">
              <div class="main__content_item__fullname">
                {{ conservation.displayName || conservation.fullname }}
              </div>
              <div class="main__content_item__message--recently">
                {{ conservation.lastMessage || '@' + conservation.username }}
              </div>
            </div>
            <div class="d-flex position-absolute align-center right-0 top-0 pt-2 pr-2">
              <p class="texting-time pr-1">
                {{ conservation.lastMessageAt ? convertToDayOfWeek(conservation.lastMessageAt) : '' }}
              </p>
            </div>
          </li>
        </div>
      </ul>
    </div>
  </div>
</template>
<script>
import MSButton from '@/components/button/MSButton.vue'
import MSTextField from '@/components/textfield/MSTextField.vue'
import { getConservationsAPI, getOrCreatePrivateRoomAPI } from '@/services/RoomServices'
import { searchUserAPI, getUserAPI, getAllUsersAPI } from '@/services/UserServices'
import { convertToDayOfWeek } from '@/helper/ConvertDate'
import { useRoomInfoStore } from '@/stores/RoomInfoStore'
import { useUsersInfoStore } from '@/stores/UsersInfoStore'
import lodash from 'lodash'


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
    }
  },
  components: {
    MSButton,
    MSTextField
  },
  methods: {
    async fetchUserInfo() {
      await getUserAPI()
        .then((res) => {
          this.userInfo = res.data.user
          this.skeletonLoadingUserInfo = false
        })
    },

    async getAllUsers() {
      await getAllUsersAPI()
        .then((res) => {
          const usersInfoStore = useUsersInfoStore()
          usersInfoStore.setUsersInfo(res.data)
        })
    },

    async fetchConservations() {
      await getConservationsAPI()
        .then((res) => {
          const rooms = res.data
          this.skeletonLoadingConversations = false
          this.generateConversationWithUsersInfo(rooms)
        })
        .catch((err) => {
          console.log('Error fetching rooms: ', err)
        })
    }
    ,
    convertToDayOfWeek(dateString) {
      return convertToDayOfWeek(dateString);
    },

    handleSearch() {
      searchUserAPI(this.searchValue)
        .then((res) => {
          this.rooms = res.data
          this.skeletonLoadingConversations = false
        })
    },
    //debounce search
    debounceSearch: lodash.debounce(function (data) {
      this.handleSearch(data);
    }, 300),

    //Xử lý onclick vào thẻ li trong sidebar
    async handleChangeRoom(roomInfo) {
      //Tao phòng nếu chưa có (lấy phòng nếu đã tồn tại)
      await getOrCreatePrivateRoomAPI([roomInfo.receiverId])
        .then((res) => {
          const roomInfoStore = useRoomInfoStore()
          roomInfoStore.setRoomInfo(roomInfo)
        })
        .catch(err => {
          console.log('Không tạo (lấy) được thông tin phòng: ', err)
        })
    },

    generateConversationWithUsersInfo(rooms) {
      const conversations = []
      const usersInfoStore = useUsersInfoStore()
      const UsersInfo = usersInfoStore.usersInfo

      rooms.forEach((room) => {
        // Tìm user còn lại trong room (khác với user hiện tại)
        const remainUser = room.members.find((member) => member.userId != this.userInfo._id)
        if (!remainUser) return

        // Tìm thông tin của remainUser trong UsersInfo
        const userInfo = UsersInfo.find(user => user._id == remainUser.userId)
        if (userInfo) {
          // Thêm thông tin vào rooms
          conversations.push({
            _id: room._id,
            receiverId: userInfo._id,
            displayName: userInfo.fullname,
            avatarUrl: userInfo.avatarUrl,
            lastMessage: room.lastMessage,
            lastMessageAt: room.lastMessageAt,
          })
        }
      })
      this.rooms = conversations
    }

  },


  async created() {
    await this.getAllUsers()
    this.fetchUserInfo()
    this.fetchConservations()
  },

  watch: {
    searchValue(newInput) {
      this.skeletonLoadingConversations = true
      if (newInput.length == 0) {
        this.fetchConservations()
      }
      else {
        this.debounceSearch(newInput);
      }
    },
  },

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
  display: flex;
  padding: 0 16px;
  align-items: center;
  background-color: var(--background-sidebar-color);

  .v-skeleton-loader {
    background-color: inherit;
  }

  .statusbar__item__username {
    font-size: 16px;
    font-weight: bold
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
  .main__content_item__avatar {
    height: 40px;
    width: 40px;

    .v-img__img {
      border: 1px solid var(--border-avatar-color);
      background-color: var(--avatar-color);
      border-radius: 6px;
    }
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

  .texting-time {
    font-size: 12px;
    color: var(--lighter-text-color)
  }
}

.sidebar-search {
  .v-field__input {
    font-size: 16px;
  }
}

.v-avatar {
  border: 1px solid var(--border-avatar-color);
  background-color: var(--avatar-color) !important;
}
</style>