<template>
  <div class="call-container">
    <div class="video-call">
      <!-- Local Video-->
      <div class="local-video-wrapper">
        <video class="local-video" ref="localVideo" autoplay muted></video>
      </div>

      <!-- Remote Video-->
      <div class="remote-video-wrapper">
        <div v-if="!isResponse" class="remote-video">
          <div class="d-flex justify-center align-center h-100">
            <div class="text-h6 font-weight-bold text-grey-lighten-5">
              Đang đợi người dùng phản hồi ...
            </div>
          </div>
        </div>
        <video v-else class="remote-video" ref="remoteVideo" autoplay></video>
      </div>
    </div>
    <div class="call-controls">
      <div class="call-controls-wrapper">
        <v-btn v-if="isAudio" size="42" @click="toggleAudio" icon="mdi-microphone-outline"></v-btn>
        <v-btn v-else size="42" @click="toggleAudio" icon="mdi-microphone-off"></v-btn>
        <v-btn v-if="isVideo" size="42" @click="toggleCamera" icon="mdi-video-outline"></v-btn>
        <v-btn v-else size="42" @click="toggleCamera" icon="mdi-video-off-outline"></v-btn>
        <v-btn size="42" icon="mdi-phone-hangup" color="red-darken-1" @click="endCall"></v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import PeerService from '@/peer/PeerService'
import ChatService from '@/socket/ChatService'

export default {
  data() {
    return {
      peer: null,
      remotePeerId: null,
      localStream: null,
      isCaller: false,
      isAudio: true,
      isVideo: null,
      isResponse: false
    }
  },

  async mounted() {
    const route = useRoute()

    if (!route.query) return

    const userId = localStorage.getItem('userId')
    const callerId = route.query.caller_id
    const hasVideoStr = route.query.has_video
    this.isVideo = hasVideoStr === 'true' ? true : false

    this.remotePeerId = route.query.users_to_ring

    if (userId === callerId) {
      this.isCaller = true
    }

    await this.setUpCamera()

    //Tạo peer mới
    this.peer = PeerService.createPeer(userId)
    ChatService.joinRoom(userId)

    // Nếu là người gọi, lắng nghe sự kiện người nghe gửi thông tin
    if (this.isCaller) {
      ChatService.onReceiverPeerIdReceived((peerId) => {
        this.remotePeerId = peerId
        this.startCall()
      })
    }
    // Nếu không phải người gọi, gửi peerId đến người gọi để kết nối
    else {
      ChatService.sendReceiverPeerId({ peerId: this.peer._id, callerId: callerId })
    }

    // Lắng nghe cuộc gọi đến
    this.peer.on('call', (call) => {
      if (this.localStream) {
        call.answer(this.localStream)
      }
      call.on('stream', (remoteStream) => {
        this.isResponse = true
        this.$refs.remoteVideo.srcObject = remoteStream
      })
    })
  },

  methods: {
    async setUpCamera() {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        if (this.isVideo == false) {
          this.localStream.getTracks().forEach((track) => {
            if (track.kind === 'video') {
              track.enabled = this.isVideo
            }
          })
        }
        this.$refs.localVideo.srcObject = this.localStream
      } catch (err) {
        console.error('Lỗi khi truy cập camera: ', err)
      }
    },

    async startCall() {
      if (!this.remotePeerId) {
        return
      }

      try {
        // Thực hiện cuộc gọi
        const call = this.peer.call(this.remotePeerId, this.localStream)
        call.on('stream', (remoteStream) => {
          this.isResponse = true
          this.$refs.remoteVideo.srcObject = remoteStream
        })
        call.on('close', () => {
          console.log('Call ended')
        })
        call.on('error', (err) => {
          console.error('Error in call: ', err)
        })
      } catch (err) {
        console.error('Lỗi khi bắt đầu cuộc gọi: ', err)
      }
    },

    endCall() {
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop())
      }
      if (this.peer) {
        this.peer.destroy()
      }
    },

    toggleAudio() {
      this.isAudio = !this.isAudio
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          if (track.kind === 'audio') {
            track.enabled = this.isAudio
          }
        })
      }
    },

    toggleCamera() {
      this.isVideo = !this.isVideo
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          if (track.kind === 'video') {
            track.enabled = this.isVideo
          }
        })
      }
    }
  },

  beforeUnmount() {
    this.endCall()
  }
}
</script>

<style lang="scss" scoped>
.call-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  background-color: #202020;
}

.video-call {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
}

.remote-video-wrapper {
  position: absolute;
  display: flex;
  height: 100%;
  width: 100%;
}

.remote-video {
  width: 100%;
  height: 100%;
}

.local-video-wrapper {
  z-index: 1;
  position: absolute;
  display: flex;
  width: 20%;
  height: 20%;
  top: 0;
  right: 0;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.call-controls {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.call-controls-wrapper {
  display: flex;
  background-color: #2c2c34;
  padding: 6px 12px;
  border-radius: 24px;
  margin: 8px 0;

  .v-btn {
    margin: 0 24px;
  }
}
</style>
