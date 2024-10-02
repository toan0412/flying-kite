<template>
  <div class="login-wrapper">
    <div class="content-left-wrapper">
      <div class="block-1">
        <div class="content-wrapper">
          <div class="content-box">
            <div class="heading-text-wrapper">
              <div class="heading-text">Flying</div>
              <div class="heading-text">Kite</div>
            </div>
            <div class="sub-heading-text">
              Kết nối với bất cứ ai, bất cứ lúc nào, thu hẹp khoảng cách giữa bạn và những người
              thân yêu với các cuộc trò chuyện nhanh và dễ dàng!
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content-right-wrapper">
      <div class="block-2">
        <!-- Component login -->
        <div v-if="!showRegisterForm && !showForgetPasswordForm" class="form-wrapper">
          <div class="font_mainheading">Chào mừng bạn trở lại!</div>
          <div class="desc_label_general">
            Bạn chưa có tài khoản?
            <a href="#" @click="handleShowRegisterForm">Tạo tài khoản</a>
            miễn phí! Chỉ mất ít hơn 1 phút.
          </div>
          <div class="social_login_box">
            <a href="#"></a>
          </div>
          <div class="block-3">
            <div class="_1px-div-line"></div>
            <div class="heading-4">Hoặc</div>
            <div class="_1px-div-line"></div>
          </div>
          <!-- login form-->
          <div class="form-box">
            <form @submit.prevent="handleLogin">
              <div class="form-field-wrapper">
                <div class="text-field-box">
                  <label for="email" class="field-label-2">Email</label>
                  <input
                    v-model="email"
                    class="input_register w-input"
                    maxlength="256"
                    name="email"
                    placeholder="Nhập email"
                    id="email"
                    required=""
                  />
                </div>
                <div class="text-field-box">
                  <label for="password" class="field-label-2">Mật khẩu</label>
                  <div class="password-input-wrapper">
                    <input
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      class="input_register w-input"
                      maxlength="256"
                      name="password"
                      placeholder="Nhập mật khẩu"
                      id="password"
                      required=""
                    />
                    <v-icon
                      @click="showPassword = !showPassword"
                      size="18"
                      class="password-toggle-icon opacity-70"
                    >
                      {{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                    </v-icon>
                  </div>
                </div>
              </div>
              <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
              <button type="submit" name="btn-register" class="large-button w-button">
                Đăng nhập
                <v-progress-circular
                  class="ml-2"
                  v-if="isLoading"
                  size="16"
                  width="3"
                  color="white"
                  indeterminate
                ></v-progress-circular>
              </button>
            </form>

            <div class="social_login_box">
              <button @click="loginWithGoogle" class="google-login-button">
                <v-icon icon="mdi-google-plus" alt="Google Icon" class="pr-3" />
                Đăng nhập bằng Google
              </button>
            </div>

            <div class="div-block-95">
              <div class="small-link">
                Quên mật khẩu?
                <a @click="handleShowForgetPasswordForm">Nhấn vào đây</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Component register -->
        <div v-else-if="!showForgetPasswordForm" class="form-wrapper">
          <div class="font_mainheading">Tạo tài khoản mới</div>
          <div class="desc_label_general">
            Bạn đã có tài khoản?
            <a href="#" @click="handleShowLoginForm">Đăng nhập tại đây</a>
          </div>
          <!-- register form-->
          <div class="form-box">
            <form @submit.prevent="handleSignUp">
              <div class="form-field-wrapper">
                <div class="text-field-box">
                  <label for="email" class="field-label-2">Email</label>
                  <input
                    type="email"
                    v-model="email"
                    class="input_register w-input"
                    maxlength="256"
                    name="email"
                    placeholder="Nhập email"
                    id="email"
                    required=""
                  />
                </div>

                <div class="text-field-box">
                  <label for="password" class="field-label-2">Mật khẩu</label>
                  <div class="password-input-wrapper">
                    <input
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      class="input_register w-input"
                      maxlength="256"
                      name="password"
                      placeholder="Nhập mật khẩu"
                      id="password"
                      required=""
                    />
                    <v-icon
                      @click="showPassword = !showPassword"
                      size="18"
                      class="password-toggle-icon opacity-70"
                    >
                      {{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                    </v-icon>
                  </div>
                </div>

                <div class="text-field-box">
                  <label for="confirmPassword" class="field-label-2">Nhập lại mật khẩu</label>
                  <div class="password-input-wrapper">
                    <input
                      v-model="confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="input_register w-input"
                      maxlength="256"
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      id="confirmPassword"
                      required=""
                    />
                    <v-icon
                      @click="showConfirmPassword = !showConfirmPassword"
                      size="18"
                      class="password-toggle-icon opacity-70"
                    >
                      {{ showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                    </v-icon>
                  </div>
                </div>

                <div class="text-field-box">
                  <label for="fullName" class="field-label-2">Tên đầy đủ</label>
                  <input
                    v-model="fullName"
                    class="input_register w-input"
                    maxlength="256"
                    name="fullName"
                    placeholder="Nhập tên của bạn"
                    id="fullName"
                    required=""
                  />
                </div>
              </div>
              <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
              <button type="submit" name="btn-register" class="large-button w-button">
                Tạo tài khoản
                <v-progress-circular
                  v-if="isLoading"
                  size="20"
                  color="white"
                  indeterminate
                ></v-progress-circular>
              </button>
            </form>
            <div class="social_login_box">
              <button @click="loginWithGoogle" class="google-login-button">
                <v-icon icon="mdi-google-plus" alt="Google Icon" class="pr-3" />
                Đăng nhập bằng Google
              </button>
            </div>
          </div>
        </div>

        <!-- Component forgot password -->
        <div v-else class="form-wrapper">
          <div class="font_mainheading">Quên mật khẩu?</div>
          <div class="desc_label_general">
            Nhập địa chỉ email của bạn vào và chúng tôi sẽ gửi cho bạn mã OTP, hoặc
            <a href="#" @click="handleShowLoginForm">quay lại đăng nhập</a>
          </div>

          <div class="desc_label_general"></div>

          <div class="form-box">
            <!-- Form send OTP -->
            <form
              v-if="!showInputOTPForm && !showNewPasswordForm"
              @submit.prevent="handleSendVerificationEmail"
            >
              <div class="form-field-wrapper">
                <div class="text-field-box">
                  <label for="email" class="field-label-2">Email</label>
                  <input
                    v-model="email"
                    class="input_register w-input"
                    maxlength="256"
                    name="email"
                    placeholder="Nhập email"
                    id="email"
                    required=""
                  />
                </div>
              </div>

              <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>

              <button type="submit" name="btn-send-otp" class="large-button w-button">
                Gửi mã OTP
                <v-progress-circular
                  class="ml-2"
                  v-if="isLoading"
                  size="16"
                  width="3"
                  color="white"
                  indeterminate
                ></v-progress-circular>
              </button>
            </form>

            <!-- Form verify OTP -->
            <form
              v-else-if="showInputOTPForm && !showNewPasswordForm"
              @submit.prevent="handleVerifyOTP"
            >
              <div class="form-field-wrapper d-flex justify-center">
                <v-card
                  :title="userInfoForgetPassword.fullName"
                  :subtitle="userInfoForgetPassword.email"
                >
                  <template v-slot:prepend>
                    <v-avatar class="mr-2" size="54">
                      <v-img :src="userInfoForgetPassword.avatarUrl"></v-img>
                    </v-avatar>
                  </template>

                  <v-card-title>Đây có phải là bạn không?</v-card-title>

                  <div class="div-block-95">
                    <div class="small-link">
                      Đây không phải tôi,
                      <a @click="handleShowForgetPasswordForm">quay lại</a>
                    </div>
                  </div>
                </v-card>

                <v-sheet color="surface">
                  <v-otp-input v-model="inputOTP" variant="solo"></v-otp-input>
                </v-sheet>
              </div>
              <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
              <button type="submit" name="btn-send-otp" class="large-button w-button">
                Xác thực
                <v-progress-circular
                  class="ml-2"
                  v-if="isLoading"
                  size="16"
                  width="3"
                  color="white"
                  indeterminate
                ></v-progress-circular>
              </button>
            </form>

            <!-- Form input new password -->
            <form v-else @submit.prevent="handleChangePassword">
              <div class="form-field-wrapper">
                <div class="text-field-box">
                  <label for="password" class="field-label-2">Mật khẩu mới</label>
                  <div class="password-input-wrapper">
                    <input
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      class="input_register w-input"
                      maxlength="256"
                      name="password"
                      placeholder="Nhập mật khẩu mới"
                      id="password"
                      required=""
                    />
                    <v-icon
                      @click="showPassword = !showPassword"
                      size="18"
                      class="password-toggle-icon opacity-70"
                    >
                      {{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                    </v-icon>
                  </div>
                </div>

                <div class="text-field-box">
                  <label for="confirmPassword" class="field-label-2">Nhập lại mật khẩu mới</label>
                  <div class="password-input-wrapper">
                    <input
                      v-model="confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="input_register w-input"
                      maxlength="256"
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu mới"
                      id="confirmPassword"
                      required=""
                    />
                    <v-icon
                      @click="showConfirmPassword = !showConfirmPassword"
                      size="18"
                      class="password-toggle-icon opacity-70"
                    >
                      {{ showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                    </v-icon>
                  </div>
                </div>
              </div>

              <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>

              <button type="submit" name="btn-send-otp" class="large-button w-button">
                Đổi mật khẩu mới
                <v-progress-circular
                  class="ml-2"
                  v-if="isLoading"
                  size="16"
                  width="3"
                  color="white"
                  indeterminate
                ></v-progress-circular>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  loginAPI,
  signUpAPI,
  loginWithGoogleAPI,
  sendVerificationEmailAPI,
  verifyEmailOTP,
  changePasswordAPI
} from '@/services/UserServices.js'
import { generateAvatarBlob } from '@/helper/GenerateAvatarBlob'
import { googleTokenLogin } from 'vue3-google-login'
import { uploadFilesAndGetUrls } from '@/helper/GetUrlOfMedia'

export default {
  data() {
    return {
      password: '',
      confirmPassword: '',
      email: '',
      fullName: '',
      showRegisterForm: false,
      showForgetPasswordForm: false,
      showInputOTPForm: false,
      showNewPasswordForm: false,
      isLoading: false,
      errorMessage: '',
      inputOTP: '',
      userInfoForgetPassword: {},
      showPassword: false,
      showConfirmPassword: false
    }
  },

  methods: {
    handleLogin() {
      this.errorMessage = ''
      this.isLoading = true
      const userInfo = { email: this.email, password: this.password }
      loginAPI(userInfo)
        .then((res) => {
          if (res.status === 200) {
            this.errorMessage = ''
            localStorage.setItem('accessToken', res.data.tokens.accessToken)
            localStorage.setItem('userId', res.data.user._id)
            this.$router.push('/')
            this.$emit('is-auth', true)
          }
        })
        .catch((error) => {
          this.errorMessage = error.message
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    async handleSignUp() {
      this.error = ''
      this.isLoading = true

      if (this.confirmPassword !== this.password) {
        this.errorMessage = 'Mật khẩu nhập lại không khớp'
        return
      }

      const avatarUrl = await this.generateAvatarUrl(this.fullName, this.email)

      const signUpInfo = {
        password: this.password,
        email: this.email,
        fullName: this.fullName,
        avatarUrl: avatarUrl
      }
      signUpAPI(signUpInfo)
        .then((res) => {
          this.handleShowLoginForm()
          this.email = res.data.email
        })
        .catch((error) => {
          this.errorMessage = error.message
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    handleShowRegisterForm() {
      this.showForgetPasswordForm = false
      this.showRegisterForm = true
      this.resetForm()
    },

    handleShowForgetPasswordForm() {
      this.showForgetPasswordForm = true
      this.showRegisterForm = false
      this.resetForm()
    },

    handleShowLoginForm() {
      this.showForgetPasswordForm = false
      this.showRegisterForm = false
      this.resetForm()
    },

    resetForm() {
      this.password = ''
      this.confirmPassword = ''
      this.email = ''
      this.fullName = ''
      this.errorMessage = ''
      this.showInputOTPForm = false
      this.showPassword = false
      this.showConfirmPassword = false
    },

    //Tạo avataUrl theo seed và background
    async generateAvatarUrl(fullName, email) {
      const avatarBlob = generateAvatarBlob(fullName, 'user')
      const path = `avatars/users/${email}/`
      const avatarUrl = await uploadFilesAndGetUrls([avatarBlob], path)
      return avatarUrl[0].url
    },

    async loginWithGoogle() {
      this.errorMessage = ''
      this.isLoading = true
      try {
        const { access_token } = await googleTokenLogin()
        const response = await loginWithGoogleAPI(access_token)
        if (response.status === 200) {
          localStorage.setItem('accessToken', response.data.tokens.accessToken)
          localStorage.setItem('userId', response.data.user._id)
          this.$router.push('/')
          this.$emit('is-auth', true)
        }
      } catch (error) {
        this.errorMessage = 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.'
      } finally {
        this.isLoading = false
      }
    },

    async handleSendVerificationEmail() {
      this.errorMessage = ''
      this.isLoading = true

      try {
        const res = await sendVerificationEmailAPI({ email: this.email })
        if (res.data._id) {
          this.showInputOTPForm = true
          this.userInfoForgetPassword = res.data
        }
      } catch (error) {
        this.errorMessage = error.message
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },

    async handleVerifyOTP() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        const res = await verifyEmailOTP({
          userId: this.userInfoForgetPassword._id,
          email: this.userInfoForgetPassword.email,
          inputOTP: this.inputOTP
        })

        if (res.data.isEmailVerified == true) {
          this.showNewPasswordForm = true
        } else {
          this.errorMessage = 'OTP không chính xác. Vui lòng thử lại.'
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'
        console.error('Error verifying OTP:', error)
      } finally {
        this.isLoading = false
      }
    },

    async handleChangePassword() {
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Mật khẩu nhập lại không khớp'
        return
      }
      await changePasswordAPI({
        userId: this.userInfoForgetPassword._id,
        email: this.userInfoForgetPassword.email,
        newPassword: this.password
      })
        .then((res) => {
          this.handleShowLoginForm()
          this.email = res.data.email
        })
        .catch((error) => {
          this.errorMessage = error.message
          console.error(error)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-wrapper {
  position: relative;
  display: flex;
  overflow: hidden;
  width: 100%;
  height: 100vh;
}

.content-left-wrapper {
  width: 60%;
  background-image: var(--login-background-color);
  background-position: 0px 0px, 50% 50%;
  background-size: auto, cover;
}

.block-1 {
  display: flex;
  width: auto;
  height: 100%;
  padding: 40px;
  align-items: center;
  color: var(--ms-white);
}

.content-wrapper {
  position: relative;
  justify-content: center;
  z-index: 50;
  display: flex;
  width: 80%;
  height: 100%;
  max-width: none;
  flex-direction: column;
}

.content-box {
  box-sizing: border-box;
}

.heading-text-wrapper {
  display: flex;
  flex-direction: column;
}

.heading-text {
  display: inline;
  max-width: none;
  margin-top: 0px;
  margin-bottom: 20px;
  color: var(--ms-white);
  font-size: 120px;
  line-height: 1em;
  font-weight: 900;
}

.sub-heading-text {
  padding-top: 13px;
  color: var(--ms-white);
  font-size: 23px;
  line-height: 33px;
  font-weight: 300;
}

.content-right-wrapper {
  width: auto;
  align-items: center;
  flex: 1;
  background-color: var(--ms-white);
}

.block-2 {
  position: relative;
  display: flex;
  height: 100%;
  padding: 40px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.form-wrapper {
  display: flex;
  position: relative;
  z-index: 50;
  overflow: visible;
  width: 100%;
  height: 100%;
  max-width: 500px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.font_mainheading {
  margin-top: 0px;
  margin-bottom: 10px;
  align-self: center;
  font-size: 40px;
  line-height: 1.2em;
  font-weight: 700;
  text-align: center;
}

.desc_label_general {
  margin-bottom: 20px;
  margin-left: 0px;
  flex: 0 0 auto;
  font-size: 17px;
  line-height: 1.4em;
  font-weight: 300;
  text-align: center;
  margin-top: 0px;
  font-size: 22px;
}

.block-3 {
  display: flex;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
  justify-content: space-between;
  align-items: center;
}

._1px-div-line {
  width: 40%;
  height: 0.8px;
  background-color: #e4e4e4;
}

.heading-4 {
  margin-bottom: 10px;
  color: #17293b;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
}

.form-box {
  display: flex;
  width: 100%;
  flex-direction: column;
}

.form-field-wrapper {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.text-field-box {
  width: 100%;
  flex-direction: row;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle-icon {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translate(-50%, -36%);
}

.field-label-2 {
  display: none;
  color: rgba(55, 66, 82, 0.9);
  font-weight: 600;
  margin-bottom: 5px;
}

.input_register {
  height: 45px;
  margin-bottom: 15px;
  border-radius: 5px;
  background-color: var(--ms-white);
  font-family: Roboto, sans-serif;
  color: var(--text-color);
  font-size: 16px;
  font-weight: 300;
  display: block;
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.428571429;
  border: 1px solid #cccccc;
}

.large-button {
  display: inline-block;
  padding: 9px 15px;
  width: 100%;
  height: 60px;
  margin: 20px 0px 0px;
  padding-top: 20px;
  padding-bottom: 15px;
  border-radius: 5px;
  background-color: #44546f;
  box-shadow: 1px 10px 20px 0 rgba(0, 0, 0, 0.14);
  transition: background-color 200ms ease, box-shadow 200ms ease, transform 200ms ease,
    -webkit-transform 200ms ease;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border: 0;
  line-height: inherit;
}

a {
  cursor: pointer;
  color: #44546f;
  text-decoration: none;
}

.div-block-95 {
  display: flex;
  justify-content: center;
}

.small-link {
  transition: transform 200ms ease, -webkit-transform 200ms ease;
  color: #94a3b6;
  font-size: 14px;
  line-height: 1.5em;
  font-weight: 300;
  margin-top: 8px;
}

.google-login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  width: 100%;
  height: 45px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  color: #757575;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f5f5f5;
  }

  img {
    width: 18px;
    height: 18px;
    margin-right: 10px;
  }
}

.error-message {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  min-height: 45px;
  border-radius: 5px;
  color: #2e3547;
  font-size: 14px;
  font-weight: 300;
  width: 100%;
  font-size: 14px;
  background-image: linear-gradient(rgb(255 235 233), rgb(255 235 233));
  border: 1px solid rgb(255 129 130 / 40%);
}
</style>