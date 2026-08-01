// Hostinger Phusion Passenger CommonJS Entry Point
(async () => {
  try {
    await import('./server/index.js')
    console.log('[HOSTINGER] Server started successfully')
  } catch (err) {
    console.error('[HOSTINGER BOOT ERROR]', err)
  }
})()
