<template>
  <div class="call-container">
    <div class="video-call">
      <!-- Local Video -->
      <div class="local-video-wrapper">
        <video class="local-video" ref="localVideo" autoplay muted></video>
      </div>

      <!-- Remote Videos -->
      <div class="remote-videos-wrapper">
        <div
          v-for="(stream, peerId) in remoteStreams"
          :key="peerId"
          class="remote-video-wrapper"
          :style="remoteVideoStyle"
        >
          <video
            class="remote-video"
            :ref="
              (el) => {
                if (el) remoteVideoRefs[peerId] = el
              }
            "
            autoplay
          ></video>
        </div>
        <div v-if="Object.keys(remoteStreams).length === 0" class="remote-video">
          <div class="d-flex justify-center align-center h-100">
            <div class="text-h6 font-weight-bold text-grey-lighten-5">
              Đang đợi người dùng phản hồi ...
            </div>
          </div>
        </div>
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
      localVideo: null,
      remoteStreams: {},
      remoteVideoRefs: {},
      peer: null,
      remotePeerIds: [],
      localStream: null,
      isCaller: false,
      isAudio: true,
      isVideo: true
    }
  },

  computed: {
    remoteVideoStyle() {
      const count = Object.keys(this.remoteStreams).length
      if (count === 1) {
        return { width: '100%', height: '100%' }
      } else if (count === 2) {
        return { width: '50%', height: '100%' }
      } else if (count === 3) {
        return { width: '33.33%', height: '100%' }
      } else {
        return { width: '50%', height: '50%' }
      }
    }
  },

  methods: {
    async setUpCamera() {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        if (!this.isVideo) {
          this.localStream.getVideoTracks().forEach((track) => (track.enabled = false))
        }
        this.$refs.localVideo.srcObject = this.localStream
      } catch (err) {
        console.error('Lỗi khi truy cập camera: ', err)
      }
    },

    startCall(peerId) {
      if (!peerId) return
      try {
        const call = this.peer.call(peerId, this.localStream)
        this.handleCall(call)
      } catch (err) {
        console.error('Lỗi khi bắt đầu cuộc gọi: ', err)
      }
    },

    handleCall(call) {
      call.on('stream', (remoteStream) => {
        this.$set(this.remoteStreams, call.peer, remoteStream)
        this.$nextTick(() => {
          if (this.remoteVideoRefs[call.peer]) {
            this.remoteVideoRefs[call.peer].srcObject = remoteStream
          }
        })
      })
      call.on('close', () => {
        this.$delete(this.remoteStreams, call.peer)
      })
    },

    endCall() {
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop())
      }
      if (this.peer) {
        this.peer.destroy()
      }
      // Add logic to notify other users about call ending
    },

    toggleAudio() {
      this.isAudio = !this.isAudio
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((track) => (track.enabled = this.isAudio))
      }
    },

    toggleCamera() {
      this.isVideo = !this.isVideo
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach((track) => (track.enabled = this.isVideo))
      }
    }
  },

  async mounted() {
    const route = useRoute()
    if (!route.query) return

    const userId = localStorage.getItem('userId')
    const callerId = route.query.caller_id
    this.isVideo = route.query.has_video === 'true'
    this.remotePeerIds = route.query.users_to_ring
    this.isCaller = userId === callerId

    await this.setUpCamera()

    this.peer = PeerService.createPeer(userId)
    ChatService.joinRoom(userId)

    if (this.isCaller) {
      ChatService.onReceiverPeerIdReceived((peerId) => {
        if (!this.remotePeerIds.includes(peerId)) {
          this.remotePeerIds.push(peerId)
        }
        this.startCall(peerId)
      })
    } else {
      ChatService.sendReceiverPeerId({ peerId: this.peer._id, callerId: callerId })
    }

    this.peer.on('call', (call) => {
      call.answer(this.localStream)
      this.handleCall(call)
    })
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
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  margin: 12px;
}

.remote-videos-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.local-video-wrapper {
  position: absolute;
  width: 20%;
  height: 20%;
  top: 10px;
  right: 10px;
  z-index: 1;
}

.remote-video,
.local-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.call-controls {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 20px;
}

.call-controls-wrapper {
  display: flex;
  background-color: #2c2c34;
  padding: 6px 12px;
  border-radius: 24px;

  .v-btn {
    margin: 0 12px;
  }
}
</style>