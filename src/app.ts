import * as T from 'three';
import { PARTS } from './parts/registry';
import type { PartSpec } from './parts/types';
import { DEMOS } from './demos';
import { DemoPlayer } from './demos/player';
import { createRenderer, createCamera, fitToStage } from './scene/renderer';
import { buildEnvironment } from './scene/environment';
import { addLighting, addGround } from './scene/lighting';
import { Orbit } from './scene/controls';
import { Labels } from './ui/labels';
import { Panel } from './ui/panel';
import { Chips } from './ui/chips';
import { toast } from './ui/toast';
import { distanceToFit } from './lib/framing';

/** Runtime state for one part: its group, whether it is fitted, its fly-in progress. */
interface Live {
  spec: PartSpec;
  group: T.Group;
  dir: T.Vector3;
  dist: number;
  anchor: T.Vector3;
  installed: boolean;
  anim?: number;
}

const HOME = new T.Vector3(0, 0.75, 0);

export class App {
  private stage = document.getElementById('stage')!;
  private scene = new T.Scene();
  private camera = createCamera();
  private renderer = createRenderer(this.stage);
  private car = new T.Group();
  private ray = new T.Raycaster();
  private v2 = new T.Vector2();

  private live: Live[] = [];
  private byId = new Map<string, Live>();
  private anchors = new Map<string, T.Vector3>();

  private mode: 'explore' | 'build' = 'explore';
  private selected: PartSpec | null = null;
  private inspecting: PartSpec | null = null;
  private explode = 0;

  private focusPt: T.Vector3 | null = null;
  private tourTimer: ReturnType<typeof setTimeout> | null = null;
  private tourOn = false;
  private paceMs = 4200;

  private orbit: Orbit;
  private labels: Labels;
  private panel: Panel;
  private chips: Chips;
  private player: DemoPlayer;
  private lights: ReturnType<typeof addLighting>;
  private lastT = performance.now();

  constructor() {
    this.scene.fog = new T.Fog(0x181c21, 14, 34);
    this.scene.environment = buildEnvironment(this.renderer);
    this.lights = addLighting(this.scene);
    addGround(this.scene);
    this.scene.add(this.car);

    for (const spec of PARTS) {
      const group = new T.Group();
      spec.build(group);
      this.car.add(group);
      group.traverse(o => {
        const m = o as T.Mesh;
        if (!m.isMesh) return;
        m.userData.part = spec;
        m.material = (m.material as T.Material).clone();
        const mat = m.material as T.MeshStandardMaterial;
        m.userData.baseEmissive = mat.emissive ? mat.emissive.clone() : null;
      });
      const anchor = new T.Box3().setFromObject(group).getCenter(new T.Vector3());
      const entry: Live = {
        spec, group, anchor, installed: true,
        dir: new T.Vector3(...spec.explode.dir).normalize(),
        dist: spec.explode.dist
      };
      this.live.push(entry);
      this.byId.set(spec.id, entry);
      this.anchors.set(spec.id, anchor.clone());
    }

    this.orbit = new Orbit(this.camera, this.renderer.domElement,
      pt => this.pick(pt), () => this.syncSpin(false));
    this.labels = new Labels(
      document.getElementById('labels')!,
      document.getElementById('leads') as unknown as SVGSVGElement,
      PARTS, p => this.tapPart(p));
    this.panel = new Panel(() => this.startDemo());
    this.chips = new Chips(document.getElementById('chips')!, PARTS, p => this.tapPart(p));
    this.player = new DemoPlayer(this.scene, () => this.afterDemo());

    this.wireControls();
    addEventListener('resize', () => fitToStage(this.renderer, this.camera, this.stage));
    fitToStage(this.renderer, this.camera, this.stage);
    this.setMode('explore');
    requestAnimationFrame(() => this.frame());
  }

  /* ---------- selection and inspect ---------- */

  private tapPart(p: PartSpec) {
    if (this.mode === 'explore' || this.byId.get(p.id)!.installed) { this.select(p, true); return; }
    const next = this.nextToFit();
    if (next && p !== next) {
      this.chips.reject(p);
      toast(`Fit the ${next.name.toLowerCase()} first`);
      return;
    }
    this.install(this.byId.get(p.id)!);
  }

  private select(p: PartSpec | null, inspect = false) {
    this.selected = p;
    for (const l of this.live) {
      l.group.traverse(o => {
        const m = o as T.Mesh;
        if (!m.isMesh || !m.userData.baseEmissive) return;
        (m.material as T.MeshStandardMaterial).emissive
          .copy(m.userData.baseEmissive)
          .lerp(new T.Color(0x2a3d4a), l.spec === p ? 1 : 0);
      });
    }
    if (!p) {
      this.panel.clear();
      if (this.inspecting) this.setInspect(null);
      this.refresh();
      return;
    }
    this.panel.show(p, !!DEMOS[p.id]);
    if (inspect) this.setInspect(p);
    this.chips.scrollTo(p);
    this.refresh();
  }

  /** Isolates one part: everything else hides, and the camera frames just this. */
  private setInspect(p: PartSpec | null) {
    this.inspecting = p;
    (document.getElementById('back') as HTMLElement).style.display = p ? 'block' : 'none';
    (document.getElementById('hint') as HTMLElement).style.display = p ? 'none' : 'block';
    this.refresh();
    if (!p) { this.focusPt = null; this.orbit.want.r = 8.6; return; }
    const l = this.byId.get(p.id)!;
    const sph = new T.Box3().setFromObject(l.group).getBoundingSphere(new T.Sphere());
    this.focusPt = sph.center.clone();
    this.orbit.want.r = distanceToFit(sph.radius, this.camera.fov, this.camera.aspect);
    this.orbit.want.ph = Math.min(this.orbit.want.ph, 1.25);
  }

  private pick(pt: { x: number; y: number }) {
    if (this.player.current) return;
    const r = this.renderer.domElement.getBoundingClientRect();
    this.v2.set(((pt.x - r.left) / r.width) * 2 - 1, -((pt.y - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.v2, this.camera);
    const hit = this.ray.intersectObjects(this.car.children, true)
      .find(h => h.object.visible && h.object.userData.part &&
                 this.byId.get((h.object.userData.part as PartSpec).id)!.installed);
    this.select(hit ? (hit.object.userData.part as PartSpec) : null, true);
  }

  /* ---------- build mode ---------- */

  private nextToFit(): PartSpec | null {
    const l = this.live.find(x => !x.installed);
    return l ? l.spec : null;
  }

  private install(l: Live) {
    if (this.inspecting) this.setInspect(null);
    l.installed = true;
    l.anim = 0;
    l.group.visible = true;
    this.select(l.spec);
  }

  private stripDown() {
    for (const l of this.live) { l.installed = false; l.anim = undefined; l.group.position.set(0, 0, 0); }
    this.select(null);
  }

  private refresh() {
    const next = this.nextToFit();
    for (const l of this.live) {
      l.group.visible = (l.installed || l.anim !== undefined) &&
                        (!this.inspecting || l.spec === this.inspecting);
      this.chips.update(l.spec, {
        installed: l.installed,
        next: this.mode === 'build' && l.spec === next,
        selected: l.spec === this.selected
      });
    }
    const done = this.live.filter(l => l.installed).length;
    document.getElementById('count')!.textContent =
      this.mode === 'build' ? `${done} of ${this.live.length} fitted` : `${this.live.length} parts`;
    (document.getElementById('installNext') as HTMLButtonElement).disabled = !next;
  }

  private setMode(m: 'explore' | 'build') {
    this.mode = m;
    this.setTour(false);
    document.getElementById('mExplore')!.setAttribute('aria-pressed', String(m === 'explore'));
    document.getElementById('mBuild')!.setAttribute('aria-pressed', String(m === 'build'));
    document.getElementById('explodeRow')!.style.display = m === 'explore' ? 'flex' : 'none';
    document.getElementById('buildRow')!.style.display = m === 'build' ? 'flex' : 'none';
    document.getElementById('paceRow')!.style.display = m === 'build' ? 'flex' : 'none';
    if (m === 'explore') {
      for (const l of this.live) { l.installed = true; l.anim = undefined; }
      this.refresh();
    } else {
      (document.getElementById('ex') as HTMLInputElement).value = '0';
      this.explode = 0;
      this.stripDown();
    }
  }

  /** The guided build: one part at a time, paced so its explanation can be read. */
  private setTour(on: boolean) {
    this.tourOn = on;
    if (this.tourTimer) clearTimeout(this.tourTimer);
    const btn = document.getElementById('tourBtn') as HTMLButtonElement;
    btn.textContent = on ? 'Pause' : (this.nextToFit() ? 'Guided build' : 'Watch again');
    btn.classList.toggle('key', on);
    if (on) this.tourStep();
    else { this.focusPt = null; this.orbit.want.r = 8.6; }
  }

  private tourStep() {
    if (!this.tourOn) return;
    const next = this.nextToFit();
    if (!next) { this.setTour(false); toast(`Finished — all ${this.live.length} parts fitted`); return; }
    const l = this.byId.get(next.id)!;
    this.install(l);
    this.focusPt = l.anchor.clone().add(l.group.position);
    this.focusPt.y = Math.max(this.focusPt.y, 0.55);
    this.orbit.want.r = Math.min(this.orbit.want.r, 7.4);
    this.tourTimer = setTimeout(() => this.tourStep(), this.paceMs);
  }

  /* ---------- demos ---------- */

  private startDemo() {
    if (!this.selected) return;
    const spec = DEMOS[this.selected.id];
    if (!spec) return;
    this.car.visible = false;
    this.labels.setVisible(false);
    (document.getElementById('back') as HTMLElement).textContent = 'Back to part';
    this.player.start(spec, this.selected.id);
    this.focusPt = this.player.focusPoint;
    this.orbit.want.r = spec.dist;
    this.orbit.want.ph = spec.phi ?? 1.18;
    this.orbit.want.th = -0.55;
  }

  private afterDemo() {
    this.car.visible = true;
    this.labels.setVisible((document.getElementById('labelBtn') as HTMLElement)
      .getAttribute('aria-pressed') === 'true');
    (document.getElementById('back') as HTMLElement).textContent = 'Show whole car';
    if (this.selected) this.select(this.selected, true);
  }

  /* ---------- controls ---------- */

  private syncSpin(on: boolean) {
    this.orbit.spinning = on;
    document.getElementById('spin')!.setAttribute('aria-pressed', String(on));
  }

  private wireControls() {
    document.getElementById('mExplore')!.onclick = () => this.setMode('explore');
    document.getElementById('mBuild')!.onclick = () => this.setMode('build');
    (document.getElementById('ex') as HTMLInputElement).oninput = e =>
      this.explode = Number((e.target as HTMLInputElement).value) / 100;
    (document.getElementById('installNext') as HTMLButtonElement).onclick = () => {
      const next = this.nextToFit();
      if (next) this.install(this.byId.get(next.id)!);
    };
    document.getElementById('strip')!.onclick = () => { this.setTour(false); this.stripDown(); };
    document.getElementById('tourBtn')!.onclick = () => {
      if (this.tourOn) { this.setTour(false); return; }
      if (!this.nextToFit()) this.stripDown();
      this.setTour(true);
    };
    document.querySelectorAll<HTMLButtonElement>('#pace button').forEach(b => {
      b.onclick = () => {
        this.paceMs = Number(b.dataset.ms);
        document.querySelectorAll('#pace button').forEach(o =>
          o.setAttribute('aria-pressed', String(o === b)));
        if (this.tourOn) { if (this.tourTimer) clearTimeout(this.tourTimer); this.tourStep(); }
      };
    });
    document.getElementById('spin')!.onclick = () => this.syncSpin(!this.orbit.spinning);
    const labelBtn = document.getElementById('labelBtn')!;
    labelBtn.onclick = () => {
      const on = labelBtn.getAttribute('aria-pressed') !== 'true';
      labelBtn.setAttribute('aria-pressed', String(on));
      this.labels.setVisible(on);
    };
    document.getElementById('back')!.onclick = () => {
      if (this.player.current) this.player.stop();
      else this.select(null);
    };
  }

  /* ---------- frame ---------- */

  private tmp = new T.Vector3();
  private fpt = new T.Vector3();

  private frame() {
    requestAnimationFrame(() => this.frame());
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastT) / 1000);
    this.lastT = now;

    if (this.player.current) {
      this.player.tick(dt);
      this.orbit.update(this.player.focusPoint, 0.14);
      this.lights.inspect.visible = true;
      this.lights.inspect.position.copy(this.camera.position);
      this.renderer.render(this.scene, this.camera);
      return;
    }

    this.fpt.copy(this.focusPt ?? HOME);
    this.orbit.update(this.fpt, this.focusPt ? 0.14 : 0.05);
    this.lights.inspect.visible = !!this.inspecting;
    if (this.inspecting) this.lights.inspect.position.copy(this.camera.position);

    for (const l of this.live) {
      if (l.anim !== undefined) {
        l.anim = Math.min(1, l.anim + 0.07);
        const k = 1 - Math.pow(1 - l.anim, 3);
        this.tmp.copy(l.dir).multiplyScalar(l.dist * 1.5 * (1 - k));
        l.group.position.copy(this.tmp);
        if (l.anim >= 1) l.anim = undefined;
      } else if (this.mode === 'explore') {
        this.tmp.copy(l.dir).multiplyScalar(l.dist * this.explode);
        l.group.position.lerp(this.tmp, 0.18);
      }
      this.anchors.get(l.spec.id)!.copy(l.anchor).add(l.group.position);
    }

    this.renderer.render(this.scene, this.camera);

    if (this.inspecting) {
      this.byId.get(this.inspecting.id)!.group.traverse(o => {
        if (o.userData.spin) o.rotateY(0.045 * o.userData.spin);
      });
    }

    this.labels.layout({
      camera: this.camera, car: this.car, ray: this.ray, stage: this.stage,
      anchors: this.anchors, selected: this.selected, only: this.inspecting,
      installed: p => this.byId.get(p.id)!.installed
    });
  }
}
