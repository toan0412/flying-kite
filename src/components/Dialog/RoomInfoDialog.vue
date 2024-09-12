<template>
  <v-dialog v-model="show" max-width="500px" class="room-info-dialog">
    <v-card>
      <v-card-actions class="justify-sm-center">
        <div class="text-h6 font-weight-bold">Thông tin phòng</div>
        <v-btn
          class="position-absolute right-0"
          icon="mdi-close"
          flat
          @click.stop="show = false"
        ></v-btn>
      </v-card-actions>
      <div class="avatar-wrapper">
        <div class="background-avatar">
          <v-avatar size="150">
            <v-img :src="imageUrl" v-if="imageUrl" />
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
      </div>

      <v-file-input
        ref="fileInput"
        accept="image/png, image/jpeg, image/bmp"
        @change="onFileChange"
        hide-input
      >
        <template v-slot:prepend>
          <MSButton @click="triggerFileInput"
            ><span class="font-weight-bold">Chọn ảnh</span></MSButton
          >
        </template>
      </v-file-input>
      <div
        @click.stop="editableRoomName = true"
        v-if="!editableRoomName"
        class="room-info__name d-flex justify-sm-center pt-5"
      >
        {{ roomInfo.roomName }}
      </div>
      <div v-else class="name-text-field-wrapper pt-4 pb-2">
        <v-text-field max-width="210" class="custom-textfield" v-model="editRoomName" autofocus>
          <template v-slot:append>
            <v-icon
              size="16"
              icon="mdi-close-circle"
              @click.stop="editableRoomName = false"
            ></v-icon> </template
        ></v-text-field>
      </div>

      <div class="room-info__created d-flex justify-sm-center">Được tạo bởi {{ createdBy }}</div>
      <div class="text-subtitle-2 font-weight-bold opacity-70 pl-3 pt-3">Thành viên</div>
      <v-list
        max-height="250"
        v-if="membersInRoom.length > 0"
        lines="one"
        class="room-info__members"
      >
        <v-list-item
          class="room-info__members__item"
          clickable
          v-for="member in membersInRoom"
          :key="member._id"
        >
          <template v-slot:prepend>
            <MSAvatar width="40" height="40" :src="member.avatarUrl" />
          </template>
          <v-list-item-title class="ml-3">{{ member.fullname }}</v-list-item-title>
          <v-list-item-subtitle class="ml-3">@{{ member.username }}</v-list-item-subtitle>
          <template v-if="isAdminOfRoom" v-slot:append>
            <div @click="openRemoveMemberConfirmDialog(member._id)" class="remove-member">Xóa</div>
          </template>
        </v-list-item>
        <v-list-item clickable @click="openAddMemberDialog" class="add-member">
          <template v-slot:prepend>
            <v-icon icon="mdi-plus" size="24"></v-icon>
          </template>
          <v-list-item-title>Thêm thành viên mới</v-list-item-title>
        </v-list-item>
      </v-list>

      <div
        class="leave-room font-weight-bold opacity-70 pl-3 pt-3 text-red-accent-4"
        @click="openLeaveRoomConfirmDialog"
      >
        Rời khỏi
      </div>

      <div class="d-flex justify-end pa-2">
        <MSButton
          color="deep-orange-darken-1"
          :disabled="!isRoomInfoEdit"
          @click="handleUpdateRoomInfo"
        >
          <v-progress-circular
            v-if="isCallingAPI"
            :size="20"
            :width="3"
            color="white"
            indeterminate
          >
          </v-progress-circular>
          <span v-else>Lưu</span>
        </MSButton>
      </div>
    </v-card>
    <ConfirmDialog
      ref="removeMemberDialog"
      title="Thông báo"
      message="Bạn có chắc chắn muốn xóa thành viên này?"
      @response="handleResponseRemoveMemberDialog"
    />

    <ConfirmDialog
      ref="leaveRoomDialog"
      title="Thông báo"
      message="Bạn có chắc chắn muốn rời khỏi phòng?"
      @response="handleResponseLeaveRoomDialog"
    />
  </v-dialog>
</template>

<script>
import MSAvatar from '@/components/CustomAvatar/MSAvatar.vue'
import MSButton from '@/components/CustomButton/MSButton.vue'
import { useRoomInfoStore } from '@/stores/RoomInfoStore'
import { useAllUsersInfoStore } from '@/stores/AllUsersInfoStore'
import { uploadFilesAndGetUrls } from '@/helper/GetUrlOfMedia'
import ChatService from '@/socket/ChatService'
import ConfirmDialog from '@/components/Dialog/ConfirmDialog.vue'

export default {
  props: {
    visible: Boolean
  },

  data() {
    return {
      roomInfo: {},
      membersInRoom: [],
      isAdminOfRoom: false,
      memberId: '',
      imageUrl: '',
      fileToUpLoad: [],
      createdBy: '',
      editRoomName: '',
      isRoomInfoEdit: false,
      editableRoomName: false,
      isCallingAPI: false
    }
  },

  components: { MSAvatar, MSButton, ConfirmDialog },

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

    async handleUpdateRoomInfo() {
      this.isCallingAPI = true
      let avatarUrl = ''
      const roomId = localStorage.getItem('roomId')
      const roomName = this.editRoomName

      if (this.imageUrl && this.imageUrl !== this.roomInfo.avatarUrl) {
        const path = `rooms/${roomId}/files`
        const avatarList = await uploadFilesAndGetUrls(this.fileToUpLoad, path)
        avatarUrl = avatarList[0].url
      }

      try {
        ChatService.updateRoom({ roomId, roomName, avatarUrl })
      } catch (err) {
        console.error('Cập nhật phòng thất bại:', err)
      } finally {
        this.isCallingAPI = false
        this.show = false
      }
    },

    async handleRemoveMemberFromRoom() {
      const roomId = localStorage.getItem('roomId')
      const userId = localStorage.getItem('userId')
      const memberId = this.memberId

      try {
        await ChatService.removeMemberFromRoom({ roomId, userId, memberId })

        this.membersInRoom = this.membersInRoom.filter((member) => member._id !== memberId)
      } catch (error) {
        console.error('Error remove member from room', error)
      }
    },

    async leaveRoom() {
      const roomId = localStorage.getItem('roomId')
      const userId = localStorage.getItem('userId')

      try {
        await ChatService.leavePublicRoom({ roomId, userId })
      } catch (error) {
        console.error('Error leave room', error)
      }
    },

    openRemoveMemberConfirmDialog(memberId) {
      this.memberId = memberId
      this.$refs.removeMemberDialog.openDialog()
    },

    openLeaveRoomConfirmDialog() {
      this.$refs.leaveRoomDialog.openDialog()
    },

    handleResponseRemoveMemberDialog(answer) {
      if (answer) {
        this.handleRemoveMemberFromRoom()
      }
    },

    handleResponseLeaveRoomDialog(answer) {
      if (answer) {
        this.leaveRoom()
      }
    },

    openAddMemberDialog() {
      this.$emit('open-Add-Member-Dialog')
    }
  },

  watch: {
    visible(newValue, oldValue) {
      if (newValue) {
        const userId = localStorage.getItem('userId')
        const allUsersInfoStore = useAllUsersInfoStore()
        const allUsersInfo = allUsersInfoStore.allUsersInfo

        const roomInfoStore = useRoomInfoStore()
        this.roomInfo = roomInfoStore.roomInfo
        this.imageUrl = this.roomInfo.avatarUrl
        if (userId === this.roomInfo.createdBy) {
          this.isAdminOfRoom = true
        }

        const allUsersInfoMap = new Map(allUsersInfo.map((user) => [user._id, user]))

        this.createdBy = allUsersInfoMap.get(this.roomInfo.createdBy).fullname

        this.membersInRoom = this.roomInfo.members
          .filter((member) => member.userId !== userId)
          .map((member) => allUsersInfoMap.get(member.userId))
      }
    },

    editRoomName(newVal) {
      if (newVal.length !== 0 && newVal !== this.roomInfo.roomName) {
        this.isRoomInfoEdit = true
      } else {
        this.isRoomInfoEdit = false
      }
    },

    imageUrl(newVal) {
      if (newVal.length !== 0 && newVal !== this.roomInfo.avatarUrl) {
        this.isRoomInfoEdit = true
      } else {
        this.isRoomInfoEdit = false
      }
    }
  }
}
</script>

<style lang="scss">
.room-info-dialog {
  .v-card-title {
    display: flex;
    justify-content: end;
    align-items: center;
    padding: 4px 16px;
  }

  .v-input {
    max-height: 30px;
  }

  .v-text-field {
    .v-field__field {
      height: 36px;
    }

    .v-input__details {
      display: none;
    }

    .v-field__outline {
      display: none;
    }

    .v-field__outline {
      height: 36px;
    }

    .v-input__append {
      margin: 4px;
    }

    .v-field__input {
      min-height: fit-content;
      font-size: 14px;
      height: 36px;
    }
  }

  .name-text-field-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .v-card {
    position: relative;
    height: 650px;

    .mdi-paperclip {
      display: none;
    }

    .v-btn--variant-elevated {
      box-shadow: unset;
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
      background-image: var(--search-background-color);

      .v-avatar {
        margin-top: 24px;
        background-color: white;
        border: 1px solid var(--border-color);
      }
    }
  }

  .avatar-wrapper {
    width: 100%;
    height: 200px;
  }

  .room-info__name {
    font-size: 22px;
    font-weight: bold;

    &:hover {
      cursor: pointer;
      opacity: 0.7;
    }
  }

  .room-info__created {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
    font-size: 14px;
    opacity: 0.9;
  }

  .room-info__members {
    border-bottom: 1px solid var(--border-color);

    .room-info__members__item {
      cursor: pointer;
      .remove-member {
        display: none;
      }

      &:hover {
        .remove-member {
          display: flex;
        }
      }
    }

    .add-member {
      cursor: pointer;
      .v-list-item__prepend {
        width: 30px;
      }
      &:hover {
        opacity: 0.7;
      }
    }

    .remove-member {
      color: var(--text-color);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 13px;
      cursor: pointer;
      width: 54px;
      height: 24px;
      border: 1px solid;
      border-radius: 16px;
    }
  }

  .leave-room {
    cursor: pointer;
  }
}
</style>
