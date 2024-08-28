<template>
  <v-dialog v-model="show" max-width="500px" class="public-room-dialog">
    <!-- Bước 1 -->
    <v-card height="515">
      <v-card-title>
        Tạo cuộc trò chuyện nhóm mới
        <v-btn icon="mdi-close" flat @click.stop="show = false"></v-btn>
      </v-card-title>

      <div class="card-body" v-if="step1">
        <v-file-input class="mb-2" ref="fileInput" accept="image/png, image/jpeg, image/bmp" @change="onFileChange"
          hide-input>
          <template v-slot:prepend>
            <MSButton @click="triggerFileInput">Chọn ảnh</MSButton>
          </template>
        </v-file-input>
        <div class="background-avatar">
          <v-avatar size="150">
            <v-img :src="imageUrl" v-if="imageUrl" />
            <v-icon size="30" v-else>mdi-camera</v-icon>
            <v-icon v-if="imageUrl" @click="imageUrl = ''" icon=" mdi-close-circle-outline" class="remove-avatar"
              size="14"></v-icon>
          </v-avatar>
        </div>
        <div class="card-body-input d-flex justify-sm-center">
          <v-text-field v-model="publicRoomName" max-width="325" placeholder="Tên nhóm"
            variant="underlined"></v-text-field>
        </div>
        <v-card-actions class="card-body-actions">
          <MSButton :disabled="!publicRoomName" class="ml-auto" @click="step1 = false; step2 = true">Tiếp theo</MSButton>
        </v-card-actions>
      </div>

      <!-- Bước 2 -->
      <div class="card-body" v-if="step2">
        <v-text-field v-model="searchValue" clearable clear-icon="mdi-close" placeholder="Tìm kiếm" variant="underlined"
          class="create-room-search"></v-text-field>
        <v-list max-height="325" v-if="searchUsersList.length > 0" lines="one">
          <v-list-item v-for="user in searchUsersList" :key="user._id" :value="user" clickable>
            <template v-slot:prepend>
              <v-img width="40" height="40" :src="user.avatarUrl" />
            </template>
            <v-list-item-title class="ml-3">{{ user.fullname }}</v-list-item-title>
            <v-list-item-subtitle class="ml-3">@{{ user.username }}</v-list-item-subtitle>
            <template v-slot:append>
              <v-checkbox-btn :input-value="isSelected(user._id)" @change="toggleSelection(user._id)"
                color="deep-orange-darken-1" width="40" height="40" />
            </template>
          </v-list-item>
        </v-list>
        <EmptyCard v-else title="Không tìm thấy người dùng"
          subtitle="Người dùng không tìm thấy hoặc không tồn tại, vui lòng thử lại" />
        <v-card-actions class="card-body-actions">
          <MSButton @click="step1 = true; step2 = false">Trước</MSButton>
          <MSButton class="ml-auto" @click="createPrivateRoom">Tạo nhóm mới</MSButton>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import MSButton from '@/components/CustomButton/MSButton.vue'
import { useAllUsersInfoStore } from '@/stores/AllUsersInfoStore'
import { useRoomInfoStore } from '@/stores/RoomInfoStore'
import { createRoomAPI } from '@/services/RoomServices'
import EmptyCard from '@/components/Card/EmptyCard.vue'
import { uploadFilesAndGetUrls } from '@/helper/GetUrlOfMedia'
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
      imageUrl: "",
      step1: true,
      step2: false,
      publicRoomName: '',
      selectedUserIds: [],
      fileToUpLoad: [],
    }
  },

  components: {
    EmptyCard,
    MSButton
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
    },
  },
  methods: {
    async createPrivateRoom() {
      const type = "public"
      let avatarUrl = ""

      if (this.imageUrl) {
        const roomId = localStorage.getItem('roomId')
        const path = `rooms/${roomId}/files`
        const avatarList = await uploadFilesAndGetUrls(this.fileToUpLoad, path)
        avatarUrl = avatarList[0].url
      }


      try {
        // Tạo phòng 
        const res = await createRoomAPI(this.selectedUserIds, this.publicRoomName, type, avatarUrl);

        // Tạo thông tin phòng mới
        const newRoom = {
          _id: res.data._id,
          type: res.data.type,
          displayName: res.data.roomName,
          avatarUrl: res.data.avatarUrl,
          lastMessageAt: res.data.lastMessageAt,
        };

        // Cập nhật thông tin phòng vào store
        const roomInfoStore = useRoomInfoStore();
        roomInfoStore.setRoomInfo(newRoom);
      } catch (err) {
        console.error('Không tạo được phòng:', err);
      }
      finally {
        this.show = false;
      }
    },

    debounceSearch: lodash.debounce(function (searchValue) {
      this.handleSearchUser(searchValue)
    }, 300),

    handleSearchUser(searchValue) {
      this.searchUsersList = this.allUsersInfo.filter(userInfo =>
        userInfo.username.includes(searchValue) ||
        userInfo.fullname.includes(searchValue)
      );
    },

    triggerFileInput() {
      // Triggers the file input click event
      this.$refs.fileInput.$el.querySelector('input[type="file"]').click();
    },

    onFileChange(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      this.fileToUpLoad = [file]

      if (!file) {
        return;
      }

      reader.onload = e => {
        this.imageUrl = e.target.result;
      }

      reader.readAsDataURL(file);
    },

    isSelected(userId) {
      return this.selectedUserIds.includes(userId);
    },

    toggleSelection(userId) {
      const index = this.selectedUserIds.indexOf(userId);
      if (index === -1) {
        this.selectedUserIds.push(userId);
      } else {
        this.selectedUserIds.splice(index, 1);
      }
    },

  },


  watch: {
    visible(newValue, oldValue) {
      if (newValue) {
        const allUsersInfoStore = useAllUsersInfoStore()
        this.searchUsersList = allUsersInfoStore.allUsersInfo
        this.allUsersInfo = this.searchUsersList
      }
    },

    searchValue(newVal) {
      if (newVal) {
        this.debounceSearch(newVal)
      }
    },
  },
}
</script>

<style lang="scss">
.public-room-dialog {

  .card-body {
    height: 500px;
    position: relative;

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


  .card-body-actions {
    width: 100%;
    position: absolute;
    bottom: 0;
    padding-bottom: 12px;
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
      border: 1px solid var(--border-color)
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
