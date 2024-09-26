<template>
  <v-dialog v-model="show" max-width="500px" class="private-room-dialog">
    <v-card>
      <v-card-title>
        Tạo cuộc trò chuyện riêng mới
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
        <v-list-item
          ><div class="text-subtitle-2 font-weight-bold opacity-70">Mọi người</div>
        </v-list-item>

        <v-list-item
          v-for="user in searchUsersList"
          :key="user._id"
          clickable
          @click="createPrivateRoom(user)"
        >
          <template v-slot:prepend>
            <MSAvatar width="40" height="40" :src="user.avatarUrl" />
          </template>
          <v-list-item-title class="ml-3">{{ user.fullName }}</v-list-item-title>
          <v-list-item-subtitle class="ml-3">{{
            user.username ? user.username : ''
          }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <EmptyCard
        v-else
        title="Bạn chưa có cuộc trò chuyện nào"
        subtitle="Nhập dữ liệu người dùng và nhấn 'Enter' để tìm kiếm"
      />
    </v-card>
  </v-dialog>
</template>

<script>
import MSAvatar from '@/components/CustomAvatar/MSAvatar.vue'
import { useRoomInfoStore } from '@/stores/RoomInfoStore'
import { useConversationsStore } from '@/stores/ConversationsStore'
import { searchUserAPI } from '@/services/UserServices'
import { createRoomAPI, getRoomByIdAPI } from '@/services/RoomServices'
import EmptyCard from '@/components/Card/EmptyCard.vue'

export default {
  props: {
    visible: Boolean
  },

  data() {
    return {
      searchValue: '',
      searchUsersList: [],
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
      console.log(user)
      const roomInfoStore = useRoomInfoStore()
      const conversationsStore = useConversationsStore()
      const receiverId = user._id
      this.show = false

      // Tìm phòng riêng tư tồn tại
      const privateRoomExist = this.conversations.find((room) => {
        if (room.type === 'public' || room.receiverId === null) return false
        return room.receiverId === receiverId
      })

      if (privateRoomExist) {
        getRoomByIdAPI(privateRoomExist._id).then((res) => {
          const newRoom = res.data
          roomInfoStore.setRoomInfo(newRoom)
        })
        return
      } else {
        try {
          // Tạo phòng
          const roomInfo = {
            members: [receiverId],
            type: 'private'
          }
          const res = await createRoomAPI(roomInfo)
          const newRoom = res.data

          roomInfoStore.setRoomInfo(newRoom)
          conversationsStore.addRoom(newRoom)
        } catch (err) {
          console.error('Lỗi khi tạo phòng:', err)
        }
      }
    },

    handleSearchUser() {
      const userId = localStorage.getItem('userId')
      searchUserAPI(this.searchValue)
        .then((res) => (this.searchUsersList = res.data.filter((user) => user._id !== userId)))
        .catch((err) => console.error('Error while searching users', err))
    }
  },

  watch: {
    visible(newValue, oldValue) {
      if (newValue) {
        this.searchValue = ''
        const conversationsStore = useConversationsStore()
        this.conversations = conversationsStore.conversations
        const mappedConversations = this.conversations
          .filter((room) => room.type === 'private')
          .map((room) => ({
            _id: room.receiverId,
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
