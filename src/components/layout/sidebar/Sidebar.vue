<template>
  <div class="sidebar">
    <div class="sidebar__header">
      <div class="header__user">
        <div class="header__user__avatar">
            <v-avatar>
              <v-img
                alt="John"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQehhyMBXUAuR8iqYs0dkkE09Ycc2la0dJWdg&s"
              ></v-img>
            </v-avatar>
          <div class="header__user__userinfo">
            <div class="header__user__fullname">
            nguyen truong toan
            </div>
            <div class="header__user__status">
              Quay lại ngay
            </div>
          </div>
        </div>
        <div class="header__user__actions">
          <v-icon icon="mdi-dots-horizontal"/>
        </div>
      </div>
      <div class="header__search">
        <v-text-field
          append-inner-icon="mdi-magnify"
          placeholder="Mọi người, nhóm, tin nhắn, web"
          density="compact"
          variant="solo"
          hide-details
          single-line
          height="50"
        ></v-text-field>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .sidebar{
    width: 322px;
    height: 100vh;
    background-color: white;
    color: var(--text-color);
    border-right: 1px solid #cecece;
  }
  .sidebar__header{
    height: 106px;
    display: flex;
    flex-direction: column;
    background-color: var(--background-sidebar-color);
  }
  
  .header__user{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 8px 16px;
    align-items: center;

    .header__user__userinfo{
      padding-left: 16px;

      .header__user__fullname{
        font-size: 16px;
        font-weight: 500;
      }
      .header__user__status{
        font-size: 12px;
        font-weight: 300;
      }
    }
  }

  .header__search{
    padding: 0 16px;
    .v-input__control{
      height: 36px;
    }
    .v-field__input{
      font-size: 14px;
    }
  }

  .header__user__avatar{
    display: flex;
  }
</style>