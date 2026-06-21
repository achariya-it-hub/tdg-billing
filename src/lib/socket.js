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
  createSocket().connect()
  createSocket().emit('join-kitchen')
}

export function connectToPOS() {
  createSocket().connect()
  createSocket().emit('join-pos')
}

export function connectToOnline() {
  createSocket().connect()
  createSocket().emit('join-online')
}
