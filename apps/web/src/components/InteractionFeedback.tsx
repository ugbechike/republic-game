'use client';
import { useEffect } from 'react';
export function InteractionFeedback() {
  useEffect(() => {
    let enabled = false,
      audio: AudioContext | undefined;
    const setting = (event: Event) => {
      enabled = (event as CustomEvent<boolean>).detail;
    };
    const click = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest('button');
      if (!button || button.disabled) return;
      window.dispatchEvent(
        new CustomEvent('republic:interaction', { detail: { kind: 'button', label: button.textContent?.trim() } }),
      );
      if (!enabled) return;
      try {
        audio ??= new AudioContext();
        void audio.resume();
        const tone = audio.createOscillator(),
          gain = audio.createGain();
        tone.connect(gain);
        gain.connect(audio.destination);
        tone.frequency.setValueAtTime(420, audio.currentTime);
        tone.frequency.exponentialRampToValueAtTime(240, audio.currentTime + 0.06);
        gain.gain.setValueAtTime(0.035, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.08);
        tone.start();
        tone.stop(audio.currentTime + 0.08);
      } catch {
        /* Visual feedback remains available without audio support. */
      }
    };
    window.addEventListener('republic:sound', setting);
    document.addEventListener('click', click);
    return () => {
      window.removeEventListener('republic:sound', setting);
      document.removeEventListener('click', click);
      void audio?.close();
    };
  }, []);
  return null;
}
