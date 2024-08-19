
<template>
  <div class="content-wrapper">
    <div class="content__header">
      <v-skeleton-loader v-if="skeletonLoadingRoomInfo" width="270" type="list-item-avatar"></v-skeleton-loader>
      <div v-else class="content__header__info">
        <v-img width="40" height="40" :alt="room.fullname" :src="room.avatarUrl"></v-img>
        <p class="content__header__info__name">{{ room.displayName || '' }}</p>
      </div>
      <!-- header -->
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

    <!-- conversation -->
    <div class="content__conversation">
      <div class="content__conversation--left"></div>
      <div class="content__conversation--main">
        <!-- skeleton loading -->
        <ol v-if="skeletonLoadingConversation">
          <li class="my-message">
            <v-skeleton-loader width="400" type="paragraph"></v-skeleton-loader>
          </li>
          <li class="other-message">
            <v-skeleton-loader width="400" type="paragraph"></v-skeleton-loader>
          </li>
          <li class="my-message">
            <v-skeleton-loader width="400" type="paragraph"></v-skeleton-loader>
          </li>
          <li class="other-message">
            <v-skeleton-loader width="400" type="paragraph"></v-skeleton-loader>
          </li>
          <li class="my-message">
            <v-skeleton-loader width="400" type="paragraph"></v-skeleton-loader>
          </li>
          <li class="other-message">
            <v-skeleton-loader width="400" type="paragraph"></v-skeleton-loader>
          </li>
          <li class="my-message">
            <v-skeleton-loader width="400" type="paragraph"></v-skeleton-loader>
          </li>
          <li class="other-message">
            <v-skeleton-loader width="400" type="paragraph"></v-skeleton-loader>
          </li>
          <!-- Add more skeleton loaders as needed -->
        </ol>
        <ol ref="messageList" v-else>
          <li v-for="message in messages" :key="message._id" :class="{
            'my-message': message.senderId === userId,
            'other-message': message.senderId !== userId
          }">
            <div class="message-wrapper">
              <div class="message-content">
                {{ message.content }}
              </div>
            </div>
          </li>
        </ol>
      </div>

      <div class="content__conversation--right"></div>
    </div>

    <!-- input -->
    <div class="content__input">
      <div class="content__input--wrapper">
        <div class="content__input__content">
          <MSTextField v-model="messageInput" height="50" prepend-inner-icon="mdi-emoticon-outline" density="compact"
            variant="solo" hide-details single-line placeholder="Nhập tin nhắn" />
        </div>
        <div class="content__input__actions">
          <div v-if="isTyping" @click="sendMessage" class="content__input__actions__item">
            <v-icon size="20" icon="mdi-send-variant-outline" />
          </div>
          <div v-if="!isTyping" class="content__input__actions__item">
            <v-icon size="20" icon="mdi-microphone-outline" />
          </div>
          <div v-if="!isTyping" class="content__input__actions__item">
            <v-icon size="20" icon="mdi-card-account-details-outline " />
          </div>
          <div v-if="!isTyping" class="content__input__actions__item">
            <v-icon size="20" icon="mdi-camera-outline" />
          </div>
          <div v-if="!isTyping" class="content__input__actions__item">
            <v-icon size="20" icon="mdi-dots-horizontal" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MSTextField from '@/components/textfield/MSTextField.vue';
import { useRoomInfoStore } from '@/stores/RoomInfoStore';
import { getConservationByRoomIdAPI } from '@/services/MessageService';
import ChatService from '@/socket/ChatService.cjs';

export default {
  components: {
    MSTextField
  },

  data() {
    return {
      room: {},
      messages: [],
      messageInput: '',
      isTyping: false,
      userId: '',
      roomId: '',
      skeletonLoadingRoomInfo: true,
      skeletonLoadingConversation: true,
    };
  },

  methods: {
    getConservationByRoomId() {
      getConservationByRoomIdAPI(this.roomId)
        .then(response => {
          this.messages = response.data;
          this.skeletonLoadingConversation = false;
          this.skeletonLoadingRoomInfo = false;
          setTimeout(() => {
            this.scrollListMessageToBottom();
          }, 0);
        })
        .catch(error => {
          console.log(error);
        });
    },

    sendMessage() {
      if (this.messageInput.length === 0) return;
      const content = this.messageInput
      const lastMessage = {
        roomId: this.roomId,
        content: content
      }
      const message = {
        ...lastMessage,
        senderId: this.userId,
      }
      ChatService.sendMessage(message)
      ChatService.setLastMessage(lastMessage)
      this.messageInput = ''

    },

    //Hàm cuộn thẻ ol xuống dưới
    scrollListMessageToBottom() {
      const messageList = this.$refs.messageList;
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    }
  },

  mounted() {
    this.userId = localStorage.getItem('userId');
    // Set up socket listener for incoming messages
    ChatService.onMessageReceived((message) => {
      this.messages.push(message);
      //Cuộn xuống cuối khi DOM được re-render
      setTimeout(() => {
        this.scrollListMessageToBottom();
      }, 0);
    });
  },

  computed: {
    currentRoom() {
      const roomInfoStore = useRoomInfoStore();
      return roomInfoStore.roomInfo;
    }
  },

  watch: {
    currentRoom(newVal) {
      this.room = newVal
      this.roomId = newVal._id
      this.skeletonLoadingConversation = true
      this.skeletonLoadingRoomInfo = true
      this.getConservationByRoomId()
    },

    messageInput(newMessage) {
      this.isTyping = newMessage.length > 0;
    }
  }
}
</script>


<style lang="scss">
.content-wrapper {
  height: 100%;
  width: 100%;
}

.content__header {
  display: flex;
  justify-content: space-between;
  height: 59px;
  border-bottom: 1px solid var(--border-color);
  padding: 8px 16px;
  align-items: center;

  .v-skeleton-loader__bone {
    margin: 0 8px 0 0;
  }
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
  justify-content: center;
  height: 86px;
  width: 100%;

  .content__input--wrapper {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
  }

  .content__input__content {
    display: flex;
    width: 50%
  }

  .content__input__actions {
    display: flex;
    height: 46px;
    padding-left: 16px;
  }

  .content__input__actions__item {
    cursor: pointer;
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

.content__conversation {
  display: flex;
  height: calc(100vh - 60px - 86px);
  width: 100%;
  justify-content: center;
  position: relative;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  align-items: stretch;

  .content__conversation--main {
    display: flex;
    flex-direction: column;
    flex-grow: 0;
    flex-shrink: 1;
    overflow: hidden;
    align-items: stretch;
    opacity: 1;
    height: 100%;
    width: 1060px;

    ol {
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      padding: 0 8px;
      height: 100%
    }

    .my-message {
      margin: 4px 0;
      display: flex;
      justify-content: flex-end;

      .message-wrapper {
        background-color: var(--background-message-color);
      }
    }

    .other-message {
      margin: 4px 0;
      display: flex;
      justify-content: start;

      .message-wrapper {
        background-color: #f1f1f1;
      }
    }

    .message-wrapper {
      padding: 4px 12px;
      border-radius: 8px;
      max-width: 70%;

    }

    .message-content {
      font-size: 14px;
      overflow-wrap: break-word;
    }
  }

  .content__conversation--left {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    align-items: stretch;
    min-width: 30px;
  }

  .content__conversation--right {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    align-items: stretch;
    min-width: 30px;
  }

}
</style>
