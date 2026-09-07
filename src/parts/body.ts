/** Panels, glass and lights */

import * as T from 'three';
import { definePart } from './types';
import { M } from '../lib/materials';
import { mesh, box, tube, profile, pane } from '../lib/geom';

export const bodyF = definePart({
  id: 'bodyF',
  name: 'Front body',
  system: 'Body',
  explode: { dir: [0, 1, .35], dist: 2.1 },
  role: 'shapes the nose, absorbs impact',
  info:
    'Front wings and the engine bay walls. The nose is designed to crumple and absorb energy before it reaches you.',
  detail: {
    madeOf: 'Pressed steel or aluminium panels',
    attachesTo: 'Chassis below, doors and bonnet alongside',
    worthKnowing: 'The nose is meant to fold. A rigid front end would pass the whole impact to you.'
  },
  build(g) {
    const p = profile([[.72,.48],[.91,.48],'ARCH',[1.79,.48],[2.18,.5],[2.22,.74],[2.16,1.02],[.72,1.02]], [1.35,.48,.44], 1.9, M.paint());
    g.add(p);
  }
});

export const bodyR = definePart({
  id: 'bodyR',
  name: 'Rear body',
  system: 'Body',
  explode: { dir: [0, 1, -.35], dist: 2.1 },
  role: 'shapes the tail, holds the boot',
  info:
    'Rear wings and boot floor. The same wheel arch shape is cut in to clear the tyre at full suspension travel.',
  detail: {
    madeOf: 'Pressed steel, boot floor and arches',
    attachesTo: 'Chassis rear, doors, rear bumper',
    worthKnowing: 'The spare wheel well doubles as a crush zone in a rear impact.'
  },
  build(g) {
    const p = profile([[-2.15,.52],[-1.79,.5],'ARCH',[-.91,.5],[-.72,.5],[-.72,1.02],[-2.06,1.0],[-2.15,.82]], [-1.35,.5,.44], 1.9, M.paint());
    g.add(p);
  }
});

export const doors = definePart({
  id: 'doors',
  name: 'Doors',
  system: 'Body',
  explode: { dir: [1, .15, 0], dist: 2.2 },
  role: 'lets you in, guards the side',
  info:
    'Hollow shells with a steel beam inside. That beam is what stops another car intruding into the cabin from the side.',
  detail: {
    madeOf: 'Outer skin, inner frame, side-impact beam',
    attachesTo: 'Hinged near the B-pillar',
    worthKnowing: 'Once shut, a door is structural — the latch carries load across the opening.'
  },
  build(g) {
    [-.95,.95].forEach(x=>{
    g.add(mesh(box(.07,.54,1.42), M.paint(), x,.76,0));
    g.add(mesh(box(.05,.05,.9), M.steel(), x,.72,0));
    g.add(mesh(box(.05,.05,.16), M.dark(), x*1.03,.9,-.4)); });
  }
});

export const hood = definePart({
  id: 'hood',
  name: 'Bonnet',
  system: 'Body',
  explode: { dir: [0, 1, .45], dist: 1.8 },
  role: 'covers the engine bay',
  info:
    'Hinged so it can be opened for servicing, and shaped to slide the airflow up over the windscreen.',
  detail: {
    madeOf: 'Thin skin over a stiffening frame',
    attachesTo: 'Hinges at the base of the windscreen',
    worthKnowing: 'It is shaped to buckle upward rather than spear back through the glass.'
  },
  build(g) {
    const h = mesh(box(1.66,.06,1.2), M.paint(), 0,1.03,1.5); h.rotation.x = .03; g.add(h);
  }
});

export const cabin = definePart({
  id: 'cabin',
  name: 'Roof & pillars',
  system: 'Body',
  explode: { dir: [0, 1, 0], dist: 2.3 },
  role: 'the safety cage',
  info:
    'The safety cage. These pillars are the strongest steel in the car because they hold the roof up if it ever lands upside down.',
  detail: {
    madeOf: 'High-strength steel pillars and roof panel',
    attachesTo: 'Welded to floor pan, front and rear body',
    worthKnowing: 'The B-pillar is usually the strongest piece of steel in the entire car.'
  },
  build(g) {
    [-.78,.78].forEach(x=>{
    g.add(tube([x,1.0,.78],[x*.82,1.5,.2],.055,M.paint2()));   // A pillar
    g.add(tube([x,1.0,-1.12],[x*.82,1.48,-.66],.055,M.paint2())); // C pillar
    g.add(tube([x*.82,1.5,.2],[x*.82,1.48,-.66],.05,M.paint2())); });
    g.add(mesh(box(1.42,.07,.92), M.paint(), 0,1.51,-.24));
  }
});

export const glass = definePart({
  id: 'glass',
  name: 'Glazing',
  system: 'Body',
  explode: { dir: [0, 1, 0], dist: 2.5 },
  role: 'see out, stay in',
  info:
    'Laminated windscreen: two glass layers bonded to plastic so it cracks but stays in one piece. Side glass is toughened instead, so it crumbles.',
  detail: {
    madeOf: 'Laminated windscreen, toughened side glass',
    attachesTo: 'Bonded to the pillars and roof',
    worthKnowing: 'The bonded windscreen is structural — it measurably stiffens the body shell.'
  },
  build(g) {
    g.add(pane(1.5,[.82,1.0],[.22,1.5], M.glass()));
    g.add(pane(1.4,[-1.1,1.0],[-.66,1.48], M.glass()));
    [-.8,.8].forEach(x=>{ const s = mesh(new T.PlaneGeometry(1.1,.44), M.glass(), x,1.24,-.22);
    s.rotation.y = Math.PI/2; s.castShadow = false; g.add(s); });
  }
});

export const bumpers = definePart({
  id: 'bumpers',
  name: 'Bumpers',
  system: 'Body',
  explode: { dir: [0, 0, 1], dist: 2.0 },
  role: 'takes the small knocks',
  info:
    'Plastic skins over a foam and steel beam. They shrug off a low-speed knock without any of the expensive parts behind them getting hurt.',
  detail: {
    madeOf: 'Plastic cover, foam block, steel beam',
    attachesTo: 'Bolts to the ends of the chassis rails',
    worthKnowing: 'They are designed so a low-speed knock damages nothing behind the cover.'
  },
  build(g) {
    g.add(mesh(box(1.9,.24,.18), M.dark(), 0,.64,2.3));
    g.add(mesh(box(1.9,.24,.18), M.dark(), 0,.64,-2.26));
  }
});

export const bodyParts = [bodyF, bodyR, doors, hood, cabin, glass, bumpers];
