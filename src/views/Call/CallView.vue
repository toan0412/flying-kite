<template>
  <div class="video-call">
    <div class="local-video-container">
      <video id="local-video" autoplay muted></video>
    </div>
    <div class="remote-video-container">
      <video id="remote-video" autoplay></video>
    </div>
    <div class="controls">
      <input v-model="targetPeerId" placeholder="Target Peer ID" />
      <button @click="makeCall">Call</button>
      <button @click="answerCall">Answer</button>
    </div>
  </div>
</template>

<script>
import PeerService from '@/peer/PeerService'

export default {
  data() {
    return {
      peer: null,
      targetPeerId: '',
      call: null
    }
  },
  mounted() {
    // Tạo một Peer với ID
    const peerId = localStorage.getItem('userId')
    console.log(peerId)
    
    this.peer = PeerService.createPeer(peerId)

    // Listen for incoming calls
    this.peer.on('call', (incomingCall) => {
      this.call = incomingCall
    })
  },
  methods: {
    async makeCall() {
      console.log(navigator.mediaDevices)
      if (!this.targetPeerId) {
        alert('Please enter a Target Peer ID')
        return
      }

      try {
        this.call = await PeerService.call(this.peer, this.targetPeerId)
      } catch (error) {
        console.error('Error making call:', error)
      }
    },

    async answerCall() {
      if (this.call) {
        try {
          await PeerService.answer(this.call)
        } catch (error) {
          console.error('Error answering call:', error)
        }
      } else {
        alert('No incoming call to answer')
      }
    }
  }
}
</script>

<style scoped>
.video-call {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.local-video-container,
.remote-video-container {
  width: 300px;
  height: 200px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
}

video {
  width: 100%;
  height: 100%;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.controls input {
  margin-bottom: 10px;
  padding: 5px;
}

.controls button {
  margin: 5px;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
