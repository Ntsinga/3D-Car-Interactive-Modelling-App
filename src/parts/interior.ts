/** Seats, dashboard and controls */

import * as T from 'three';
import { definePart } from './types';
import { M } from '../lib/materials';
import { mesh, box, tube } from '../lib/geom';

function seat(x: number, z: number, w: number): T.Group {
  const s = new T.Group();
  s.add(mesh(box(w,.13,.5), M.cloth(), x,.72,z));
  const b = mesh(box(w,.62,.13), M.cloth(), x,1.03,z-.26); b.rotation.x = -.14; s.add(b);
  s.add(mesh(box(w*.55,.16,.13), M.cloth(), x,1.4,z-.3));
  return s;
}

export const seats = definePart({
  id: 'seats',
  name: 'Seats',
  system: 'Interior',
  explode: { dir: [0, 1, 0], dist: 1.5 },
  role: 'holds you safely',
  info:
    'Structural items, not just cushions: the frames anchor the seatbelts and hold you in place in a crash.',
  detail: {
    madeOf: 'Steel frame, foam, fabric or leather',
    attachesTo: 'Bolted straight through the floor pan',
    worthKnowing: 'The headrest is safety equipment: it is what stops whiplash in a rear-end hit.'
  },
  build(g) {
    [-.42,.42].forEach(x=> g.add(seat(x,.2,.52)));
    g.add(seat(0,-.85,1.24));
  }
});

export const dash = definePart({
  id: 'dash',
  name: 'Dashboard & steering',
  system: 'Interior',
  explode: { dir: [0, 1, .3], dist: 1.6 },
  role: 'where you steer and read',
  info:
    'The steering column links the wheel to a rack that slides side to side, pushing the front wheels into the turn.',
  detail: {
    madeOf: 'Moulded plastic over a steel cross-beam',
    attachesTo: 'Steering column to the rack, wiring to everything',
    worthKnowing: 'That hidden beam ties the two A-pillars together across the car.'
  },
  build(g) {
    g.add(mesh(box(1.72,.26,.32), M.dark(), 0,1.06,.86));
    const w = mesh(new T.TorusGeometry(.16,.026,10,24), M.rubber(), .42,1.06,.62);
    w.rotation.x = 1.15; g.add(w);
    g.add(tube([.42,1.06,.64],[.42,.86,.9],.03,M.steel()));
  }
});

export const interiorParts = [seats, dash];
