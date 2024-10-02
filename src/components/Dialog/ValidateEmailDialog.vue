<template>
  <v-dialog v-model="show" max-width="625" class="validate-email-dialog">
    <v-card class="py-8 px-6 text-center mx-auto ma-4" elevation="12" max-width="525" width="100%">
      <v-card-actions class="justify-sm-center">
        <div class="text-h6 font-weight-bold">Xác minh tài khoản của bạn</div>
        <v-icon
          class="position-absolute right-0 ma-3"
          icon="mdi-close"
          @click.stop="show = false"
        ></v-icon>
      </v-card-actions>

      <div class="text-subtitle-2 font-weight-bold pa-2 opacity-70">
        Chúng tôi đã gửi cho bạn email đến tài khoản {{ userInfo.email }} <br />
      </div>

      <div class="text-body-2 pa-2">Hãy kiểm tra email của bạn và điền vào đây mã xác nhận.</div>

      <v-sheet color="surface">
        <v-otp-input v-model="inputOTP" variant="solo"></v-otp-input>
      </v-sheet>

      <div class="d-flex justify-center">
        <MSButton
          :disabled="inputOTP.length < 5 || isCallingAPI"
          class="my-4"
          height="40"
          variant="flat"
          width="70%"
          @click="onSubmitVerificationCode"
        >
          <v-progress-circular
            v-if="isCallingAPI"
            :size="20"
            :width="3"
            color="white"
            indeterminate
          >
          </v-progress-circular>
          <span v-else>Xác thực</span>
        </MSButton>
      </div>

      <div class="text-caption">
        Bạn chưa nhận được mã? <a href="#" @click.prevent="resendVerificationCode">Gửi lại</a>
      </div>
      <div class="d-flex justify-center align-center text-red-lighten-1">
        {{ errorMessage }}
      </div>
    </v-card>
  </v-dialog>
</template>
    
<script>
import { useUserInfoStore } from '@/stores/UserInfoStore'
import MSButton from '../CustomButton/MSButton.vue'
import { sendVerificationEmailAPI, verifyEmailOTP } from '@/services/UserServices'

export default {
  data() {
    return {
      userInfo: {},
      inputOTP: '',
      isCallingAPI: false,
      errorMessage: ''
    }
  },

  props: {
    visible: Boolean
  },

  components: { MSButton },

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
    async onSubmitVerificationCode() {
      this.isCallingAPI = true

      try {
        const res = await verifyEmailOTP({
          userId: this.userInfo._id,
          email: this.userInfo.email,
          inputOTP: this.inputOTP
        })

        const userInfo = res.data
        this.$emit('verification-success', userInfo)
        this.show = false
      } catch (error) {
        console.error('Xảy ra lỗi khi xác thực email', error)
        this.errorMessage('Đã xảy ra lỗi khi xác thực. Vui lòng thử lại sau.')
      } finally {
        this.isCallingAPI = false
      }
    },

    async resendVerificationCode() {
      this.inputOTP = ''
      await sendVerificationEmailAPI({ email: this.userInfo.email })
    }
  },

  watch: {
    visible(newValue) {
      if (newValue) {
        const userInfoStore = useUserInfoStore()
        this.userInfo = userInfoStore.userInfo
        this.errorMessage = ''
        this.inputOTP = ''
      }
    }
  }
}
</script>
    
<style lang="scss">
.validate-email-dialog {
  .v-btn {
    background-color: rgb(var(--v-theme-secondary));
    color: white;
  }

  a {
    color: rgb(var(--v-theme-secondary));
  }
}
</style>
    