<template>
  <v-dialog v-model="show" max-width="500px" class="public-room-dialog">
    <v-card>
      <v-card-actions class="justify-sm-center">
        <div class="text-h6 font-weight-bold">Cuộc trò chuyện nhóm mới</div>
        <v-icon
          class="position-absolute right-0 ma-3"
          icon="mdi-close"
          @click.stop="show = false"
        ></v-icon>
      </v-card-actions>

      <!-- Bước 1 -->
      <div class="card-body" v-if="step1">
        <v-file-input
          class="mb-2"
          ref="fileInput"
          accept="image/png, image/jpeg, image/bmp"
          @change="onFileChange"
          hide-input
        >
        </v-file-input>
        <div class="background-avatar">
          <v-avatar @click="triggerFileInput" size="150">
            <v-img :src="imageUrl" v-if="imageUrl" />
            <v-icon v-if="imageUrl" class="adjust-image" icon="mdi-pencil-outline" size="30" />
            <v-icon size="30" v-else>mdi-camera</v-icon>
            <v-icon
              v-if="imageUrl"
              @click="imageUrl = ''"
              icon=" mdi-close-circle-outline"
              class="remove-avatar"
              size="14"
            ></v-icon>
          </v-avatar>
        </div>
        <div class="card-body-input d-flex justify-sm-center">
          <v-text-field
            v-model="publicRoomName"
            max-width="325"
            placeholder="Tên nhóm"
            variant="underlined"
          ></v-text-field>
        </div>
        <div class="position-absolute right-0 bottom-0 pa-2">
          <MSButton :disabled="!publicRoomName" class="ml-auto" @click="handleNextStep"
            ><span>Tiếp theo</span></MSButton
          >
        </div>
      </div>

      <!-- Bước 2 -->
      <div class="card-body" v-if="step2">
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
                :input-value="isSelected(user._id)"
                @change="toggleSelection(user._id)"
                width="40"
                height="40"
              />
            </template>
          </v-list-item>
        </v-list>
        <EmptyCard
          v-else
          title="Bạn chưa có cuộc trò chuyện nào"
          subtitle="Nhập dữ liệu người dùng và nhấn 'Enter' để tìm kiếm"
        />
        <div class="position-absolute right-0 bottom-0 pa-2 w-100 d-flex justify-content">
          <MSButton class="mr-auto" @click="handleBackStep">Trước</MSButton>

          <MSButton
            class="ml-auto"
            :disabled="selectedUserIds.length == 0"
            @click="createPrivateRoom"
          >
            <v-progress-circular
              v-if="isCallingAPI"
              :size="20"
              :width="3"
              color="white"
              indeterminate
            >
            </v-progress-circular>
            <span v-else>Tạo nhóm mới</span>
          </MSButton>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import MSAvatar from '@/components/CustomAvatar/MSAvatar.vue'
import MSButton from '@/components/CustomButton/MSButton.vue'
import { useRoomInfoStore } from '@/stores/RoomInfoStore'
import { createRoomAPI } from '@/services/RoomServices'
import { useConversationsStore } from '@/stores/ConversationsStore'
import { searchUserAPI } from '@/services/UserServices'
import EmptyCard from '@/components/Card/EmptyCard.vue'
import { uploadFilesAndGetUrls } from '@/helper/GetUrlOfMedia'

export default {
  props: {
    visible: Boolean
  },

  data() {
    return {
      searchValue: '',
      searchUsersList: [],
      allUsersInfo: [],
      imageUrl: '',
      step1: true,
      step2: false,
      publicRoomName: '',
      selectedUserIds: [],
      fileToUpLoad: [],
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
    async createPrivateRoom() {
      const conversationsStore = useConversationsStore()
      const roomInfoStore = useRoomInfoStore()
      this.isCallingAPI = true
      let avatarUrl = ''

      try {
        // Upload avatar nếu có
        if (this.imageUrl) {
          const path = `rooms/temp/files`
          const avatarList = await uploadFilesAndGetUrls(this.fileToUpLoad, path)
          if (avatarList && avatarList.length > 0) {
            avatarUrl = avatarList[0].url
          }
        }

        // Tạo phòng
        const roomInfo = {
          members: this.selectedUserIds,
          roomName: this.publicRoomName,
          type: 'public',
          avatarUrl: avatarUrl
        }
        const res = await createRoomAPI(roomInfo)

        const newRoom = res.data

        roomInfoStore.setRoomInfo(newRoom)
        conversationsStore.addRoom(newRoom)
      } catch (err) {
        console.error('Lỗi khi tạo phòng:', err)
      } finally {
        // Reset lại trạng thái sau khi hoàn tất
        this.isCallingAPI = false
        this.show = false
        this.publicRoomName = ''
        this.imageUrl = ''
      }
    },

    handleSearchUser() {
      searchUserAPI(this.searchValue)
        .then((res) => {
          this.searchUsersList = res.data
          console.log(this.searchUsersList.length)
        })
        .catch((err) => console.error('Error while searching users', err))
    },

    triggerFileInput() {
      // Triggers the file input click event
      this.$refs.fileInput.$el.querySelector('input[type="file"]').click()
    },

    onFileChange(event) {
      const file = event.target.files[0]
      const reader = new FileReader()
      this.fileToUpLoad = [file]

      if (!file) {
        return
      }

      reader.onload = (e) => {
        this.imageUrl = e.target.result
      }

      reader.readAsDataURL(file)
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

    handleNextStep() {
      this.step1 = false
      this.step2 = true
    },

    handleBackStep() {
      this.step2 = false
      this.step1 = true
    }
  },

  watch: {
    visible(newValue, oldValue) {
      if (newValue) {
        const conversationsStore = useConversationsStore()
        this.imageUrl = ''
        this.searchValue = ''
        this.selectedUserIds = []
        this.conversations = conversationsStore.conversations

        const mappedConversations = this.conversations
          .filter((room) => room.type === 'private')
          .map((room) => ({
            _id: room.receiverId,
            fullName: room.roomName,
            avatarUrl: room.avatarUrl
          }))

        this.searchUsersList = mappedConversations
        this.handleBackStep()
      }
    }
  }
}
</script>

<style lang="scss">
.public-room-dialog {
  .card-body {
    position: relative;
    height: 575px;

    .mdi-paperclip {
      display: none;
    }

    .v-btn--variant-elevated {
      box-shadow: unset;
    }
  }

  .remove-avatar {
    position: absolute;
    bottom: 0;
  }

  .card-body-input {
    padding-top: 85px;
  }

  .background-avatar {
    position: relative;
    display: flex;
    justify-content: center;
    width: 100%;
    height: 120px;
    padding-top: 4px;
    background-image: linear-gradient(
      to right,
      rgb(var(--v-theme-primary-darken-1)),
      rgb(var(--v-theme-primary)),
      rgb(var(--v-theme-primary-lighten-1))
    );

    .v-avatar {
      cursor: pointer;
      margin-top: 24px;
      background-color: white;
      border: 1px solid var(--border-color);
    }

    .adjust-image {
      display: none;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .v-avatar:hover {
      background: white;
      opacity: 0.7;

      .adjust-image {
        display: flex;
      }
    }
  }

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

  .v-btn {
    background: rgb(var(--v-theme-secondary)) !important;
    color: white;
  }
}
</style>
