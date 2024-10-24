<template>
  <v-dialog v-model="show" max-width="500px" class="private-room-dialog">
    <v-card>
      <v-card-actions class="justify-sm-center">
        <div class="text-h6 font-weight-bold">Cuộc trò chuyện video mới</div>
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
      <v-list height="450" v-if="searchUsersList.length > 0" lines="one">
        <v-list-item
          ><div class="text-subtitle-2 font-weight-bold opacity-70">Mọi người</div>
        </v-list-item>

        <v-list-item
          v-for="user in searchUsersList"
          :key="user._id"
          clickable
          @click="createCallRoom(user)"
        >
          <template v-slot:prepend>
            <MSAvatar width="40" height="40" :src="user.avatarUrl" />
          </template>
          <v-list-item-title class="ml-3">{{ user.fullName }}</v-list-item-title>
          <v-list-item-subtitle class="ml-3">{{
            user.email ? user.email : ''
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
import ChatService from '@/socket/ChatService'
import EmptyCard from '@/components/Card/EmptyCard.vue'

export default {
  props: {
    visible: Boolean,
    hasVideo: Boolean
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
    async createCallRoom(user) {
      console.log(this.hasVideo)
      const roomInfoStore = useRoomInfoStore()
      const roomInfo = roomInfoStore.roomInfo

      const callerId = localStorage.getItem('userId')
      const callId = Math.floor(Math.random() * 1000000000).toString()
      const roomId = roomInfo._id

      const userIdsToRing = [user._id]

      const frontendUrl = import.meta.env.VITE_FRONTEND_URL

      const url = new URL(`${frontendUrl}call`)

      url.searchParams.append('room_id', roomId)
      url.searchParams.append('call_id', callId)
      userIdsToRing.forEach((userId) => url.searchParams.append('users_to_ring', userId))
      url.searchParams.append('caller_id', callerId)
      url.searchParams.append('has_video', this.hasVideo)

      ChatService.initiateCall({ url, userIdsToRing })
      window.open(url.toString(), '_blank', 'width=1268,height=768')
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
}
</style>
  