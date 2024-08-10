
<template>
  <div class="content-wrapper">
    <div class="content__header">
      <div class="content__header__avatar">
        <v-img alt="John"
          src="https://cdns-images.dzcdn.net/images/cover/2dc4b0f8be56c076730024177b491b1c/1900x1900-000000-80-0-0.jpg"></v-img>
      </div>
      <div class="content__header__actions">
        <div class="content__header__actions__item">
          <v-icon icon="mdi-magnify"></v-icon>
        </div>
        <div class="content__header__actions__item">
          <v-icon icon="mdi-account-plus">
          </v-icon>
        </div>
        <div class="content__header__actions__item">
          <v-icon icon="mdi-video"></v-icon>
        </div>
        <div class="content__header__actions__item">
          <v-icon icon="mdi-phone"></v-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.content__header {
  display: flex;
  height: 59px;
  border-bottom: 1px solid var(--border-color);
  padding: 8px 16px;
  align-items: center;
}

.content__header__avatar {
  height: 40px;
  width: 40px;

  .v-img__img {
    border: 1px solid var(--ms-border-color);
    border-radius: 6px;
  }
}

.content__header__actions {
  display: flex;
  width: 174px;
  height: 40px;
}
</style>
