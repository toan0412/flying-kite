import { Peer } from 'peerjs'

const PeerService = {
  createPeer(peerId) {
    const peer = new Peer(peerId, {
      host: '6s56z8-9000.csb.app',
      secure: true
    })
    return peer
  },

  async call(peer, targetPeerId, isVideoCall = true) {
    try {
      let mediaConstraints = isVideoCall ? { video: true, audio: true } : { audio: true }
      let mediaStream

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
      } catch (err) {
        console.warn('Video device not found. Falling back to audio only.')
        mediaConstraints = { audio: true }
        mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
      }

      const call = peer.call(targetPeerId, mediaStream, mediaConstraints)

      call.on('stream', (remoteStream) => {
        const remoteVideoElement = document.getElementById('local-video')
        if (remoteVideoElement) {
          remoteVideoElement.srcObject = remoteStream
        }
      })

      call.on('close', () => {
        console.log('Call closed')
      })

      call.on('error', (err) => {
        console.error('Call error:', err)
      })

      return call
    } catch (err) {
      console.error('Failed to create media stream:', err)
    }
  },

  async answer(call, isVideoCall = true) {
    try {
      let mediaConstraints = isVideoCall ? { video: true, audio: true } : { audio: true }
      let mediaStream
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
      } catch (err) {
        console.warn('Video device not found. Falling back to audio only.')
        mediaConstraints = { audio: true }
        mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
      }

      // Answer the call with the media stream
      call.answer(mediaStream)

      call.on('stream', (remoteStream) => {
        const remoteVideoElement = document.getElementById('remote-video')
        if (remoteVideoElement) {
          remoteVideoElement.srcObject = remoteStream
        }
      })

      call.on('close', () => {
        console.log('Call closed')
      })

      call.on('error', (err) => {
        console.error('Call error:', err)
      })

      return call
    } catch (err) {
      console.error('Failed to create media stream:', err)
    }
  }
}

export default PeerService
