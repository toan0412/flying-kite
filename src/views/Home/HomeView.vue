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
          @click="openUserInfoDialog(room.receiverId, room.type)"
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
          :visible="showRoomInfoDialog"
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
            <!-- Loading message -->
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
              'message',
              message.senderId === userId ? 'my-message' : 'other-message',
              isLastMessageOfSender(index) ? 'first-message' : '',
              isLastMessageOfTime(index) ? 'time-separator' : ''
            ]"
            :data-id="message._id"
          >
            <!-- Message wrapper -->
            <div class="message-wrapper">
              <!-- Message time -->
              <div class="message-time">
                <div class="texting-time">
                  {{ convertToDayOfWeek(message.createdAt) }}
                </div>
              </div>

              <!-- Message sender name -->
              <div class="message-sender__name">
                {{ message.fullname }}
              </div>

              <div class="message-row">
                <!-- Message avatar -->
                <div class="message-sender__avatar">
                  <MSAvatar
                    @click="openUserInfoDialog(message.senderId)"
                    width="30"
                    height="30"
                    :alt="message.fullname"
                    :src="message.avatarUrl"
                  >
                  </MSAvatar>
                </div>

                <!-- Message main -->
                <div class="message-main">
                  <!-- Message main audio -->
                  <div
                    v-if="message.media[0] && message.media[0].type == 'audio/wav'"
                    class="message-content__audio"
                  >
                    <audio controls loop>
                      <source :src="message.media[0].url" type="audio/wav" />
                      Trình duyệt của bạn không hỗ trợ tính năng này.
                    </audio>
                  </div>

                  <!-- Message main media -->
                  <div
                    v-else-if="
                      message.media[0] &&
                      (message.media[0].type.includes('image') ||
                        message.media[0].type.includes('video'))
                    "
                    class="message-content__images"
                  >
                    <v-row dense>
                      <v-col
                        v-for="(media, index) in message.media"
                        :key="index"
                        :cols="12 / getColumnCount(message.media.length)"
                      >
                        <v-img
                          v-if="media.type.includes('image')"
                          aspect-ratio="1"
                          cover
                          height="140"
                          width="140"
                          :src="media.url"
                          @click="openZoomInImageDialog(media)"
                        ></v-img>

                        <video
                          preload="metadata"
                          v-if="media.type.includes('video')"
                          height="140"
                          width="140"
                          controls
                        >
                          <source :src="media.url" />
                        </video>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Message main other file -->
                  <div v-else class="message-content__file">
                    <div v-if="message.media[0]" class="message-content__file__text">
                      <a :href="message.media[0].url" target="_blank" rel="noopener noreferrer">
                        <v-icon class="pr-2" icon="mdi-file-outline"></v-icon>
                        {{ message.media[0].name }}
                      </a>
                    </div>
                  </div>

                  <!-- Message main text -->
                  <div
                    v-if="message.content || message.isDelete"
                    class="message-content__text-wrapper"
                  >
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
                    <div v-else class="message-content__text">
                      {{ message.content }}
                    </div>
                  </div>

                  <!-- Message main tooltip -->
                  <v-tooltip activator="parent" location="top">{{
                    convertToDayOfWeek(message.createdAt)
                  }}</v-tooltip>
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
                    <v-icon
                      @click="showDeleteMessageDialog(message)"
                      color="grey-darken-1"
                      size="18"
                      >mdi-trash-can-outline</v-icon
                    >
                    <v-tooltip activator="parent" location="top">Xóa</v-tooltip>
                  </div>
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
      <!-- Hiển thị preview -->
      <div v-if="filesToUpload.length" class="content__input__preview">
        <!-- Hiển thị preview ghi âm -->
        <div v-if="filesToUpload[0].type.includes('audio')" class="content__input__preview__audio">
          <audio controls>
            <source :src="filesToUpload[0].url" type="audio/wav" />
            Trình duyệt của bạn không hỗ trợ tính năng này
          </audio>
          <v-icon
            class="mr-3"
            @click="removeItemFromPreview(index)"
            size="20"
            icon="mdi-close"
          ></v-icon>
        </div>

        <!-- Hiển thị preview ảnh/ video -->
        <div
          v-if="
            filesToUpload.length > 0 &&
            (filesToUpload.some((file) => file.type.includes('image')) ||
              filesToUpload.some((file) => file.type.includes('video')))
          "
          class="content__input__preview__image"
        >
          <div
            v-for="(media, index) in filesToUpload"
            :key="index"
            class="content__input__preview__image__item"
          >
            <!-- preview ảnh-->
            <v-img
              cover
              v-if="media.type.includes('image')"
              :src="media.url"
              height="100"
              width="100"
            ></v-img>

            <!-- preview video-->
            <video v-if="media.type.includes('video')" height="100" controls>
              <source :src="media.url" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <!-- action -->
            <v-icon
              @click="removeItemFromPreview(index)"
              size="18"
              icon="mdi-close-circle"
            ></v-icon>
          </div>
        </div>
      </div>

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
          <input
            class="content__input__actions__item__input"
            ref="imageFileInput"
            type="file"
            accept="image/*, video/*, application/*, .rar"
            multiple
            @change="handleChangePreviewImages"
          />
          <v-icon @click="triggerImageFileInput" size="20" icon="mdi-paperclip" />
        </div>
        <div v-if="!isTyping" class="content__input__actions__item">
          <v-icon size="20" icon="mdi-dots-horizontal" />
        </div>
      </div>
    </div>
  </div>
  <!-- Dialog để hiển thị ảnh lớn -->
  <ZoomInImage :file="fileSelected" :visible="showZoomInImage" @close="showZoomInImage = false" />

  <ConfirmDialog
    ref="deleteMessageDialog"
    title="Xóa tin nhắn"
    message="Bạn có chắc chắn muốn xoá tin nhắn này không?"
    @response="handleResponseDeleteMessageDialog"
  />

  <UserInfoDialog
    :userId="userIdSelected"
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
    UserInfoDialog: defineAsyncComponent(() => import('@/components/Dialog/UserInfoDialog.vue')),
    ZoomInImage: defineAsyncComponent(() => import('@/components/Dialog/ZoomInImage.vue'))
  },

  data() {
    return {
      room: {},
      userId: '',
      userName: '',
      roomId: '',
      messageInput: '',
      searchValue: '',
      fileSelected: {},
      showZoomInImage: false,
      searchNotification: 'Nhấn "Enter" để tìm tin nhắn',
      notifyTyping: '',
      messages: [],
      isTyping: false,
      isSendingMessage: false,
      isLoadingMessage: false,
      isLoadingSearch: false,
      isSearchField: false,
      flagStopCallApi: false,
      showUserInfoDialog: false,
      skeletonLoadingConversation: true,
      skeletonLoadingRoomInfo: true,
      offset: 0,
      limit: 30,
      messagesSearchList: [],
      filesToUpload: [],
      selectedMessage: {},
      emojiIndex: emojiIndex,
      showEmojiPicker: false,
      showAddMemberDialog: false,
      showRoomInfoDialog: false,
      isReplyMessage: false,
      replyMessage: null,
      localStream: null,
      mediaRecorder: null,
      isRecording: false,
      userIdSelected: ''
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
      this.isSendingMessage = true
      if (this.messageInput.length === 0 && this.filesToUpload.length === 0) return

      try {
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
      } catch (error) {
        console.error(error)
      } finally {
        // Reset state
        this.isSendingMessage = false
        this.showEmojiPicker = false
        this.closeReplyMessage()
        this.messageInput = ''
        if (this.filesToUpload) {
          this.revokePreviewObjectURL()
        }
        this.isTyping = false
      }
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
      const files = this.filesToUpload.map((item) => item.file)
      const url = await uploadFilesAndGetUrls(files, path)
      return url
    },

    // Bấm vào icon camera => trigger đến file input
    triggerImageFileInput() {
      this.$refs.imageFileInput.click()
    },

    // Hiển thị ảnh trước khi gửi
    handleChangePreviewImages(event) {
      const files = event.target.files
      const maxFileSize = 25 * 1024 * 1024 // 50MB

      for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxFileSize) {
          alert(`File bạn chọn quá lớn. Kích thước tối đa là 25MB.`)
          // Reset input nếu có file vượt quá kích thước
          this.$refs.imageFileInput.value = ''
          return
        }
        const file = files[i]
        const imageUrl = URL.createObjectURL(file)
        this.filesToUpload.push({ url: imageUrl, file: file, type: file.type })
      }
      console.log(this.filesToUpload)

      if (this.filesToUpload.length) {
        this.isTyping = true
      }
    },

    //Xoá item khỏi preview
    removeItemFromPreview(index) {
      this.filesToUpload.splice(index, 1)
      if (!this.filesToUpload.length) {
        this.isTyping = false
      }
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
          const audioUrl = URL.createObjectURL(audioFile)

          this.filesToUpload.push({ url: audioUrl, file: audioFile, type: audioFile.type })
          console.log(this.filesToUpload)

          if (this.filesToUpload.length) {
            this.isTyping = true
          }
        }

        this.mediaRecorder.start()
      } catch (error) {
        console.error('Microphone access error:', error)
      }
    },

    async stopRecording() {
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
      this.isRecording = false
    },

    revokePreviewObjectURL() {
      if (this.filesToUpload.length > 0) {
        this.filesToUpload = []
        URL.revokeObjectURL(this.filesToUpload)
      }
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

    // Hiển thị ảnh lớn
    openZoomInImageDialog(file) {
      this.fileSelected = file
      this.showZoomInImage = true
    },

    openUserInfoDialog(id, type) {
      if (type && type !== 'private') return
      this.userIdSelected = id
      this.showUserInfoDialog = true
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

  .content__input__actions__item__input {
    display: none;
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

  .content__input__preview__audio {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .content__input__preview__image {
    display: flex;
    padding: 4px 8px;
  }

  .content__input__preview__image__item {
    position: relative;
    padding: 4px 8px;
    height: fit-content;
    width: fit-content;

    .v-img {
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    video {
      object-fit: cover;
      border-radius: 8px;
    }

    .v-icon {
      position: absolute;
      top: -2px;
      right: 0;
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

      .message.first-message {
        .message-time {
          display: flex;
          width: 100%;
          justify-content: center;
        }
      }

      .message:hover {
        &:hover {
          .message-actions {
            display: flex;
            align-items: center;
          }
        }
      }

      .message-wrapper {
        margin: 4px 0;
        position: relative;
        display: flex;
        flex-direction: column;
      }

      .message-row {
        display: flex;
        width: 100%;
        align-items: center;
      }

      .my-message {
        .message-row {
          flex-direction: row-reverse;
        }
        .message-content__text-wrapper {
          background-color: var(--background-message-color);
        }

        .message-wrapper {
          align-items: end;
        }
      }

      .other-message {
        .message-row {
          justify-content: flex-start;
        }

        .message-main {
          padding: 0 14px;
        }

        .message-content__text-wrapper {
          background-color: #f1f1f1;
        }

        &:hover {
          .message-actions__item:nth-child(2) {
            display: none;
          }
        }

        .message-wrapper {
          align-items: start;
        }

        .message-sender__avatar {
          display: flex;
          .v-img {
            border-radius: 50%;
          }
        }
      }

      .other-message.first-message {
        .message-sender__name {
          display: flex;
          margin-left: 46px;
          font-size: 12px;
          color: var(--lighter-text-color);
          font-weight: bold;
        }
      }

      .message-time {
        display: none;
      }

      .message-sender__name {
        display: none;
      }

      .message-sender__avatar {
        display: none;
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

    .message-actions {
      display: none;
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

    .message-content__text-wrapper {
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
        cursor: pointer;
      }
      video {
        object-fit: cover;
        border-radius: 8px;
      }
    }

    .message-content__audio {
      display: flex;
      align-items: center;

      audio {
        height: 36px;
      }

      audio::-webkit-media-controls-panel {
        background-color: var(--background-message-color);
      }
    }

    .message-content__file {
      background-color: var(--background-message-color);
      border-radius: 12px;
      font-size: 14px;
      overflow-wrap: break-word;
      color: var(--text-color);
    }

    .message-content__file__text {
      margin: 4px 12px;
      a {
        display: flex;
        padding: 4px 12px;
        align-items: center;
        font-weight: bold;
        color: var(--text-color);
        text-decoration: none;
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
</style>
