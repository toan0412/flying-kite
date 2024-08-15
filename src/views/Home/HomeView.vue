
<template>
  <div class="content-wrapper">
    <div class="content__header">
      <div class="content__header__info">
        <v-img width="40" height="40" :alt="conversation.fullname" :src="conversation.avatarUrl"></v-img>
        <p class="content__header__info__name">{{ conversation.fullname || '' }}</p>
      </div>
      <div class="content__header__actions">
        <div class="content__header__actions__item">
          <v-icon size="20" icon="mdi-magnify"></v-icon>
        </div>
        <div class="content__header__actions__item">
          <v-icon size="20" icon="mdi-account-plus-outline"> </v-icon>
        </div>
        <div class="content__header__actions__item ml-1 header-action-background">
          <v-icon color="white" size="20" icon="mdi-video-outline"></v-icon>
        </div>
        <div class="content__header__actions__item ml-1 header-action-background">
          <v-icon color="white" size="20" icon="mdi-phone-outline"></v-icon>
        </div>
      </div>
    </div>
    <div class="content__input">
      <div class="content__input--wrapper">
        <div class="content__input__content">
          <MSTextField width="700" height="50" prepend-inner-icon="mdi-emoticon-outline" density="compact" variant="solo"
            hide-details single-line placeholder="Nhập tin nhắn"></MSTextField>
        </div>
        <div class="content__input__actions">
          <div class="content__input__actions__item">
            <v-icon size="20" icon="mdi-microphone-outline" />
          </div>
          <div class="content__input__actions__item">
            <v-icon size="20" icon="mdi-card-account-details-outline " />
          </div>
          <div class="content__input__actions__item">
            <v-icon size="20" icon="mdi-camera-outline" />
          </div>
          <div class="content__input__actions__item">
            <v-icon size="20" icon="mdi-dots-horizontal" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MSTextField from '@/components/textfield/MSTextField.vue'
import { useConversationStore } from '@/stores/ConversationStore'
import { getConservationByRoomIdAPI } from '@/services/MessageService'

export default {
  components: {
    MSTextField
  },

  data() {
    return {
      conversation: {},
      message: []
    };
  },

  methods: {
    getConservationByRoomId() {
      getConservationByRoomIdAPI(this.conversation.id)
        .then(response => {
          this.message = response.data
          console.log(this.message)
        })
        .catch(error => {
          console.log(error)
        })
    }
  },

  props: {
    roomId: String
  },

  computed: {
    currentConversation() {
      const conversationStore = useConversationStore();
      return conversationStore.conversation
    }
  },

  watch: {
    currentConversation(newConversation, oldConversation) {
      this.conversation = newConversation
      this.getConservationByRoomId()
    }
  }

}
</script>


<style lang="scss">
.content__header {
  display: flex;
  justify-content: space-between;
  height: 59px;
  border-bottom: 1px solid var(--border-color);
  padding: 8px 16px;
  align-items: center;
}

.content__header__info {
  display: flex;
  align-items: center;
  height: 40px;

  .v-img__img {
    background-color: var(--avatar-color);
    border: 1px solid var(--ms-border-color);
    border-radius: 6px;
  }

  .content__header__info__name {
    font-size: 16px;
    font-weight: 700;
    padding-left: 8px;
    color: var(--text-color);
  }
}

.content__header__actions {
  display: flex;
  width: 174px;
  height: 40px;
}

.content__header__actions__item {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.header-action-background {
  background-color: var(--ms-primary-color);
}

.content__input {
  display: flex;
  align-items: center;
  position: fixed;
  height: 86px;
  width: calc(100% - 322px);
  bottom: 0;

  .content__input--wrapper {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
  }

  .content__input__actions {
    display: flex;
    height: 46px;
    padding-left: 16px;
  }

  .content__input__actions__item {
    background-color: var(--background-icon-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 46px;
    width: 50px;
    margin: 0 4px;
  }

}
</style>
