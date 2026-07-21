// Audio Alert Utility using Web Audio API
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

export function playOrderAlertSound(type = 'new_order') {
  if (!getSoundEnabled()) return
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    if (type === 'new_order' || type === 'online_order') {
      // Pleasant 3-note ascending chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
      const notes = [523.25, 659.25, 783.99]
      notes.forEach((freq, idx) => {
        const startTime = ctx.currentTime + (idx * 0.12)
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + 0.35)
      })
    } else if (type === 'kot') {
      // Crisp 2-tone kitchen bell
      const freqs = [783.99, 1046.5]
      freqs.forEach((freq, idx) => {
        const startTime = ctx.currentTime + (idx * 0.15)
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, startTime)
        gain.gain.setValueAtTime(0.4, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(startTime)
        osc.stop(startTime + 0.4)
      })
    }
  } catch (e) {
    console.error('Audio alert error:', e)
  }
}
