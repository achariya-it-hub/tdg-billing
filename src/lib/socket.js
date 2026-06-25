import { io } from 'socket.io-client'

let socketInstance = null

function getSocketUrl() {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3001'
  }
  return window.location.origin
}

function createSocket() {
  if (!socketInstance) {
    socketInstance = io(getSocketUrl(), {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
  }
  return socketInstance
}

export function getSocket() {
  return createSocket()
}

export function connectToKitchen() {
  const socket = createSocket()
  socket.connect()
  if (socket.connected) {
    socket.emit('join-kitchen')
  } else {
    socket.once('connect', () => socket.emit('join-kitchen'))
  }
}

export function connectToPOS() {
  const socket = createSocket()
  socket.connect()
  if (socket.connected) {
    socket.emit('join-pos')
  } else {
    socket.once('connect', () => socket.emit('join-pos'))
  }
}

export function connectToOnline() {
  const socket = createSocket()
  socket.connect()
  if (socket.connected) {
    socket.emit('join-online')
  } else {
    socket.once('connect', () => socket.emit('join-online'))
  }
}
