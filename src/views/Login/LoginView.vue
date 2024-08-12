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
              Kết nối với bất cứ ai, bất cứ lúc nào, thu hẹp khoảng cách giữa bạn và những người thân yêu với các cuộc trò chuyện nhanh và dễ dàng!
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content-right-wrapper">
      <div class="block-2">
        <div class="form-wrapper">
          <div class="font_mainheading">Chào mừng bạn trở lại!</div>
            <div class="desc_label_general">
              Bạn chưa có tài khoản? 
              <a href="#">Tạo tài khoản</a>
              , miễn phí! Mất ít hơn 1 phút.
            </div>
            <div class="social_login_box">
              <a href="#"></a>
            </div>
            <div class="block-3">
              <div class="_1px-div-line"></div>
              <div class="heading-4">Hoặc</div>
              <div class="_1px-div-line"></div>

            </div>
            <div class="form-box">
              <form @submit.prevent="handleLogin">
                <div class="form-field-wrapper">
                  <div class="text-field-box">
                    <label for="username" class="field-label-2">Username</label>
                    <input v-model="username" class="input_register w-input" maxlength="256" name="username" placeholder="Nhập tên đăng nhập" id="username" required="">                      </div>
                  <div class="text-field-box">
                    <label for="password" class="field-label-2">Password</label>
                    <input v-model="password" type="password" class="input_register w-input" maxlength="256" name="password" placeholder="Nhập mật khẩu" id="password" required="">
                  </div>
                </div>
                <input type="submit" name="btn-login" class="large-button w-button" value="Đăng nhập">
              </form>
              <div class="div-block-95">
                <div class="small-link">
                  Quên mật khẩu?
                  <strong>
                    <a href="/forgot-password.php">Nhấn vào đây</a>
                  </strong>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data(){
      return{
        username: null,
        password: null,
      }
    },
    methods:{
      handleLogin(){
        console.log(this.username, this.password)
      }
    }
  }
</script>

<style lang="scss">
  .login-wrapper{
    position: relative;
    display: flex;
    overflow: hidden;
    width: 100%;
    height: 100vh;
  }

  .content-left-wrapper{
    width: 60%;
    background-color: #79139e;
    background-image: linear-gradient(180deg, #d49be9, #79139e);
    background-position: 0px 0px, 50% 50%;
    background-size: auto, cover;
  }

  .block-1{
    display: flex;
    width: auto;
    height: 100%;
    padding: 40px;
    align-items: center;
    color: #fff;
  }

  .content-wrapper{
    position: relative;
    justify-content: center;
    z-index: 50;
    display: flex;
    width: 80%;
    height: 100%;
    max-width: none;
    flex-direction: column;
  }

  .content-box{
    box-sizing: border-box;
  }

  .heading-text-wrapper{
    display: flex;
    flex-direction: column;
  }

  .heading-text{
    display: inline;
    max-width: none;
    margin-top: 0px;
    margin-bottom: 20px;
    color: #fff;
    font-size: 120px;
    line-height: 1em;
    font-weight: 900;
  }

  .sub-heading-text{
    padding-top: 13px;
    color: #fff;
    font-size: 23px;
    line-height: 33px;
    font-weight: 300;
  }

  .content-right-wrapper{
    width: auto;
    align-items: center;
    flex: 1;
    background-color: #fff;
  }

  .block-2{
    position: relative;
    display: flex;
    height: 100%;
    padding: 40px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .form-wrapper{
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

  .font_mainheading{
    margin-top: 0px;
    margin-bottom: 10px;
    align-self: center;
    font-size: 40px;
    line-height: 1.2em;
    font-weight: 700;
    text-align: center;
  }

  .desc_label_general{
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

  .block-3{
    display: flex;
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
    justify-content: space-between;
    align-items: center;
  }

  ._1px-div-line{
    width: 40%;
    height: 0.8px;
    background-color: #e4e4e4;
  }

  .heading-4{
    margin-bottom: 10px;
    color: #17293b;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .form-box{
    display: flex;
    width: 100%;
    flex-direction: column;
  }

  .form-field-wrapper{
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .text-field-box{
    width: 100%;
    flex-direction: row;
  }

  .field-label-2{
    display: none;
    color: rgba(55, 66, 82, 0.9);
    font-weight: 600;
    margin-bottom: 5px;
  }

  .input_register{
    height: 45px;
    margin-bottom: 15px;
    border-radius: 5px;
    background-color: #fff;
    font-family: Roboto, sans-serif;
    color: #2e3547;
    font-size: 16px;
    font-weight: 300;
    display: block;
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    line-height: 1.428571429;
    vertical-align: middle;
    border: 1px solid #cccccc;
  }

  .large-button{
    display: inline-block;
    padding: 9px 15px;
    width: 100%;
    height: 60px;
    margin: 20px 0px 0px;
    padding-top: 20px;
    padding-bottom: 15px;
    border-radius: 5px;
    background-color: var(--primary-text-color);
    box-shadow: 1px 10px 20px 0 rgba(0, 0, 0, 0.14);
    transition: background-color 200ms ease, box-shadow 200ms ease, transform 200ms ease, -webkit-transform 200ms ease;
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    border: 0;
    line-height: inherit;
  }

  a{
  color: var(--primary-text-color);
  text-decoration: none;
  }

  .div-block-95{
    display: flex;
    justify-content: center;
  }

  .small-link{
    transition: transform 200ms ease, -webkit-transform 200ms ease;
    color: #94a3b6;
    font-size: 14px;
    line-height: 1.5em;
    font-weight: 300;
    margin-top: 8px;
  }
</style>