import * as T from 'three';

/**
 * Orbit controls, written here rather than imported because the r128 build does
 * not ship OrbitControls, and because this needs tap-to-pick woven into the same
 * pointer handling: a tap that barely moved is a selection, not a drag.
 */
export class Orbit {
  target = new T.Vector3(0, 0.75, 0);
  /** Where the camera is now, and where it is easing to. */
  private now = { th: -0.75, ph: 1.13, r: 8.6 };
  want = { th: -0.75, ph: 1.13, r: 8.6 };
  spinning = false;

  private pointers = new Map<number, { x: number; y: number }>();
  private lastPinch = 0;
  private moved = 0;
  private downAt: { x: number; y: number } | null = null;

  constructor(
    private camera: T.PerspectiveCamera,
    el: HTMLCanvasElement,
    private onTap: (pt: { x: number; y: number }) => void,
    private onDragStart: () => void
  ) {
    el.addEventListener('pointerdown', e => {
      el.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.moved = 0;
      this.downAt = { x: e.clientX, y: e.clientY };
    });
    el.addEventListener('pointermove', e => this.move(e));
    const up = (e: PointerEvent) => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.lastPinch = 0;
      if (this.moved < 8 && this.downAt) this.onTap(this.downAt);
      this.downAt = null;
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', e => {
      e.preventDefault();
      this.zoom(1 + Math.sign(e.deltaY) * 0.09);
    }, { passive: false });
  }

  private move(e: PointerEvent) {
    const p = this.pointers.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;

    if (this.pointers.size === 1) {
      this.moved += Math.abs(dx) + Math.abs(dy);
      this.spinning = false;
      this.onDragStart();
      this.want.th -= dx * 0.007;
      this.want.ph = Math.max(0.18, Math.min(1.52, this.want.ph - dy * 0.006));
    } else if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.lastPinch) this.zoom(this.lastPinch / dist);
      this.lastPinch = dist;
      this.moved += 10;
    }
  }

  private zoom(factor: number) {
    this.want.r = Math.max(1.2, Math.min(16, this.want.r * factor));
  }

  /** Eases toward the target each frame, which is what makes inspect feel like a move. */
  update(lookAt: T.Vector3, targetEase: number) {
    if (this.spinning) this.want.th += 0.0035;
    this.target.lerp(lookAt, targetEase);
    const n = this.now, w = this.want;
    n.th += (w.th - n.th) * 0.15;
    n.ph += (w.ph - n.ph) * 0.15;
    n.r += (w.r - n.r) * 0.15;
    this.camera.position.set(
      this.target.x + n.r * Math.sin(n.ph) * Math.sin(n.th),
      this.target.y + n.r * Math.cos(n.ph),
      this.target.z + n.r * Math.sin(n.ph) * Math.cos(n.th)
    );
    this.camera.lookAt(this.target);
  }
}
