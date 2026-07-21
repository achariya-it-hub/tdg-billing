// Audio Alert Utility using Web Audio API (Service Bell Ring Synthesizer)
let soundEnabled = true

export function setSoundEnabled(enabled) {
  soundEnabled = enabled
  try {
    localStorage.setItem('tdg_sound_alerts', enabled ? 'true' : 'false')
  } catch (e) {}
}

export function getSoundEnabled() {
  try {
    const val = localStorage.getItem('tdg_sound_alerts')
    if (val !== null) return val === 'true'
  } catch (e) {}
  return soundEnabled
}

// Synthesizes a realistic metallic service bell ring (brass desk bell "Ding-Ding!")
function strikeServiceBell(ctx, startTime, volumeMultiplier = 1.0) {
  const harmonics = [
    { freq: 2093.00, gain: 0.45 * volumeMultiplier, decay: 1.2 }, // Fundamental C7
    { freq: 2793.83, gain: 0.25 * volumeMultiplier, decay: 0.8 }, // Overnote F7
    { freq: 4186.01, gain: 0.18 * volumeMultiplier, decay: 0.5 }, // High shimmer C8
    { freq: 5587.65, gain: 0.10 * volumeMultiplier, decay: 0.3 }  // Ring strike transient F8
  ]

  harmonics.forEach(h => {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(h.freq, startTime)

    // Instantaneous sharp hammer attack + natural metallic ring decay
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(h.gain, startTime + 0.003)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + h.decay)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + h.decay)
  })
}

export function playOrderAlertSound(type = 'new_order') {
  if (!getSoundEnabled()) return
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    // Service Bell "Ring-Ring!" (2 rapid strikes)
    const t0 = ctx.currentTime
    strikeServiceBell(ctx, t0, 1.0)
    strikeServiceBell(ctx, t0 + 0.18, 0.9)
  } catch (e) {
    console.error('Audio alert error:', e)
  }
}
