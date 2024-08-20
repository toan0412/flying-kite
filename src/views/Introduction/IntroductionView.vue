<template>
  <div class="introduction__wrapper">
    <div class="introduction__main">
      <div class="introduction__main__content">
        <div class="introduction__main__content__header">
          <v-avatar size="54">
            <v-img :alt="userInfo.username" :src="userInfo.avatarUrl"></v-img>
          </v-avatar>
        </div>
      </div>
      <div class="introduction__main__footer">
      </div>
    </div>
  </div>
</template>

<script>
import { useUserInfoStore } from '@/stores/UserInfoStore'

  export default{

    data(){
      return{
        userInfo = {}
      }
    },

    mounted(){
      const useUserInfoStore = useUserInfoStore()
      const userInfo = useUserInfoStore.userInfo
    }
    
  }
  
</script>

<style lang="scss">
.introduction__wrapper {
  position: relative;
  display: flex;
  overflow: hidden;
  align-items: stretch;
  height: 100%;
}

.introduction__main {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  padding-left: 45px;
  padding-right: 45px;
  background-color: rgb(255, 255, 255);
  opacity: 1;
  transition: none 0s ease 0s;
}

.introduction__main__content {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  align-self: stretch;
}

.introduction__main__footer {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  overflow: hidden;
  align-items: stretch;
  opacity: 1;
}
</style>