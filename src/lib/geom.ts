import * as T from 'three';
import type { Material } from 'three';
import { M } from './materials';

/** A mesh that casts and receives shadow, positioned in one call. */
export function mesh(geo: T.BufferGeometry, mat: Material, x = 0, y = 0, z = 0): T.Mesh {
  const m = new T.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export const box = (w: number, h: number, d: number) => new T.BoxGeometry(w, h, d);
export const cyl = (r: number, h: number, s = 20) => new T.CylinderGeometry(r, r, h, s);

/** A cylinder laid between two points, for pipes, cables and links. */
export function tube(
  from: [number, number, number],
  to: [number, number, number],
  r: number,
  mat: Material
): T.Mesh {
  const a = new T.Vector3(...from);
  const b = new T.Vector3(...to);
  const dir = b.clone().sub(a);
  const m = mesh(cyl(r, dir.length(), 12), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize());
  return m;
}

export function ring(r: number, thickness: number, mat: Material): T.Mesh {
  return mesh(new T.TorusGeometry(r, thickness, 8, 20), mat);
}

/**
 * Marks something as turning under inspection. Rotation is applied with
 * `rotateY`, a *local* rotation, so a tilted holder keeps its axis.
 */
export function spins<O extends T.Object3D>(o: O, rate = 1): O {
  o.userData.spin = rate;
  return o;
}

/**
 * Holds a tilt so the child can spin about its own axis.
 *
 * Setting `rotation.y` on an object that already has `rotation.z` does not spin
 * it — three.js composes the Euler angles, so the axis itself swings around.
 * Putting the tilt on a parent and spinning the child fixes that.
 */
export function mount(obj: T.Object3D, x: number, y: number, z: number, tilt?: 'x' | 'z'): T.Group {
  const h = new T.Group();
  h.position.set(x, y, z);
  if (tilt === 'z') h.rotation.z = Math.PI / 2;
  if (tilt === 'x') h.rotation.x = Math.PI / 2;
  h.add(obj);
  return h;
}

/** A point on the car's side profile, or the marker for a wheel arch. */
export type ProfilePoint = [number, number] | 'ARCH';

/**
 * Extrudes a side-profile outline across the width of the car, which is how the
 * body panels and their wheel arches are shaped.
 */
export function profile(
  pts: ProfilePoint[],
  arch: [number, number, number],
  width: number,
  mat: Material
): T.Mesh {
  const s = new T.Shape();
  pts.forEach((p, i) => {
    if (p === 'ARCH') {
      s.absarc(arch[0], arch[1], arch[2], Math.PI, 0, true);
      return;
    }
    i === 0 ? s.moveTo(p[0], p[1]) : s.lineTo(p[0], p[1]);
  });
  const g = new T.ExtrudeGeometry(s, {
    depth: width,
    bevelEnabled: true,
    bevelSize: 0.045,
    bevelThickness: 0.045,
    bevelSegments: 4,
    curveSegments: 16
  });
  g.translate(0, 0, -width / 2);
  g.rotateY(-Math.PI / 2);
  g.computeVertexNormals();
  return mesh(g, mat);
}

/**
 * A flat pane of glass spanning two points of the car's side profile, its width
 * running across the car.
 *
 * Only one rotation is applied, deliberately. Setting `rotation.y` as well swings
 * the pane's width out of the car's cross-axis — three.js composes Euler angles,
 * so the second rotation acts on the axes the first one moved. That mistake made
 * the windscreen render as a side-facing panel one and a half metres tall.
 */
export function pane(
  w: number,
  from: [number, number],
  to: [number, number],
  mat: Material
): T.Mesh {
  const dy = to[1] - from[1];
  const dz = to[0] - from[0];
  const len = Math.hypot(dy, dz);
  const m = mesh(new T.PlaneGeometry(w, len), mat);
  m.position.set(0, (from[1] + to[1]) / 2, (from[0] + to[0]) / 2);
  m.rotation.x = Math.atan2(dz, dy);   // lays the pane's length along the slope
  m.castShadow = false;
  return m;
}

/** A see-through reservoir with coloured fluid showing through it. */
export function bottle(
  w: number, h: number, d: number,
  x: number, y: number, z: number,
  colour: number, capR = 0.035
): T.Group {
  const g = new T.Group();
  const shell = mesh(box(w, h, d), M.plastic(), x, y, z);
  shell.castShadow = false;
  g.add(shell);
  g.add(mesh(box(w * 0.86, h * 0.55, d * 0.86), M.fluid(colour), x, y - h * 0.2, z));
  g.add(mesh(cyl(capR, 0.05, 10), M.dark(), x, y + h / 2 + 0.02, z));
  return g;
}

/** A spur gear with real teeth, axis along its local Y. */
export function gearWheel(r: number, teeth: number, w: number, mat: Material): T.Group {
  const g = new T.Group();
  g.add(mesh(new T.CylinderGeometry(r * 0.88, r * 0.88, w, Math.max(18, teeth)), mat));
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const t = mesh(box(r * 0.26, w, r * 0.3), mat, Math.cos(a) * r * 0.92, 0, Math.sin(a) * r * 0.92);
    t.rotation.y = -a;
    g.add(t);
  }
  g.add(mesh(cyl(r * 0.12, w * 1.6, 12), M.dark()));
  return g;
}
