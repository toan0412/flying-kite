<template>
  <v-dialog v-model="show" max-width="660" class="setting-dialog">
    <v-card>
      <v-card-actions class="justify-sm-center">
        <div class="text-h6 font-weight-bold">Cài đặt</div>
        <v-icon
          class="position-absolute right-0 ma-2"
          icon="mdi-close"
          flat
          @click.stop="show = false"
        ></v-icon>
      </v-card-actions>

      <!--Body Card-->
      <div class="setting-dialog__body pt-3">
        <!--Nav Card-->
        <v-list class="setting-dialog__body__nav" width="210">
          <v-list-item @click="changeIndexSetting(1)">
            <v-icon icon="mdi-account-edit-outline"></v-icon>
            <div class="font-weight-bold ml-2">Tài khoản và hồ sơ</div>
          </v-list-item>

          <v-list-item @click="changeIndexSetting(2)">
            <v-icon icon="mdi-cog-outline"></v-icon>
            <div class="font-weight-bold ml-2">Chung</div>
          </v-list-item>

          <v-list-item @click="changeIndexSetting(3)">
            <v-icon icon="mdi-lock-outline"></v-icon>
            <div class="font-weight-bold ml-2">Quyền riêng tư</div>
          </v-list-item>

          <v-list-item @click="changeIndexSetting(4)">
            <v-icon icon="mdi-magic-staff"></v-icon>
            <div class="font-weight-bold ml-2">Giao diện</div>
          </v-list-item>
        </v-list>

        <!--Main Card-->
        <!-- Setting 1-->
        <div v-if="indexSetting == 1" class="setting-dialog__body__main">
          <div class="setting-dialog__body__content">
            <div
              v-if="!userInfo.isEmailVerified"
              class="d-flex justify-center align-center text-red-lighten-1"
            >
              <v-icon size="20" icon="mdi-alert-circle-outline pr-2"></v-icon>
              <p>Email của bạn chưa được xác thực,</p>
              &nbsp;
              <p @click="sendVerificationEmail" class="text-decoration-underline cursor-pointer">
                xác thực ngay
              </p>
            </div>

            <div class="text-subtitle-1 font-weight-bold opacity-70 pl-2 pt-2">Hồ sơ của bạn</div>

            <div class="d-flex justify-sm-center mb-5">
              <MSAvatar
                max-width="140"
                height="140"
                cover
                :alt="userInfo.email"
                :src="userInfo.avatarUrl"
              ></MSAvatar>
            </div>

            <div class="setting-dialog__main__item d-flex justify-sm-space-between ma-2">
              <div class="font-weight-bold">ID người dùng</div>

              <div class="font-weight-bold opacity-60">{{ userInfo._id }}</div>
            </div>

            <div
              class="setting-dialog__main__item d-flex justify-sm-space-between ma-2 editable"
              @click="editableName = true"
            >
              <div class="font-weight-bold">
                Tên người dùng
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
                Email
                <v-icon size="14" icon="mdi-pencil-outline"></v-icon>
              </div>
              <div v-if="!editableEmail" class="font-weight-bold opacity-60">
                {{ userInfo.email }}
                <v-tooltip location="end" text="Email của người dùng đã được xác thực">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-if="userInfo.isEmailVerified"
                      v-bind="props"
                      size="16"
                      icon="mdi-check-circle"
                      color="green-accent-4"
                    ></v-icon>
                  </template>
                </v-tooltip>

                <v-tooltip location="end" text="Email của người dùng chưa được xác thực">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-if="!userInfo.isEmailVerified"
                      v-bind="props"
                      size="16"
                      icon="mdi-alert-octagon-outline"
                      color="red-lighten-1"
                    ></v-icon>
                  </template>
                </v-tooltip>
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

            <div class="d-flex justify-end align-center text-red-lighten-1 pr-3">
              {{ errorMessage }}
            </div>

            <div class="position-absolute right-0 bottom-0 pa-2">
              <MSButton :disabled="!isEdit" @click="handleUpdateUserInfo">Lưu </MSButton>
            </div>
          </div>
        </div>

        <!-- Setting 2-->
        <div v-if="indexSetting == 2" class="setting-dialog__body__main">
          <div class="setting-dialog__body__content">
            <div class="text-subtitle-1 font-weight-bold opacity-70 pl-2">Chung</div>

            <div class="setting-dialog__main__item d-flex justify-sm-space-between ma-2">
              <div class="font-weight-bold">
                Ngôn ngữ
                <v-icon size="14" icon="mdi-earth"></v-icon>
              </div>
              <div class="font-weight-bold opacity-60">Tiếng Việt</div>
            </div>

            <div class="position-absolute right-0 bottom-0 pa-2">
              <MSButton :disabled="!isEdit" @click="handleUpdateUserInfo">Lưu </MSButton>
            </div>
          </div>
        </div>

        <!-- Setting 3-->
        <div v-if="indexSetting == 3" class="setting-dialog__body__main">
          <div class="setting-dialog__body__content">
            <div class="text-subtitle-1 font-weight-bold opacity-70 pl-2">Quyền riêng tư</div>

            <div class="position-absolute right-0 bottom-0 pa-2">
              <MSButton :disabled="!isEdit" @click="handleUpdateUserInfo">Lưu </MSButton>
            </div>
          </div>
        </div>

        <!-- Setting 4-->
        <div v-if="indexSetting == 4" class="setting-dialog__body__main">
          <div class="setting-dialog__body__content">
            <div class="text-subtitle-1 font-weight-bold opacity-70 pl-2">Giao diện</div>

            <v-row class="mt-4 justify-center ma-2">
              <v-col
                v-for="theme in themes"
                :key="theme.id"
                cols="4"
                class="d-flex flex-column align-center"
              >
                <v-avatar
                  size="42"
                  :style="{
                    backgroundColor: theme.primary,
                    border: `1px solid ${theme.secondary}`
                  }"
                  class="mb-2 cursor-pointer"
                  @click="selectTheme(theme.name)"
                >
                  <v-icon v-if="currentTheme === theme.name" :color="theme.secondary"
                    >mdi-check</v-icon
                  >
                </v-avatar>
                <span class="text-caption">{{ theme.displayName }}</span>
              </v-col>
            </v-row>

            <div class="position-absolute right-0 bottom-0 pa-2">
              <MSButton color="deep-orange-darken-1" :disabled="!isEdit" @click="handleUpdateTheme">
                Lưu
              </MSButton>
            </div>
          </div>
        </div>
      </div>

      <ValidateEmailDialog
        @verification-success="handleVerificationSuccess"
        :visible="showValidateEmailDialog"
        @close="showValidateEmailDialog = false"
      />
    </v-card>
  </v-dialog>
</template>

<script>
import MSAvatar from '@/components/CustomAvatar/MSAvatar.vue'
import MSButton from '@/components/CustomButton/MSButton.vue'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { updateUserAPI, sendVerificationEmailAPI } from '@/services/UserServices'
import ValidateEmailDialog from './ValidateEmailDialog.vue'

export default {
  data() {
    return {
      userInfo: {},
      editableName: false,
      editableEmail: false,
      editName: '',
      editEmail: '',
      isEdit: false,
      isThemeEdit: false,
      showValidateEmailDialog: false,
      currentTheme: '',
      indexSetting: 1,
      errorMessage: '',
      themes: [
        {
          id: 0,
          displayName: 'Màu mặc định',
          name: 'default',
          primary: '#f1f2f4',
          secondary: '#44546f'
        },
        {
          id: 1,
          displayName: 'Màu tím pastel',
          name: 'pastelPurple',
          primary: '#e8dff5',
          secondary: '#6a4c93'
        },
        {
          id: 2,
          displayName: 'Màu hồng pastel',
          name: 'pastelPink',
          primary: '#fce1e4',
          secondary: '#ff6b6b'
        },
        {
          id: 3,
          displayName: 'Màu vàng pastel',
          name: 'pastelYellow',
          primary: '#fcf4dd',
          secondary: '#ffa62b'
        },
        {
          id: 4,
          displayName: 'Màu lục pastel',
          name: 'pastelGreen',
          primary: '#ddedea',
          secondary: '#2ec4b6'
        },
        {
          id: 5,
          displayName: 'Màu lam pastel',
          name: 'pastelBlue',
          primary: '#daeaf6',
          secondary: '#3d5a80'
        }
      ]
    }
  },

  props: {
    visible: Boolean
  },

  components: {
    MSAvatar,
    MSButton,
    ValidateEmailDialog
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
      if (!this.isEdit) return
      if (this.editName || this.editEmail) {
        try {
          const res = await updateUserAPI({ fullName: this.editName, email: this.editEmail })
          if (res.status == 200) {
            const updatedUser = res.data
            const userInfoStore = useUserInfoStore()
            userInfoStore.setUserInfo(updatedUser)
            this.show = false
          }
        } catch (error) {
          this.errorMessage = error.message
        }
      }
    },

    handleVerificationSuccess(userInfo) {
      this.userInfo = userInfo
      const userInfoStore = useUserInfoStore()
      userInfoStore.setUserInfo(userInfo)
    },

    selectTheme(themeName) {
      if (this.currentTheme !== themeName) {
        this.currentTheme = themeName
        this.isEdit = true
      }
    },

    handleUpdateTheme() {
      this.$vuetify.theme.global.name = this.currentTheme
      localStorage.setItem('app_theme', this.currentTheme)
      this.show = false
    },

    changeIndexSetting(index) {
      this.indexSetting = index
      this.isEdit = false
    },

    async sendVerificationEmail() {
      try {
        this.showValidateEmailDialog = true
        await sendVerificationEmailAPI({ userId: this.userInfo._id, email: this.userInfo.email })
      } catch (error) {
        console.error(error)
      }
    },

    resetSetting() {
      this.isEdit = false
      this.isThemeEdit = false
      this.currentTheme = this.$vuetify.theme.global.name || ''
      this.editableName = false
      this.editableEmail = false
      this.editName = ''
      this.editEmail = ''
      this.errorMessage = ''
      this.indexSetting = 1
    }
  },

  watch: {
    visible(newValue) {
      if (newValue) {
        this.getUserInfo()
        this.resetSetting()
      }
    },

    editName(newVal) {
      if (newVal.length !== 0 && newVal !== this.userInfo.fullName) {
        this.isEdit = true
      } else {
        this.isEdit = false
      }
    },

    editEmail(newVal) {
      if (newVal.length !== 0 && newVal !== this.userInfo.email) {
        this.isEdit = true
      } else {
        this.isEdit = false
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
  .setting-dialog__body {
    display: flex;
  }

  .setting-dialog__body__main {
    width: 450px;
    height: 500px;
  }

  .setting-dialog__body__content {
    margin: 12px;
  }

  .setting-dialog__main__item {
    align-items: center;
    height: 44px;
    border-bottom: 1px solid var(--border-color);
  }

  .v-btn {
    background: rgb(var(--v-theme-secondary)) !important;
    color: white;
  }
}
</style>
