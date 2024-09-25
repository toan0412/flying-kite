<template>
  <v-dialog v-model="show" max-width="660" class="setting-dialog">
    <v-card>
      <v-card-actions class="justify-sm-center">
        <div class="text-h6 font-weight-bold">Cài đặt</div>
        <v-btn
          class="position-absolute right-0"
          icon="mdi-close"
          flat
          @click.stop="show = false"
        ></v-btn>
      </v-card-actions>

      <!--Body Card-->
      <div class="setting-dialog__body pt-3">
        <!--Nav Card-->
        <v-list class="setting-dialog__body__nav" width="210">
          <v-list-item @click="indexSetting = 1">
            <v-icon icon="mdi-account-edit-outline"></v-icon>
            <div class="font-weight-bold ml-2">Tài khoản và hồ sơ</div>
          </v-list-item>

          <v-list-item @click="indexSetting = 2">
            <v-icon icon="mdi-cog-outline"></v-icon>
            <div class="font-weight-bold ml-2">Chung</div>
          </v-list-item>

          <v-list-item @click="indexSetting = 3">
            <v-icon icon="mdi-lock-outline"></v-icon>
            <div class="font-weight-bold ml-2">Quyền riêng tư</div>
          </v-list-item>

          <v-list-item @click="indexSetting = 4">
            <v-icon icon="mdi-magic-staff"></v-icon>
            <div class="font-weight-bold ml-2">Giao diện</div>
          </v-list-item>
        </v-list>

        <!--Main Card-->
        <!-- Setting 1-->
        <div v-if="indexSetting == 1" class="setting-dialog__body__main">
          <div class="text-subtitle-1 font-weight-bold opacity-70 pl-2">Hồ sơ của bạn</div>

          <div class="d-flex justify-sm-center mb-5">
            <MSAvatar
              max-width="140"
              height="140"
              cover
              :alt="userInfo.username"
              :src="userInfo.avatarUrl"
            ></MSAvatar>
          </div>

          <div class="setting-dialog__main__item d-flex justify-sm-space-between ma-2">
            <div class="font-weight-bold">ID người dùng:</div>

            <div class="font-weight-bold opacity-60">{{ userInfo._id }}</div>
          </div>

          <div
            class="setting-dialog__main__item d-flex justify-sm-space-between ma-2 editable"
            @click="editableName = true"
          >
            <div class="font-weight-bold">
              Tên người dùng:
              <v-icon size="14" icon="mdi-pencil-outline"></v-icon>
            </div>
            <div v-if="!editableName" class="font-weight-bold opacity-60">
              {{ userInfo.fullName }}
            </div>
            <v-text-field
              max-width="210"
              class="custom-textfield"
              v-else
              v-model="editName"
              autofocus
            >
              <template v-slot:append>
                <v-icon
                  size="16"
                  icon="mdi-close-circle"
                  @click.stop="toggleEditNameField"
                ></v-icon> </template
            ></v-text-field>
          </div>

          <div
            class="setting-dialog__main__item d-flex justify-sm-space-between ma-2 editable"
            @click="editableEmail = true"
          >
            <div class="font-weight-bold">
              Email:
              <v-icon size="14" icon="mdi-pencil-outline"></v-icon>
            </div>
            <div v-if="!editableEmail" class="font-weight-bold opacity-60">
              {{ userInfo.email }}
              <v-icon size="14" icon="mdi-check-circle-outline" color="green-accent-4"></v-icon>
            </div>

            <v-text-field
              v-else
              max-width="210"
              class="custom-textfield"
              v-model="editEmail"
              type="email"
              autofocus
            >
              <template v-slot:append>
                <v-icon
                  size="16"
                  icon="mdi-close-circle"
                  @click.stop="toggleEditEmailField"
                ></v-icon> </template
            ></v-text-field>
          </div>

          <div class="position-absolute right-0 bottom-0 pa-2">
            <MSButton
              color="deep-orange-darken-1"
              :disabled="!isUserInfoEdit"
              @click="handleUpdateUserInfo"
              >Lưu
            </MSButton>
          </div>
        </div>

        <!-- Setting 2-->
        <div v-if="indexSetting == 2" class="setting-dialog__body__main">
          <div class="text-subtitle-1 font-weight-bold opacity-70 pl-2">Chung</div>

          <div class="position-absolute right-0 bottom-0 pa-2">
            <MSButton
              color="deep-orange-darken-1"
              :disabled="!isUserInfoEdit"
              @click="handleUpdateUserInfo"
              >Lưu
            </MSButton>
          </div>
        </div>

        <!-- Setting 3-->
        <div v-if="indexSetting == 3" class="setting-dialog__body__main">
          <div class="text-subtitle-1 font-weight-bold opacity-70 pl-2">Quyền riêng tư</div>

          <div class="position-absolute right-0 bottom-0 pa-2">
            <MSButton
              color="deep-orange-darken-1"
              :disabled="!isUserInfoEdit"
              @click="handleUpdateUserInfo"
              >Lưu
            </MSButton>
          </div>
        </div>

        <!-- Setting 4-->
        <div v-if="indexSetting == 4" class="setting-dialog__body__main">
          <div class="text-subtitle-1 font-weight-bold opacity-70 pl-2">Giao diện</div>

          <div class="position-absolute right-0 bottom-0 pa-2">
            <MSButton
              color="deep-orange-darken-1"
              :disabled="!isUserInfoEdit"
              @click="handleUpdateUserInfo"
              >Lưu
            </MSButton>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import MSAvatar from '@/components/CustomAvatar/MSAvatar.vue'
import MSButton from '@/components/CustomButton/MSButton.vue'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { updateUserAPI } from '@/services/UserServices'

export default {
  data() {
    return {
      userInfo: {},
      editableName: false,
      editableEmail: false,
      editName: '',
      editEmail: '',
      isUserInfoEdit: false,
      indexSetting: 1
    }
  },

  props: {
    visible: Boolean
  },

  components: {
    MSAvatar,
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
    }
  },

  methods: {
    getUserInfo() {
      const userInfoStore = useUserInfoStore()
      this.userInfo = userInfoStore.userInfo
    },

    toggleEditNameField() {
      ;(this.editableName = !this.editableName), (this.editName = '')
    },

    toggleEditEmailField() {
      ;(this.editableEmail = !this.editableEmail), (this.editEmail = '')
    },
    async handleUpdateUserInfo() {
      if (!this.isUserInfoEdit) return
      if (this.editName || this.editEmail) {
        try {
          const res = await updateUserAPI({ fullName: this.editName, email: this.editEmail })
          const updatedUser = res.data
          const userInfoStore = useUserInfoStore()
          userInfoStore.setUserInfo(updatedUser)
        } catch (error) {
          console.error(error)
        } finally {
          this.show = false
        }
      }
    }
  },

  watch: {
    visible(newValue) {
      if (newValue) {
        this.getUserInfo()
      }
    },

    editName(newVal) {
      if (newVal.length !== 0 && newVal !== this.userInfo.fullName) {
        this.isUserInfoEdit = true
      } else {
        this.isUserInfoEdit = false
      }
    },

    editEmail(newVal) {
      if (newVal.length !== 0 && newVal !== this.userInfo.email) {
        this.isUserInfoEdit = true
      } else {
        this.isUserInfoEdit = false
      }
    }
  }
}
</script>

<style lang="scss">
.setting-dialog {
  .v-card-actions {
    border-bottom: 1px solid var(--border-color);
  }
  .setting-dialog__body__nav {
    border: 1px solid var(--border-color);

    .v-list-item {
      cursor: pointer;
      border-bottom: 1px solid var(--border-color);
    }

    .v-list-item:hover {
      opacity: 0.7;
    }

    .v-list-item__content {
      display: flex;
      align-items: center;
    }
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

  .editable {
    cursor: pointer;
  }

  .editable:hover {
    border-radius: 4px;
    padding: 0 4px;
  }
}

.setting-dialog__body {
  display: flex;
}

.setting-dialog__body__main {
  width: 450px;
  height: 500px;
}

.setting-dialog__main__item {
  align-items: center;
  height: 44px;
  border-bottom: 1px solid var(--border-color);
}
</style>
