<template>
  <div class="content-wrapper">
    <!-- Header  -->
    <div class="content__header">
      <v-skeleton-loader
        v-if="skeletonLoadingRoomInfo"
        width="270"
        type="list-item-avatar"
      ></v-skeleton-loader>
      <!-- Header info -->
      <div v-else class="content__header__info">
        <MSAvatar
          @click="openUserInfoDialog(room)"
          width="40"
          height="40"
          cover
          :alt="room.fullname"
          :src="room.avatarUrl"
        ></MSAvatar>
        <p class="content__header__info__name">{{ room.roomName || '' }}</p>
        <v-icon
          class="pl-2"
          v-if="room.type === 'public'"
          icon="mdi-cog"
          @click="showRoomInfoDialog = true"
        ></v-icon>
        <RoomInfoDialog
          @open-add-member-dialog="openAddMemberDialog"
          v-model:visible="showRoomInfoDialog"
          @close="showRoomInfoDialog = false"
        />
      </div>
      <!-- Header actions -->
      <div class="content__header__actions">
        <!-- Tìm kiếm tin nhắn -->
        <div class="content__header__actions__searchfield">
          <v-expand-x-transition>
            <div class="content__header__actions__searchfield__wrapper" v-if="isSearchField">
              <v-menu transition="scroll-y-transition">
                <template v-slot:activator="{ props }">
                  <MSTextField
                    v-bind="props"
                    v-model="searchValue"
                    width="270"
                    density="compact"
                    variant="solo"
                    hide-details
                    single-line
                    placeholder="Tìm tin nhắn"
                    clear-icon="mdi-close"
                    clearable
                    @keydown.enter="handleSearchMessage"
                  >
                  </MSTextField>
                </template>
                <v-list width="350" max-height="450" class="mt-1">
                  <v-list-item>
                    <v-list-subheader class="justify-center">
                      <span class="font-weight-bold pr-3">{{ searchNotification }}</span>
                      <v-progress-circular
                        v-if="isLoadingSearch"
                        :size="20"
                        :width="3"
                        color="black"
                        indeterminate
                      ></v-progress-circular>
                    </v-list-subheader>
                  </v-list-item>
                  <v-list-item
                    class="pa-2"
                    v-for="messageSearch in messagesSearchList"
                    :key="messageSearch._id"
                    @click="handleScrollMessage(messageSearch)"
                  >
                    <template v-slot:prepend>
                      <MSAvatar height="40" width="40" :src="messageSearch.avatarUrl"></MSAvatar>
                    </template>
                    <v-list-item-title class="pl-2">{{
                      messageSearch.senderName
                    }}</v-list-item-title>
                    <v-list-item-subtitle class="pl-2"
                      ><span v-html="messageSearch.content"></span
                    ></v-list-item-subtitle>
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

        <div v-if="room.type == 'public'" class="content__header__actions__item">
          <v-icon size="20" icon="mdi-account-plus-outline" @click="showAddMemberDialog = true">
          </v-icon>
          <AddMemberDialog
            v-model:visible="showAddMemberDialog"
            @close="showAddMemberDialog = false"
          />
        </div>

        <div class="content__header__actions__item ml-1 header-action-background">
          <v-icon
            @click="openVideoCall(false)"
            color="white"
            size="20"
            icon="mdi-phone-outline"
          ></v-icon>
        </div>

        <div class="content__header__actions__item ml-1 header-action-background">
          <v-icon
            @click="openVideoCall(true)"
            color="white"
            size="20"
            icon="mdi-video-outline"
          ></v-icon>
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
            <v-progress-circular
              :size="20"
              :width="3"
              color="brown"
              indeterminate
            ></v-progress-circular>
          </li>
          <!-- Notify typing -->
          <li class="notify-typing">
            <div class="message__notify">
              {{ notifyTyping }}
            </div>
          </li>

          <!-- Message -->
          <li
            v-for="(message, index) in messages"
            :key="message._id"
            :class="[
              message.senderId === userId ? 'my-message' : 'other-message',
              isLastMessageOfSender(index) ? 'first-message' : '',
              isLastMessageOfTime(index) ? 'time-separator' : ''
            ]"
            :data-id="message._id"
          >
            <!-- Message wrapper -->
            <div class="message-wrapper">
              <!-- Message sender name -->
              <div class="message-sender__name">
                {{ message.fullname }}
              </div>

              <!-- Message time -->
              <div class="message-time">
                <div class="texting-time">
                  {{ convertToDayOfWeek(message.createdAt) }}
                </div>
              </div>

              <!-- Message actions -->
              <div class="message-actions">
                <div class="message-actions__item">
                  <v-icon color="grey-darken-1" @click="openReplyMessage(message)" size="18"
                    >mdi-reply-outline</v-icon
                  >
                  <v-tooltip activator="parent" location="top">Trả lời</v-tooltip>
                </div>

                <div class="message-actions__item">
                  <v-icon color="grey-darken-1" size="18">mdi-share-outline</v-icon>
                  <v-tooltip activator="parent" location="top">Chuyển tiếp</v-tooltip>
                </div>

                <div class="message-actions__item">
                  <v-icon @click="showDeleteMessageDialog(message)" color="grey-darken-1" size="18"
                    >mdi-trash-can-outline</v-icon
                  >
                  <v-tooltip activator="parent" location="top">Xóa</v-tooltip>
                </div>
              </div>

              <!-- Message main -->
              <div class="message-main">
                <!-- Message main audio -->
                <div
                  v-if="message.media[0] && message.media[0].type == 'audio/wav'"
                  class="message-content__audio"
                >
                  <audio preload="none" controls>
                    <source :src="message.media[0].url" type="audio/wav" />
                    Trình duyệt của bạn không hỗ trợ tính năng này.
                  </audio>
                </div>

                <!-- Message main image -->
                <div v-else class="message-content__images">
                  <v-row dense>
                    <v-col
                      v-for="(media, index) in message.media"
                      :key="index"
                      :cols="12 / getColumnCount(message.media.length)"
                    >
                      <v-img
                        aspect-ratio="1"
                        cover
                        height="140"
                        width="140"
                        :src="media.url"
                        @click="openImageDialog(media.url)"
                        class="cursor-pointer"
                      ></v-img>

                      <!-- Dialog để hiển thị ảnh lớn -->
                      <v-dialog v-model="imageDialog" max-width="600px">
                        <v-card>
                          <v-card-title class="d-flex justify-space-between align-center">
                            <v-btn
                              icon="mdi-close"
                              variant="text"
                              @click="imageDialog = false"
                            ></v-btn>
                          </v-card-title>
                          <v-img :src="imageSelected" contain height="100%"></v-img>
                        </v-card>
                      </v-dialog>
                    </v-col>
                  </v-row>
                </div>

                <!-- Message main text -->
                <div class="message-content__text-wrapper">
                  <div
                    class="message-content__reply"
                    @click="handleScrollMessage(message.replyMessage)"
                    v-if="message.replyMessage"
                  >
                    <v-icon icon="mdi-reply" color="grey-darken-1"></v-icon>
                    <p class="message-content__reply__content">
                      {{ message.replyMessage.content }}
                    </p>
                    <p class="message-content__reply__details">
                      {{ message.replyMessage.fullname }},{{ message.replyMessage.createdAt }}
                    </p>
                  </div>
                  <div v-if="message.isDelete" class="message-content__text">
                    Tin nhắn đã bị xóa
                  </div>
                  <div
                    v-else-if="!message.isDelete && message.content"
                    class="message-content__text"
                  >
                    {{ message.content }}
                  </div>
                </div>
                <v-tooltip activator="parent" location="top">{{
                  convertToDayOfWeek(message.createdAt)
                }}</v-tooltip>
              </div>

              <!-- Message avtar -->
              <div class="message-sender__avatar">
                <MSAvatar width="30" height="30" :alt="message.fullname" :src="message.avatarUrl">
                </MSAvatar>
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
        <Picker v-if="showEmojiPicker" :data="emojiIndex" set="twitter" @select="showEmoji" />
        <!-- Reply Input -->
        <div v-if="isReplyMessage" class="content__input__reply">
          <div class="d-flex justify-space-between py-2">
            <v-icon color="grey-darken-1" icon="mdi-reply"></v-icon>
            <v-icon color="grey-darken-1" icon="mdi-close" @click="closeReplyMessage"></v-icon>
          </div>
          <div class="content_input__reply__message">{{ replyMessage.content }}</div>
          <div class="content_input__reply__sender--detail">
            {{ replyMessage.fullname }}, {{ convertToDayOfWeek(replyMessage.createdAt) }}
          </div>
        </div>

        <!-- Message Input -->
        <v-textarea
          ref="messageInput"
          auto-focus
          class="custom-textfield"
          v-model="messageInput"
          height="50"
          @keydown.enter="sendMessage"
          rows="1"
          auto-grow
          max-rows="3"
          density="compact"
          variant="solo"
          hide-details
          single-line
          placeholder="Nhập tin nhắn"
        >
          <template v-slot:prepend>
            <v-icon
              icon="mdi-emoticon-outline"
              clickable
              @click="showEmojiPicker = !showEmojiPicker"
            ></v-icon>
          </template>
        </v-textarea>
      </div>
      <!-- Actions -->
      <div class="content__input__actions">
        <div v-if="isTyping" class="content__input__actions__item">
          <v-progress-circular
            v-if="isSendingMessage"
            :size="20"
            :width="3"
            color="black"
            indeterminate
          ></v-progress-circular>
          <v-icon v-else size="20" @click="sendMessage" icon="mdi-send-variant-outline" />
        </div>
        <div v-if="!isTyping" class="content__input__actions__item">
          <v-icon
            v-if="!isRecording"
            @click="startRecording"
            size="20"
            icon="mdi-microphone-outline"
          />
          <v-icon v-else @click="stopRecording" size="20" icon="mdi-pause"></v-icon>
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
  <ConfirmDialog
    ref="deleteMessageDialog"
    title="Xóa tin nhắn"
    message="Bạn có chắc chắn muốn xoá tin nhắn này không?"
    @response="handleResponseDeleteMessageDialog"
  />

  <UserInfoDialog
    :userId="room.receiverId"
    :visible="showUserInfoDialog"
    @close="showUserInfoDialog = false"
  ></UserInfoDialog>
</template>

<script>
import MSAvatar from '@/components/CustomAvatar/MSAvatar.vue'
import MSTextField from '@/components/CustomTextField/MSTextField.vue'
import ChatService from '@/socket/ChatService'
import ConversationSkeletonLoading from '@/components/SkeletonLoading/ConversationSkeletonLoading.vue'
import { getConservationByRoomIdAPI, searchMessageByRoomAPI } from '@/services/MessageService'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useRoomInfoStore } from '@/stores/RoomInfoStore'
import { useAllUsersInfoStore } from '@/stores/AllUsersInfoStore'
import { convertToDayOfWeek } from '@/helper/ConvertDate'
import { uploadFilesAndGetUrls } from '@/helper/GetUrlOfMedia'

import Dropzone from 'dropzone'
import data from 'emoji-mart-vue-fast/data/all.json'
import 'emoji-mart-vue-fast/css/emoji-mart.css'
import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src'
import { differenceInMinutes, parseISO } from 'date-fns'
import { defineAsyncComponent } from 'vue'

let emojiIndex = new EmojiIndex(data)

export default {
  components: {
    MSTextField,
    MSAvatar,
    ConversationSkeletonLoading,
    Picker,
    ConfirmDialog: defineAsyncComponent(() => import('@/components/Dialog/ConfirmDialog.vue')),
    AddMemberDialog: defineAsyncComponent(() => import('@/components/Dialog/AddMemberDialog.vue')),
    RoomInfoDialog: defineAsyncComponent(() => import('@/components/Dialog/RoomInfoDialog.vue')),
    UserInfoDialog: defineAsyncComponent(() => import('@/components/Dialog/UserInfoDialog.vue'))
  },

  data() {
    return {
      room: {},
      userId: '',
      userName: '',
      roomId: '',
      messageInput: '',
      searchValue: '',
      imageSelected: '',
      searchNotification: 'Nhấn "Enter" để tìm tin nhắn',
      notifyTyping: '',
      messages: [],
      isTyping: false,
      isSendingMessage: false,
      isLoadingMessage: false,
      isLoadingSearch: false,
      isSearchField: false,
      flagStopCallApi: false,
      imageDialog: false,
      showUserInfoDialog: false,
      skeletonLoadingConversation: true,
      skeletonLoadingRoomInfo: true,
      offset: 0,
      limit: 30,
      messagesSearchList: [],
      filesToUpload: [],
      myDropzone: null,
      selectedMessage: {},
      emojiIndex: emojiIndex,
      showEmojiPicker: false,
      showAddMemberDialog: false,
      showRoomInfoDialog: false,
      isReplyMessage: false,
      replyMessage: null,
      localStream: null,
      mediaRecorder: null,
      isRecording: false
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

        const messages = res.data.map((message) => {
          const userInfo = this.allUsersInfoMap.get(message.senderId)

          let replyMessage = null
          if (message.replyTo) {
            replyMessage = res.data.find((msg) => msg._id === message.replyTo)
          }

          return {
            ...message,
            avatarUrl: userInfo.avatarUrl,
            fullname: userInfo.fullname,
            replyMessage: replyMessage
              ? {
                  _id: replyMessage._id,
                  fullname: this.allUsersInfoMap.get(replyMessage.senderId)?.fullname || 'Unknown',
                  content: replyMessage.content,
                  createdAt: this.convertToDayOfWeek(replyMessage.createdAt)
                }
              : null
          }
        })

        this.messages = [...this.messages, ...messages]
      } catch (error) {
        console.error(error)
      } finally {
        this.isLoadingMessages = false
        this.isLoadingMessage = false
        this.skeletonLoadingConversation = false
        this.skeletonLoadingRoomInfo = false
        this.isLoadingMessage = false
        this.offset += this.limit
      }
    },

    //Hàm gửi tin nhắn
    async sendMessage() {
      console.log('sendMessage call')
      this.isSendingMessage = true
      if (this.messageInput.length === 0 && this.filesToUpload.length === 0) return

      const message = {
        roomId: this.roomId,
        senderId: this.userId
      }

      if (this.replyMessage) {
        message.replyTo = this.replyMessage._id
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
      this.showEmojiPicker = false
      // Xóa nội dung tin nhắn và danh sách file
      this.closeReplyMessage()
      this.messageInput = ''
      this.filesToUpload = []
      this.myDropzone.removeAllFiles(true)
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

          this.messagesSearchList = messagesSearchList.map((message) => {
            const user = this.allUsersInfoMap.get(message.senderId)
            if (user) {
              message.senderName = user.fullname
              message.avatarUrl = user.avatarUrl
            }
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
      const allItems = this.$refs.messageList.querySelectorAll('.highlight-text')

      if (!allItems) return
      allItems.forEach((item) => {
        item.classList.remove('highlight-text')
      })
    },

    //Lấy URL của ảnh khi gửi tin nhắn
    async getUrlOfMedia() {
      const roomId = localStorage.getItem('roomId')
      const path = `rooms/${roomId}/files`
      const url = await uploadFilesAndGetUrls(this.filesToUpload, path)
      return url
    },

    async startRecording() {
      try {
        this.isRecording = true
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.mediaRecorder = new MediaRecorder(this.localStream)

        let audioChunks = []
        this.mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data)
        }

        this.mediaRecorder.onstop = async () => {
          const randomId = this.getRandomIdOfMedia()
          const audioFile = new File(audioChunks, `voice-message-${randomId}.wav`, {
            type: 'audio/wav'
          })
          this.filesToUpload.push(audioFile)
          console.log('Recording stopped, file ready for upload.', this.filesToUpload)
        }

        this.mediaRecorder.start()
      } catch (error) {
        console.error('Microphone access error:', error)
      }
    },

    async stopRecording() {
      this.isTyping = true
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          track.stop()
        })
        this.localStream = null
      }
      if (this.mediaRecorder) {
        this.mediaRecorder.stop()
        this.mediaRecorder = null
      }
      console.log('File is ready before send')
      setTimeout(async () => {
        await this.sendMessage()
        this.isTyping = false
        this.isRecording = false
      }, 0)
    },

    getRandomIdOfMedia() {
      return Math.floor(Math.random() * 10000000000) + 1
    },

    // Hàm set class cho thẻ li
    isLastMessageOfTime(index) {
      // Nếu tin nhắn hiện tại là tin nhắn cuối cùng trong danh sách, không cần kiểm tra
      if (index === this.messages.length - 1) {
        return false
      }

      const currentMessage = this.messages[index]
      const nextMessage = this.messages[index + 1]

      const currentMessageTime = parseISO(currentMessage.createdAt)
      const nextMessageTime = parseISO(nextMessage.createdAt)

      // Kiểm tra khoảng cách giữa hai tin nhắn
      return differenceInMinutes(currentMessageTime, nextMessageTime) >= 30
    },

    isLastMessageOfSender(index) {
      // Nếu đây là tin nhắn cuối cùng trong danh sách thì đương nhiên là tin nhắn cuối của sender
      if (index === this.messages.length - 1) {
        return true
      }

      if (this.messages[index].senderId !== this.messages[index + 1].senderId) {
        return true
      }

      return false
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

    openUserInfoDialog(room) {
      if (room.type !== 'private') return
      this.showUserInfoDialog = true
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
        messageId: this.selectedMessage._id
      }
      ChatService.deleteMessage(message)
    },

    //Hàm gửi sự kiện người dùng đang nhập tin nhắn
    sendNotifyTyping() {
      const userInfoStore = useUserInfoStore()
      const roomId = this.roomId
      const senderName = userInfoStore.userInfo.fullname
      const senderId = this.userId
      const isTyping = this.isTyping
      ChatService.sendNotifyTyping({ roomId, senderId, senderName, isTyping })
    },

    async openVideoCall(hasVideo) {
      const callerId = localStorage.getItem('userId')
      const callId = Math.floor(Math.random() * 1000000000).toString()
      const roomId = this.room._id
      const userIdsToRing = this.room.members
        .filter((user) => user.userId !== this.userId)
        .map((user) => user.userId)

      const url = new URL('http://localhost:5173/call')

      url.searchParams.append('room_id', roomId)
      url.searchParams.append('call_id', callId)
      userIdsToRing.forEach((userId) => url.searchParams.append('users_to_ring', userId))
      url.searchParams.append('caller_id', callerId)
      url.searchParams.append('has_video', hasVideo)

      ChatService.inviteCall({ url, userIdsToRing })
      window.open(url.toString(), '_blank', 'width=1268,height=768')
    },

    //Mở Add member dialog từ Room info dialog
    openAddMemberDialog() {
      this.showRoomInfoDialog = false
      this.showAddMemberDialog = true
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
    },

    showEmoji(emoji) {
      this.messageInput += emoji.native
    },

    closeReplyMessage() {
      this.isReplyMessage = false
      this.replyMessage = null
    },

    openReplyMessage(message) {
      this.isReplyMessage = true
      this.replyMessage = message
    }
  },

  mounted() {
    this.userId = localStorage.getItem('userId')

    this.$refs.messageInput.$el.querySelector('textarea').focus()

    const allUsersInfoStore = useAllUsersInfoStore()
    const allUsersInfo = allUsersInfoStore.allUsersInfo

    this.allUsersInfoMap = new Map(allUsersInfo.map((user) => [user._id, user]))

    //Setup dropzone
    this.setupDropzone()

    // Lắng nghe tin nhắn đã gửi
    ChatService.onMessageReceived((messageReceived) => {
      let replyMessage = null

      if (messageReceived.replyTo) {
        replyMessage = this.messages.find((msg) => msg._id === messageReceived.replyTo)
      }

      replyMessage = messageReceived.replyTo
        ? {
            _id: replyMessage._id,
            fullname: this.allUsersInfoMap.get(replyMessage.senderId)?.fullname || 'Unknown',
            content: replyMessage.content,
            createdAt: this.convertToDayOfWeek(replyMessage.createdAt)
          }
        : null

      const message = {
        ...messageReceived,
        replyMessage
      }

      this.messages.unshift(message)
    })

    ChatService.onDeletedMessageReceived((deletedMessage) => {
      this.messages = this.messages.map((message) => {
        if (message._id === deletedMessage._id) {
          return deletedMessage
        }
        return message
      })
    })

    ChatService.onNotifyTypingReceived((notify) => {
      if (notify) {
        if (notify.senderId !== this.userId && notify.isTyping == true) {
          this.notifyTyping = `${notify.senderName} đang nhập tin nhắn ...`
        } else {
          this.notifyTyping = ''
        }
      }
    })

    ChatService.onUpdatedRoomReceived((updatedRoom) => {
      if (updatedRoom.type == 'private') return
      const roomInfoStore = useRoomInfoStore()
      roomInfoStore.setRoomInfo(updatedRoom)
      this.room = updatedRoom
    })
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
        if (oldVal && oldVal._id && newVal._id == oldVal._id) return
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
        this.notifyTyping = ''
        this.messageInput = ''

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
    },

    isTyping() {
      this.sendNotifyTyping()
    }
  }
}
</script>

<style lang="scss">
.content-wrapper {
  display: flex;
  flex-direction: column;
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

  .v-list {
    overflow-y: hidden !important;
  }

  .v-list:hover {
    overflow-y: auto !important;
  }
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
  padding: 12px 0;
  align-items: end;
  justify-content: center;
  width: 100%;
  border-top: 1px solid var(--border-color);

  .content__input--wrapper {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
  }

  .content__input__content {
    display: flex;
    flex-direction: column;
    width: 50%;
  }

  .content__input__reply {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 12px;
    height: fit-content;
    background-color: var(--background-icon-color);
    border-radius: 18px;
    padding: 4px 16px;
  }

  .content_input__reply__message {
    position: relative;
    display: inline;
    flex-grow: 0;
    flex-shrink: 0;
    overflow: hidden;
    white-space: pre;
    text-overflow: ellipsis;
    color: var(--text-color);
    align-self: stretch;
    cursor: inherit;
  }

  .content_input__reply__sender--detail {
    position: relative;
    display: inline;
    flex-grow: 0;
    flex-shrink: 0;
    font-size: 12px;
    overflow: hidden;
    white-space: pre;
    text-overflow: ellipsis;
    color: var(--text-color);
    align-self: stretch;
    cursor: inherit;
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

  .emoji-mart {
    position: absolute;
    bottom: 84px;
    width: 300px;
    height: 300px;

    .emoji-mart-preview {
      display: none;
    }
  }
}

.content__conversation {
  width: 100%;
  justify-content: center;
  position: relative;
  display: flex;
  padding: 4px 0;
  flex-direction: row;
  overflow: hidden;
  align-items: stretch;

  .content__conversation--main {
    min-height: calc(100vh - 60px - 86px);
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
      padding: 12px 8px;
      height: 100%;
      list-style-type: none;

      .message-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        .message-sender__name {
          display: none;
        }
      }

      .time-separator {
        .message-time {
          display: flex;
          position: absolute;
          width: 100%;
          top: -46px;
          justify-content: center;
          margin: 8px 0;
        }

        .message-sender__avatar {
          .v-img {
            display: block;
          }
        }
      }

      .my-message.time-separator {
        padding-top: 56px;
      }

      .other-message.time-separator {
        padding-top: 38px;

        .message-sender__name {
          display: block;
        }

        .message-sender__name {
          display: flex;
          position: absolute;
          width: 100%;
          top: -16px;
          font-size: 12px;
          justify-content: start;
          padding-left: 48px;
          color: var(--text-color);
        }
      }

      .my-message {
        .message-sender__avatar {
          display: none;
        }
      }

      .message-sender__avatar {
        width: 30px;
        height: 30px;
        .v-img {
          display: none;
        }
      }

      .other-message.first-message {
        .message-sender__avatar {
          .v-img {
            display: block;
          }
        }

        .message-time {
          display: flex;
          position: absolute;
          width: 100%;
          top: -46px;
          justify-content: center;
          margin: 8px 0;
        }

        .message-sender__name {
          display: flex;
          position: absolute;
          width: 100%;
          top: -16px;
          font-size: 12px;
          justify-content: start;
          padding-left: 48px;
          color: var(--lighter-text-color);
        }
      }
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

    .notify-typing {
      display: flex;
      justify-content: center;
      align-items: center;

      .message__notify {
        opacity: 0.7;
        font-size: 14px;
      }
    }

    .my-message {
      .message-wrapper {
        justify-content: flex-end;
      }

      .message-content__text-wrapper {
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

    .message-time {
      display: none;
    }

    .other-message {
      .message-wrapper {
        justify-content: start;
        flex-direction: row-reverse;
      }

      .message-content__text-wrapper {
        background-color: #f1f1f1;
      }

      &:hover {
        .message-actions {
          display: flex;
          align-items: center;

          .message-actions__item:nth-child(3) {
            display: none;
          }
        }
      }
    }

    .message-content__text {
      margin: 4px 12px;
    }

    .message-main {
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      max-width: 70%;
    }

    .message-sender__avatar {
      .v-img {
        border-radius: 50%;
      }
    }

    .message-content__text-wrapper {
      margin: 4px 8px;
      border-radius: 12px;
      font-size: 14px;
      overflow-wrap: break-word;
      color: var(--text-color);
    }

    .message-content__reply {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      padding: 4px 8px;
      margin: 4px;
      border: 1px solid var(--border-color);
      background-color: var(--background-reply-message-color);
    }

    .message-content__reply__content {
      position: relative;
      display: inline;
      flex-grow: 0;
      flex-shrink: 0;
      overflow: hidden;
      white-space: pre;
      text-overflow: ellipsis;
      color: var(--text-color);
      align-self: stretch;
      cursor: inherit;
    }

    .message-content__reply__details {
      position: relative;
      display: inline;
      flex-grow: 0;
      flex-shrink: 0;
      overflow: hidden;
      white-space: pre;
      font-size: 12px;
      text-overflow: ellipsis;
      color: var(--text-color);
      align-self: stretch;
      cursor: inherit;
    }

    .message-content__images {
      .v-img__img {
        border-radius: 8px;
      }
    }

    .message-content__audio {
      color: var(--background-message-color);
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
