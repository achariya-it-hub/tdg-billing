// CommonJS entry point for Hostinger Phusion Passenger
(async () => {
  try {
    await import('./server/index.js');
    console.log('[HOSTINGER] Server booted cleanly via app.cjs');
  } catch (err) {
    console.error('[HOSTINGER BOOT ERROR]', err);
  }
})();
