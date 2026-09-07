import * as T from 'three';
import type { DemoSpec, DemoUpdate } from './types';
import { Y0 } from './stage';

const canSpeak = typeof speechSynthesis !== 'undefined';

/** Rough reading time, used as a fallback and as a backstop if speech never ends. */
export function stepDuration(text: string): number {
  return Math.max(5, text.split(' ').length * 0.42);
}

export interface RunningDemo {
  spec: DemoSpec;
  root: T.Group;
  update: DemoUpdate;
  step: number;
  time: number;
  playing: boolean;
  spoken: boolean;
  partId: string;
}

/**
 * Plays a mechanism demo: builds the rig, speaks each step, and advances when
 * the narration finishes rather than on a fixed timer, so the animation stays
 * in step with the voice whatever speed the device reads at.
 */
export class DemoPlayer {
  current: RunningDemo | null = null;
  voiceOn = true;

  private caption = document.getElementById('caption')!;
  private capText = document.getElementById('capText')!;
  private capNum = document.getElementById('capNum')!;
  private bar = document.getElementById('demoBar')!;
  private playBtn = document.getElementById('playBtn') as HTMLButtonElement;
  private voiceBtn = document.getElementById('voiceBtn') as HTMLButtonElement;

  constructor(private scene: T.Scene, private onExit: () => void) {
    this.playBtn.onclick = () => this.togglePlay();
    (document.getElementById('prevBtn') as HTMLButtonElement).onclick = () => this.go(this.current!.step - 1);
    (document.getElementById('nextBtn') as HTMLButtonElement).onclick = () => this.go(this.current!.step + 1);
    this.voiceBtn.onclick = () => this.toggleVoice();
  }

  private say(text: string) {
    if (!canSpeak) return;
    speechSynthesis.cancel();
    if (!this.voiceOn) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.96;
    u.onend = () => { if (this.current) this.current.spoken = true; };
    speechSynthesis.speak(u);
  }

  start(spec: DemoSpec, partId: string) {
    const root = new T.Group();
    const update = spec.build(root);
    this.scene.add(root);
    this.caption.style.display = 'block';
    this.bar.style.display = 'flex';
    this.current = { spec, root, update, step: 0, time: 0, playing: true, spoken: false, partId };
    this.go(0);
  }

  go(step: number) {
    const d = this.current;
    if (!d) return;
    d.step = Math.max(0, Math.min(d.spec.steps.length - 1, step));
    d.time = 0;
    d.spoken = false;
    const text = d.spec.steps[d.step];
    this.capText.textContent = text;
    this.capNum.textContent = `${d.step + 1} / ${d.spec.steps.length}`;
    this.say(text);
  }

  private togglePlay() {
    const d = this.current;
    if (!d) return;
    d.playing = !d.playing;
    this.playBtn.textContent = d.playing ? 'Pause' : 'Play';
    if (canSpeak) d.playing ? speechSynthesis.resume() : speechSynthesis.pause();
  }

  private toggleVoice() {
    this.voiceOn = !this.voiceOn;
    this.voiceBtn.setAttribute('aria-pressed', String(this.voiceOn));
    this.voiceBtn.textContent = this.voiceOn ? 'Voice on' : 'Voice off';
    if (!this.voiceOn && canSpeak) speechSynthesis.cancel();
    else if (this.current) this.say(this.current.spec.steps[this.current.step]);
  }

  /** Advances the animation, and the narration when the current step is done. */
  tick(dt: number) {
    const d = this.current;
    if (!d) return;
    if (!d.playing) { d.update(0, d.step, d.time); return; }
    d.time += dt;
    d.update(dt, d.step, d.time);
    const due = stepDuration(d.spec.steps[d.step]);
    const ready = this.voiceOn && canSpeak ? d.spoken || d.time > due * 1.9 : d.time > due;
    if (!ready) return;
    if (d.step < d.spec.steps.length - 1) this.go(d.step + 1);
    else { d.playing = false; this.playBtn.textContent = 'Play'; }
  }

  get focusPoint() { return new T.Vector3(0, Y0, 0); }

  stop() {
    const d = this.current;
    if (!d) return;
    if (canSpeak) speechSynthesis.cancel();
    this.scene.remove(d.root);
    d.root.traverse(o => {
      const m = o as T.Mesh;
      if (m.isMesh) { m.geometry.dispose(); (m.material as T.Material).dispose(); }
    });
    this.caption.style.display = 'none';
    this.bar.style.display = 'none';
    this.current = null;
    this.onExit();
  }
}
