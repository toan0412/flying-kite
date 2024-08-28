
<template>
  <div class="content-wrapper">
    <!-- Header  -->
    <div class="content__header">
      <v-skeleton-loader v-if="skeletonLoadingRoomInfo" width="270" type="list-item-avatar"></v-skeleton-loader>
      <div v-else class="content__header__info">
        <MSAvatar width="40" height="40" cover :alt="room.fullname" :src="room.avatarUrl"></MSAvatar>
        <p class="content__header__info__name">{{ room.displayName || '' }}</p>
      </div>
      <!-- Header actions -->
      <div class="content__header__actions">
        <!-- Tìm kiếm tin nhắn -->
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
                      <div class="texting-time">
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

    <!-- Conversation -->
    <div class="content__conversation">
      <div class="content__conversation--left"></div>
      <div class="content__conversation--main">
        <!-- skeleton loading -->
        <ol v-if="skeletonLoadingConversation">
          <ConversationSkeletonLoading />
        </ol>
        <ol ref="messageList" v-else>
          <li class="messageList--loading" v-if="isLoadingMessage & !flagStopCallApi">
            <v-progress-circular :size="20" :width="3" color="brown" indeterminate></v-progress-circular>
          </li>
          <!-- Message -->
          <li v-for="message in messages" :key="message._id" :class="{
            'my-message': message.senderId === userId,
            'other-message': message.senderId !== userId
          }" :data-id="message._id" ref="messageElement">
            <div class="message-actions">
              <v-icon color="grey-darken-1
" size="18" icon="mdi-trash-can-outline" @click="showDeleteMessageDialog(message)">
              </v-icon>
            </div>
            <div class="message-wrapper">
              <div v-if="message.media" class="message-content__images">
                <v-row dense>
                  <v-col v-for="(media, index) in message.media" :key="index"
                    :cols="12 / getColumnCount(message.media.length)">
                    <v-img aspect-ratio="1" cover height="140" width="140" :src="media.url"
                      @click="openImageDialog(media.url)" class="cursor-pointer"></v-img>

                    <!-- Dialog để hiển thị ảnh lớn -->
                    <v-dialog v-model="imageDialog" max-width="600px">
                      <v-card>
                        <v-card-title class="d-flex justify-space-between align-center">
                          <v-btn icon="mdi-close" variant="text" @click="imageDialog = false"></v-btn>
                        </v-card-title>
                        <v-img :src="imageSelected" contain height="100%"></v-img>
                      </v-card>
                    </v-dialog>
                  </v-col>
                </v-row>
              </div>
              <div class="message-content">
                <div v-if="message.content" class="message-content__text">
                  {{ message.content }}
                </div>
              </div>
            </div>
          </li>
        </ol>
      </div>

      <div class="content__conversation--right"></div>
    </div>

    <!-- Footer Input -->
    <div class="content__input">
      <!-- Hiển thị thumbnail -->
      <div class="content__input__preview" ref="previewImages"></div>
      <!-- Input -->
      <div class="content__input__content">
        <MSTextField v-model="messageInput" height="50" prepend-inner-icon="mdi-emoticon-outline" density="compact"
          variant="solo" hide-details single-line placeholder="Nhập tin nhắn" />
      </div>
      <!-- Actions -->
      <div class="content__input__actions">
        <div v-if="isTyping" class="content__input__actions__item">
          <v-progress-circular v-if="isSendingMessage" :size="20" :width="3" color="black"
            indeterminate></v-progress-circular>
          <v-icon v-else size="20" @click="sendMessage" icon="mdi-send-variant-outline" />
        </div>
        <div v-if="!isTyping" class="content__input__actions__item">
          <v-icon size="20" icon="mdi-microphone-outline" />
        </div>
        <div v-if="!isTyping" class="content__input__actions__item">
          <v-icon size="20" icon="mdi-card-account-details-outline " />
        </div>
        <div class="content__input__actions__item">
          <v-icon size="20" icon="mdi-camera-outline" />
          <!-- Dropzone -->
          <form ref="myDropzone" class="dropzone"></form>
        </div>
        <div v-if="!isTyping" class="content__input__actions__item">
          <v-icon size="20" icon="mdi-dots-horizontal" />
        </div>
      </div>
    </div>
  </div>
  <ConfirmDialog ref="deleteMessageDialog" title="Xóa tin nhắn" message="Bạn có chắc chắn muốn xoá tin nhắn này không?"
    @response="handleResponseDeleteMessageDialog" />
</template>

<script>
import MSAvatar from '@/components/CustomAvatar/MSAvatar.vue'
import MSTextField from '@/components/CustomTextField/MSTextField.vue'
import ConversationSkeletonLoading from '@/components/SkeletonLoading/ConversationSkeletonLoading.vue'
import { useRoomInfoStore } from '@/stores/RoomInfoStore'
import { getConservationByRoomIdAPI, searchMessageByRoomAPI } from '@/services/MessageService'
import ChatService from '@/socket/ChatService.cjs'
import { useAllUsersInfoStore } from '@/stores/AllUsersInfoStore'
import Dropzone from 'dropzone'
import ConfirmDialog from '@/components/Dialog/ConfirmDialog.vue'
import { convertToDayOfWeek } from '@/helper/ConvertDate'
import { uploadFilesAndGetUrls } from '@/helper/GetUrlOfMedia';

export default {
  components: {
    MSTextField,
    MSAvatar,
    ConversationSkeletonLoading,
    ConfirmDialog
  },

  data() {
    return {
      room: {},
      userId: '',
      roomId: '',
      messageInput: '',
      searchValue: '',
      imageSelected: '',
      searchNotification: 'Nhấn "Enter" để tìm tin nhắn',
      messages: [],
      isTyping: false,
      isSendingMessage: false,
      isLoadingMessage: true,
      isLoadingSearch: false,
      isSearchField: false,
      flagStopCallApi: false,
      imageDialog: false,
      skeletonLoadingConversation: true,
      skeletonLoadingRoomInfo: true,
      offset: 0,
      limit: 30,
      messagesSearchList: [],
      filesToUpload: [],
      myDropzone: null,
      selectedMessage: {}
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
      this.isSendingMessage = true
      if (this.messageInput.length === 0 && this.filesToUpload.length === 0) return

      const message = {
        roomId: this.roomId,
        senderId: this.userId
      }

      if (this.filesToUpload.length > 0) {
        message.media = await this.getUrlOfMedia()
      }

      if (this.messageInput.length > 0) {
        message.content = this.messageInput
      }

      //Nếu có cả content và media -> Chia thành gửi 2 tin nhắn
      if (message.content && message.media) {
        const { media, ...messageNoContent } = message
        const { content, ...messageNoMedia } = message
        ChatService.sendMessage(messageNoContent)
        ChatService.sendMessage(messageNoMedia)
      } else {
        ChatService.sendMessage(message)
      }

      this.isSendingMessage = false

      // Xóa nội dung tin nhắn và danh sách file
      this.messageInput = ''
      this.filesToUpload = []
      this.myDropzone.removeAllFiles(true)
    },

    //Hàm xử lý tìm kiếm tin nhắn
    handleSearchMessage() {
      if (this.searchValue.length === 0) return;

      this.isLoadingSearch = true;

      searchMessageByRoomAPI(this.roomId, this.searchValue)
        .then((res) => {
          const messagesSearchList = res.data;

          if (messagesSearchList.length === 0) {
            this.searchNotification = 'Không tìm thấy kết quả nào, thử lại';
            return;
          }

          const allUsersInfoStore = useAllUsersInfoStore();
          const allUsersInfo = allUsersInfoStore.allUsersInfo;

          const allUsersInfoMap = new Map(allUsersInfo.map(user => [user._id, user]));

          this.messagesSearchList = messagesSearchList.map((message) => {
            const user = allUsersInfoMap.get(message.senderId);
            if (user) {
              message.senderName = user.fullname;
              message.avatarUrl = user.avatarUrl;
            }
            message.content = message.content.replace(
              new RegExp(this.searchValue, 'gi'),
              `<b>${this.searchValue}</b>`
            );
            return message;
          });
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.isLoadingSearch = false;
          if (this.messagesSearchList.length > 0) {
            this.searchNotification = 'Tìm thấy ' + this.messagesSearchList.length + ' kết quả';
          }
        });
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
      const allItems = this.$refs.messageList.querySelectorAll('li .highlight-text');

      if (!allItems) return
      allItems.forEach((item) => {
        item.classList.remove('highlight-text')
      })
    },

    //Lấy URL của ảnh khi gửi tin nhắn
    async getUrlOfMedia() {
      const roomId = localStorage.getItem('roomId');
      const path = `rooms/${roomId}/files`
      const mediaArray = await uploadFilesAndGetUrls(this.filesToUpload, path);
      return mediaArray;
    },

    getColumnCount(length) {
      if (length === 1) return 1
      if (length === 2) return 2
      if (length === 4) return 4
      return 3
    },

    openImageDialog(imageUrl) {
      this.imageSelected = imageUrl
      this.imageDialog = true
    },

    setupDropzone() {
      var that = this
      // Nếu Dropzone đã được khởi tạo, hủy bỏ nó
      if (this.myDropzone) {
        this.myDropzone.destroy()
      }

      // Khởi tạo Dropzone mới
      this.myDropzone = new Dropzone(this.$refs.myDropzone, {
        url: '/noNeed',
        paramName: 'file',
        maxFilesize: 2, // Kích thước tối đa của file (MB)
        autoProcessQueue: false, // Ngăn Dropzone tự động gửi tệp
        previewsContainer: this.$refs.previewImages,
        init: function () {
          this.on(
            'addedfile',
            function (file) {
              that.filesToUpload.push(file)
              that.isTyping = true
            }.bind(this)
          )

          this.on('thumbnail', function (file) {
            // Logic tùy chỉnh khi ảnh thu nhỏ được tạo
            let removeButton = Dropzone.createElement(
              '<i class="mdi mdi-close-circle dz-remove-btn"></i>'
            )
            file.previewElement.appendChild(removeButton)

            removeButton.addEventListener(
              'click',
              function (e) {
                e.preventDefault()
                e.stopPropagation()
                this.removeFile(file)
                // Xóa tệp khỏi mảng khi bị xóa
                that.filesToUpload = that.filesToUpload.filter((f) => f !== file)
              }.bind(this)
            )
          })
        }
      })
    },

    //Hàm xóa tin nhắnh
    handleDeleteMessage() {
      const message = {
        roomId: this.roomId,
        messageId: this.selectedMessage._id,
      }
      ChatService.deleteMessage(message)
    },

    showDeleteMessageDialog(message) {
      this.selectedMessage = message
      this.$refs.deleteMessageDialog.openDialog()
    },

    handleResponseDeleteMessageDialog(answer) {
      if (!answer) return
      this.handleDeleteMessage()
    },

    //Hàm convert date
    convertToDayOfWeek(dateString) {
      return convertToDayOfWeek(dateString)
    }

  },

  mounted() {
    this.userId = localStorage.getItem('userId')

    //Setup dropzone
    this.setupDropzone()

    // Set up socket listener for incoming messages
    ChatService.onMessageReceived((message) => {
      this.messages.unshift(message)
    })

    ChatService.onDeletedMessageReceived((deletedMessage) => {
      this.messages = this.messages.map((message) => {
        if (message._id === deletedMessage._id) {
          return deletedMessage;
        }
        return message;
      });
    });

  },

  computed: {
    currentRoom() {
      const roomInfoStore = useRoomInfoStore()
      return roomInfoStore.roomInfo
    }
  },

  watch: {
    currentRoom: {
      async handler(newVal, oldVal) {
        // Reset khi thay đổi phòng
        localStorage.setItem('roomId', newVal._id)
        this.room = newVal
        this.roomId = newVal._id
        this.messages = []
        this.offset = 0
        this.skeletonLoadingConversation = true
        this.skeletonLoadingRoomInfo = true
        this.flagStopCallApi = false
        this.isSearchField = false

        // Xóa người dùng khỏi phòng cũ nếu oldVal tồn tại
        if (oldVal && oldVal._id) {
          ChatService.leaveRoom(oldVal._id)
        }

        // Thêm người dùng vào phòng mới
        ChatService.joinRoom(this.roomId)

        // Lấy cuộc hội thoại theo phòng mới
        await this.getConservationByRoomId()

        // Thiết lập sự kiện cuộn
        this.setupScrollTopListMessageListener()
      },
      immediate: true
    },

    searchValue(newVal, oldVal) {
      if (newVal != oldVal) {
        this.searchNotification = 'Nhấn "Enter" để tìm tin nhắn'
        this.messagesSearchList = []
      }
    },

    messageInput(newMessage) {
      this.isTyping = newMessage.length > 0
    },

    filesToUpload(newVal) {
      this.isTyping = newVal.length > 0
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
  cursor: pointer;
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

  .content__input__actions__item:hover {
    opacity: 0.7;
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
      .message-content__text {
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
      display: flex;
      justify-content: flex-end;

      .message-content {
        background-color: var(--background-message-color);
      }


      &:hover {
        .message-actions {
          display: flex;
          align-items: center;
        }
      }
    }

    .message-actions {
      display: none;
    }

    .other-message {
      display: flex;
      justify-content: start;

      .message-content {
        background-color: #f1f1f1;
      }
    }

    .message-content__text {
      margin: 4px 12px;
    }

    .message-wrapper {
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      max-width: 70%;
    }

    .message-content {
      margin: 4px 8px;
      border-radius: 12px;
      font-size: 14px;
      overflow-wrap: break-word;
      color: var(--text-color);
    }

    .message-content__images {
      .v-img__img {
        border-radius: 8px;
      }
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
