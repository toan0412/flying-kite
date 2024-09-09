<template>
    <v-dialog v-model="show" max-width="500px" class="private-room-dialog">
      <v-card>
        <v-card-title>
          Chuyển tiếp tin nhắn
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
          <v-list-item
            v-for="user in searchUsersList"
            :key="user._id"
            clickable
            @click="createPrivateRoom(user)"
          >
            <template v-slot:prepend>
              <MSAvatar width="40" height="40" :src="user.avatarUrl" />
            </template>
            <v-list-item-title class="ml-3">{{ user.fullname }}</v-list-item-title>
            <v-list-item-subtitle class="ml-3">@{{ user.username }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <EmptyCard
          v-else
          title="Không tìm thấy người dùng"
          subtitle="Người dùng không tìm thấy hoặc không tồn tại, vui lòng thử lại"
        />
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import MSAvatar from '@/components/CustomAvatar/MSAvatar.vue'
  import { useAllUsersInfoStore } from '@/stores/AllUsersInfoStore'
  import { useConversationsStore } from '@/stores/ConversationsStore'
  import { useRoomInfoStore } from '@/stores/RoomInfoStore'
  import { createRoomAPI } from '@/services/RoomServices'
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
        conversations: []
      }
    },
  
    components: {
      EmptyCard,
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
      async createPrivateRoom(user) {
        const roomInfoStore = useRoomInfoStore()
        const receiverId = user._id
        this.show = false
  
        // Tìm phòng riêng tư tồn tại
        const privateRoomExist = this.conversations.find((room) => {
          if (room.type === 'public') return false
          return room.receiverId === receiverId
        })
  
        if (privateRoomExist) {
          roomInfoStore.setRoomInfo(privateRoomExist)
          return
        } else {
          try {
            // Tạo phòng mới nếu chưa tồn tại
            const res = await createRoomAPI([receiverId])
            const roomInfo = res.data
  
            const userId = localStorage.getItem('userId')
            const allUsersInfoMap = new Map(this.allUsersInfo.map((user) => [user._id, user]))
  
            // Tìm thông tin người dùng nhận
            const receiver = roomInfo.members.find((member) => member.userId !== userId)
            if (!receiver) return
  
            const receiverInfo = allUsersInfoMap.get(receiver.userId)
  
            // Tạo thông tin phòng mới
            const newRoom = {
              _id: roomInfo._id,
              receiverId: receiverInfo._id,
              roomName: receiverInfo.fullname,
              avatarUrl: receiverInfo.avatarUrl
            }
  
            // Cập nhật thông tin phòng mới vào store
            roomInfoStore.setRoomInfo(newRoom)
  
            // (Tùy chọn) Cập nhật danh sách các phòng nếu cần
            this.conversations.push(newRoom)
          } catch (err) {
            console.error('Không tạo (lấy) được thông tin phòng:', err)
          }
        }
      },
  
      debounceSearch: lodash.debounce(function (searchValue) {
        this.handleSearchUser(searchValue)
      }, 300),
  
      handleSearchUser(searchValue) {
        this.searchUsersList = this.allUsersInfo.filter(
          (userInfo) =>
            userInfo.username.includes(searchValue) || userInfo.fullname.includes(searchValue)
        )
      }
    },
  
    watch: {
      visible(newValue, oldValue) {
        if (newValue) {
          const allUsersInfoStore = useAllUsersInfoStore()
          const conversationsStore = useConversationsStore()
          this.searchUsersList = allUsersInfoStore.allUsersInfo
          this.conversations = conversationsStore.conversations
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
  