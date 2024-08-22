
<template>
  <div class="content-wrapper">
    <div class="content__header">
      <v-skeleton-loader v-if="skeletonLoadingRoomInfo" width="270" type="list-item-avatar"></v-skeleton-loader>
      <div v-else class="content__header__info">
        <MSAvatar width="40" height="40" :alt="room.fullname" :src="room.avatarUrl"></MSAvatar>
        <p class="content__header__info__name">{{ room.displayName || '' }}</p>
      </div>
      <!-- header -->
      <div class="content__header__actions">
        <div class="content__header__actions__searchfield">
          <v-expand-x-transition>
            <div class="content__header__actions__searchfield__wrapper" v-if="isSearchField">
              <v-menu transition="scroll-y-transition">
                <template v-slot:activator="{ props }">
                  <MSTextField v-bind="props" v-model="searchValue" width="270" density="compact" variant="solo"
                    hide-details single-line placeholder="Tìm tin nhắn" clear-icon="mdi-close" clearable
                    @keydown.enter="handleSearchMessage">
                  </MSTextField>
                </template>
                <v-list width="350" class="mt-1">
                  <v-list-item>
                    <v-list-subheader class="justify-center">
                      <span class="font-weight-bold pr-3">{{ searchNotification }}</span>
                      <v-progress-circular v-if="isLoadingSearch" :size="20" :width="3" color="black"
                        indeterminate></v-progress-circular>
                    </v-list-subheader>
                  </v-list-item>
                  <v-list-item class="pa-2" v-for="messageSearch in messagesSearchList" :key="messageSearch._id"
                    @click="handleScrollMessage(messageSearch)">
                    <template v-slot:prepend>
                      <MSAvatar height="40" width="40" :src="messageSearch.avatarUrl"></MSAvatar>
                    </template>
                    <v-list-item-title class="pl-2">{{
                      messageSearch.senderName
                    }}</v-list-item-title>
                    <v-list-item-subtitle class="pl-2"><span v-html="messageSearch.content"></span></v-list-item-subtitle>
                    <template v-slot:append>
                      <div>
                        {{ convertToDayOfWeek(messageSearch.createdAt) }}
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-expand-x-transition>
        </div>
        <div class="content__header__actions__item">
          <v-icon size="20" icon="mdi-magnify" @click="toggleSearchField"></v-icon>
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
          <li class="messageList--loading" v-if="isLoadingMessage & !flagStopCallApi">
            <v-progress-circular :size="20" :width="3" color="brown" indeterminate></v-progress-circular>
          </li>
          <li v-for="message in messages" :key="message._id" :class="{
            'my-message': message.senderId === userId,
            'other-message': message.senderId !== userId
          }" :data-id="message._id" ref="messageElement">
            <div class="message-wrapper">
              <div class="message-content">
                <div v-if="message.media" v-for="media in message.media" class="message-content__images">
                  <v-img height="189" width="189" :src="media.url"></v-img>
                </div>
                <div v-if="message.content" class="message-content__text">
                  {{ message.content }}
                </div>
              </div>
            </div>
          </li>
        </ol>
      </div>

      <div class=" content__conversation--right"></div>
    </div>

    <!-- input -->
    <div class="content__input">
      <!-- Hiển thị thumbnail -->
      <div class="content__input__preview" ref="previewImages">
      </div>
      <!-- Input -->
      <div class="content__input__content">
        <MSTextField v-model="messageInput" height="50" prepend-inner-icon="mdi-emoticon-outline" density="compact"
          variant="solo" hide-details single-line placeholder="Nhập tin nhắn" />
      </div>
      <!-- Actions -->
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
          <!-- Dropzone -->
          <form ref="myDropzone" action="/file-upload" class="dropzone" id="my-great-dropzone">
          </form>
        </div>
        <div v-if="!isTyping" class="content__input__actions__item">
          <v-icon size="20" icon="mdi-dots-horizontal" />
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import MSAvatar from '@/components/avatar/MSAvatar.vue'
import MSTextField from '@/components/textfield/MSTextField.vue'
import { useRoomInfoStore } from '@/stores/RoomInfoStore'
import { getConservationByRoomIdAPI, searchMessageByRoomAPI } from '@/services/MessageService'
import ChatService from '@/socket/ChatService.cjs'
import { useUsersInfoStore } from '@/stores/UsersInfoStore'
import { convertToDayOfWeek } from '@/helper/ConvertDate'
import Dropzone from 'dropzone';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/index.js';

export default {
  components: {
    MSTextField,
    MSAvatar
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
      isLoadingMessage: true,
      isLoadingSearch: false,
      offset: 0,
      limit: 30,
      isSearchField: false,
      searchValue: '',
      flagStopCallApi: false,
      currentSearchMessage: 0,
      totalSearchMessage: 0,
      messagesSearchList: [],
      searchNotification: 'Nhấn "Enter" để tìm tin nhắn',
      fileThumbnail: [],
      filesToUpload: [],
      dropzoneInstance: null,
    }
  },

  methods: {
    //Lấy cuộc hội thoại theo id phòng
    async getConservationByRoomId() {
      if (!this.roomId || this.flagStopCallApi || this.isLoadingMessages) return

      this.isLoadingMessages = true

      try {
        const res = await getConservationByRoomIdAPI(this.roomId, this.limit, this.offset)

        if (res.data.length === 0) {
          this.flagStopCallApi = true
        }

        this.messages = [...this.messages, ...res.data]
        this.skeletonLoadingConversation = false
        this.skeletonLoadingRoomInfo = false
        this.isLoadingMessage = false
        this.offset += this.limit
      } catch (error) {
        console.error(error)
      } finally {
        this.isLoadingMessages = false // Đánh dấu cuộc gọi API đã hoàn tất
      }
    },

    //Hàm gửi tin nhắn
    async sendMessage() {
      if (this.messageInput.length === 0 && this.filesToUpload.length === 0) return;

      // Khởi tạo đối tượng tin nhắn
      const message = {
        roomId: this.roomId,
        senderId: this.userId
      };

      // Xử lý media và content
      if (this.filesToUpload.length > 0) {
        const media = await this.getUrlOfMedia();
        message.media = media;
      }

      if (this.messageInput.length > 0) {
        // Nếu có nội dung tin nhắn
        message.content = this.messageInput;
      }

      // Gửi tin nhắn
      ChatService.sendMessage(message);

      // Xóa nội dung tin nhắn và danh sách file
      this.messageInput = '';
      this.filesToUpload = [];
    },


    //Hàm xử lý tìm kiếm tin nhắn
    handleSearchMessage() {
      if (this.searchValue.length === 0) return

      this.isLoadingSearch = true

      searchMessageByRoomAPI(this.roomId, this.searchValue)
        .then((res) => {
          const messagesSearchList = res.data

          if (messagesSearchList.length === 0) {
            this.searchNotification = 'Không tìm thấy kết quả nào, thử lại'
            return
          }

          const usersInfoStore = useUsersInfoStore()
          const usersInfo = usersInfoStore.usersInfo

          this.messagesSearchList = messagesSearchList.map((message) => {
            const user = usersInfo.find((user) => user._id === message.senderId)
            message.senderName = user ? user.fullname : 'Unknown'
            message.avatarUrl = user ? user.avatarUrl : ''
            message.content = message.content.replace(
              new RegExp(this.searchValue, 'gi'),
              `<b>${this.searchValue}</b>`
            )
            return message
          })
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          this.isLoadingSearch = false
          if (this.messagesSearchList.length > 0) {
            this.searchNotification = 'Tìm thấy ' + this.messagesSearchList.length + ' kết quả'
          }
        })
    },

    //Hàm toggle field nhập tìm kiếm tin nhắn
    toggleSearchField() {
      this.searchValue = ''
      if (this.isSearchField == true) {
        // Xóa lớp 'highlight-text' khỏi tất cả các thẻ <li>
        this.removeHighLightTextClass()
      }
      this.isSearchField = !this.isSearchField
    },

    //Hàm scroll đến tin nhắn đã chọn
    async handleScrollMessage(messageSelected) {
      this.removeHighLightTextClass()
      const messageList = this.$refs.messageList
      const messageSelectedElement = messageList.querySelector(`[data-id="${messageSelected._id}"]`)
      // Khi không tìm thấy nghĩa là tin nhắn ở paging trước => call api
      if (!messageSelectedElement) {
        await this.getConservationByRoomId()
        this.handleScrollMessage(messageSelected)
        return
      }

      messageSelectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      messageSelectedElement.classList.add('highlight-text')
    },

    //Hàm setup lắng nghe sự kiện scroll top
    setupScrollTopListMessageListener() {
      const messageList = this.$refs.messageList

      const handleScroll = () => {
        const scrollBottom = messageList.clientHeight - messageList.scrollTop

        // Kiểm tra nếu người dùng đã cuộn lên trên cùng
        if (scrollBottom >= messageList.scrollHeight - 100) {
          this.isLoadingMessage = true
          this.getConservationByRoomId()
        }
      }

      if (messageList) {
        messageList.addEventListener('scroll', handleScroll)
      }
    },

    // Xóa lớp 'highlight-text' khỏi tất cả các thẻ <li>
    removeHighLightTextClass() {
      const allItems = this.$el.querySelectorAll('li.highlight-text')
      allItems.forEach((item) => {
        item.classList.remove('highlight-text')
      })
    },

    async getUrlOfMedia() {
      // Xử lý các tệp đã lưu
      const uploadPromises = this.filesToUpload.map(async (file) => {
        const roomId = localStorage.getItem('roomId');
        const storageRef = ref(storage, `rooms/${roomId}/files/${file.name}`);

        try {
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);

          return {
            name: file.name,
            url: downloadURL,
            type: file.type
          };
        } catch (error) {
          console.error("Error uploading file:", file.name, error);
        }
      });

      try {
        const mediaArray = await Promise.all(uploadPromises);
        return mediaArray;
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    }
  },

  mounted() {
    var that = this
    this.userId = localStorage.getItem('userId')

    // Set up socket listener for incoming messages
    ChatService.onMessageReceived((message) => {
      this.messages.unshift(message)
    })

    //Setup dropzone
    this.myDropzone = new Dropzone(this.$refs.myDropzone, {
      paramName: "file",
      maxFilesize: 2, // Kích thước tối đa của file (MB)
      autoProcessQueue: false, // Ngăn Dropzone tự động gửi tệp
      previewsContainer: this.$refs.previewImages,
      init: function () {
        this.on("addedfile", function (file) {
          if (!this.filesToUpload) {
            this.filesToUpload = [];
          }
          that.filesToUpload.push(file);
          that.isTyping = true
        }.bind(this));

        this.on("thumbnail", function (file, dataUrl) {
          // Logic tùy chỉnh khi ảnh thu nhỏ được tạo
          let removeButton = Dropzone.createElement('<i class="mdi mdi-close-circle dz-remove-btn"></i>');
          file.previewElement.appendChild(removeButton);

          removeButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.removeFile(file);
            // Xóa tệp khỏi mảng khi bị xóa
            this.filesToUpload = this.filesToUpload.filter(f => f !== file);
          }.bind(this));
        });
      }
    });

  },

  computed: {
    currentRoom() {
      const roomInfoStore = useRoomInfoStore()
      return roomInfoStore.roomInfo
    }
  },

  watch: {
    async currentRoom(newVal, oldVal) {
      if (!newVal) return
      //reset when room change
      this.room = newVal
      this.roomId = newVal._id
      localStorage.setItem('roomId', this.roomId)
      this.messages = []
      this.offset = 0
      this.skeletonLoadingConversation = true
      this.skeletonLoadingRoomInfo = true
      this.flagStopCallApi = false
      this.isSearchField = false

      // Xóa người dùng khỏi phòng cũ nếu oldVal tồn tại
      if (oldVal._id) {
        ChatService.leaveRoom(oldVal._id)
      }

      // Thêm người dùng vào phòng mới
      ChatService.joinRoom(this.roomId)

      // Lấy cuộc hội thoại theo phòng mới
      await this.getConservationByRoomId()

      // Thiết lập sự kiện cuộn
      this.setupScrollTopListMessageListener()

      if (this.dropzoneInstance) {
        this.dropzoneInstance.destroy();
      }
    },

    //Theo dõi input nhắn tin
    messageInput(newMessage) {
      this.isTyping = newMessage.length > 0
    },

    //Theo dõi input search
    searchValue(newVal, oldVal) {
      if (newVal != oldVal) {
        this.searchNotification = 'Nhấn "Enter" để tìm tin nhắn'
        this.messagesSearchList = []
      }
    },
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

  .content__header__info__name {
    font-size: 16px;
    font-weight: 700;
    padding-left: 8px;
    color: var(--text-color);
  }
}

.content__header__actions {
  display: flex;
}

.content__header__actions__searchfield {
  display: flex;
}

.content__header__actions__searchfield__wrapper {
  display: flex;
  align-items: center;
  height: 100%;
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
  background-color: var(--background-icon-primary-color);
}

.content__input {
  position: relative;
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
    width: 50%;
  }

  .content__input__actions {
    display: flex;
    height: 46px;
    padding-left: 16px;
  }

  .content__input__actions__item {
    position: relative;
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

  .content__input__preview {
    display: flex;
    position: absolute;
    bottom: 70px;
    max-width: 60%;
    overflow-x: auto;
    background-color: var(--background-icon-color);
    border-radius: 16px;

    .dz-image-preview {
      position: relative;
      padding: 8px 8px;

      img {
        border-radius: 8px;
      }
    }

    .dz-success-mark {
      display: none;
    }

    .dz-error-mark {
      display: none;
    }

    .dz-details {
      display: none;
    }

    .dz-remove-btn {
      position: absolute;
      top: -4px;
      right: 2px;
      cursor: pointer;
      font-size: 20px;
    }
  }

  .content__input__preview::-webkit-scrollbar {
    height: 12px;
  }
}


.content__conversation {
  height: calc(100vh - 60px - 86px);
  width: 100%;
  justify-content: center;
  position: relative;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  align-items: stretch;

  .content__conversation--main {
    position: relative;
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
      flex-direction: column-reverse;
      padding: 0 8px;
      height: 100%;
    }

    .highlight-text {
      .message-content {
        background: var(--highlight-text-color);
      }
    }

    .messageList--loading {
      position: absolute;
      display: flex;
      justify-content: center;
      width: 100%;
      top: 0;
      height: 36px;
      align-items: center;
    }

    .my-message {
      padding: 4px 0;
      display: flex;
      justify-content: flex-end;

      .message-wrapper {
        background-color: var(--background-message-color);
      }
    }

    .other-message {
      padding: 4px 0;
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
      color: var(--text-color);
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

.message-content__images {
  padding: 0 4px;
}

.dropzone {
  position: absolute;
  height: 100%;
  width: 100%;

  .dz-button {
    display: none;
  }
}
</style>
