<template>
  <div class="sidebar">
    <div class="sidebar-search pt-3 pl-3">
      <MSTextField width="298" append-inner-icon="mdi-magnify" density="compact" variant="solo" hide-details single-line
        placeholder="Tìm kiếm"></MSTextField>
    </div>
    <div class="sidebar__statusbar">
      <div class="sidebar__statusbar__item">
        <v-avatar size="54">
          <v-img alt="John"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQehhyMBXUAuR8iqYs0dkkE09Ycc2la0dJWdg&s"></v-img>
        </v-avatar>
        <div class="pl-3">
          <div class="statusbar__item__username">
            {{ userInfo.fullname }}
          </div>
          <div class="statusbar__item__status">
            {{ userInfo.status }}
          </div>
        </div>
      </div>
      <div class="sidebar__statusbar__item">
        <v-icon icon="mdi-cog"></v-icon>
      </div>
    </div>
    <div class="sidebar__main pa-4">
      <div class="sidebar__main__filter">
        Cuộc trò chuyện gần đây
        <v-icon size="14" icon="mdi-chevron-down" />
      </div>
      <ul class="sidebar__main__content">
        <li class="sidebar__main__content__item">
          <div class="main__content_item__avatar">
            <v-img alt="John"
              src="https://cdns-images.dzcdn.net/images/cover/2dc4b0f8be56c076730024177b491b1c/1900x1900-000000-80-0-0.jpg"></v-img>
          </div>
          <div class="main__content_item--wrap">
            <div class="main__content_item__fullname">
              Nguyễn Trường Toàn
            </div>
            <div class="main__content_item__message--recently">
              Hello chào bạn
            </div>
          </div>
          <div class="d-flex position-absolute align-center right-0 top-0 pt-2">
            <p class="texting-time pr-1">
              T4
            </p>
            <v-icon size="14" icon="mdi-pin-outline"></v-icon>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import MSButton from '@/components/button/MSButton.vue'
import MSTextField from '@/components/textfield/MSTextField.vue'

export default {
  data() {
    return {
      userInfo: null
    }
  },
  components: {
    MSButton,
    MSTextField
  },
  created() {
    let userInfo = localStorage.getItem('userInfo');
    this.userInfo = userInfo ? JSON.parse(userInfo) : null
  }
}
</script>

<style lang="scss">
.sidebar {
  position: relative;
  width: 322px;
  height: 100vh;
}

.sidebar__statusbar {
  position: absolute;
  bottom: 0;
  height: 86px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--background-sidebar-color);
  color: var(--primary-text-color);
}

.sidebar__statusbar__item {
  display: flex;
  padding: 0 16px;
  align-items: center;

  .statusbar__item__username {
    font-size: 16px;
    font-weight: bold
  }

  .statusbar__item__status {
    font-size: 12px;
    font-weight: 300;
  }
}

.sidebar__main {
  color: #212121;
}

.sidebar__main__filter {
  display: flex;
  height: 44px;
  align-items: center;
  font-weight: bold;
  color: var(--lighter-text-color);
  font-size: 14px;

  i {
    color: var(--ms-lighter-color);
  }
}

.sidebar__main__content {
  .main__content_item__avatar {
    height: 40px;
    width: 40px;

    .v-img__img {
      border: 1px solid var(--ms-border-color);
      border-radius: 6px;
    }
  }

  .main__content_item--wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 1;
    overflow: hidden;
    align-items: flex-start;
    align-self: stretch;
    justify-content: center;
    margin-left: 10px;
  }

  .sidebar__main__content__item {
    display: flex;
    align-items: center;
    position: relative;
    height: 60px;
  }

  .main__content_item__fullname {
    display: inline;
    flex-grow: 0;
    flex-shrink: 1;
    overflow: hidden;
    white-space: pre;
    text-overflow: ellipsis;
    font-size: 16px;
    line-height: 22px;
    cursor: inherit;
  }

  .main__content_item__message--recently {
    display: inline;
    flex-grow: 0;
    flex-shrink: 1;
    overflow: hidden;
    white-space: pre;
    text-overflow: ellipsis;
    font-size: 14px;
    color: rgb(43, 44, 51);
    cursor: inherit;
  }

  .texting-time {
    font-size: 12px;
    color: var(--lighter-text-color)
  }
}

.sidebar-search {
  .v-field__input {
    font-size: 16px;
  }
}

.v-avatar {
  border: 1px solid var(--ms-border-color);
}
</style>