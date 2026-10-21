/**
 * A soft two-note chime made with the Web Audio API, so there's no sound
 * file to load. Browsers only allow sound after the person has interacted
 * with the page, so `unlockChime` is called from the Start button.
 */
let context: AudioContext | null = null;

export function unlockChime() {
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
  } catch {
    context = null;
  }
}

export function playChime() {
  if (!context) return;
  const start = context.currentTime;
  [659.25, 880].forEach((frequency, i) => {
    const osc = context!.createOscillator();
    const gain = context!.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    const t = start + i * 0.28;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    osc.connect(gain).connect(context!.destination);
    osc.start(t);
    osc.stop(t + 1.5);
  });
}
