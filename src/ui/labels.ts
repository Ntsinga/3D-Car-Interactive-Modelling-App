import * as T from 'three';
import type { PartSpec } from '../parts/types';
import { packColumn, isTiny } from '../lib/layout';

const SVGNS = 'http://www.w3.org/2000/svg';

interface Entry {
  part: PartSpec;
  el: HTMLDivElement;
  line: SVGPolylineElement;
  /** Cached label width, so layout does not force a reflow every frame. */
  w: number;
  wState: string;
  hidden: boolean;
}

/**
 * Callout labels in the left and right margins with leader lines to each part.
 *
 * The SVG needs explicit width and height: it is a replaced element, so `inset: 0`
 * leaves it at its intrinsic 300x150 and silently clips every line.
 */
export class Labels {
  private entries: Entry[] = [];
  private wp = new T.Vector3();
  private aim = new T.Vector3();
  private tick = 0;
  visible = true;

  constructor(
    private box: HTMLElement,
    private leads: SVGSVGElement,
    parts: PartSpec[],
    onPick: (p: PartSpec) => void
  ) {
    parts.forEach((part, i) => {
      const el = document.createElement('div');
      el.className = 'lbl';
      el.innerHTML = `<span class="n">${i + 1}</span>${part.name}`;
      el.onclick = () => onPick(part);
      box.appendChild(el);
      const line = document.createElementNS(SVGNS, 'polyline');
      leads.appendChild(line);
      this.entries.push({ part, el, line, w: 0, wState: '', hidden: false });
    });
  }

  setVisible(on: boolean) {
    this.visible = on;
    this.box.style.display = this.leads.style.display = on ? '' : 'none';
  }

  /**
   * A part buried inside the bodywork still gets a label, drawn dimmed: hiding
   * them entirely meant a closed car showed almost nothing.
   */
  private updateOcclusion(camera: T.Camera, car: T.Object3D, ray: T.Raycaster,
                          anchors: Map<string, T.Vector3>, installed: (p: PartSpec) => boolean) {
    for (const e of this.entries) {
      if (!installed(e.part)) { e.hidden = true; continue; }
      this.aim.copy(anchors.get(e.part.id)!);
      const dist = this.aim.distanceTo(camera.position);
      ray.set(camera.position, this.aim.sub(camera.position).normalize());
      const hit = ray.intersectObjects(car.children, true)
        .find(h => h.object.visible && !(h.object as T.Mesh).material['transparent']);
      e.hidden = !!(hit && hit.object.userData.part !== e.part && hit.distance < dist - 0.1);
    }
  }

  layout(opts: {
    camera: T.PerspectiveCamera; car: T.Object3D; ray: T.Raycaster;
    stage: HTMLElement; anchors: Map<string, T.Vector3>;
    installed: (p: PartSpec) => boolean; selected: PartSpec | null; only: PartSpec | null;
  }) {
    if (!this.visible) return;
    if (this.tick++ % 5 === 0) {
      this.updateOcclusion(opts.camera, opts.car, opts.ray, opts.anchors, opts.installed);
    }

    const w = opts.stage.clientWidth;
    const h = opts.stage.clientHeight;
    const cols: Array<Array<{ e: Entry; x: number; y: number }>> = [[], []];

    for (const e of this.entries) {
      const hide = !opts.installed(e.part) || (opts.only && e.part !== opts.only);
      if (hide) { e.el.style.display = 'none'; e.line.style.display = 'none'; continue; }
      this.wp.copy(opts.anchors.get(e.part.id)!).project(opts.camera);
      if (this.wp.z > 1) { e.el.style.display = 'none'; e.line.style.display = 'none'; continue; }
      const x = (this.wp.x * 0.5 + 0.5) * w;
      const y = (-this.wp.y * 0.5 + 0.5) * h;
      cols[x < w / 2 ? 0 : 1].push({ e, x, y });
    }

    cols.forEach((col, side) => {
      col.sort((a, b) => a.y - b.y);
      const slots = packColumn(col.map(c => c.y), h);
      const tiny = isTiny(col.length, h);
      col.forEach((c, i) => {
        const { e } = c;
        const on = e.part === opts.selected;
        const dim = e.hidden && !on;
        const ly = slots[i].labelY;
        e.el.style.display = 'block';
        e.el.classList.toggle('on', on);
        e.el.classList.toggle('dim', dim);
        e.el.classList.toggle('tiny', tiny);
        e.el.style.top = `${ly - 9}px`;
        if (side === 0) { e.el.style.left = '6px'; e.el.style.right = 'auto'; }
        else { e.el.style.right = '6px'; e.el.style.left = 'auto'; }

        const state = `${on ? 'a' : 'b'}${tiny ? 't' : 'n'}`;
        if (e.wState !== state) { e.w = e.el.offsetWidth; e.wState = state; }
        const edge = side === 0 ? 6 + e.w : w - 6 - e.w;
        const bend = side === 0 ? Math.min(edge + 10, c.x) : Math.max(edge - 10, c.x);
        e.line.style.display = '';
        e.line.classList.toggle('on', on);
        e.line.classList.toggle('dim', dim);
        e.line.setAttribute('points', `${edge},${ly} ${bend},${ly} ${c.x},${c.y}`);
      });
    });
  }
}
